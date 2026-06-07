@echo off
title 🌐 WHOIS Web App
color 0A
echo.
echo  ========================================
echo    WHOIS Web App - Starting...
echo  ========================================
echo.

:: 切換到專案目錄
cd /d "C:\Users\Colin\Downloads\whois-web"

:: 檢查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo  [ERROR] 找不到 Node.js，請先安裝 Node.js！
    echo  下載網址: https://nodejs.org
    pause
    exit /b 1
)

echo  [1/2] 正在啟動伺服器...

:: 啟動伺服器（背景執行）
start /B node server.js

:: 等待伺服器啟動
timeout /t 2 /nobreak >nul

echo  [2/2] 開啟瀏覽器...
start "" "http://localhost:3000"

echo.
echo  ========================================
echo    ✅ WHOIS Web App 已啟動！
echo    🌐 網址：http://localhost:3000
echo  ========================================
echo.
echo  關閉此視窗將會停止伺服器。
echo  按 Ctrl+C 可手動停止。
echo.

:: 保持視窗開著（伺服器在前景顯示日誌）
node server.js
