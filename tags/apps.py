# tags/apps.py - FIXED SYNTAX ERROR
from django.apps import AppConfig

class TagsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # *** FIXED: Added quotes ***
    name = 'tags'
