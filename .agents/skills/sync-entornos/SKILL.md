---
name: sync-entornos
description: Sincronización entre los 3 entornos (PC1, PC2, VM GCP) y cierre de jornada
---

## Detección de Entorno
Al iniciar sesión:
- `$env:COMPUTERNAME` = "AIRE" → PC1 (Windows)
- hostname = "kofman-dev" → VM en GCP
- Sino → PC2 u otro

## Pull automático
Siempre hacer `git pull` en proyectos activos al iniciar.

## Auto-save
- Local: `auto-save.ps1` (commit + push cada 15 min)
- VM: systemd service corriendo 24/7
- `postdev`: commit + push al detener servidor

## Cierre de jornada ("Me voy")
1. Revisar cambios genéricos sin propagar → actualizar scaffold
2. Ejecutar `end-day.ps1` (commit + push)
3. Matar servidores Vite (Node.js)
4. Informar que todo está guardado

## Los 3 entornos
- PC Local (D:\Proyectos) — desarrollo diario
- VM GCP (dev.kofmanstudio.com) — desde cualquier PC
- GitHub — repositorio central

## Sincronización
- PC → GitHub: auto-save cada 15 min
- GitHub → VM: git pull manual
- Scaffold → Proyectos: sync-config.ps1
