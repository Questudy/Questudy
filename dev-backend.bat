@echo off
setlocal
pushd "%~dp0" || exit /b 1

where uv >nul 2>&1
if errorlevel 1 (
    echo uv is required. Install it using the README instructions, then try again.
    pause
    popd
    exit /b 1
)

echo Starting Questudy backend for development. Swagger UI will open when ready.
echo Keep this window open. Press Ctrl+C to stop.
uv run --locked python -m backend
set "result=%errorlevel%"
if not "%result%"=="0" (
    echo Startup failed. Check the error above and the README troubleshooting steps.
    pause
)
popd
exit /b %result%
