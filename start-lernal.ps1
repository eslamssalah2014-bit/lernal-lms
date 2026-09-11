<#
.SYNOPSIS
    Starts both Lernal LMS Server (Render API) and Client (Vercel Frontend) concurrently.
#>

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "🚀 STARTING LERNAL LMS (SINCE 2026)" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

$serverDir = Join-Path $PSScriptRoot "backend"
$clientDir = Join-Path $PSScriptRoot "frontend"

Write-Host "Starting Backend API Server on http://localhost:5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$serverDir'; npm start"

Start-Sleep -Seconds 2

Write-Host "Starting Frontend Client on http://localhost:5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$clientDir'; npm run dev"

Write-Host "`n✅ Lernal LMS services initiated!" -ForegroundColor Green
Write-Host "👉 Open your browser to: http://localhost:5173" -ForegroundColor White
Write-Host "👉 API Health Check: http://localhost:5000/api/health`n" -ForegroundColor White
