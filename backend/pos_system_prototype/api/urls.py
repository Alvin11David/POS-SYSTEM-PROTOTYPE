from django.urls import path

from .views import login_view, logout_view

urlpatterns = [
    path("auth/login/", login_view, name="api-login"),
    path("auth/logout/", logout_view, name="api-logout"),
]
