# rentals/admin_urls.py

from django.urls import path
from . import admin_views

app_name = 'rentals_admin'

urlpatterns = [
    path('active/', admin_views.active_rentals, name='active_rentals'),
    path('<int:rental_id>/return/', admin_views.process_return, name='process_return'),
    path('history/', admin_views.rental_history, name='rental_history'),
]