"""
Django settings for crowdfunding_projectt project.
"""

import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-i7pm5hrnm+fou1-=u5kiprp_fe#i6*1-4)ji8+$drejz_0bc@n'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# FIXED: Docker-compatible ALLOWED_HOSTS
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', 'web', '*']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Your apps
    'users.apps.UsersConfig',
    'projects.apps.ProjectsConfig',
    'categories.apps.CategoriesConfig',
    'comments.apps.CommentsConfig',
    'tags.apps.TagsConfig',
    'home.apps.HomeConfig',
    # Third-party apps
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'django_extensions',
]

# Custom User Model
AUTH_USER_MODEL = 'users.User'

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # FIXED: Correct middleware paths
    'crowdfunding_projectt.middleware.UserActivityMiddleware',
    'crowdfunding_projectt.middleware.RecommendationMiddleware',
]

ROOT_URLCONF = 'crowdfunding_projectt.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'crowdfunding_projectt.wsgi.application'

# FIXED: Database configuration for Docker
try:
    import dj_database_url
    if os.environ.get('DATABASE_URL'):
        # Docker PostgreSQL configuration
        DATABASES = {
            'default': dj_database_url.parse(os.environ.get('DATABASE_URL'))
        }
    else:
        # Local SQLite configuration
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'db.sqlite3',
            }
        }
except ImportError:
    # Fallback to SQLite if dj_database_url is not available
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Email Configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'aya3mad2002@gmail.com'
EMAIL_HOST_PASSWORD = 'ytdv ausw sobd udvr'
DEFAULT_FROM_EMAIL = 'Crowdfunding <aya3mad2002@gmail.com>'
EMAIL_USE_SSL = False
EMAIL_TIMEOUT = 30

# Login/Logout URLs
LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_URL = '/'
LOGIN_URL = '/users/login/'

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# REST FRAMEWORK CONFIGURATION
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# CRITICAL: CORS Configuration for session sharing
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',  # CRITICAL: Use localhost not 127.0.0.1
    'http://127.0.0.1:3000',  # Keep as backup
]

CORS_ALLOW_ALL_ORIGINS = True  # For development only
CORS_ALLOW_CREDENTIALS = True  # CRITICAL: Allow session cookies

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'x-session-id',
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# CSRF Configuration
CSRF_COOKIE_SECURE = False
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SAMESITE = None  # CRITICAL: Allow cross-origin CSRF
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:3000',  # CRITICAL: Use localhost
    'http://127.0.0.1:3000',  # Keep as backup
]

# CRITICAL: Session cookie settings for same-origin requests
SESSION_COOKIE_SAMESITE = None  # CRITICAL: Allow cross-origin session cookies
SESSION_COOKIE_SECURE = False   # Set to True in production with HTTPS
SESSION_COOKIE_HTTPONLY = False # Allow JavaScript access to session cookie
SESSION_COOKIE_NAME = 'sessionid'
SESSION_COOKIE_DOMAIN = None    # Allow same-domain cookies

# FIXED: Static files configuration for Docker
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# FIXED: Only include STATICFILES_DIRS if the directory exists and is different from STATIC_ROOT
if os.path.exists(os.path.join(BASE_DIR, 'static')) and os.path.join(BASE_DIR, 'static') != STATIC_ROOT:
    STATICFILES_DIRS = [
        os.path.join(BASE_DIR, 'static'),
    ]

# Static files storage for Docker
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Redis configuration for Docker
REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/1')

# FIXED: Enhanced logging configuration for middleware debugging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'activity.log'),
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'crowdfunding_projectt.middleware': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
        },
    },
}

# CRITICAL: Session configuration for cross-origin activity tracking
SESSION_ENGINE = 'django.contrib.sessions.backends.db'  # Use database, not cache
SESSION_COOKIE_AGE = 86400  # 24 hours
SESSION_SAVE_EVERY_REQUEST = True  # Force session save on every request
SESSION_EXPIRE_AT_BROWSER_CLOSE = False

# ADDED: Cache configuration for better performance
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
        'TIMEOUT': 300,  # 5 minutes
        'OPTIONS': {
            'MAX_ENTRIES': 1000,
        }
    }
}

# ADDED: Security settings for production readiness
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# ADDED: File upload settings
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
DATA_UPLOAD_MAX_NUMBER_FIELDS = 1000

# ADDED: Internationalization settings
USE_L10N = True
LOCALE_PATHS = [
    os.path.join(BASE_DIR, 'locale'),
]

# ADDED: Performance settings
DEFAULT_INDEX_TABLESPACE = ''
DEFAULT_TABLESPACE = ''
