# orders/admin_urls.py

from django.urls import path
from . import admin_views

app_name = 'orders_admin'

urlpatterns = [
    path('all/', admin_views.admin_order_list, name='admin_order_list'),
    path('<int:order_id>/update-status/', admin_views.update_order_status, name='update_order_status'),
    path('items/<int:order_item_id>/set-meters/', admin_views.set_fabric_meters, name='set_fabric_meters'),
    path('pending-measurements/', admin_views.orders_pending_measurement, name='pending_measurements'),
]