# accounts/urls.py

from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('refresh/', views.refresh_token, name='refresh_token'),
    path('me/', views.me, name='me'),
    path('profile/update/', views.update_profile, name='update_profile'), # NEW
    path('addresses/', views.address_list, name='address_list'), # NEW
    path('addresses/<int:address_id>/', views.address_detail, name='address_detail'), # NEW
]