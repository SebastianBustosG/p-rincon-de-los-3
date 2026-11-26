import re, unicodedata
from django import forms
from .models import Usuario
def full_name(value):
    parts = value.strip().split()
    if len(parts) < 3 or not all(any(c.isalpha() for c in part) and all(c.isalpha() or unicodedata.category(c).startswith('M') or c in "'-’" for c in part) for part in parts):
        raise forms.ValidationError('Ingresa tu nombre y tus dos apellidos, separados por espacios.')
    return ' '.join(parts)
class ProfileForm(forms.Form):
    username = forms.CharField(max_length=30, min_length=3)
    telefono = forms.RegexField(r'^56[0-9]{9}$', strip=False, error_messages={'invalid':'El teléfono debe ser chileno con prefijo 56 y exactamente 11 dígitos, sin signo + ni espacios.'})
    direccion = forms.CharField(max_length=120)
    def clean_username(self): return full_name(self.cleaned_data['username'])
class OrderForm(forms.Form):
    nombre = forms.CharField(max_length=40)
    telefono = forms.RegexField(r'^56[0-9]{9}$', strip=False, error_messages={'invalid':'El teléfono debe ser chileno con prefijo 56 y exactamente 11 dígitos, sin signo + ni espacios.'})
    tipoEntrega = forms.ChoiceField(choices=[(x,x) for x in ['Retiro en Local','Despacho a Domicilio']])
    direccion = forms.CharField(max_length=120, required=False)
    metodoPago = forms.ChoiceField(choices=[(x,x) for x in ['Efectivo','Transferencia','Débito']])
    montoPagaCon = forms.IntegerField(min_value=0, required=False)
    observaciones = forms.CharField(max_length=200, required=False)
    solicitud_id = forms.UUIDField()
    def clean_nombre(self): return full_name(self.cleaned_data['nombre'])
    def clean(self):
        data = super().clean()
        if data.get('tipoEntrega') == 'Despacho a Domicilio' and not data.get('direccion'):
            self.add_error('direccion', 'Ingresa tu dirección de despacho.')
        return data
