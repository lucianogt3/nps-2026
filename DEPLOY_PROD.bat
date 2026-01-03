@echo off
TITLE NurseTec - DEPLOY PRODUCAO
CLS

ECHO ======================================================
ECHO   ATUALIZANDO PARA PRODUCAO (NGINX + PM2)
ECHO ======================================================
ECHO.

:: 1. PARAR TUDO ANTIGO
ECHO [1/5] Parando servicos antigos...
taskkill /F /IM nginx.exe >nul 2>&1
call pm2 stop all >nul 2>&1
call pm2 delete all >nul 2>&1

:: 2. GERAR BUILD DO REACT
ECHO [2/5] Gerando nova versao do site (Build)...
call npm run build
IF %ERRORLEVEL% NEQ 0 (
    ECHO [ERRO] Falha no Build. Verifique o codigo.
    PAUSE
    EXIT
)

:: 3. INICIAR BACKEND (PM2)
ECHO [3/5] Iniciando Banco de Dados...
call pm2 start ecosystem.config.cjs
call pm2 save

:: 4. INICIAR NGINX
ECHO [4/5] Iniciando Servidor Web (Nginx)...
SET NGINX_PATH=C:\nginx
IF EXIST "%NGINX_PATH%\nginx.exe" (
    CD /D "%NGINX_PATH%"
    start nginx.exe
    CD /D "%~dp0"
) ELSE (
    ECHO [ERRO] Nginx nao encontrado em %NGINX_PATH%
    PAUSE
)

ECHO.
ECHO ======================================================
ECHO      SISTEMA EM PRODUCAO ONLINE!
ECHO ======================================================
ECHO.
ECHO  - Acesse: http://localhost:5007
ECHO.
PAUSE