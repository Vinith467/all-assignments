# catalog/urls.py

from django.urls import path
from . import views

app_name = 'catalog'

urlpatterns = [
    path('list/', views.product_list, name='product_list'),
    path('<int:product_id>/', views.product_detail, name='product_detail'),
    path('categories/', views.categories_list, name='categories_list'),
]