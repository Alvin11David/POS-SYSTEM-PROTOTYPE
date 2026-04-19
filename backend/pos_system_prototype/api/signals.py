from django.contrib.auth.models import Group, User
from django.db.models.signals import post_migrate
from django.dispatch import receiver


@receiver(post_migrate)
def create_demo_admin_user(sender, **kwargs):
    admin_group, _ = Group.objects.get_or_create(name="admin")
    for role in ("manager", "cashier"):
        Group.objects.get_or_create(name=role)

    user, created = User.objects.get_or_create(
        username="admin",
        defaults={
            "first_name": "Store",
            "last_name": "Admin",
            "email": "",
            "is_staff": True,
            "is_superuser": True,
        },
    )

    if created:
        user.set_password("admin123")
    else:
        user.first_name = user.first_name or "Store"
        user.last_name = user.last_name or "Admin"
        if not user.has_usable_password():
            user.set_password("admin123")

    user.is_staff = True
    user.is_superuser = True
    user.save()
    user.groups.add(admin_group)
