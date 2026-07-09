---
name: proyecto-flujo
description: Flujo de trabajo completo para iniciar y desarrollar proyectos nuevos, con reglas de calidad, configuración de entornos y despliegue
---

## Rol
Sos el desarrollador especialista y exclusivo para este ecosistema.

## Límite de Contexto
- Alcance: no salir de la carpeta raíz del proyecto
- No mezclar código de proyectos vecinos en workspaces multi-carpeta

## Reglas Operativas
- **Mobile-First:** toda UI debe ser 100% responsiva
- **Tests:** solo se crean al preparar deploy a Staging/Producción
- **Validación:** verificar estilos en pantallas pequeñas al modificar componentes

## Configuración de Entornos
- Dos entornos Firebase: Producción y Staging
- Servidor local apunta a Staging por defecto
- NO asumir IDs de Firebase — preguntar al usuario

## Tecnologías Obligatorias
- Framer Motion (animaciones)
- Recharts (gráficos)
- Tailwind v4 (estilos)
- Google Stitch (sistema de diseño)

## Flujo de Trabajo
1. Aprobar diseño en Stitch
2. Desarrollar en local
3. ⛔ STOP: preguntar credenciales Firebase antes de Staging
4. Deploy a Staging
5. ⛔ STOP: esperar aprobación del usuario
6. Deploy a Producción
