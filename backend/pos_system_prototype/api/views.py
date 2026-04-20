import json
from decimal import Decimal, InvalidOperation
from uuid import UUID

from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.http import JsonResponse
from django.utils.dateparse import parse_datetime
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import AppSetting, Product, Sale, SaleItem, Notification


User = get_user_model()
CURRENCY_OPTIONS = {"USD", "EUR", "GBP", "KES", "UGX"}


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
        "createdAt": user.date_joined.isoformat(),
        "isStaff": user.is_staff,
        "isSuperuser": user.is_superuser,
    }


def _is_admin_user(user):
    if not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    return user.groups.filter(name="admin").exists()


def _apply_role(user, role):
    normalized_role = str(role or "cashier").strip().lower()
    if normalized_role not in {"admin", "manager", "cashier"}:
        return None

    user.groups.clear()
    group, _ = Group.objects.get_or_create(name=normalized_role)
    user.groups.add(group)
    user.is_staff = normalized_role in {"admin", "manager"}
    user.is_superuser = normalized_role == "admin"
    user.save()
    return normalized_role


def _get_app_setting():
    setting, _ = AppSetting.objects.get_or_create(id=1)
    return setting


def serialize_setting(setting):
    return {
        "currency": setting.currency,
        "taxRate": float(setting.tax_rate),
    }


def serialize_product(product):
    return {
        "id": str(product.id),
        "name": product.name,
        "price": float(product.price),
        "category": product.category or "",
        "emoji": product.emoji or "",
        "imageUrl": product.image_url or "",
    }


def serialize_sale_item(item):
    return {
        "id": str(item.product_id) if item.product_id else str(item.id),
        "name": item.name,
        "price": float(item.price),
        "quantity": item.quantity,
        "emoji": item.emoji or "",
    }


def serialize_sale(sale):
    return {
        "id": str(sale.id),
        "items": [serialize_sale_item(item) for item in sale.items.all()],
        "total": float(sale.total),
        "createdAt": sale.created_at.isoformat(),
    }


def serialize_notification(notification):
    return {
        "id": str(notification.id),
        "title": notification.title,
        "message": notification.message,
        "type": notification.notification_type,
        "isRead": notification.is_read,
        "createdAt": notification.created_at.isoformat(),
        "updatedAt": notification.updated_at.isoformat(),
    }


def _parse_body(request):
    try:
        return json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return None


@csrf_exempt
@require_http_methods(["POST"])
def login_view(request):
    payload = _parse_body(request)
    if payload is None:
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


@csrf_exempt
@require_http_methods(["GET", "POST"])
def users_view(request):
    if not _is_admin_user(request.user):
        return JsonResponse({"detail": "Forbidden"}, status=403)

    if request.method == "GET":
        users = User.objects.order_by("date_joined")
        return JsonResponse({"users": [serialize_user(user) for user in users]})

    payload = _parse_body(request)
    if payload is None:
        return JsonResponse({"detail": "Invalid JSON body"}, status=400)

    username = str(payload.get("username", "")).strip()
    password = str(payload.get("password", ""))
    full_name = str(payload.get("fullName", "")).strip()
    role = str(payload.get("role", "cashier")).strip().lower()

    if not username:
        return JsonResponse({"detail": "Username is required"}, status=400)
    if len(password) < 4:
        return JsonResponse({"detail": "Password must be at least 4 characters"}, status=400)
    if User.objects.filter(username__iexact=username).exists():
        return JsonResponse({"detail": "Username already exists"}, status=400)

    user = User.objects.create_user(username=username, password=password)
    user.first_name = full_name
    user.last_name = ""
    user.save()

    applied_role = _apply_role(user, role)
    if applied_role is None:
        user.delete()
        return JsonResponse({"detail": "Invalid role"}, status=400)

    return JsonResponse({"user": serialize_user(user)}, status=201)


