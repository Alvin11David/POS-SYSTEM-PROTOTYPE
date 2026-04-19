import json

from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods


def serialize_user(user):
    full_name = user.get_full_name().strip() or user.username
    role = user.groups.first().name if user.groups.exists() else "cashier"
    if user.is_superuser:
        role = "admin"

    return {
        "id": str(user.id),
        "username": user.username,
        "fullName": full_name,
        "role": role,
        "isStaff": user.is_staff,
        "isSuperuser": user.is_superuser,
    }


@csrf_exempt
@require_http_methods(["POST"])
def login_view(request):
    try:
        payload = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"detail": "Invalid JSON body"}, status=400)

    username = str(payload.get("username", "")).strip()
    password = str(payload.get("password", ""))

    if not username or not password:
        return JsonResponse({"detail": "Username and password are required"}, status=400)

    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({"detail": "Invalid username or password"}, status=401)

    auth_login(request, user)
    return JsonResponse({"user": serialize_user(user)})


@csrf_exempt
@require_http_methods(["POST"])
def logout_view(request):
    auth_logout(request)
    return JsonResponse({"ok": True})
