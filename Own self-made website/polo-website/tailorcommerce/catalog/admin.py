# catalog/admin.py

from django.contrib import admin
from .models import (
    Product, ProductImage, ProductVariant, Fabric, 
    StitchType, TraditionalBoxItem, RentalConfig
)


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ['image', 'is_primary', 'display_order']


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ['sku', 'size', 'color', 'price_override', 'is_active']


class TraditionalBoxItemInline(admin.TabularInline):
    model = TraditionalBoxItem
    extra = 1
    fields = ['item_name', 'quantity', 'is_stitchable']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'brand', 'is_buyable', 'is_rentable', 'is_active', 'created_at']
    list_filter = ['category', 'is_buyable', 'is_rentable', 'is_active', 'created_at']
    search_fields = ['name', 'brand', 'description']
    prepopulated_fields = {'slug': ('name',)}
    
    inlines = [ProductImageInline, ProductVariantInline, TraditionalBoxItemInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'category', 'brand', 'description')
        }),
        ('Availability', {
            'fields': ('is_buyable', 'is_rentable', 'is_active')
        }),
    )


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['product', 'is_primary', 'display_order', 'created_at']
    list_filter = ['is_primary', 'created_at']
    search_fields = ['product__name']


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ['product', 'sku', 'size', 'color', 'price_override', 'is_active']
    list_filter = ['size', 'is_active', 'created_at']
    search_fields = ['product__name', 'sku', 'color']


@admin.register(Fabric)
class FabricAdmin(admin.ModelAdmin):
    list_display = ['product', 'fabric_category', 'material', 'color', 'price_per_meter']
    list_filter = ['fabric_category', 'material']
    search_fields = ['product__name', 'color']


@admin.register(StitchType)
class StitchTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name']


@admin.register(TraditionalBoxItem)
class TraditionalBoxItemAdmin(admin.ModelAdmin):
    list_display = ['product', 'item_name', 'quantity', 'is_stitchable']
    list_filter = ['is_stitchable']
    search_fields = ['product__name', 'item_name']


@admin.register(RentalConfig)
class RentalConfigAdmin(admin.ModelAdmin):
    list_display = ['product', 'deposit_amount', 'rent_per_day']
    search_fields = ['product__name']
    
    def get_readonly_fields(self, request, obj=None):
        # Show warning about product rentability
        if obj and not obj.product.is_rentable:
            return ['product']
        return []