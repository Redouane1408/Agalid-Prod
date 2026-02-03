@echo off
echo ===================================================
echo   Agalid Local Server Deployment
echo ===================================================
echo.
echo Stopping any existing containers...
docker-compose -f infra/docker-compose.local-server.yml down

echo.
echo Starting services (Database, Backend, Frontend)...
echo This may take a few minutes for the first build.
echo.
docker-compose -f infra/docker-compose.local-server.yml up -d --build --force-recreate --renew-anon-volumes

echo.
echo Waiting for services to initialize...
timeout /t 10 /nobreak

echo.
echo ===================================================
echo   Server is Ready!
echo ===================================================
echo.
echo Frontend: http://localhost
echo Backend API: http://localhost/api
echo Mailhog: http://localhost:8025
echo PgAdmin: http://localhost:5050 (admin@example.com / admin)
echo.
echo You can close this window. The server runs in the background.
echo To stop the server, run stop-local-server.bat
echo.
pause
