# Run DevSecOps Flask Application with Dashboard
# This script ensures you're running the correct app.py file

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DevSecOps Flask Application Launcher" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to the correct directory
$appDir = "c:\Users\rohit\OneDrive\Desktop\DevSecOps practice\devsecops-project\app"
Set-Location $appDir

Write-Host "✓ Current Directory: $appDir" -ForegroundColor Green
Write-Host ""

# Check if app.py exists
if (Test-Path "app.py") {
    Write-Host "✓ Found app.py" -ForegroundColor Green
} else {
    Write-Host "✗ ERROR: app.py not found!" -ForegroundColor Red
    exit 1
}

# Check if templates/index.html exists
if (Test-Path "templates\index.html") {
    Write-Host "✓ Found templates\index.html (Dashboard)" -ForegroundColor Green
} else {
    Write-Host "✗ ERROR: templates\index.html not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting Flask Application..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Once started, open your browser to:" -ForegroundColor Cyan
Write-Host "  http://localhost:5000/" -ForegroundColor White -BackgroundColor Blue
Write-Host ""
Write-Host "Press CTRL+C to stop the server" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Run the Flask application
python app.py