@csrf_exempt
@require_http_methods(["PUT", "DELETE"])
def user_detail_view(request, user_id):
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "Forbidden"}, status=403)

    is_admin = _is_admin_user(request.user)

    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return JsonResponse({"detail": "User not found"}, status=404)

    is_self = user.id == request.user.id

    if not is_admin and not is_self:
        return JsonResponse({"detail": "Forbidden"}, status=403)

    if request.method == "DELETE":
        if not is_admin:
            return JsonResponse({"detail": "Forbidden"}, status=403)
        if user.id == request.user.id:
            return JsonResponse({"detail": "You cannot remove your own account"}, status=400)
        user.delete()
        return JsonResponse({"ok": True})

    payload = _parse_body(request)
    if payload is None:
        return JsonResponse({"detail": "Invalid JSON body"}, status=400)

    if not is_admin:
        disallowed_fields = {"username", "fullName", "role"}
        if any(field in payload for field in disallowed_fields):
            return JsonResponse({"detail": "Forbidden"}, status=403)

    incoming_username = payload.get("username")
    if incoming_username is not None:
        username = str(incoming_username).strip()
        if not username:
            return JsonResponse({"detail": "Username is required"}, status=400)
        duplicate = User.objects.filter(username__iexact=username).exclude(pk=user.id).exists()
        if duplicate:
            return JsonResponse({"detail": "Username already exists"}, status=400)
        user.username = username

    incoming_full_name = payload.get("fullName")
    if incoming_full_name is not None:
        user.first_name = str(incoming_full_name).strip()
        user.last_name = ""

    incoming_password = payload.get("password")
    if incoming_password is not None and str(incoming_password):
        if len(str(incoming_password)) < 4:
            return JsonResponse({"detail": "Password must be at least 4 characters"}, status=400)
        user.set_password(str(incoming_password))

    incoming_role = payload.get("role")
    if incoming_role is not None:
        applied_role = _apply_role(user, incoming_role)
        if applied_role is None:
            return JsonResponse({"detail": "Invalid role"}, status=400)
    else:
        user.save()

    return JsonResponse({"user": serialize_user(user)})


@csrf_exempt
@require_http_methods(["GET", "PUT"])
def settings_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "Forbidden"}, status=403)

    setting = _get_app_setting()

    if request.method == "GET":
        return JsonResponse({"settings": serialize_setting(setting)})

    if not _is_admin_user(request.user):
        return JsonResponse({"detail": "Forbidden"}, status=403)

    payload = _parse_body(request)
    if payload is None:
        return JsonResponse({"detail": "Invalid JSON body"}, status=400)

    incoming_currency = payload.get("currency")
    if incoming_currency is not None:
        currency = str(incoming_currency).strip().upper()
        if currency not in CURRENCY_OPTIONS:
            return JsonResponse({"detail": "Invalid currency"}, status=400)
        setting.currency = currency

    incoming_tax_rate = payload.get("taxRate")
    if incoming_tax_rate is not None:
        try:
            tax_rate = Decimal(str(incoming_tax_rate))
        except (InvalidOperation, TypeError):
            return JsonResponse({"detail": "Invalid tax rate"}, status=400)

        if tax_rate < 0:
            return JsonResponse({"detail": "Tax rate cannot be negative"}, status=400)
        setting.tax_rate = tax_rate

    setting.save()
    return JsonResponse({"settings": serialize_setting(setting)})


@csrf_exempt
@require_http_methods(["GET", "POST"])
def products_view(request):
    if request.method == "GET":
        products = Product.objects.all()
        return JsonResponse({"products": [serialize_product(product) for product in products]})

    payload = _parse_body(request)
    if payload is None:
        return JsonResponse({"detail": "Invalid JSON body"}, status=400)

    name = str(payload.get("name", "")).strip()
    if not name:
        return JsonResponse({"detail": "Product name is required"}, status=400)

    try:
        price = Decimal(str(payload.get("price", "0")))
    except (InvalidOperation, TypeError):
        return JsonResponse({"detail": "Invalid product price"}, status=400)

    if price < 0:
        return JsonResponse({"detail": "Product price cannot be negative"}, status=400)

    product = Product.objects.create(
        name=name,
        price=price,
        category=str(payload.get("category", "") or "").strip(),
        emoji=str(payload.get("emoji", "") or "").strip(),
        image_url=str(payload.get("imageUrl", "") or "").strip(),
    )
    return JsonResponse({"product": serialize_product(product)}, status=201)


@csrf_exempt
@require_http_methods(["PUT", "DELETE"])
def product_detail_view(request, product_id):
    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        return JsonResponse({"detail": "Product not found"}, status=404)

    if request.method == "DELETE":
        product.delete()
        return JsonResponse({"ok": True})

    payload = _parse_body(request)
    if payload is None:
        return JsonResponse({"detail": "Invalid JSON body"}, status=400)

    name = str(payload.get("name", product.name)).strip()
    if not name:
        return JsonResponse({"detail": "Product name is required"}, status=400)

    try:
        price = Decimal(str(payload.get("price", product.price)))
    except (InvalidOperation, TypeError):
        return JsonResponse({"detail": "Invalid product price"}, status=400)

    if price < 0:
        return JsonResponse({"detail": "Product price cannot be negative"}, status=400)

    product.name = name
    product.price = price
    product.category = str(payload.get("category", product.category) or "").strip()
    product.emoji = str(payload.get("emoji", product.emoji) or "").strip()
    product.image_url = str(payload.get("imageUrl", product.image_url) or "").strip()
    product.save()
    return JsonResponse({"product": serialize_product(product)})


