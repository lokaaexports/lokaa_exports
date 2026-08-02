@echo off
echo ========================================================
echo   Generating Optimized Hostinger Deployment Zip
echo ========================================================
echo.
echo Please wait, this will take a few seconds...
echo (We are intentionally skipping node_modules and .next)
echo.

if exist hostinger-deployment.zip del hostinger-deployment.zip

powershell -Command "Compress-Archive -Path (Get-ChildItem -Force -Exclude node_modules,yarn.lock,.yarnrc,server.js,server-esm.js,app.js,index.js,.git,.next,.venv,scratch,artifacts,test-results,playwright.config.ts,tsconfig.tsbuildinfo,next-env.d.ts,*.zip,*.tar.gz,create-deploy-zip.bat | Select-Object -ExpandProperty FullName) -DestinationPath hostinger-deployment.zip"

echo.
echo ========================================================
echo   SUCCESS! 
echo   'hostinger-deployment.zip' has been created!
echo   Upload this file to Hostinger File Manager.
echo ========================================================
echo.
pause
