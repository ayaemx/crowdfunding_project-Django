# Generated by Django 5.2.1 on 2025-06-14 00:25

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_add_timestamps'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='mobile_phone',
        ),
        migrations.AddField(
            model_name='user',
            name='phone_number',
            field=models.CharField(blank=True, help_text='Egyptian phone number format: 01XXXXXXXXX', max_length=15, null=True, unique=True, validators=[django.core.validators.RegexValidator(message='Enter a valid Egyptian phone number (e.g., 01XXXXXXXXX).', regex='^01[0125][0-9]{8}$')]),
        ),
    ]
