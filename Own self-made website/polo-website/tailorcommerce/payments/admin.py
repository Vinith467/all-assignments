# payments/admin.py

from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['order', 'provider', 'transaction_id', 'amount', 'status', 'created_at']
    list_filter = ['status', 'provider', 'created_at']
    search_fields = ['order__order_number', 'transaction_id']
    readonly_fields = ['created_at', 'updated_at']
    
    actions = ['mark_as_success', 'mark_as_failed']
    
    def mark_as_success(self, request, queryset):
        queryset.update(status='SUCCESS')
    mark_as_success.short_description = "Mark selected as Success"
    
    def mark_as_failed(self, request, queryset):
        queryset.update(status='FAILED')
    mark_as_failed.short_description = "Mark selected as Failed"