@csrf_exempt
@require_http_methods(["GET", "POST"])
def sales_view(request):
    if request.method == "GET":
        sales = Sale.objects.prefetch_related("items").all()
        return JsonResponse({"sales": [serialize_sale(sale) for sale in sales]})

    payload = _parse_body(request)
    if payload is None:
        return JsonResponse({"detail": "Invalid JSON body"}, status=400)

    items = payload.get("items") or []
    if not isinstance(items, list) or len(items) == 0:
        return JsonResponse({"detail": "Sale must include at least one item"}, status=400)

    try:
        total = Decimal(str(payload.get("total", "0")))
    except (InvalidOperation, TypeError):
        return JsonResponse({"detail": "Invalid sale total"}, status=400)

    if total < 0:
        return JsonResponse({"detail": "Sale total cannot be negative"}, status=400)

    sale_kwargs = {"total": total}
    raw_created_at = payload.get("createdAt")
    if raw_created_at:
        parsed_created_at = parse_datetime(str(raw_created_at))
        if parsed_created_at is not None:
            sale_kwargs["created_at"] = parsed_created_at

    raw_id = payload.get("id")
    if raw_id:
        try:
            sale_kwargs["id"] = UUID(str(raw_id))
        except (TypeError, ValueError):
            return JsonResponse({"detail": "Invalid sale id"}, status=400)

    sale = Sale.objects.create(**sale_kwargs)
    item_models = []

    for raw_item in items:
        if not isinstance(raw_item, dict):
            sale.delete()
            return JsonResponse({"detail": "Invalid sale item payload"}, status=400)

        name = str(raw_item.get("name", "")).strip()
        if not name:
            sale.delete()
            return JsonResponse({"detail": "Sale item name is required"}, status=400)

        try:
            quantity = int(raw_item.get("quantity", 0))
            price = Decimal(str(raw_item.get("price", "0")))
        except (TypeError, ValueError, InvalidOperation):
            sale.delete()
            return JsonResponse({"detail": "Invalid sale item values"}, status=400)

        if quantity <= 0 or price < 0:
            sale.delete()
            return JsonResponse({"detail": "Invalid sale item quantity/price"}, status=400)

        product_ref = None
        raw_product_id = raw_item.get("id")
        if raw_product_id:
            try:
                product_ref = Product.objects.filter(pk=UUID(str(raw_product_id))).first()
            except (TypeError, ValueError):
                product_ref = None

        item_models.append(
            SaleItem(
                sale=sale,
                product=product_ref,
                name=name,
                price=price,
                quantity=quantity,
                emoji=str(raw_item.get("emoji", "") or "").strip(),
            )
        )

    SaleItem.objects.bulk_create(item_models)
    sale.refresh_from_db()
    return JsonResponse({"sale": serialize_sale(sale)}, status=201)


@csrf_exempt
@require_http_methods(["GET"])
def notifications_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "Forbidden"}, status=403)

    notifications = Notification.objects.filter(user=request.user)
    unread_count = notifications.filter(is_read=False).count()
    
    return JsonResponse({
        "notifications": [serialize_notification(n) for n in notifications],
        "unreadCount": unread_count,
    })


@csrf_exempt
@require_http_methods(["GET", "PUT", "DELETE"])
def notification_detail_view(request, notification_id):
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "Forbidden"}, status=403)

    try:
        notification = Notification.objects.get(id=notification_id, user=request.user)
    except Notification.DoesNotExist:
        return JsonResponse({"detail": "Not found"}, status=404)

    if request.method == "GET":
        return JsonResponse({"notification": serialize_notification(notification)})

    if request.method == "PUT":
        payload = _parse_body(request)
        if payload is None:
            return JsonResponse({"detail": "Invalid JSON body"}, status=400)

        if "isRead" in payload:
            notification.is_read = bool(payload.get("isRead"))
            notification.save()

        return JsonResponse({"notification": serialize_notification(notification)})

    if request.method == "DELETE":
        notification.delete()
        return JsonResponse({"detail": "Notification deleted"}, status=204)
