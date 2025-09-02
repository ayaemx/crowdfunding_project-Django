# migrate_to_postgresql.py
import os
import django
import sqlite3
import psycopg2
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crowdfunding_projectt.settings')
django.setup()


def migrate_sqlite_to_postgresql():
    """Migrate data from SQLite to PostgreSQL"""

    # First, update your settings.py to use PostgreSQL
    print("1. Update your settings.py with PostgreSQL configuration:")
    print("""
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'crowdfunding_db',
        'USER': 'your_username',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
    """)

    print("\n2. Install PostgreSQL adapter:")
    print("pip install psycopg2-binary")

    print("\n3. Create PostgreSQL database:")
    print("createdb crowdfunding_db")

    print("\n4. Run migrations:")
    print("python manage.py makemigrations")
    print("python manage.py migrate")

    print("\n5. Export data from SQLite:")
    print("python manage.py dumpdata --natural-foreign --natural-primary > data.json")

    print("\n6. Load data into PostgreSQL:")
    print("python manage.py loaddata data.json")


if __name__ == "__main__":
    migrate_sqlite_to_postgresql()
