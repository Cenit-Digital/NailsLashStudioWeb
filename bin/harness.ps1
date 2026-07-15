#!/usr/bin/env pwsh
# harness.ps1 — Lanzador del motor agnóstico del arnés SSD Uncle Bob (Windows/PowerShell).
#   bin\harness.ps1 <init|test|mutate|verify|status|help> [args]
$ErrorActionPreference = 'Stop'
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host '[FAIL] node no está instalado (requerido por el arnés)'
  exit 1
}
# Join-Path anidado a propósito: la firma multi-segmento
# `Join-Path a b c d` es de PowerShell 6+ (parámetro -AdditionalChildPath) y
# revienta en Windows PowerShell 5.1, que es el que trae Windows de serie:
# "No se encuentra ningún parámetro de posición que acepte el argumento '.harness'".
# Con 5.1 siendo el intérprete por defecto, la firma corta es la portable.
$engine = Join-Path (Join-Path (Join-Path $PSScriptRoot '..') '.harness') 'harness.mjs'
& node $engine @args
exit $LASTEXITCODE
