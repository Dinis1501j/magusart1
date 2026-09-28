@echo off
cd /d "%~dp0"
echo Magus Art - abre http://127.0.0.1:4173/admin/ no navegador.
echo Mantem esta janela aberta enquanto utilizas o gestor.
node tools/server.js
pause
