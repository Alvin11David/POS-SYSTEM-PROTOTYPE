import json
from decimal import Decimal, InvalidOperation
from uuid import UUID

from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.http import JsonResponse
from django.utils.dateparse import parse_datetime
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import Product, Sale, SaleItem


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
