@echo off
echo ===================================================
echo     Sincronizare SITE catre GitHub si Vercel
echo ===================================================
echo.

cd /d "D:\stella-dashboard"

echo [1/3] Se pregatesc fisierele modificate...
git add .

echo.
echo [2/3] Se salveaza modificarile...
git commit -m "Auto update via UPDATE_SITE.bat"

echo.
echo [3/3] Se trimit fisierele pe GitHub (Vercel va prelua automat)...
git push

echo.
echo ===================================================
echo   Succes! Codul a fost trimis. 
echo   Vercel va face update site-ului in 1-2 minute!
echo ===================================================
pause
