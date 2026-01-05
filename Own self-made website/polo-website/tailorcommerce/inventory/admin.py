# inventory/admin.py

from django.contrib import admin
from .models import Inventory

@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ['variant', 'available_quantity', 'low_stock_threshold', 'is_low_stock', 'is_out_of_stock', 'updated_at']
    list_filter = ['updated_at']
    search_fields = ['variant__product__name', 'variant__sku']
    
    def is_low_stock(self, obj):
        return obj.is_low_stock
    is_low_stock.boolean = True
    is_low_stock.short_description = 'Low Stock?'
    
    def is_out_of_stock(self, obj):
        return obj.is_out_of_stock
    is_out_of_stock.boolean = True
    is_out_of_stock.short_description = 'Out of Stock?'