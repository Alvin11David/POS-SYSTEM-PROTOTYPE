from decimal import Decimal

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0002_product_image_url"),
    ]

    operations = [
        migrations.CreateModel(
            name="AppSetting",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("currency", models.CharField(default="USD", max_length=3)),
                (
                    "tax_rate",
                    models.DecimalField(
                        decimal_places=4,
                        default=Decimal("0.0800"),
                        max_digits=6,
                    ),
                ),
            ],
        ),
    ]
