# Promotly yerel demo: Postgres + web API + Android emülatörü + Expo.
# Kullanım (repo kökünde):  powershell -ExecutionPolicy Bypass -File .\start-demo.ps1
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$sdk = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
$env:ANDROID_HOME = $sdk
$env:PATH = "$sdk\platform-tools;$env:PATH"

Write-Host '1/4 Docker ve Postgres' -ForegroundColor Cyan
docker info *> $null
if ($LASTEXITCODE -ne 0) {
    Start-Process 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
    do { Start-Sleep 3; docker info *> $null } until ($LASTEXITCODE -eq 0)
}
Push-Location "$root\web"
docker compose up -d db-web | Out-Null

Write-Host '2/4 Web API (http://localhost:3000)' -ForegroundColor Cyan
if (-not (Test-Path '.next\BUILD_ID')) { npx next build }
Start-Process powershell -ArgumentList '-NoExit', '-Command', "cd '$root\web'; npx next start -p 3000 -H 0.0.0.0" -WindowStyle Minimized
Pop-Location

Write-Host '3/4 Android emülatörü' -ForegroundColor Cyan
$running = (& adb devices) -match 'emulator-'
if (-not $running) {
    Start-Process "$sdk\emulator\emulator.exe" -ArgumentList '-avd', 'Promotly', '-no-boot-anim'
    & adb wait-for-device
    do { Start-Sleep 2 } until ((& adb shell getprop sys.boot_completed) -match '1')
}

Write-Host '4/4 Expo (uygulama emülatörde açılır)' -ForegroundColor Cyan
Set-Location "$root\mobile"
npx expo start --android
