# bookings/admin.py

from django.contrib import admin
from django.utils.html import format_html
from .models import MeasurementProfile, Booking

@admin.register(MeasurementProfile)
class MeasurementProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'profile_name', 'created_at', 'updated_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'profile_name']

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'time_slot', 'status', 'has_photo', 'created_at']
    list_filter = ['status', 'date', 'created_at']
    search_fields = ['user__username', 'notes']
    
    fieldsets = (
        ('Booking Information', {
            'fields': ('user', 'date', 'time_slot', 'status', 'notes')
        }),
        ('Measurements (Admin Only)', {
            'fields': ('measurement_photo', 'measurement_data'),
            'description': 'Upload photo of handwritten measurements. Customer cannot see this.'
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    actions = ['mark_as_confirmed', 'mark_as_completed']
    
    def has_photo(self, obj):
        """Show if measurement photo exists"""
        if obj.measurement_photo:
            return format_html('<span style="color: green;">{}</span>','✓ Photo uploaded'
            )
        return format_html('<span style="color: gray;">{}</span>','No photo'
        )
    has_photo.short_description = 'Measurement Photo'
    
    def mark_as_confirmed(self, request, queryset):
        queryset.update(status='CONFIRMED')
    mark_as_confirmed.short_description = "Mark selected as Confirmed"
    
    def mark_as_completed(self, request, queryset):
        queryset.update(status='COMPLETED')
    mark_as_completed.short_description = "Mark selected as Completed"