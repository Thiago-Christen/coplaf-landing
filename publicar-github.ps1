# Run from a normal Windows PowerShell terminal, outside Codex's restricted shell.
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$coplafRepository = 'Thiago-Christen/coplaf-landing'
$coplafRemote = 'https://github.com/Thiago-Christen/coplaf-landing.git'

function Assert-CoplafSuccess([string]$Operation) {
    if ($LASTEXITCODE -ne 0) { throw "Falha: $Operation. A publicacao foi interrompida." }
}

# Windows PowerShell 5.1 turns redirected native stderr into ErrorRecords.
# Expected failures must be inspected by exit code, not terminate the script.
function Invoke-CoplafProbe([string]$Executable, [string[]]$Arguments) {
    $ErrorActionPreference = 'Continue'
    $coplafOutput = & $Executable @Arguments 2>&1
    return [pscustomobject]@{
        ExitCode = $LASTEXITCODE
        Output = ($coplafOutput | ForEach-Object { $_.ToString() }) -join "`n"
    }
}

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { throw 'Instale o GitHub CLI antes de continuar: https://cli.github.com/' }
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'O Git precisa estar instalado.' }

$coplafAuth = Invoke-CoplafProbe 'gh' @('auth', 'status', '--hostname', 'github.com')
if ($coplafAuth.ExitCode -ne 0) {
    gh auth login --hostname github.com --git-protocol https --web
    Assert-CoplafSuccess 'login no GitHub'
}
$coplafLogin = gh api user --jq .login
Assert-CoplafSuccess 'verificar conta'
if ($coplafLogin -ne 'Thiago-Christen') { throw 'Entre com a conta Thiago-Christen antes de publicar.' }
gh auth setup-git --hostname github.com
Assert-CoplafSuccess 'configurar autenticacao Git'

# A missing repository is created only after confirming the authenticated account.
$coplafRepoInfo = Invoke-CoplafProbe 'gh' @('api', "repos/$coplafRepository")
if ($coplafRepoInfo.ExitCode -ne 0) {
    if ($coplafRepoInfo.Output -notmatch 'HTTP 404') {
        throw "Nao foi possivel verificar o repositorio: $($coplafRepoInfo.Output)"
    }
    gh repo create $coplafRepository --public --description 'Landing page de apresentacao da COPLAF, empresa junior da UFPR.'
    Assert-CoplafSuccess 'criar repositorio publico'
} else {
    $coplafRepo = $coplafRepoInfo.Output | ConvertFrom-Json
    if ($coplafRepo.visibility -ne 'PUBLIC') { throw 'O repositorio existente nao e publico. Revise antes de continuar.' }
}

git rev-parse --verify HEAD
Assert-CoplafSuccess 'verificar commit local'
$coplafBranch = git branch --show-current
Assert-CoplafSuccess 'verificar branch'
if ($coplafBranch -ne 'main') { throw 'Este script publica apenas a branch main.' }
git diff --quiet HEAD
if ($LASTEXITCODE -ne 0) { throw 'Existem alteracoes locais sem commit. Revise e salve antes de publicar.' }
$coplafExistingRemote = Invoke-CoplafProbe 'git' @('remote', 'get-url', 'origin')
if ($coplafExistingRemote.ExitCode -eq 0) {
    if ($coplafExistingRemote.Output.Trim() -notin @($coplafRemote, 'git@github.com:Thiago-Christen/coplaf-landing.git')) {
        throw 'O origin aponta para outro repositorio. Nenhuma configuracao foi substituida.'
    }
} else {
    git remote add origin $coplafRemote
    Assert-CoplafSuccess 'adicionar origin'
}
git push --set-upstream origin main
Assert-CoplafSuccess 'enviar projeto (sem force push)'

$coplafPages = Invoke-CoplafProbe 'gh' @('api', "repos/$coplafRepository/pages", '--silent')
if ($coplafPages.ExitCode -ne 0) {
    if ($coplafPages.Output -notmatch 'HTTP 404') {
        throw "Nao foi possivel verificar o Pages: $($coplafPages.Output)"
    }
    gh api --method POST "repos/$coplafRepository/pages" -f build_type=workflow --silent
} else {
    gh api --method PUT "repos/$coplafRepository/pages" -f build_type=workflow --silent
}
Assert-CoplafSuccess 'ativar GitHub Pages'
gh workflow run pages.yml --repo $coplafRepository --ref main
Assert-CoplafSuccess 'iniciar publicacao'

Write-Host 'Codigo enviado. A publicacao ainda precisa terminar no GitHub Actions.'
Write-Host 'Acompanhe: https://github.com/Thiago-Christen/coplaf-landing/actions'
Write-Host 'O endereco do site aparecera na execucao bem-sucedida do workflow.'
