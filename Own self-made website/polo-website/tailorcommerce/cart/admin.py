# cart/admin.py

from django.contrib import admin
from .models import Cart, CartItem

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ['get_subtotal']
    fields = ['product', 'variant', 'purchase_type', 'quantity', 'price_snapshot', 'get_subtotal']
    
    def get_subtotal(self, obj):
        return f"₹{obj.get_subtotal()}"
    get_subtotal.short_description = 'Subtotal'

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['user', 'status', 'get_total', 'created_at', 'updated_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__username']
    inlines = [CartItemInline]
    
    def get_total(self, obj):
        return f"₹{obj.calculate_total()}"
    get_total.short_description = 'Total'

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['cart', 'product', 'variant', 'purchase_type', 'quantity', 'price_snapshot', 'get_subtotal']
    list_filter = ['purchase_type', 'created_at']
    search_fields = ['product__name', 'cart__user__username']
    
    def get_subtotal(self, obj):
        return f"₹{obj.get_subtotal()}"
    get_subtotal.short_description = 'Subtotal'