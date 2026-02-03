@echo off
echo Stopping Agalid Local Server...
docker-compose -f infra/docker-compose.local-server.yml down
echo.
echo Server stopped.
pause
