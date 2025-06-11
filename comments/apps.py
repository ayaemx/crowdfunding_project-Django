from django.apps import AppConfig

class CommentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # *** FIXED: Added quotes ***
    name = 'comments'