$root = 'd:\trae_1024\datavista-app'
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:8765/')
$listener.Start()
Write-Output "SERVER_READY http://localhost:8765/"
while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $url = [System.Uri]::UnescapeDataString($ctx.Request.Url.LocalPath)
    if ($url -eq '/' -or $url -eq '') { $url = '/report.html' }
    $rel = $url.TrimStart('/').Replace('/', '\')
    $path = Join-Path $root $rel
    if (Test-Path $path -PathType Leaf) {
      $bytes = [System.IO.File]::ReadAllBytes($path)
      $ext = [System.IO.Path]::GetExtension($path).ToLower()
      switch ($ext) {
        '.html' { $ctx.Response.ContentType = 'text/html; charset=utf-8' }
        '.js'   { $ctx.Response.ContentType = 'application/javascript; charset=utf-8' }
        '.css'  { $ctx.Response.ContentType = 'text/css; charset=utf-8' }
        '.png'  { $ctx.Response.ContentType = 'image/png' }
        '.jpg'  { $ctx.Response.ContentType = 'image/jpeg' }
        '.svg'  { $ctx.Response.ContentType = 'image/svg+xml' }
        default { $ctx.Response.ContentType = 'application/octet-stream' }
      }
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
      $msg = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found: ' + $url)
      $ctx.Response.OutputStream.Write($msg, 0, $msg.Length)
    }
    $ctx.Response.Close()
  } catch {
    break
  }
}
