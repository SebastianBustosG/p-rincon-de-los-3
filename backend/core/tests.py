import json, uuid
from decimal import Decimal
from django.test import TestCase, Client
from django.core.management import call_command
from core.models import Usuario, Insumo, Colacion, Receta, Pedido, DetallePedido

class ApiTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.admin = Usuario.objects.create_superuser('admin_test', 'AdminClave2026!')
        cls.customer = Usuario.objects.create_user('Ana Pérez Soto', 'ClienteClave2026!', telefono='56912345678', direccion='Talca 123')
        cls.other = Usuario.objects.create_user('Luis Pérez Díaz', 'ClienteClave2026!', telefono='56912345679', direccion='Talca 456')
        cls.supply = Insumo.objects.create(nombre_insumo='Arroz', unidad_medida_insumo='kg', stock_actual_insumo=5, stock_minimo_insumo=1, costo_unitario=100)
        cls.dish = Colacion.objects.create(nombre_colacion='Plato uno', precio_colacion=4000)
        cls.second = Colacion.objects.create(nombre_colacion='Plato dos', precio_colacion=3000)
        for dish in [cls.dish, cls.second]:
            Receta.objects.create(colacion=dish, insumo=cls.supply, nombre_receta='Base', cantidad_necesaria_receta=2)
    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)
        self.client.get('/api/auth/session/')
    def post(self, path, data=None, client=None):
        client = client or self.client
        if not client.cookies.get('rincon_django_csrf'): client.get('/api/auth/session/')
        return client.post('/api/' + path, data=json.dumps(data or {}), content_type='application/json', HTTP_X_CSRFTOKEN=client.cookies['rincon_django_csrf'].value)
    def signin(self, user=None, client=None):
        user = user or self.admin
        return self.post('auth/login/', {'username':user.username_usuario, 'password':'AdminClave2026!' if user.rol == 'administrador' else 'ClienteClave2026!'}, client)
    def payload(self, **changes):
        data = {'nombre':'Ana Pérez Soto','telefono':'56912345678','tipoEntrega':'Retiro en Local','metodoPago':'Transferencia','observaciones':'Sin cebolla','solicitud_id':str(uuid.uuid4()),'items':[{'id_colacion':self.dish.pk,'cantidad':1}]}
        data.update(changes)
        return data
    def test_csrf_required_and_guest_state_private(self):
        response = self.client.post('/api/orders/', data=json.dumps(self.payload()), content_type='application/json')
        self.assertEqual(response.status_code,403)
        state = self.client.get('/api/state/').json()
        self.assertEqual(state['insumos'],[])
        self.assertEqual(state['recetas'],[])
        self.assertEqual(state['pedidos'],[])
        self.assertNotIn('insumo_faltante',state['colaciones'][0])
    def test_registration_validation_and_hashed_password(self):
        data={'username':'María Pérez Díaz','telefono':'56911112222','direccion':'Talca 20','password':'Cliente2026!'}
        for changes in [{'username':'María Pérez'},{'telefono':'+56911112222'},{'telefono':'569 11112222'},{'telefono':'569ABC11222'},{'telefono':'911112222'},{'telefono':'569111122'},{'telefono':'569111122223'},{'telefono':'54911112222'},{'username':'A'*31},{'direccion':'x'*121},{'password':'corta'}]:
            self.assertEqual(self.post('auth/register/',{**data,**changes}).status_code,400)
        self.assertEqual(self.post('auth/register/',data).status_code,200)
        user=Usuario.objects.get(username_usuario=data['username'])
        self.assertNotEqual(user.password,data['password'])
        self.assertTrue(user.check_password(data['password']))
        self.assertEqual(user.rol,'cliente')
        self.assertEqual(self.post('auth/register/',{**data,'username':data['username'].upper()}).status_code,400)
    def test_guest_order_totals_stock_and_idempotency(self):
        data=self.payload(total_pedido=1)
        first=self.post('orders/',data)
        self.assertEqual(first.status_code,200,first.content)
        result=first.json()['pedido']
        self.assertEqual(result['total_pedido'],4000)
        self.assertEqual(result['codigo_pedido'],f"#PED-{result['id_pedido']}")
        self.assertTrue(result['fecha_hora_pedido'])
        self.assertEqual(Pedido.objects.count(),1)
        self.assertEqual(DetallePedido.objects.get().costo_insumos,Decimal(200))
        self.supply.refresh_from_db()
        self.assertEqual(self.supply.stock_actual_insumo,3)
        self.assertEqual(self.post('orders/',data).json()['pedido']['id_pedido'],result['id_pedido'])
        self.assertEqual(Pedido.objects.count(),1)
        self.supply.refresh_from_db()
        self.assertEqual(self.supply.stock_actual_insumo,3)
        self.assertEqual(self.post('orders/',{**data,'nombre':'Otro Pérez Soto'}).status_code,409)
    def test_shared_ingredient_failure_is_atomic(self):
        items=[{'id_colacion':self.dish.pk,'cantidad':2},{'id_colacion':self.second.pk,'cantidad':1}]
        self.assertEqual(self.post('orders/',self.payload(items=items)).status_code,409)
        self.supply.refresh_from_db()
        self.assertEqual(self.supply.stock_actual_insumo,5)
        self.assertEqual(Pedido.objects.count(),0)
    def test_bad_order_values_and_inactive_dish(self):
        for change in [{'nombre':'Ana Pérez'},{'telefono':'+56912345678'},{'telefono':'912345678'},{'telefono':'5691234567'},{'telefono':'569123456789'},{'telefono':'54912345678'},{'tipoEntrega':'Despacho a Domicilio'},{'observaciones':'x'*201},{'items':[{'id_colacion':self.dish.pk,'cantidad':-1}]},{'items':[{'id_colacion':self.dish.pk,'cantidad':1.5}]},{'metodoPago':'Efectivo','montoPagaCon':1}]:
            self.assertEqual(self.post('orders/',self.payload(**change)).status_code,400)
        self.dish.activa_colacion=False
        self.dish.save()
        self.assertEqual(self.post('orders/',self.payload()).status_code,409)
        self.supply.refresh_from_db()
        self.assertEqual(self.supply.stock_actual_insumo,5)
    def test_admin_permissions_and_status_sequence(self):
        order=self.post('orders/',self.payload()).json()['pedido']
        status=f"orders/{order['id_pedido']}/status/"
        self.assertEqual(self.post(status,{'estado':'Listo'}).status_code,401)
        self.signin(self.customer)
        self.assertEqual(self.post(status,{'estado':'Listo'}).status_code,403)
        self.assertEqual(self.post(f'supplies/{self.supply.pk}/stock/',{'stock':99}).status_code,403)
        self.signin()
        self.assertEqual(self.post(status,{'estado':'Entregado'}).status_code,409)
        self.assertEqual(self.post(status,{'estado':'Listo'}).status_code,200)
        self.assertEqual(self.post(status,{'estado':'Entregado'}).status_code,200)
        self.assertEqual(self.post(f'supplies/{self.supply.pk}/stock/',{'stock':-1}).status_code,400)
        self.assertEqual(self.post(f'supplies/{self.supply.pk}/stock/',{'delta':2}).status_code,200)
        self.assertEqual(self.post(f'dishes/{self.dish.pk}/toggle/').status_code,200)
    def test_customer_history_isolation_profile_delete(self):
        self.signin(self.customer)
        order=self.post('orders/',self.payload()).json()['pedido']
        self.assertEqual(order['cliente_id'],str(self.customer.pk))
        data=self.client.get('/api/state/').json()
        self.assertEqual(len(data['pedidos']),1)
        self.assertNotIn('costo_insumos',data['pedidos'][0]['detalles'][0])
        self.assertEqual(self.post('auth/profile/',{'username':'Ana Gómez Soto','telefono':'56999998888','direccion':'Talca Nueva 10'}).status_code,200)
        self.assertEqual(self.client.get('/api/state/').json()['pedidos'][0]['nombre_cliente_pedido'],'Ana Pérez Soto')
        self.signin(self.other)
        self.assertEqual(self.client.get('/api/state/').json()['pedidos'],[])
        self.client.force_login(Usuario.objects.get(pk=self.customer.pk))
        self.assertEqual(self.post('auth/delete/',{'password':'incorrecta'}).status_code,400)
        self.assertEqual(self.post('auth/delete/',{'password':'ClienteClave2026!'}).status_code,200)
        self.assertFalse(Usuario.objects.filter(pk=self.customer.pk).exists())
        self.assertIsNone(Pedido.objects.get().cliente_id)
        self.assertIsNone(self.client.get('/api/auth/session/').json()['account'])
    def test_admin_credentials_persist_and_client_cannot_escalate(self):
        self.signin(self.customer)
        self.post('auth/profile/',{'username':'Ana Pérez Soto','telefono':'56912345678','direccion':'Talca','rol':'administrador'})
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.rol,'cliente')
        self.signin()
        self.assertEqual(self.post('auth/profile/',{'username':'nuevo_admin','currentPassword':'wrong','newPassword':'NuevaClave2026!'}).status_code,400)
        self.assertEqual(self.post('auth/profile/',{'username':'nuevo_admin','currentPassword':'AdminClave2026!','newPassword':'NuevaClave2026!'}).status_code,200)
        self.assertEqual(self.client.get('/api/auth/session/').json()['account']['username'],'nuevo_admin')
        self.post('auth/logout/')
        self.assertEqual(self.post('auth/login/',{'username':'admin_test','password':'AdminClave2026!'}).status_code,401)
        self.assertEqual(self.post('auth/login/',{'username':'nuevo_admin','password':'NuevaClave2026!'}).status_code,200)
        self.assertEqual(self.post('auth/delete/',{'password':'NuevaClave2026!'}).status_code,403)
    def test_catalog_initialization_is_not_browser_migration_or_reset(self):
        call_command('init_local',verbosity=0)
        self.assertEqual(Pedido.objects.count(),0)
        self.assertEqual(Colacion.objects.count(),2)
        self.supply.refresh_from_db()
        self.assertEqual(self.supply.stock_actual_insumo,5)
    def test_idempotency_not_shared_between_sessions(self):
        data=self.payload()
        self.post('orders/',data)
        other=Client(enforce_csrf_checks=True)
        self.assertEqual(self.post('orders/',data,other).status_code,409)

    def test_cancel_order_persists_is_terminal_and_does_not_restock(self):
        self.signin(self.customer)
        order = self.post('orders/', self.payload()).json()['pedido']
        route = f"orders/{order['id_pedido']}/status/"
        self.assertEqual(self.post(route, {'estado': 'Cancelado', 'reponer_insumos': False}).status_code, 403)
        self.signin()
        self.assertEqual(self.post(route, {'estado': 'Cancelado', 'reponer_insumos': False}).status_code, 200)
        self.assertEqual(self.post(route, {'estado': 'Cancelado', 'reponer_insumos': False}).status_code, 200)
        saved = Pedido.objects.get(pk=order['id_pedido'])
        self.assertEqual(saved.estado_pedido, 'Cancelado')
        self.assertEqual(saved.detalles.count(), 1)
        self.supply.refresh_from_db()
        self.assertEqual(self.supply.stock_actual_insumo, 3)
        for estado in ['En curso', 'Listo', 'Entregado']:
            self.assertEqual(self.post(route, {'estado': estado}).status_code, 409)
        self.signin(self.customer)
        self.assertEqual(self.client.get('/api/state/').json()['pedidos'][0]['estado_pedido'], 'Cancelado')

    def test_cancellation_restores_original_snapshot_once_even_if_recipe_changes(self):
        order = self.post('orders/', self.payload()).json()['pedido']
        self.signin()
        route = f"orders/{order['id_pedido']}/status/"
        self.assertEqual(self.post(route, {'estado': 'Cancelado', 'reponer_insumos': 'true'}).status_code, 400)
        Receta.objects.filter(colacion=self.dish).update(cantidad_necesaria_receta=4)
        self.assertEqual(self.post(route, {'estado': 'Cancelado'}).status_code, 200)
        self.supply.refresh_from_db()
        self.assertEqual(self.supply.stock_actual_insumo, 5)
        self.assertTrue(Pedido.objects.get(pk=order['id_pedido']).insumos_repuestos)
        self.assertEqual(self.post(route, {'estado': 'Cancelado'}).status_code, 200)
        self.supply.refresh_from_db()
        self.assertEqual(self.supply.stock_actual_insumo, 5)

    def test_cancellation_restores_shared_ingredients_as_one_total(self):
        items = [{'id_colacion': self.dish.pk, 'cantidad': 1}, {'id_colacion': self.second.pk, 'cantidad': 1}]
        order = self.post('orders/', self.payload(items=items)).json()['pedido']
        self.supply.refresh_from_db()
        self.assertEqual(self.supply.stock_actual_insumo, 1)
        self.signin()
        self.assertEqual(self.post(f"orders/{order['id_pedido']}/status/", {'estado': 'Cancelado', 'reponer_insumos': True}).status_code, 200)
        self.supply.refresh_from_db()
        self.assertEqual(self.supply.stock_actual_insumo, 5)