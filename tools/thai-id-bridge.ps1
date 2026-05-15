param(
  [int]$Port = 32123
)

$ErrorActionPreference = "Stop"

Add-Type @"
using System;
using System.Runtime.InteropServices;
using System.Text;

public static class WinSCard {
  [StructLayout(LayoutKind.Sequential)]
  public struct SCARD_IO_REQUEST {
    public uint dwProtocol;
    public uint cbPciLength;
  }

  [DllImport("winscard.dll")]
  public static extern int SCardEstablishContext(uint dwScope, IntPtr pvReserved1, IntPtr pvReserved2, out IntPtr phContext);

  [DllImport("winscard.dll", CharSet = CharSet.Auto)]
  public static extern int SCardListReaders(IntPtr hContext, string mszGroups, StringBuilder mszReaders, ref int pcchReaders);

  [DllImport("winscard.dll", CharSet = CharSet.Auto)]
  public static extern int SCardConnect(IntPtr hContext, string szReader, uint dwShareMode, uint dwPreferredProtocols, out IntPtr phCard, out uint pdwActiveProtocol);

  [DllImport("winscard.dll")]
  public static extern int SCardTransmit(IntPtr hCard, ref SCARD_IO_REQUEST pioSendPci, byte[] pbSendBuffer, int cbSendLength, IntPtr pioRecvPci, byte[] pbRecvBuffer, ref int pcbRecvLength);

  [DllImport("winscard.dll")]
  public static extern int SCardDisconnect(IntPtr hCard, uint dwDisposition);

  [DllImport("winscard.dll")]
  public static extern int SCardReleaseContext(IntPtr hContext);
}
"@

function Write-JsonResponse {
  param(
    [System.Net.Sockets.NetworkStream]$Stream,
    [int]$StatusCode,
    [string]$Body
  )

  $statusText = if ($StatusCode -eq 200) { "OK" } elseif ($StatusCode -eq 204) { "No Content" } else { "Error" }
  $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($Body)
  $headers = @(
    "HTTP/1.1 $StatusCode $statusText",
    "Content-Type: application/json; charset=utf-8",
    "Access-Control-Allow-Origin: *",
    "Access-Control-Allow-Methods: GET, OPTIONS",
    "Access-Control-Allow-Headers: Content-Type",
    "Cache-Control: no-store",
    "Content-Length: $($bodyBytes.Length)",
    "Connection: close",
    "",
    ""
  ) -join "`r`n"
  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  if ($bodyBytes.Length -gt 0) {
    $Stream.Write($bodyBytes, 0, $bodyBytes.Length)
  }
}

function ConvertTo-JsonSafe {
  param([hashtable]$Value)
  return ($Value | ConvertTo-Json -Depth 6 -Compress)
}

function Invoke-Card {
  param(
    [IntPtr]$Card,
    [uint32]$Protocol,
    [byte[]]$Command
  )

  $sendPci = New-Object WinSCard+SCARD_IO_REQUEST
  $sendPci.dwProtocol = $Protocol
  $sendPci.cbPciLength = 8
  $recv = New-Object byte[] 512
  $recvLength = $recv.Length
  $result = [WinSCard]::SCardTransmit($Card, [ref]$sendPci, $Command, $Command.Length, [IntPtr]::Zero, $recv, [ref]$recvLength)
  if ($result -ne 0) {
    throw "SCardTransmit failed: 0x{0:X8}" -f $result
  }
  $output = New-Object byte[] $recvLength
  [Array]::Copy($recv, $output, $recvLength)
  return $output
}

function Read-ThaiIdBytes {
  param(
    [IntPtr]$Card,
    [uint32]$Protocol,
    [int]$Offset,
    [int]$Length
  )

  $hi = [byte](($Offset -shr 8) -band 0xff)
  $lo = [byte]($Offset -band 0xff)
  $len = [byte]$Length
  $command = [byte[]](0x80, 0xB0, $hi, $lo, 0x02, 0x00, $len)
  $response = Invoke-Card -Card $Card -Protocol $Protocol -Command $command
  if ($response.Length -ge 2 -and $response[$response.Length - 2] -eq 0x61) {
    $getResponse = [byte[]](0x00, 0xC0, 0x00, 0x00, $len)
    $response = Invoke-Card -Card $Card -Protocol $Protocol -Command $getResponse
  }
  if ($response.Length -lt 2) {
    return [byte[]]@()
  }
  $sw1 = $response[$response.Length - 2]
  $sw2 = $response[$response.Length - 1]
  if ($sw1 -ne 0x90 -or $sw2 -ne 0x00) {
    return [byte[]]@()
  }
  $dataLength = $response.Length - 2
  $data = New-Object byte[] $dataLength
  [Array]::Copy($response, 0, $data, 0, $dataLength)
  return $data
}

