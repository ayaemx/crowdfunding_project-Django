from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'
    verbose_name = 'Users Management'

    def ready(self):
        """Import signals when app is ready"""
        try:
            import users.signals  # If you create signals later
        except ImportError:
            pass
