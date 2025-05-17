# Test script for Contract PDF API endpoints
$baseUrl = "http://localhost:8080/api/contrats"
$testPdfPath = "C:\temp\test-contrat.pdf"

# 1. Get all contracts to find one to work with
Write-Host "Retrieving all contracts..." -ForegroundColor Cyan
$contracts = Invoke-RestMethod -Uri $baseUrl -Method Get
if ($contracts.Count -eq 0) {
    Write-Host "No contracts found. Please create at least one contract first." -ForegroundColor Red
    exit
}

# Select the first contract for testing
$contractId = $contracts[0].id
Write-Host "Selected contract ID: $contractId" -ForegroundColor Green

# 2. Test PDF upload
Write-Host "`nUploading PDF file to contract..." -ForegroundColor Cyan

# Check if test PDF exists, if not create a simple one
if (-not (Test-Path $testPdfPath)) {
    Write-Host "Creating a sample PDF file for testing..." -ForegroundColor Yellow
    
    # Create a simple PDF file using .NET 
    # This is a simplified example - in real usage, you'd have an actual PDF file
    $content = [System.Text.Encoding]::UTF8.GetBytes("%PDF-1.4`n1 0 obj`n<</Type /Catalog /Pages 2 0 R>>`nendobj`n2 0 obj`n<</Type /Pages /Kids [3 0 R] /Count 1>>`nendobj`n3 0 obj`n<</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R>>`nendobj`n4 0 obj`n<</Length 55>>`nstream`nBT /F1 12 Tf 100 700 Td (This is a test PDF for contract upload.) Tj ET`nendstream`nendobj`nxref`n0 5`n0000000000 65535 f`n0000000010 00000 n`n0000000056 00000 n`n0000000111 00000 n`n0000000212 00000 n`ntrailer`n<</Size 5 /Root 1 0 R>>`nstartxref`n320`n%%EOF")
    [System.IO.File]::WriteAllBytes($testPdfPath, $content)
    
    if (-not (Test-Path $testPdfPath)) {
        Write-Host "Failed to create test PDF file." -ForegroundColor Red
        exit
    }
}

# Upload the PDF file
try {
    $form = @{
        file = Get-Item -Path $testPdfPath
    }
    
    $uploadResult = Invoke-RestMethod -Uri "$baseUrl/$contractId/pdf" -Method Post -Form $form
    Write-Host "PDF uploaded successfully. Contract details:" -ForegroundColor Green
    $uploadResult | ConvertTo-Json | Write-Host
} 
catch {
    Write-Host "Error uploading PDF:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# 3. Test PDF download
Write-Host "`nDownloading PDF file from contract..." -ForegroundColor Cyan
$downloadPath = "C:\temp\downloaded-contract-$contractId.pdf"

try {
    # Download the PDF
    Invoke-RestMethod -Uri "$baseUrl/$contractId/pdf" -Method Get -OutFile $downloadPath
    
    if (Test-Path $downloadPath) {
        $fileInfo = Get-Item $downloadPath
        Write-Host "PDF downloaded successfully to: $downloadPath" -ForegroundColor Green
        Write-Host "File size: $($fileInfo.Length) bytes"
    } else {
        Write-Host "Download completed but file not found at expected location." -ForegroundColor Yellow
    }
}
catch {
    Write-Host "Error downloading PDF:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host "`nTest completed." -ForegroundColor Cyan
