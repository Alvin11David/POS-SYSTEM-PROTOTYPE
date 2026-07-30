param(
    [string]$Branch = "master",
    [int]$IntervalSeconds = 60,
    [string]$CommitMessage = "Auto-commit: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
)

$RepoPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $RepoPath

Write-Host "Starting auto-commit on branch '$Branch' every $IntervalSeconds seconds..." -ForegroundColor Cyan
Write-Host "Repo: $RepoPath" -ForegroundColor Gray

while ($true) {
    try {
        $status = git status --porcelain
        if ([string]::IsNullOrWhiteSpace($status)) {
            Write-Host "$(Get-Date -Format 'HH:mm:ss') - No changes detected." -ForegroundColor Gray
        } else {
            Write-Host "$(Get-Date -Format 'HH:mm:ss') - Changes detected:" -ForegroundColor Yellow
            $status -split "`n" | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }

            git add -A
            git commit -m "$CommitMessage"

            $pushResult = git push origin $Branch 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  Changes committed and pushed successfully!" -ForegroundColor Green
            } else {
                Write-Host "  Push failed: $pushResult" -ForegroundColor Red
            }
        }
    } catch {
        Write-Host "  Error: $_" -ForegroundColor Red
    }

    Start-Sleep -Seconds $IntervalSeconds
}
