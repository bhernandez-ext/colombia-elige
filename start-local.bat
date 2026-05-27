@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>nul
if %errorlevel%==0 (
  start "" http://127.0.0.1:4173/
  py -m http.server 4173
  goto :eof
)

where python >nul 2>nul
if %errorlevel%==0 (
  start "" http://127.0.0.1:4173/
  python -m http.server 4173
  goto :eof
)

echo No se encontro Python 3 en este equipo.
echo Instala Python desde https://www.python.org/downloads/ y vuelve a ejecutar este archivo.
pause
