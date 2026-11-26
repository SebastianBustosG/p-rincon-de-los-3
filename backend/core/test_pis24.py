from core.tests import ApiTests
from core.models import Insumo

class SuppliesTests(ApiTests):
    def test_supply_crud_and_validation(self):
        data = dict(nombre_insumo='Sal', unidad_medida_insumo='kg', stock_actual_insumo=2, stock_minimo_insumo=2, costo_unitario=100)
        self.assertEqual(self.post('supplies/save/', data).status_code, 401)
        self.signin()
        response = self.post('supplies/save/', data)
        self.assertEqual(response.status_code, 200)
        pk = response.json()['id_insumo']
        self.assertEqual(self.post('supplies/save/', dict(data, id_insumo=pk, stock_actual_insumo=-1)).status_code, 400)
        self.assertEqual(self.post('supplies/save/', dict(data, id_insumo=pk, costo_unitario=250)).status_code, 200)
        self.assertEqual(Insumo.objects.get(pk=pk).costo_unitario, 250)
        self.assertEqual(self.post('supplies/delete/', {'id_insumo': self.supply.pk}).status_code, 409)
        self.assertEqual(self.post('supplies/delete/', {'id_insumo': pk}).status_code, 200)
        self.assertFalse(Insumo.objects.filter(pk=pk).exists())
