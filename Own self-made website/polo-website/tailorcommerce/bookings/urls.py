# bookings/urls.py

from django.urls import path
from . import views

app_name = 'bookings'

urlpatterns = [
    # Bookings
    path('create/', views.create_booking, name='create_booking'),
    path('', views.booking_list, name='booking_list'),
    path('<int:booking_id>/', views.booking_detail, name='booking_detail'),
    path('<int:booking_id>/cancel/', views.cancel_booking, name='cancel_booking'),
    path('available-slots/', views.available_slots, name='available_slots'),
    
    # Measurement Profiles
    path('measurements/create/', views.create_measurement_profile, name='create_measurement_profile'),
    path('measurements/', views.measurement_profile_list, name='measurement_profile_list'),
    path('measurements/<int:profile_id>/', views.measurement_profile_detail, name='measurement_profile_detail'),
    
    # NEW: Get my measurements
    path('my-measurements/', views.get_my_measurements, name='get_my_measurements'),
]