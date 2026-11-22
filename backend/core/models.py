import unicodedata
from decimal import Decimal
from django.db import models
from django.db.models.functions import Lower
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.core.validators import MinValueValidator, RegexValidator
from django.utils import timezone

def normalizar_usuario(value): return unicodedata.normalize('NFKC', value).strip().casefold()

telefono_validator = RegexValidator(r'^[0-9]+$', 'El teléfono debe contener solo números.')
class UsuarioManager(BaseUserManager):
    def get_by_natural_key(self, username):
        return self.get(username_clave=normalizar_usuario(username))
    def create_user(self, username_usuario, password=None, **extra):
        user = self.model(username_usuario=username_usuario.strip(), **extra)
        user.set_password(password)
        user.full_clean()
        user.save(using=self._db)
        return user
    def create_superuser(self, username_usuario, password=None, **extra):
        extra.update(rol='administrador', is_staff=True, is_superuser=True)
        return self.create_user(username_usuario, password, **extra)

class Usuario(AbstractBaseUser, PermissionsMixin):
    id_usuario = models.BigAutoField(primary_key=True)
    username_usuario = models.CharField(max_length=30, unique=True)
    username_clave = models.CharField(max_length=60, unique=True, editable=False, blank=True, default='')
    password = models.CharField('contraseña', max_length=128, db_column='contraseña')
    rol = models.CharField(max_length=20, choices=[('cliente', 'Cliente'), ('administrador', 'Administrador')], default='cliente')
    direccion = models.CharField(max_length=120, blank=True)
    telefono = models.CharField(max_length=15, blank=True, validators=[telefono_validator])
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    objects = UsuarioManager()
    def clean(self):
        super().clean()
        self.username_clave = normalizar_usuario(self.username_usuario)
    def save(self, *args, **kwargs):
        self.username_clave = normalizar_usuario(self.username_usuario)
        return super().save(*args, **kwargs)
    USERNAME_FIELD = 'username_usuario'
    REQUIRED_FIELDS = []
    class Meta:
        db_table = 'usuario'
        constraints = [models.UniqueConstraint(Lower('username_usuario'), name='usuario_nombre_sin_mayusculas'), models.CheckConstraint(condition=models.Q(rol__in=['cliente', 'administrador']), name='usuario_rol_valido')]
    def __str__(self): return self.username_usuario

class Colacion(models.Model):
    id_colacion = models.BigAutoField(primary_key=True)
    nombre_colacion = models.CharField(max_length=50)
    descripcion_colacion = models.CharField(max_length=100, blank=True)
    precio_colacion = models.PositiveIntegerField()
    activa_colacion = models.BooleanField(default=True)
    categoria = models.CharField(max_length=50, default='Plato Tradicional')
    imagen = models.URLField(max_length=500, blank=True)
    tiempo_estimado = models.CharField(max_length=30, blank=True)
    class Meta: db_table = 'colacion'
    def __str__(self): return self.nombre_colacion

class Insumo(models.Model):
    id_insumo = models.BigAutoField(primary_key=True)
    nombre_insumo = models.CharField(max_length=50)
    unidad_medida_insumo = models.CharField(max_length=10, choices=[(x,x) for x in ['kg','gr','un','lts','ml']])
    stock_actual_insumo = models.DecimalField(max_digits=14, decimal_places=3, validators=[MinValueValidator(0)])
    stock_minimo_insumo = models.DecimalField(max_digits=14, decimal_places=3, validators=[MinValueValidator(0)])
    costo_unitario = models.DecimalField(max_digits=14, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    class Meta:
        db_table = 'insumo'
        constraints = [models.CheckConstraint(condition=models.Q(stock_actual_insumo__gte=0, stock_minimo_insumo__gte=0, costo_unitario__gte=0), name='insumo_valores_no_negativos')]
    def __str__(self): return self.nombre_insumo

class Receta(models.Model):
    id_receta = models.BigAutoField(primary_key=True)
    colacion = models.ForeignKey(Colacion, db_column='colacion_id', on_delete=models.CASCADE, related_name='recetas')
    insumo = models.ForeignKey(Insumo, db_column='insumo_id', on_delete=models.PROTECT, related_name='recetas')
    nombre_receta = models.CharField(max_length=50)
    cantidad_necesaria_receta = models.DecimalField(max_digits=14, decimal_places=3, validators=[MinValueValidator(Decimal('0.001'))])
    class Meta:
        db_table = 'receta'
        constraints = [models.UniqueConstraint(fields=['colacion', 'insumo'], name='receta_ingrediente_unico'), models.CheckConstraint(condition=models.Q(cantidad_necesaria_receta__gt=0), name='receta_cantidad_positiva')]

class Pedido(models.Model):
    id_pedido = models.BigAutoField(primary_key=True)
    fecha_hora_pedido = models.DateTimeField(default=timezone.now, db_index=True)
    nombre_cliente_pedido = models.CharField(max_length=40)
    telefono_cliente_pedido = models.CharField(max_length=15, validators=[telefono_validator])
    estado_pedido = models.CharField(max_length=20, choices=[(x,x) for x in ['En curso','Listo','Entregado','Cancelado']], default='En curso')
    metodo_pago_pedido = models.CharField(max_length=20, choices=[(x,x) for x in ['Efectivo','Transferencia','Débito']])
    total_pedido = models.PositiveIntegerField()
    observaciones_pedido = models.CharField(max_length=200, blank=True)
    cliente = models.ForeignKey(Usuario, null=True, blank=True, on_delete=models.SET_NULL, related_name='pedidos')
    tipo_entrega = models.CharField(max_length=30, choices=[(x,x) for x in ['Retiro en Local','Despacho a Domicilio']])
    direccion_entrega = models.CharField(max_length=120, blank=True)
    monto_paga_con = models.PositiveIntegerField(null=True, blank=True)
    solicitud_id = models.UUIDField(unique=True)
    solicitud_sesion = models.CharField(max_length=64, editable=False)
    solicitud_hash = models.CharField(max_length=64, editable=False)
    insumos_descontados = models.JSONField(default=dict, editable=False)
    insumos_repuestos = models.BooleanField(default=False, editable=False)
    class Meta:
        db_table = 'pedido'
        constraints = [models.CheckConstraint(condition=models.Q(estado_pedido__in=['En curso','Listo','Entregado','Cancelado']), name='pedido_estado_valido')]
        ordering = ['-fecha_hora_pedido', '-id_pedido']

class DetallePedido(models.Model):
    id_detalle_pedido = models.BigAutoField(primary_key=True)
    pedido = models.ForeignKey(Pedido, db_column='id_pedido', on_delete=models.CASCADE, related_name='detalles')
    colacion = models.ForeignKey(Colacion, db_column='id_colacion', on_delete=models.PROTECT)
    cantidad_detalle_pedido = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    subtotal_detalle_pedido = models.PositiveIntegerField()
    nombre_colacion = models.CharField(max_length=50)
    precio_unitario = models.PositiveIntegerField()
    costo_insumos = models.DecimalField(max_digits=16, decimal_places=3, default=0)
    class Meta:
        db_table = 'detalle_pedido'
        constraints = [models.CheckConstraint(condition=models.Q(cantidad_detalle_pedido__gt=0), name='detalle_cantidad_positiva'), models.UniqueConstraint(fields=['pedido','colacion'], name='detalle_plato_unico')]