function Decode-Tis620 {
  param([byte[]]$Bytes)
  if (-not $Bytes -or $Bytes.Length -eq 0) {
    return ""
  }
  return ([System.Text.Encoding]::GetEncoding(874).GetString($Bytes)).Trim([char]0, " ", "#")
}

function Convert-ThaiIdDate {
  param([string]$Value)
  $digits = ($Value -replace "\D", "")
  if ($digits.Length -ne 8) {
    return ""
  }
  $year = [int]$digits.Substring(0, 4)
  if ($year -gt 2400) {
    $year -= 543
  }
  return "{0:D4}-{1}-{2}" -f $year, $digits.Substring(4, 2), $digits.Substring(6, 2)
}

function Split-CardName {
  param([string]$Value)
  $parts = @($Value -split "#" | Where-Object { $_.Trim().Length -gt 0 } | ForEach-Object { $_.Trim() })
  return @{
    title = if ($parts.Length -ge 1) { $parts[0] } else { "" }
    firstName = if ($parts.Length -ge 2) { $parts[1] } else { "" }
    lastName = if ($parts.Length -ge 3) { $parts[$parts.Length - 1] } else { "" }
    fullName = ($parts -join " ")
  }
}

function Read-ThaiIdPhoto {
  param(
    [IntPtr]$Card,
    [uint32]$Protocol
  )

  $offsets = @(0x017B,0x027A,0x0379,0x0478,0x0577,0x0676,0x0775,0x0874,0x0973,0x0A72,0x0B71,0x0C70,0x0D6F,0x0E6E,0x0F6D,0x106C,0x116B,0x126A,0x1369,0x1468)
  $bytes = New-Object System.Collections.Generic.List[byte]
  foreach ($offset in $offsets) {
    $chunk = Read-ThaiIdBytes -Card $Card -Protocol $Protocol -Offset $offset -Length 255
    if ($chunk.Length -gt 0) {
      foreach ($byte in $chunk) {
        $bytes.Add([byte]$byte)
      }
    }
  }
  $array = $bytes.ToArray()
  if ($array.Length -lt 4) {
    return ""
  }
  $end = $array.Length - 1
  while ($end -gt 0 -and ($array[$end] -eq 0x00 -or $array[$end] -eq 0xff)) {
    $end--
  }
  $trimmed = New-Object byte[] ($end + 1)
  [Array]::Copy($array, $trimmed, $end + 1)
  return "data:image/jpeg;base64," + [Convert]::ToBase64String($trimmed)
}

