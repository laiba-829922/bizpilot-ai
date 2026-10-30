"""
Django settings for BizPilot AI Backend.
Supports local development and Vercel production deployment.
"""

from pathlib import Path
import os
import dj_database_url
from dotenv import load_dotenv


# =====================================================
# BASE DIRECTORY
# =====================================================

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / ".env")


# =====================================================
# SECURITY SETTINGS
# =====================================================

SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]

DEBUG = os.getenv("DEBUG", "False").lower() == "true"

ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv(
        "ALLOWED_HOSTS",
        "localhost,127.0.0.1"
    ).split(",")
    if host.strip()
]


# =====================================================
# APPLICATIONS
# =====================================================

INSTALLED_APPS = [
    # Django Apps
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party Apps
    "rest_framework",
    "corsheaders",

    # Our Apps
    "users",
    "orders",
    "expenses",
]

AUTH_USER_MODEL = "users.User"


# =====================================================
# MIDDLEWARE
# =====================================================

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# =====================================================
# URL CONFIGURATION
# =====================================================

ROOT_URLCONF = "config.urls"


# =====================================================
# TEMPLATES
# =====================================================

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# =====================================================
# WSGI APPLICATION
# =====================================================

WSGI_APPLICATION = "config.wsgi.application"


# =====================================================
# DATABASE CONFIGURATION
# =====================================================

# Vercel Neon PostgreSQL URL
DATABASE_URL = (
    os.getenv("STORAGE_URL")
    or os.getenv("DATABASE_URL")
)

if DATABASE_URL:

    # Production Database: Neon PostgreSQL
    DATABASES = {
        "default": dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=0,
            ssl_require=True,
        )
    }

else:

    # Local Database: PostgreSQL
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": "bizpilot_db",
            "USER": "postgres",
            "PASSWORD": os.getenv("DB_PASSWORD"),
            "HOST": "127.0.0.1",
            "PORT": "5432",
        }
    }


# =====================================================
# PASSWORD VALIDATION
# =====================================================

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# =====================================================
# INTERNATIONALIZATION
# =====================================================

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# =====================================================
# STATIC FILES
# =====================================================

STATIC_URL = "/static/"

STATIC_ROOT = BASE_DIR / "staticfiles"


# =====================================================
# CORS CONFIGURATION
# =====================================================

# Allowed React frontend origins
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Production frontend URL from environment variable
FRONTEND_URL = os.getenv("FRONTEND_URL", "").rstrip("/")

if FRONTEND_URL:
    CORS_ALLOWED_ORIGINS.append(FRONTEND_URL)


# =====================================================
# CSRF CONFIGURATION
# =====================================================

CSRF_TRUSTED_ORIGINS = []

if FRONTEND_URL:
    CSRF_TRUSTED_ORIGINS.append(FRONTEND_URL)


# =====================================================
# PASSWORD HASHERS
# =====================================================

PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.Argon2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher",
    "django.contrib.auth.hashers.BCryptSHA256PasswordHasher",
    "django.contrib.auth.hashers.ScryptPasswordHasher",
]


# =====================================================
# REST FRAMEWORK
# =====================================================

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}


# =====================================================
# EMAIL CONFIGURATION
# =====================================================

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"


# =====================================================
# PRODUCTION SECURITY
# =====================================================

if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_CONTENT_TYPE_NOSNIFF = True