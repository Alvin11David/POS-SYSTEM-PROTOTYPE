from django.urls import path

from .views import (
    login_view,
    logout_view,
    product_detail_view,
    products_view,
    sales_view,
)

urlpatterns = [
    path("auth/login/", login_view, name="api-login"),
    path("auth/logout/", logout_view, name="api-logout"),
    path("products/", products_view, name="api-products"),
    path("products/<uuid:product_id>/", product_detail_view, name="api-product-detail"),
    path("sales/", sales_view, name="api-sales"),
]
