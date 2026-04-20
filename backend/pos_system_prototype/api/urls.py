from django.urls import path

from .views import (
    login_view,
    logout_view,
    product_detail_view,
    products_view,
    sales_view,
    settings_view,
    user_detail_view,
    users_view,
)

urlpatterns = [
    path("auth/login/", login_view, name="api-login"),
    path("auth/logout/", logout_view, name="api-logout"),
    path("auth/users/", users_view, name="api-users"),
    path("auth/users/<int:user_id>/", user_detail_view, name="api-user-detail"),
    path("settings/", settings_view, name="api-settings"),
    path("products/", products_view, name="api-products"),
    path("products/<uuid:product_id>/", product_detail_view, name="api-product-detail"),
    path("sales/", sales_view, name="api-sales"),
]
