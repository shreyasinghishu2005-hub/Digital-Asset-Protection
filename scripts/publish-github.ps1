# SportShield Pro — prepare repo and print push steps for a PUBLIC GitHub repo.
# Run from project root:  .\scripts\publish-github.ps1
# Requires: git installed; for one-shot create+push: GitHub CLI (`gh`) logged in.

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git is not installed. Install from https://git-scm.com/download/win"
}

if (-not (Test-Path ".git")) {
    git init
    git branch -M main
}

git add -A
$status = git status --porcelain
if (-not $status) {
    Write-Host "Nothing to commit (working tree clean)."
} else {
    git commit -m "Initial commit: SportShield Pro demo (React + FastAPI)"
}

Write-Host ""
Write-Host "=== Next: create a PUBLIC repo on GitHub and push ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option A — GitHub website:" -ForegroundColor Yellow
Write-Host "  1. https://github.com/new — Repository name: e.g. sportshield-pro — Public — no README — Create."
Write-Host "  2. Then run (replace YOUR_USER):"
Write-Host "     git remote add origin https://github.com/YOUR_USER/sportshield-pro.git"
Write-Host "     git push -u origin main"
Write-Host ""
Write-Host "Option B — GitHub CLI (if installed: gh auth login):" -ForegroundColor Yellow
Write-Host "     gh repo create sportshield-pro --public --source=. --remote=origin --push"
Write-Host ""

if (Get-Command gh -ErrorAction SilentlyContinue) {
    $run = Read-Host "Run 'gh repo create' now? (y/N)"
    if ($run -eq "y" -or $run -eq "Y") {
        gh repo create sportshield-pro --public --source=. --remote=origin --push
    }
}
