param(
  [ValidateRange(1, 65535)]
  [int]$Port = 8767
)

$root = (Resolve-Path -LiteralPath $PSScriptRoot).Path
$server = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, $Port)
try { $server.Start() } catch { Write-Error "Preview server could not start: $($_.Exception.Message)"; exit 1 }
$types = @{
  '.html'='text/html; charset=utf-8'
  '.css'='text/css; charset=utf-8'
  '.js'='text/javascript; charset=utf-8'
  '.md'='text/plain; charset=utf-8'
  '.webmanifest'='application/manifest+json; charset=utf-8'
  '.svg'='image/svg+xml'
  '.png'='image/png'
}

while ($true) {
  $client = $server.AcceptTcpClient()
  $stream = $client.GetStream()
  $reader = [IO.StreamReader]::new($stream, [Text.Encoding]::ASCII, $false, 1024, $true)
  $requestLine = $reader.ReadLine()
  while (($line = $reader.ReadLine()) -ne '') { if ($null -eq $line) { break } }
  $target = if ($requestLine -match '^GET\s+([^\s]+)') { $Matches[1].Split('?')[0] } else { '/' }
  $relative = [Uri]::UnescapeDataString($target).TrimStart('/')
  if ([string]::IsNullOrWhiteSpace($relative)) { $relative = 'index.html' }

  try {
    $resolved = (Resolve-Path -LiteralPath (Join-Path $root $relative) -ErrorAction Stop).Path
    if (-not $resolved.StartsWith($root, [StringComparison]::OrdinalIgnoreCase)) { throw 'Invalid path' }
    $body = [IO.File]::ReadAllBytes($resolved)
    $extension = [IO.Path]::GetExtension($resolved).ToLowerInvariant()
    $contentType = if ($types.ContainsKey($extension)) { $types[$extension] } else { 'application/octet-stream' }
    $header = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nCache-Control: no-store`r`nConnection: close`r`n`r`n"
  } catch {
    $body = [Text.Encoding]::UTF8.GetBytes('Not found')
    $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
  }

  $headerBytes = [Text.Encoding]::ASCII.GetBytes($header)
  $stream.Write($headerBytes, 0, $headerBytes.Length)
  $stream.Write($body, 0, $body.Length)
  $stream.Dispose()
  $client.Dispose()
}
