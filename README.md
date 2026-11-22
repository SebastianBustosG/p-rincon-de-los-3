# El rincón de los 3 — Colaciones

Frontend React + Vite con backend Django 6.0.9 y SQLite. Ubicación comercial: Talca.

## Iniciar en Windows

Requisitos: Python 3.12 o posterior compatible con Django 6.0 (validado con Python 3.14), Node.js compatible con Vite 8 (validado con Node 24) y dependencias npm instaladas.

```powershell
.\iniciar.cmd
```

El comando prepara `backend/.venv` si falta, instala las dependencias Python si es necesario, aplica las migraciones pendientes, inicializa los datos mínimos solo si faltan, inicia Django y Vite y abre el navegador.

- Página: http://127.0.0.1:3002/
- Backend: http://127.0.0.1:8001/api/health/
- Administración adicional de Django: http://127.0.0.1:8001/admin/

Mantén la terminal abierta. Ctrl+C detiene los procesos que inició el comando. Si Django ya estaba iniciado, se reutiliza y no se cierra al detener otra instancia. Si esta misma página ya está iniciada, el comando reutiliza la instancia y abre el navegador. Si el puerto 3002 pertenece a otra aplicación, muestra una indicación para liberarlo; no cambia de puerto ni cierra procesos ajenos. No hace falta ejecutar npm run dev por separado.

Primera instalación de las dependencias del frontend:

```powershell
npm.cmd install
```

Administrador inicial de desarrollo: usuario `admin_loreto`, contraseña `Rincon2026!`. Puedes cambiarlos desde **Mi cuenta → Editar datos**. Es una cuenta nueva, no una importación del navegador. Antes de la primera inicialización se pueden definir `RINCON_ADMIN_USER` y `RINCON_ADMIN_PASSWORD` en el entorno; los siguientes inicios no restablecen credenciales.

## Datos persistentes

La base está en `backend/db.sqlite3`. Cuentas, perfiles, pedidos, detalles, recetas, catálogo y stock se leen y guardan en Django. No se importan cuentas, sesiones, pedidos, stock ni credenciales del antiguo localStorage. Esas claves antiguas se ignoran, no se borran.

Una base recién creada contiene un administrador, seis platos, sus insumos y recetas de demostración, y **cero clientes y cero pedidos**. El catálogo proviene de `backend/catalogo_inicial.json`, no de los datos guardados por los usuarios. Las descripciones iniciales se limitan a 100 caracteres según el modelo adjunto.

## Documentación

Consulta [IMPLEMENTACION_DJANGO_SQLITE.md](IMPLEMENTACION_DJANGO_SQLITE.md) para la estructura completa, las relaciones, las diferencias justificadas respecto al diagrama, los endpoints, las reglas de negocio, las pruebas y los respaldos.

## Verificación

```powershell
backend\.venv\Scripts\python.exe backend\manage.py test core
backend\.venv\Scripts\python.exe backend\manage.py check
backend\.venv\Scripts\python.exe backend\manage.py makemigrations --check --dry-run
node node_modules/typescript/bin/tsc --noEmit
node node_modules/vite/bin/vite.js build
```

Las pruebas usan una base temporal independiente; no modifican `db.sqlite3`.

## Uso local

Esta configuración utiliza servidores de desarrollo ligados a `127.0.0.1`. No publica la aplicación en Internet ni abre acceso desde otros equipos. Para desplegar se deben configurar hosting, HTTPS, servidor de producción, secretos, hosts permitidos, cookies seguras, límites de intentos y respaldos. SQLite es la base inicial; con muchas escrituras simultáneas se debe evaluar PostgreSQL.
