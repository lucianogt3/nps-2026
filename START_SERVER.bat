@echo off
TITLE NurseTec Server Launcher
CLS

ECHO ======================================================
ECHO    INICIANDO SISTEMA NURSETEC (MODO SERVIDOR)
ECHO ======================================================
ECHO.

:: --- 1. VERIFICAR E INICIAR NGINX ---
SET NGINX_PATH=C:\nginx

ECHO [1/2] Verificando Nginx...
tasklist /FI "IMAGENAME eq nginx.exe" 2>NUL | find /I /N "nginx.exe">NUL
IF "%ERRORLEVEL%"=="0" (
    ECHO      [OK] Nginx ja esta rodando.
) ELSE (
    ECHO      [..] Iniciando Nginx...
    IF EXIST "%NGINX_PATH%\nginx.exe" (
        CD /D "%NGINX_PATH%"
        start nginx.exe
        CD /D "%~dp0"
        ECHO      [OK] Nginx iniciado.
    ) ELSE (
        ECHO      [AVISO] Nginx nao encontrado em %NGINX_PATH%
        ECHO      (O sistema continuara rodando o Node.js sem o Nginx)
    )
)

ECHO.

:: --- 2. INICIAR PM2 (ATUALIZADO PARA .CJS) ---
ECHO [2/2] Iniciando Gerenciador de Processos (PM2)...
call pm2 start ecosystem.config.cjs

ECHO.
ECHO ======================================================
ECHO             STATUS DO SISTEMA
ECHO ======================================================
call pm2 status
ECHO.
ECHO [SUCESSO] O sistema esta rodando em segundo plano!
ECHO.
ECHO  - Frontend: http://localhost:5007
ECHO  - Backend:  http://localhost:4000
ECHO.
ECHO  * Pode fechar esta janela, o servidor continuara rodando.
ECHO  * Para parar tudo depois, abra um terminal e digite: pm2 stop all
ECHO.
PAUSE
