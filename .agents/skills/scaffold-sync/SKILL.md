---
name: scaffold-sync
description: Sincronización de configuraciones genéricas entre proyectos via kofman-scaffold
---

## Regla de oro
Toda configuración genérica (package.json scripts, .gitignore, firebase.json, .firebaserc, opencode.json, temas, AGENTS.md, cloudflared) se actualiza PRIMERO en `kofman-scaffold/templates/` y luego se propaga con `sync-config.ps1`.

## Sincronización diaria
1. Verificar si hay cambios genéricos sin propagar
2. Ejecutar `sync-config.ps1` si es necesario
3. Commit + push de `kofman-scaffold` y proyectos actualizados
