from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from .models import Usuario, Colacion, Insumo, Receta, Pedido, DetallePedido
class CreationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = Usuario
        fields = ('username_usuario',)
class ChangeForm(UserChangeForm):
    class Meta(UserChangeForm.Meta):
        model = Usuario
        fields = '__all__'
@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    add_form = CreationForm
    form = ChangeForm
    ordering = ('username_usuario',)
    list_display = ('username_usuario','rol','is_active')
    search_fields = ('username_usuario',)
    fieldsets = ((None, {'fields': ('username_usuario','password')}), ('Perfil', {'fields': ('rol','telefono','direccion')}), ('Permisos', {'fields': ('is_active','is_staff','is_superuser','groups','user_permissions')}))
    add_fieldsets = ((None, {'fields': ('username_usuario','password1','password2','rol','is_staff')}),)
admin.site.register([Colacion, Insumo, Receta, Pedido, DetallePedido])