function Read-ThaiIdCard {
  $context = [IntPtr]::Zero
  $card = [IntPtr]::Zero
  $activeProtocol = [uint32]0

  try {
    $result = [WinSCard]::SCardEstablishContext(0, [IntPtr]::Zero, [IntPtr]::Zero, [ref]$context)
    if ($result -ne 0) {
      throw "SCardEstablishContext failed: 0x{0:X8}" -f $result
    }

    $readerLength = 0
    [void][WinSCard]::SCardListReaders($context, $null, $null, [ref]$readerLength)
    if ($readerLength -le 1) {
      throw "No smart card reader found"
    }
    $readerBuffer = New-Object System.Text.StringBuilder $readerLength
    $result = [WinSCard]::SCardListReaders($context, $null, $readerBuffer, [ref]$readerLength)
    if ($result -ne 0) {
      throw "SCardListReaders failed: 0x{0:X8}" -f $result
    }
    $readers = $readerBuffer.ToString().Split([char]0, [System.StringSplitOptions]::RemoveEmptyEntries)
    if ($readers.Length -eq 0) {
      throw "No smart card reader found"
    }

    $lastError = $null
    foreach ($reader in $readers) {
      $result = [WinSCard]::SCardConnect($context, $reader, 2, 3, [ref]$card, [ref]$activeProtocol)
      if ($result -eq 0) {
        break
      }
      $lastError = "SCardConnect failed for $reader`: 0x{0:X8}" -f $result
    }
    if ($card -eq [IntPtr]::Zero) {
      throw $lastError
    }

    $select = [byte[]](0x00,0xA4,0x04,0x00,0x08,0xA0,0x00,0x00,0x00,0x54,0x48,0x00,0x01)
    [void](Invoke-Card -Card $card -Protocol $activeProtocol -Command $select)

    $cid = Decode-Tis620 (Read-ThaiIdBytes -Card $card -Protocol $activeProtocol -Offset 0x0004 -Length 13)
    $nameTh = Split-CardName (Decode-Tis620 (Read-ThaiIdBytes -Card $card -Protocol $activeProtocol -Offset 0x0011 -Length 100))
    $nameEn = Split-CardName (Decode-Tis620 (Read-ThaiIdBytes -Card $card -Protocol $activeProtocol -Offset 0x0075 -Length 100))
    $birthDate = Convert-ThaiIdDate (Decode-Tis620 (Read-ThaiIdBytes -Card $card -Protocol $activeProtocol -Offset 0x00D9 -Length 8))
    $issueDate = Convert-ThaiIdDate (Decode-Tis620 (Read-ThaiIdBytes -Card $card -Protocol $activeProtocol -Offset 0x0167 -Length 8))
    $expireDate = Convert-ThaiIdDate (Decode-Tis620 (Read-ThaiIdBytes -Card $card -Protocol $activeProtocol -Offset 0x016F -Length 8))
    $address = (Decode-Tis620 (Read-ThaiIdBytes -Card $card -Protocol $activeProtocol -Offset 0x1579 -Length 100)) -replace "#", " "
    $photo = Read-ThaiIdPhoto -Card $card -Protocol $activeProtocol

    return @{
      ok = $true
      cid = $cid
      titleTh = $nameTh.title
      firstNameTh = $nameTh.firstName
      lastNameTh = $nameTh.lastName
      fullNameTh = $nameTh.fullName
      titleEn = $nameEn.title
      firstNameEn = $nameEn.firstName
      lastNameEn = $nameEn.lastName
      fullName = $nameEn.fullName
      birthDate = $birthDate
      cardIssueDate = $issueDate
      cardExpireDate = $expireDate
      address = $address.Trim()
      imageUrl = $photo
    }
  }
  finally {
    if ($card -ne [IntPtr]::Zero) {
      [void][WinSCard]::SCardDisconnect($card, 0)
    }
    if ($context -ne [IntPtr]::Zero) {
      [void][WinSCard]::SCardReleaseContext($context)
    }
  }
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse("127.0.0.1"), $Port)
$listener.Start()
Write-Host "Thai ID bridge running on http://127.0.0.1:$Port"

while ($true) {
  $client = $listener.AcceptTcpClient()
  try {
    $stream = $client.GetStream()
    $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::ASCII, $false, 4096, $true)
    $requestLine = $reader.ReadLine()
    if (-not $requestLine) {
      continue
    }
    while (($line = $reader.ReadLine()) -ne $null -and $line.Length -gt 0) {}
    $parts = $requestLine.Split(" ")
    $method = $parts[0]
    $path = $parts[1]

    if ($method -eq "OPTIONS") {
      Write-JsonResponse -Stream $stream -StatusCode 204 -Body ""
    }
    elseif ($path -eq "/health") {
      Write-JsonResponse -Stream $stream -StatusCode 200 -Body (ConvertTo-JsonSafe @{ ok = $true })
    }
    elseif ($path -eq "/read-card") {
      try {
        $data = Read-ThaiIdCard
        Write-JsonResponse -Stream $stream -StatusCode 200 -Body (ConvertTo-JsonSafe $data)
      }
      catch {
        Write-JsonResponse -Stream $stream -StatusCode 500 -Body (ConvertTo-JsonSafe @{ ok = $false; message = $_.Exception.Message })
      }
    }
    else {
      Write-JsonResponse -Stream $stream -StatusCode 404 -Body (ConvertTo-JsonSafe @{ ok = $false; message = "Not found" })
    }
  }
  finally {
    $client.Close()
  }
}
