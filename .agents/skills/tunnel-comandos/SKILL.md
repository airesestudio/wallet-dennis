---
name: tunnel-comandos
description: Gestión del túnel Cloudflare para acceder a proyectos locales desde cualquier red
---

## Túnel activo
- Ejecutable: `D:\Proyectos\Archivos\cloudflared.exe`
- Túnel: `kevin-tunnel` (ID: c75ee27c-76f0-45c1-bffe-b0f054b3aa03)
- Config: `C:\Users\aires\.cloudflared\config.yml`

## URLs
- `https://kevin.kofmanstudio.com` → Kevin (localhost:5173)
- `https://kofman.kofmanstudio.com` → Kofman (localhost:5174)
- `https://moreno.kofmanstudio.com` → Moreno (localhost:5176)
- `https://dennis.kofmanstudio.com` → Dennis (localhost:5177)

## Autenticación
Solo `contacto@kofmanstudio.com` puede acceder (Cloudflare Access con código por email).

## Iniciar
```powershell
D:\Proyectos\Archivos\cloudflared.exe tunnel run kevin-tunnel
```

## Cortar
```powershell
taskkill /IM cloudflared.exe /F
```
