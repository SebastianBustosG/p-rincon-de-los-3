import hashlib, json, secrets
from collections import defaultdict
from decimal import Decimal, InvalidOperation
from functools import wraps
from django import forms
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import transaction, IntegrityError, OperationalError
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import normalizar_usuario, Usuario, Colacion, Insumo, Receta, Pedido, DetallePedido
from .forms import ProfileForm, OrderForm

class ApiError(Exception):
    def __init__(self, message, status=400): self.message, self.status = message, status
def require_user(request):
    if not request.user.is_authenticated: raise ApiError('Debes iniciar sesión.', 401)
def require_admin(request):
    require_user(request)
    if request.user.rol != 'administrador': raise ApiError('Acceso exclusivo del administrador.', 403)
def validated(form):
    if not form.is_valid():
        raise ApiError(' '.join(f'{field}: {" ".join(errors)}' for field, errors in form.errors.items()))
    return form.cleaned_data
def account(user):
    if not user.is_authenticated: return None
    return {'id': str(user.pk), 'username': user.username_usuario, 'telefono': user.telefono, 'direccion': user.direccion, 'role': user.rol}
def order_json(order, admin=False):
    result = {field: getattr(order, field) for field in ['id_pedido','nombre_cliente_pedido','telefono_cliente_pedido','estado_pedido','metodo_pago_pedido','total_pedido','observaciones_pedido','tipo_entrega','direccion_entrega','monto_paga_con']}
    result.update(codigo_pedido=f'#PED-{order.pk}', fecha_hora_pedido=order.fecha_hora_pedido.isoformat(), cliente_id=str(order.cliente_id) if order.cliente_id else None)
    result['detalles'] = []
    for item in order.detalles.all():
        detail = {field: getattr(item, field) for field in ['id_detalle_pedido','nombre_colacion','cantidad_detalle_pedido','subtotal_detalle_pedido']}
        detail.update(id_pedido=order.pk, id_colacion=item.colacion_id)
        if admin: detail['costo_insumos'] = float(item.costo_insumos)
        result['detalles'].append(detail)
    return result
