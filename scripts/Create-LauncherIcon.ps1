# Converts the existing transparent logo to a multi-resolution Windows ICO.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$workspaceRoot = Split-Path $PSScriptRoot -Parent
$sourceLogo = [System.Drawing.Image]::FromFile((Join-Path $workspaceRoot 'assets/images/valheim-emblem.png'))
$iconImages = @()
try {
    foreach ($iconSize in @(16,24,32,48,64,128,256)) {
        $iconBitmap = [System.Drawing.Bitmap]::new($iconSize, $iconSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $iconGraphics = [System.Drawing.Graphics]::FromImage($iconBitmap)
        $iconGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $iconGraphics.Clear([System.Drawing.Color]::Transparent)
        $iconGraphics.DrawImage($sourceLogo, 0, 0, $iconSize, $iconSize)
        $iconMemory = [System.IO.MemoryStream]::new()
        $iconBitmap.Save($iconMemory, [System.Drawing.Imaging.ImageFormat]::Png)
        $iconImages += [pscustomobject]@{Size=$iconSize;Bytes=$iconMemory.ToArray()}
        $iconMemory.Dispose(); $iconGraphics.Dispose(); $iconBitmap.Dispose()
    }
    $iconFile = [System.IO.File]::Create((Join-Path $workspaceRoot 'launcher/Desktop/valheim.ico'))
    $iconWriter = [System.IO.BinaryWriter]::new($iconFile)
    try {
        $iconWriter.Write([uint16]0); $iconWriter.Write([uint16]1); $iconWriter.Write([uint16]$iconImages.Count)
        $iconOffset = 6 + 16 * $iconImages.Count
        foreach ($entry in $iconImages) {
            $dimension = if ($entry.Size -eq 256) { 0 } else { $entry.Size }
            $iconWriter.Write([byte]$dimension); $iconWriter.Write([byte]$dimension)
            $iconWriter.Write([byte]0); $iconWriter.Write([byte]0); $iconWriter.Write([uint16]1); $iconWriter.Write([uint16]32)
            $iconWriter.Write([uint32]$entry.Bytes.Length); $iconWriter.Write([uint32]$iconOffset)
            $iconOffset += $entry.Bytes.Length
        }
        foreach ($entry in $iconImages) { $iconWriter.Write([byte[]]$entry.Bytes) }
    } finally { $iconWriter.Dispose() }
} finally { $sourceLogo.Dispose() }
Write-Output 'Windows icon: 16, 24, 32, 48, 64, 128, 256 px'
