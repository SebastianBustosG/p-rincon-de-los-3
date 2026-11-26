from django.test import TestCase
from core.tests import ApiTests
from core.models import Colacion, Receta

class RecipeTests(TestCase):
    setUpTestData = classmethod(ApiTests.setUpTestData.__func__)
    setUp = ApiTests.setUp
    post = ApiTests.post
    signin = ApiTests.signin
    payload = ApiTests.payload
    def data(self, **updates):
        value = dict(nombre_colacion='Arroz nuevo', descripcion_colacion='', precio_colacion=2000, categoria='Plato Tradicional', imagen='', tiempo_estimado='', activa_colacion=True, ingredientes=[dict(insumo_id=self.supply.pk, cantidad='0.500')])
        value.update(updates)
        return value
    def test_crud_permissions_and_atomic_recipe(self):
        self.assertEqual(self.post('dishes/save/', self.data()).status_code, 401)
        self.signin(self.customer)
        self.assertEqual(self.post('dishes/save/', self.data()).status_code, 403)
        self.signin()
        response = self.post('dishes/save/', self.data())
        self.assertEqual(response.status_code, 200, response.content)
        pk = response.json()['id_colacion']
        self.assertEqual(self.post('dishes/save/', self.data(id_colacion=pk, ingredientes=[dict(insumo_id=self.supply.pk,cantidad='-1')])).status_code, 400)
        self.assertEqual(str(Receta.objects.get(colacion_id=pk).cantidad_necesaria_receta), '0.500')
        self.assertEqual(self.post('dishes/save/', self.data(id_colacion=pk, ingredientes=[dict(insumo_id=self.supply.pk,cantidad='1')])).status_code, 200)
        self.assertEqual(self.post('dishes/delete/', dict(id_colacion=pk)).status_code, 200)
        self.assertFalse(Colacion.objects.filter(pk=pk).exists())
    def test_limit_stock_filter_and_historical_protection(self):
        self.signin()
        paused = self.post('dishes/save/', self.data(activa_colacion=False)).json()['id_colacion']
        self.assertIn(paused, [d['id_colacion'] for d in self.client.get('/api/state/').json()['colaciones']])
        self.post('auth/logout/')
        self.assertNotIn(paused, [d['id_colacion'] for d in self.client.get('/api/state/').json()['colaciones']])
        self.assertEqual(self.post('orders/', self.payload()).status_code, 200)
        state = self.client.get('/api/state/').json()
        self.assertEqual(next(d for d in state['colaciones'] if d['id_colacion'] == self.dish.pk)['porciones_disponibles'], 1)
        self.assertEqual(self.post('orders/', self.payload()).status_code, 200)
        self.assertEqual(self.client.get('/api/state/').json()['colaciones'], [])
        self.signin()
        self.assertEqual(self.post('dishes/delete/', dict(id_colacion=self.dish.pk)).status_code, 409)
