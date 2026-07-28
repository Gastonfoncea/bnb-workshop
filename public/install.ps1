# Installs the create-bnb-agent workshop skill for Claude Code, Codex and Cursor.
#
#   irm https://bnb-workshop.vercel.app/install.ps1 | iex
#
# No param() block on purpose: `iex` evaluates the script as a string and cannot
# forward arguments to it. Configure with environment variables instead:
#   $env:BNB_SKILL_TARGET = "claude"   # auto (default) | all | claude | codex | cursor
#   $env:BNB_SKILL_BASE_URL = "..."

$ErrorActionPreference = "Stop"

$skill = "create-bnb-agent"
$baseUrl = if ($env:BNB_SKILL_BASE_URL) { $env:BNB_SKILL_BASE_URL } else { "https://bnb-workshop.vercel.app" }
$target = if ($env:BNB_SKILL_TARGET) { $env:BNB_SKILL_TARGET } else { "auto" }
$homePath = $env:USERPROFILE

if (@("auto", "all", "claude", "codex", "cursor") -notcontains $target) {
    throw "BNB_SKILL_TARGET must be auto, all, claude, codex, or cursor."
}

# tar.exe ships with Windows 10 1803 and later.
if (-not (Get-Command tar.exe -ErrorAction SilentlyContinue)) {
    throw "tar.exe not found. Windows 10 1803 or later is required."
}

# --- pick the clients to install for -----------------------------------------

if ($target -eq "all") {
    $clients = @("claude", "codex", "cursor")
} elseif ($target -eq "auto") {
    $clients = @()
    foreach ($client in @("claude", "codex", "cursor")) {
        if (Test-Path -LiteralPath (Join-Path $homePath ".$client")) { $clients += $client }
    }
    if ($clients.Count -eq 0) {
        throw "No Claude Code, Codex or Cursor installation found in $homePath. Set `$env:BNB_SKILL_TARGET and retry."
    }
} else {
    $clients = @($target)
}

# --- fetch the skill ----------------------------------------------------------

$tmpDir = Join-Path ([System.IO.Path]::GetTempPath()) ([System.Guid]::NewGuid().ToString())
New-Item -ItemType Directory -Force -Path $tmpDir | Out-Null

try {
    $archive = Join-Path $tmpDir "$skill.tar.gz"
    Write-Output "Downloading $skill..."
    Invoke-WebRequest -Uri "$baseUrl/$skill.tar.gz" -OutFile $archive -UseBasicParsing

    tar.exe -xzf $archive -C $tmpDir
    if ($LASTEXITCODE -ne 0) { throw "Failed to unpack the skill archive." }

    $source = Join-Path $tmpDir $skill
    if (-not (Test-Path -LiteralPath (Join-Path $source "SKILL.md"))) {
        throw "Downloaded archive is missing SKILL.md."
    }

    # --- install --------------------------------------------------------------

    foreach ($client in $clients) {
        $skillsRoot = [System.IO.Path]::GetFullPath((Join-Path $homePath ".$client\skills"))
        $destination = [System.IO.Path]::GetFullPath((Join-Path $skillsRoot $skill))

        # Refuse to write anywhere but the client's own skills directory.
        $expectedPrefix = $skillsRoot.TrimEnd("\") + "\"
        if (-not $destination.StartsWith($expectedPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
            throw "Unsafe destination for $client`: $destination"
        }

        New-Item -ItemType Directory -Force -Path $skillsRoot | Out-Null
        if (Test-Path -LiteralPath $destination) {
            Remove-Item -LiteralPath $destination -Recurse -Force
        }
        Copy-Item -LiteralPath $source -Destination $destination -Recurse
        Write-Output "  OK  $client -> $destination"
    }

    Write-Output ""
    Write-Output "Installed. Restart your assistant, then ask it to create a BNB workshop agent."
}
finally {
    Remove-Item -LiteralPath $tmpDir -Recurse -Force -ErrorAction SilentlyContinue
}
