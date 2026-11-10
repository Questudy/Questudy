@echo off
setlocal
pushd "%~dp0frontend" || exit /b 1
where node >nul 2>&1
if errorlevel 1 (
    echo Node.js 22 or newer is required.
    pause
    popd
    exit /b 1
)
echo Questudy map preview: http://127.0.0.1:5173
echo Keep this window open. Press Ctrl+C to stop.
call npm run dev
set "result=%errorlevel%"
if not "%result%"=="0" pause
popd
exit /b %result%
