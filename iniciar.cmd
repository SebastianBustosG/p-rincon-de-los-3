@echo off
setlocal
cd /d "%~dp0"
if not exist "node_modules\vite\bin\vite.js" (
  echo Faltan las dependencias. Ejecuta npm.cmd install y vuelve a intentarlo.
  exit /b 1
)
python "%~dp0backend\bootstrap.py"
if errorlevel 1 exit /b 1
node "%~dp0scripts\start.mjs"
