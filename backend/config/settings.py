import os, secrets
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent
key_file = BASE_DIR / '.secret-key'
if not key_file.exists():
    try:
        with key_file.open('x', encoding='utf-8') as file:
            file.write(secrets.token_urlsafe(60))
    except FileExistsError:
        pass
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY') or key_file.read_text().strip()
DEBUG = os.environ.get('DJANGO_DEBUG', '1') == '1'
ALLOWED_HOSTS = ['127.0.0.1', 'localhost', 'testserver']
INSTALLED_APPS = ['django.contrib.admin', 'django.contrib.auth', 'django.contrib.contenttypes', 'django.contrib.sessions', 'django.contrib.messages', 'django.contrib.staticfiles', 'core']
MIDDLEWARE = ['django.middleware.security.SecurityMiddleware', 'django.contrib.sessions.middleware.SessionMiddleware', 'django.middleware.common.CommonMiddleware', 'django.middleware.csrf.CsrfViewMiddleware', 'django.contrib.auth.middleware.AuthenticationMiddleware', 'django.contrib.messages.middleware.MessageMiddleware', 'django.middleware.clickjacking.XFrameOptionsMiddleware']
ROOT_URLCONF = 'config.urls'
TEMPLATES = [{'BACKEND': 'django.template.backends.django.DjangoTemplates', 'DIRS': [], 'APP_DIRS': True, 'OPTIONS': {'context_processors': ['django.template.context_processors.request', 'django.contrib.auth.context_processors.auth', 'django.contrib.messages.context_processors.messages']}}]
WSGI_APPLICATION = 'config.wsgi.application'
DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': BASE_DIR / 'db.sqlite3', 'OPTIONS': {'timeout': 20, 'transaction_mode': 'IMMEDIATE'}}}
AUTH_USER_MODEL = 'core.Usuario'
AUTH_PASSWORD_VALIDATORS = [{'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}}]
LANGUAGE_CODE = 'es-cl'
TIME_ZONE = 'America/Santiago'
USE_TZ = True
STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
SESSION_COOKIE_NAME = 'rincon_django_session'
CSRF_COOKIE_NAME = 'rincon_django_csrf'
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_EXPIRE_AT_BROWSER_CLOSE = False
SESSION_COOKIE_AGE = 60 * 60 * 24 * 7
CSRF_TRUSTED_ORIGINS = [f'http://{host}:{port}' for host in ['localhost', '127.0.0.1'] for port in range(3000, 3011)]
CSRF_FAILURE_VIEW = 'core.views.csrf_failure'
