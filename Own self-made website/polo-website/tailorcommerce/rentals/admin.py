# rentals/admin.py

from django.contrib import admin
from .models import RentalTransaction

@admin.register(RentalTransaction)
class RentalTransactionAdmin(admin.ModelAdmin):
    list_display = ['order_item', 'status', 'expected_return_date', 'actual_return_date', 'refund_amount', 'created_at']
    list_filter = ['status', 'condition_status', 'expected_return_date']
    search_fields = ['order_item__product_name', 'order_item__order__order_number']
    
    fieldsets = (
        ('Rental Details', {
            'fields': ('order_item', 'deposit_amount', 'rent_per_day')
        }),
        ('Return Information', {
            'fields': ('expected_return_date', 'actual_return_date', 'actual_days_used', 'condition_status')
        }),
        ('Fees & Refund', {
            'fields': ('rent_cost', 'late_fee', 'damage_fee', 'refund_amount', 'status')
        }),
    )
    
    actions = ['process_return']
    
    def process_return(self, request, queryset):
        for rental in queryset:
            if rental.actual_return_date:
                rental.calculate_refund()
    process_return.short_description = "Calculate refund for selected rentals"