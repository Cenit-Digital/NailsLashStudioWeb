# Captura la ventana de nivel superior VISIBLE más grande cuyo proceso es el ejecutable $exe (el Chromium
# de Playwright, otra ruta que el Chrome del usuario), con PrintWindow(PW_RENDERFULLCONTENT): no depende
# de qué ventana esté delante. Guarda la ventana entera y un recorte de su franja superior (pestañas).
param([string]$exe, [string]$out, [string]$outRecorte, [int]$recorteW, [int]$recorteH)
Add-Type -TypeDefinition @"
using System; using System.Runtime.InteropServices; using System.Collections.Generic;
public static class Ventanas {
  public delegate bool EnumProc(IntPtr h, IntPtr p);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc f, IntPtr p);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr hdc, uint flags);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
  public static List<IntPtr> Todas() { var l = new List<IntPtr>(); EnumWindows((h, p) => { if (IsWindowVisible(h)) l.Add(h); return true; }, IntPtr.Zero); return l; }
}
"@
[Ventanas]::SetProcessDPIAware() | Out-Null
Add-Type -AssemblyName System.Drawing
$objetivo = [System.IO.Path]::GetFullPath($exe).ToLowerInvariant()
$mejor = [IntPtr]::Zero; $area = 0; $rect = $null
foreach ($h in [Ventanas]::Todas()) {
  $procId = 0; [Ventanas]::GetWindowThreadProcessId($h, [ref]$procId) | Out-Null
  try { $ruta = (Get-Process -Id $procId -ErrorAction Stop).Path } catch { continue }
  if (-not $ruta -or $ruta.ToLowerInvariant() -ne $objetivo) { continue }
  $r = New-Object Ventanas+RECT; [Ventanas]::GetWindowRect($h, [ref]$r) | Out-Null
  $a = ($r.R - $r.L) * ($r.B - $r.T)
  if ($a -gt $area) { $area = $a; $mejor = $h; $rect = $r }
}
if ($mejor -eq [IntPtr]::Zero) { Write-Output "SIN_VENTANA"; exit 2 }
$w = $rect.R - $rect.L; $h2 = $rect.B - $rect.T
$bmp = New-Object System.Drawing.Bitmap $w, $h2
$g = [System.Drawing.Graphics]::FromImage($bmp); $hdc = $g.GetHdc()
$ok = [Ventanas]::PrintWindow($mejor, $hdc, 2); $g.ReleaseHdc($hdc); $g.Dispose()
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$cw = [Math]::Min($recorteW, $w); $ch = [Math]::Min($recorteH, $h2)
$rec = $bmp.Clone((New-Object System.Drawing.Rectangle 0, 0, $cw, $ch), $bmp.PixelFormat)
$rec.Save($outRecorte, [System.Drawing.Imaging.ImageFormat]::Png); $rec.Dispose(); $bmp.Dispose()
Write-Output "ok printwindow=$ok ventana=${w}x${h2} recorte=${cw}x${ch}"
