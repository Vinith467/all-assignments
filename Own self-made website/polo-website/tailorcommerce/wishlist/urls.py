from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_wishlist, name='get_wishlist'),
    path('toggle/', views.toggle_wishlist, name='toggle_wishlist'),
]