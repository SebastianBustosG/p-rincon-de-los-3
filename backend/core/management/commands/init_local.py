import json, os, textwrap
from pathlib import Path
from django.core.management.base import BaseCommand
from django.db import transaction
from core.models import Usuario, Insumo, Colacion, Receta
class Command(BaseCommand):
    help = 'Crea el administrador y el catálogo inicial solo cuando faltan. No importa localStorage ni crea pedidos.'
    @transaction.atomic
    def handle(self, *args, **options):
        if not Usuario.objects.filter(rol='administrador').exists():
            Usuario.objects.create_superuser(os.environ.get('RINCON_ADMIN_USER', 'admin_loreto'), os.environ.get('RINCON_ADMIN_PASSWORD', 'Rincon2026!'))
            self.stdout.write('Administrador local creado. Usuario inicial: admin_loreto (o RINCON_ADMIN_USER).')
        if Colacion.objects.exists() or Insumo.objects.exists() or Receta.objects.exists():
            self.stdout.write('Catálogo existente: no se modifica.')
            return
        catalog = json.loads((Path(__file__).resolve().parents[3] / 'catalogo_inicial.json').read_text(encoding='utf-8'))
        for data in catalog['insumos']: Insumo.objects.create(**data)
        for data in catalog['colaciones']:
            data['descripcion_colacion'] = textwrap.shorten(data['descripcion_colacion'], width=100, placeholder='…')
            Colacion.objects.create(**data)
        for data in catalog['recetas']: Receta.objects.create(**data)
        self.stdout.write('Catálogo base creado; cero pedidos y cero clientes importados.')
