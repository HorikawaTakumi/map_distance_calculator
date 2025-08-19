# WSL2 Port Forwarding Setup Script
# Run as Administrator in PowerShell

param(
    [int]$Port = 3000,
    [string]$WSLDistro = "Ubuntu",
    [switch]$Remove,
    [switch]$Status
)

function Show-Usage {
    Write-Host "WSL2 Port Forwarding Setup Script" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\setup-wsl-port.ps1                    # Setup port 3000 forwarding"
    Write-Host "  .\setup-wsl-port.ps1 -Port 8080         # Setup custom port"
    Write-Host "  .\setup-wsl-port.ps1 -Remove            # Remove port forwarding"
    Write-Host "  .\setup-wsl-port.ps1 -Status            # Check current status"
    Write-Host ""
}

function Test-AdminRights {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Get-WSLIPAddress {
    param([string]$Distro)
    
    try {
        $wslIP = wsl -d $Distro ip addr show eth0 2>$null | Select-String "inet " | ForEach-Object { 
            ($_ -split '\s+')[2] -split '/' | Select-Object -First 1 
        }
        return $wslIP
    }
    catch {
        Write-Warning "Failed to get WSL IP address. Is WSL running?"
        return $null
    }
}

function Get-WindowsIPAddress {
    try {
        $adapter = Get-NetAdapter | Where-Object { $_.Status -eq "Up" -and $_.InterfaceDescription -notlike "*Loopback*" -and $_.InterfaceDescription -notlike "*Hyper-V*" } | Select-Object -First 1
        $ipConfig = Get-NetIPAddress -InterfaceIndex $adapter.InterfaceIndex -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "169.254.*" }
        return $ipConfig.IPAddress
    }
    catch {
        Write-Warning "Failed to get Windows IP address"
        return "localhost"
    }
}

function Show-Status {
    param([int]$Port)
    
    Write-Host "`n=== Current Status ===" -ForegroundColor Cyan
    
    # Check port forwarding rules
    Write-Host "`nPort Forwarding Rules:" -ForegroundColor Yellow
    $portProxy = netsh interface portproxy show all | Select-String "$Port"
    if ($portProxy) {
        $portProxy | ForEach-Object { Write-Host "  $_" -ForegroundColor Green }
    } else {
        Write-Host "  No port forwarding rules found for port $Port" -ForegroundColor Red
    }
    
    # Check firewall rules
    Write-Host "`nFirewall Rules:" -ForegroundColor Yellow
    $firewallRules = Get-NetFirewallRule -DisplayName "*WSL*Port*$Port*" -ErrorAction SilentlyContinue
    if ($firewallRules) {
        $firewallRules | ForEach-Object { 
            Write-Host "  $($_.DisplayName) - $($_.Enabled)" -ForegroundColor Green 
        }
    } else {
        Write-Host "  No firewall rules found for WSL port $Port" -ForegroundColor Red
    }
    
    # Show IP addresses
    $wslIP = Get-WSLIPAddress -Distro $WSLDistro
    $winIP = Get-WindowsIPAddress
    
    Write-Host "`nIP Addresses:" -ForegroundColor Yellow
    Write-Host "  WSL IP: $wslIP" -ForegroundColor Cyan
    Write-Host "  Windows IP: $winIP" -ForegroundColor Cyan
    
    if ($wslIP) {
        Write-Host "`nAccess URLs:" -ForegroundColor Yellow
        Write-Host "  From same network: https://$winIP`:$Port" -ForegroundColor Green
        Write-Host "  Direct WSL access: https://$wslIP`:$Port" -ForegroundColor Green
    }
}

function Remove-PortForwarding {
    param([int]$Port)
    
    Write-Host "Removing port forwarding for port $Port..." -ForegroundColor Yellow
    
    # Remove port proxy
    try {
        netsh interface portproxy delete v4tov4 listenport=$Port listenaddress=0.0.0.0
        Write-Host "✓ Port proxy removed" -ForegroundColor Green
    }
    catch {
        Write-Warning "Failed to remove port proxy"
    }
    
    # Remove firewall rules
    try {
        Get-NetFirewallRule -DisplayName "*WSL*Port*$Port*" -ErrorAction SilentlyContinue | Remove-NetFirewallRule
        Write-Host "✓ Firewall rules removed" -ForegroundColor Green
    }
    catch {
        Write-Warning "Failed to remove firewall rules"
    }
}

function Setup-PortForwarding {
    param([int]$Port, [string]$Distro)
    
    Write-Host "Setting up WSL2 port forwarding for port $Port..." -ForegroundColor Green
    
    # Get WSL IP address
    $wslIP = Get-WSLIPAddress -Distro $Distro
    if (-not $wslIP) {
        Write-Error "Cannot get WSL IP address. Make sure WSL is running."
        return
    }
    
    Write-Host "WSL IP Address: $wslIP" -ForegroundColor Cyan
    
    # Remove existing port forwarding (if any)
    netsh interface portproxy delete v4tov4 listenport=$Port listenaddress=0.0.0.0 2>$null
    
    # Add port forwarding
    Write-Host "Adding port forwarding..." -ForegroundColor Yellow
    try {
        netsh interface portproxy add v4tov4 listenport=$Port listenaddress=0.0.0.0 connectport=$Port connectaddress=$wslIP
        Write-Host "✓ Port forwarding added: 0.0.0.0:$Port -> $wslIP`:$Port" -ForegroundColor Green
    }
    catch {
        Write-Error "Failed to add port forwarding"
        return
    }
    
    # Add firewall rules
    Write-Host "Configuring Windows Firewall..." -ForegroundColor Yellow
    try {
        # Remove existing rules
        Get-NetFirewallRule -DisplayName "*WSL*Port*$Port*" -ErrorAction SilentlyContinue | Remove-NetFirewallRule
        
        # Add new rules
        New-NetFirewallRule -DisplayName "WSL Port $Port Inbound" -Direction Inbound -Protocol TCP -LocalPort $Port -Action Allow | Out-Null
        New-NetFirewallRule -DisplayName "WSL Port $Port Outbound" -Direction Outbound -Protocol TCP -LocalPort $Port -Action Allow | Out-Null
        Write-Host "✓ Firewall rules added" -ForegroundColor Green
    }
    catch {
        Write-Warning "Failed to configure firewall. You may need to do this manually."
    }
    
    # Show access information
    $winIP = Get-WindowsIPAddress
    Write-Host "`n=== Setup Complete ===" -ForegroundColor Green
    Write-Host "Access your application from mobile devices using:" -ForegroundColor Yellow
    Write-Host "  https://$winIP`:$Port" -ForegroundColor Cyan
    Write-Host "  http://$winIP`:$Port" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Note: Make sure your mobile device is on the same WiFi network" -ForegroundColor Yellow
}

# Main script execution
if (-not (Test-AdminRights)) {
    Write-Error "This script must be run as Administrator!"
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

if ($Status) {
    Show-Status -Port $Port
    exit 0
}

if ($Remove) {
    Remove-PortForwarding -Port $Port
    exit 0
}

if ($args -contains "-h" -or $args -contains "--help") {
    Show-Usage
    exit 0
}

Setup-PortForwarding -Port $Port -Distro $WSLDistro