def availability(colacion):
    if not colacion.activa_colacion: return 0, 'Desactivado por administración'
    recipes = list(colacion.recetas.all())
    if not recipes: return 0, 'Sin receta configurada'
    portions, missing = 10**9, ''
    for recipe in recipes:
        available = int(recipe.insumo.stock_actual_insumo // recipe.cantidad_necesaria_receta)
        if available < portions:
            portions = available
            missing = f'{recipe.insumo.nombre_insumo} ({recipe.insumo.stock_actual_insumo} {recipe.insumo.unidad_medida_insumo} disp.)'
    return portions, missing if portions <= 0 else ''
def state(request):
    is_admin = request.user.is_authenticated and request.user.rol == 'administrador'
    dishes = []
    for dish in Colacion.objects.prefetch_related('recetas__insumo').order_by('id_colacion'):
        data = {field: getattr(dish, field) for field in ['id_colacion','nombre_colacion','descripcion_colacion','precio_colacion','activa_colacion','categoria','imagen','tiempo_estimado']}
        portions, missing = availability(dish)
        data['porciones_disponibles'] = portions
        if is_admin: data['insumo_faltante'] = missing
        dishes.append(data)
    orders = Pedido.objects.prefetch_related('detalles')
    orders = orders if is_admin else orders.filter(cliente=request.user) if request.user.is_authenticated else orders.none()
    supplies, recipes = [], []
    if is_admin:
        for supply in Insumo.objects.order_by('id_insumo'):
            supplies.append({field: float(getattr(supply, field)) if field in ['stock_actual_insumo','stock_minimo_insumo','costo_unitario'] else getattr(supply, field) for field in ['id_insumo','nombre_insumo','unidad_medida_insumo','stock_actual_insumo','stock_minimo_insumo','costo_unitario']})
        recipes = [{**row, 'cantidad_necesaria_receta': float(row['cantidad_necesaria_receta'])} for row in Receta.objects.values('id_receta','colacion_id','insumo_id','nombre_receta','cantidad_necesaria_receta')]
    return {'colaciones': dishes, 'insumos': supplies, 'recetas': recipes, 'pedidos': [order_json(o, is_admin) for o in orders]}

def register(request, data):
    profile = validated(ProfileForm(data))
    password = data.get('password', '')
    if not isinstance(password, str): raise ApiError('Contraseña inválida.')
    validate_password(password)
    if Usuario.objects.filter(username_clave=normalizar_usuario(profile['username'])).exists(): raise ApiError('Ese nombre de usuario ya está registrado.')
    user = Usuario.objects.create_user(profile['username'], password, telefono=profile['telefono'], direccion=profile['direccion'])
    login(request, user)
    return {'account': account(user)}
def profile_update(request, data):
    require_user(request)
    if not isinstance(data.get('currentPassword', ''), str): raise ApiError('Contraseña actual inválida.')
    user = Usuario.objects.select_for_update().get(pk=request.user.pk)
    is_admin = user.rol == 'administrador'
    if is_admin:
        username = forms.CharField(min_length=3, max_length=30).clean(data.get('username'))
        if not user.check_password(data.get('currentPassword') or ''): raise ApiError('La contraseña actual es incorrecta.')
    else:
        profile = validated(ProfileForm(data))
        username = profile['username']
        user.telefono, user.direccion = profile['telefono'], profile['direccion']
    if Usuario.objects.filter(username_clave=normalizar_usuario(username)).exclude(pk=user.pk).exists(): raise ApiError('Ese nombre de usuario ya está registrado.')
    new_password = data.get('newPassword') or ''
    if not isinstance(new_password, str): raise ApiError('Contraseña inválida.')
    if new_password:
        if not user.check_password(data.get('currentPassword') or ''): raise ApiError('La contraseña actual es incorrecta.')
        validate_password(new_password, user)
        user.set_password(new_password)
    user.username_usuario = username
    user.full_clean()
    user.save()
    update_session_auth_hash(request, user)
    return {'account': account(user)}
def create_order(request, data):
    values = validated(OrderForm(data))
    items = data.get('items')
    if not isinstance(items, list) or not items or len(items) > 100: raise ApiError('Agrega al menos un plato al pedido (máximo 100 líneas).')
    scope = request.session.setdefault('order_scope', secrets.token_hex(24))
    digest = hashlib.sha256(json.dumps(data, sort_keys=True, ensure_ascii=False).encode()).hexdigest()
    previous = Pedido.objects.filter(solicitud_id=values['solicitud_id']).first()
    if previous:
        if previous.solicitud_sesion != scope or previous.solicitud_hash != digest: raise ApiError('La confirmación ya fue usada con otros datos.', 409)
        return {'pedido': order_json(previous, request.user.is_authenticated and request.user.rol == 'administrador')}
    quantities = defaultdict(int)
    for item in items:
        if not isinstance(item, dict) or type(item.get('id_colacion')) is not int or type(item.get('cantidad')) is not int or not 1 <= item['cantidad'] <= 999: raise ApiError('Las cantidades deben ser enteros positivos (máximo 999).')
        quantities[item['id_colacion']] += item['cantidad']
        if quantities[item['id_colacion']] > 999: raise ApiError('Cantidad máxima por plato: 999.')
    dishes = {d.pk: d for d in Colacion.objects.filter(pk__in=quantities).prefetch_related('recetas__insumo')}
    consumption = defaultdict(Decimal)
    detail_data, total = [], 0
    for dish_id, quantity in quantities.items():
        dish = dishes.get(dish_id)
        if not dish or not dish.activa_colacion: raise ApiError('Uno de los platos ya no está disponible.', 409)
        recipes = list(dish.recetas.all())
        if not recipes: raise ApiError(f'{dish.nombre_colacion}: no tiene receta configurada.', 409)
        cost = Decimal(0)
        for recipe in recipes:
            amount = recipe.cantidad_necesaria_receta * quantity
            consumption[recipe.insumo_id] += amount
            cost += amount * recipe.insumo.costo_unitario
        subtotal = dish.precio_colacion * quantity
        total += subtotal
        detail_data.append({'colacion': dish, 'nombre_colacion': dish.nombre_colacion, 'precio_unitario': dish.precio_colacion, 'cantidad_detalle_pedido': quantity, 'subtotal_detalle_pedido': subtotal, 'costo_insumos': cost})
    for supply_id, amount in consumption.items():
        supply = Insumo.objects.get(pk=supply_id)
        if supply.stock_actual_insumo < amount: raise ApiError('No hay stock suficiente para el pedido completo. Actualiza tu selección.', 409)
        supply.stock_actual_insumo -= amount
        supply.save(update_fields=['stock_actual_insumo'])
    cash = values.get('montoPagaCon')
    if values['metodoPago'] == 'Efectivo' and cash is not None and cash < total: raise ApiError('El monto en efectivo no cubre el total.')
    order = Pedido.objects.create(nombre_cliente_pedido=values['nombre'], telefono_cliente_pedido=values['telefono'], metodo_pago_pedido=values['metodoPago'], total_pedido=total, observaciones_pedido=values['observaciones'], cliente=request.user if request.user.is_authenticated and request.user.rol == 'cliente' else None, tipo_entrega=values['tipoEntrega'], direccion_entrega=values['direccion'] if values['tipoEntrega'] == 'Despacho a Domicilio' else '', monto_paga_con=cash if values['metodoPago'] == 'Efectivo' else None, solicitud_id=values['solicitud_id'], solicitud_sesion=scope, solicitud_hash=digest, insumos_descontados={str(key): str(value) for key, value in consumption.items()})
    for detail in detail_data: DetallePedido.objects.create(pedido=order, **detail)
    return {'pedido': order_json(order, request.user.is_authenticated and request.user.rol == 'administrador')}

def handle(request, route, data):
    if route == 'health/' and request.method == 'GET': return {'service':'colaciones-django', 'database':'sqlite'}
    if route == 'auth/session/' and request.method == 'GET':
        request.session.setdefault('order_scope', secrets.token_hex(24))
        return {'account': account(request.user)}
    if route == 'state/' and request.method == 'GET': return state(request)
    if request.method != 'POST': raise ApiError('Método no permitido.', 405)
    if route == 'auth/register/': return register(request, data)
    if route == 'auth/login/':
        username, password = data.get('username'), data.get('password')
        if not isinstance(username, str) or not isinstance(password, str): raise ApiError('Usuario o contraseña incorrectos.', 401)
        user = authenticate(request, username=username.strip(), password=password)
        if user is None: raise ApiError('Usuario o contraseña incorrectos.', 401)
        login(request, user)
        return {'account': account(user)}
    if route == 'auth/logout/':
        logout(request)
        return {'account': None}
    if route == 'auth/profile/': return profile_update(request, data)
    if route == 'auth/delete/':
        require_user(request)
        if request.user.rol != 'cliente': raise ApiError('No se puede eliminar la cuenta administradora.', 403)
        password = data.get('password')
        if not isinstance(password, str) or not request.user.check_password(password): raise ApiError('La contraseña es incorrecta. Tu cuenta no se eliminó.')
        request.user.delete()
        logout(request)
        return {'account': None}
    if route == 'orders/': return create_order(request, data)
    require_admin(request)
    if route == 'supplies/save/':
        identifier = data.get('id_insumo')
        supply = Insumo.objects.filter(pk=identifier).first() if identifier else Insumo()
        if supply is None: raise ApiError('Insumo no encontrado.', 404)
        for field in ['nombre_insumo', 'unidad_medida_insumo', 'stock_actual_insumo', 'stock_minimo_insumo', 'costo_unitario']:
            if field not in data: raise ApiError('Completa todos los campos del insumo.')
            setattr(supply, field, data[field])
        supply.full_clean()
        supply.save()
        return {'ok': True, 'id_insumo': supply.pk}
    if route == 'supplies/delete/':
        supply = Insumo.objects.filter(pk=data.get('id_insumo')).first()
        if not supply: raise ApiError('Insumo no encontrado.', 404)
        if supply.recetas.exists() or any(str(supply.pk) in o.insumos_descontados for o in Pedido.objects.exclude(estado_pedido='Cancelado')):
            raise ApiError('El insumo está vinculado a recetas o pedidos. Retira esas referencias antes de eliminarlo.', 409)
        supply.delete()
        return {'ok': True}
    parts = route.strip('/').split('/')
    if len(parts) != 3 or not parts[1].isdigit(): raise ApiError('Ruta no encontrada.', 404)
    category, identifier, action = parts
    if category == 'orders' and action == 'status':
        order = Pedido.objects.filter(pk=identifier).first()
        if not order: raise ApiError('Pedido no encontrado.', 404)
        status = data.get('estado')
        if status not in ['En curso','Listo','Entregado','Cancelado']: raise ApiError('Estado inválido.')
        if order.estado_pedido == 'Cancelado' and status != 'Cancelado': raise ApiError('Un pedido cancelado no puede reactivarse.', 409)
        if status == 'Cancelado':
            reponer = data.get('reponer_insumos', True)
            if type(reponer) is not bool: raise ApiError('La opción de reponer insumos debe ser verdadera o falsa.')
            if order.estado_pedido == 'Cancelado': return {'ok': True, 'insumos_repuestos': order.insumos_repuestos}
            if reponer:
                if not order.insumos_descontados: raise ApiError('No hay registro de insumos para reponer. Puedes cancelar sin reposición y ajustar el inventario manualmente.', 409)
                for supply_id, quantity in order.insumos_descontados.items():
                    supply = Insumo.objects.filter(pk=supply_id).first()
                    if not supply: raise ApiError('Un insumo del pedido ya no existe. Cancela sin reposición y revisa el inventario.', 409)
                    supply.stock_actual_insumo += Decimal(quantity)
                    supply.full_clean()
                    supply.save(update_fields=['stock_actual_insumo'])
                order.insumos_repuestos = True
            order.estado_pedido = 'Cancelado'
            order.save(update_fields=['estado_pedido', 'insumos_repuestos'])
            return {'ok': True, 'insumos_repuestos': order.insumos_repuestos}
        if status == 'Entregado' and order.estado_pedido not in ['Listo','Entregado']: raise ApiError('Primero marca el pedido como listo.', 409)
        order.estado_pedido = status
        order.save(update_fields=['estado_pedido'])
        return {'ok': True}
    if category == 'supplies' and action == 'stock':
        supply = Insumo.objects.filter(pk=identifier).first()
        if not supply: raise ApiError('Insumo no encontrado.', 404)
        try:
            raw = data.get('stock') if 'stock' in data else data.get('delta')
            if isinstance(raw, bool): raise ValueError()
            value = Decimal(str(raw))
            if not value.is_finite(): raise ValueError()
            result = value if 'stock' in data else supply.stock_actual_insumo + value
            if result < 0 or result > Decimal('99999999999.999') or result.as_tuple().exponent < -3: raise ValueError()
        except (ValueError, TypeError, InvalidOperation): raise ApiError('Stock inválido: usa un valor no negativo con máximo tres decimales.')
        supply.stock_actual_insumo = result
        supply.save(update_fields=['stock_actual_insumo'])
        return {'ok': True}
    if category == 'dishes' and action == 'toggle':
        dish = Colacion.objects.filter(pk=identifier).first()
        if not dish: raise ApiError('Plato no encontrado.', 404)
        dish.activa_colacion = not dish.activa_colacion
        dish.save(update_fields=['activa_colacion'])
        return {'ok': True}
    raise ApiError('Ruta no encontrada.', 404)

@ensure_csrf_cookie
def dispatch(request, route):
    try:
        data = json.loads(request.body or '{}') if request.method == 'POST' else {}
        if not isinstance(data, dict): raise ApiError('El cuerpo debe ser un objeto JSON.')
        if request.method == 'POST':
            with transaction.atomic(): result = handle(request, route, data)
        else: result = handle(request, route, data)
        return JsonResponse({**result, 'csrfToken': get_token(request)})
    except ApiError as error: return JsonResponse({'error': error.message}, status=error.status)
    except ValidationError as error: return JsonResponse({'error': ' '.join(error.messages)}, status=400)
    except (json.JSONDecodeError, UnicodeDecodeError): return JsonResponse({'error':'JSON inválido.'}, status=400)
    except IntegrityError: return JsonResponse({'error':'Los datos entran en conflicto con un registro existente. Actualiza e inténtalo de nuevo.'}, status=409)
    except OperationalError: return JsonResponse({'error':'La base está ocupada temporalmente. Inténtalo de nuevo.'}, status=503)
def csrf_failure(request, reason=''):
    return JsonResponse({'error':'La sesión de seguridad expiró. Recarga la página e inténtalo otra vez.'}, status=403)
