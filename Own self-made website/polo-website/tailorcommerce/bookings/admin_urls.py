# bookings/admin_urls.py

from django.urls import path
from . import admin_views

app_name = 'bookings_admin'

urlpatterns = [
    path('<int:booking_id>/upload-measurement/', admin_views.upload_measurement, name='upload_measurement'),
]