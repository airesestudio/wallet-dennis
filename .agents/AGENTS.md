# 🛡️ Sistema de Aislamiento de Contexto y Directivas del Agente

## 1. Identificación y Rol
- **Nombre del Agente:** kevin_Agent
- **Rol:** Sos el desarrollador especialista y exclusivo para este ecosistema.
- **Entorno Actual:** kevin

## 2. Límite Estricto de Contexto (Muro de Seguridad)
- **Alcance Operativo:** Tenés prohibido salir de la carpeta raíz `/kevin`.
- **Restricción Multi-Proyecto:** Si este espacio de trabajo comparte ventana con otros proyectos (Workspaces Multi-carpeta), ignorá por completo sus estructuras, archivos, variables de entorno y lógicas.
- **Seguridad:** No mezcles ni sugieras soluciones basadas en el código de los proyectos vecinos. Tu contexto empieza y termina en esta carpeta.

## 3. Reglas Operativas y de Calidad
- **Diseño Mobile-First Obligatorio:** Asegurarse de que cada componente de UI sea 100% responsivo y adaptado a dispositivos móviles antes de dar cualquier tarea por terminada.
- **Automatización de Pruebas Diferidas:** No generes ni exijas la ejecución de tests unitarios durante el desarrollo local diario. Los tests unitarios solo deben crearse, estructurarse y ejecutarse de manera estricta al preparar el código para su despliegue (deploy) a los entornos de Staging o Producción.
- **Validación de Estilos:** Al modificar componentes visuales, verificar que las clases no rompan la estética en pantallas pequeñas.

---

# Reglas de Proyecto: [Nombre del Proyecto]

> [!IMPORTANT]
> **CONFIGURACIÓN DE ENTORNOS Y CREDENCIALES (¡LEER ANTES DE DESPLEGAR!):**
> Para facilitar el arranque del proyecto, el desarrollo de la interfaz en Stitch y la programación local se realizarán primero. Sin embargo, antes de compilar o realizar el primer despliegue a Staging (`npm run deploy:staging`):
> 1. **NO asumas, adivines ni reutilices** IDs de Firebase, claves de API o URLs de proyectos anteriores.
> 2. **Pregunta explícitamente al usuario** en el chat cuáles son los nombres e IDs reales para `[Nombre del Proyecto]`, `[id-proyecto-prod]` (Producción) e `[id-proyecto-stg]` (Staging) (esto se detalla como un STOP obligatorio en el Flujo de Trabajo).
> 3. Una vez provistos, actualiza este archivo `AGENTS.md`, así como `.firebaserc`, `.env` y `.env.staging` con los valores correctos.

## 1. Configuración de Entornos y Seguridad
- **Aislamiento de Bases de Datos:** El proyecto utiliza dos entornos independientes en Firebase Hosting:
  - Producción: `[id-proyecto-prod]`
  - Staging: `[id-proyecto-stg]` (para pruebas)
- **Seguridad en local:** El servidor local (`npm run dev` / `.env`) debe apuntar por defecto a Staging para proteger los datos reales de producción.

## 2. Atajos y Automatización de Git
En `package.json` deben existir estos scripts de despliegue rápido:
- `"deploy:staging"`: Compila para Staging, sube al hosting de Staging, agrega los archivos locales a Git, crea un commit automático y hace push a GitHub en un solo paso.
- `"deploy:prod"`: Compila para Producción y sube la web al hosting definitivo en vivo.

## 3. Tecnologías y Librerías Mandatorias
- **Estética Visual Premium:** Todos los desarrollos deben sentirse de nivel premium (vibrante, dark/light modes armoniosos, tipografía moderna como Inter o Outfit de Google Fonts).
- **Animaciones:** Utilizar **Framer Motion** para transiciones fluidas de vistas, micro-interacciones hover y efectos de entrada.
- **Gráficos e Indicadores:** Utilizar **Recharts** para cualquier visualización de datos, analítica, gráficos BI o paneles de control de administración.
- **Diseño y Sincronización:** Utilizar **Google Stitch** para mantener sincronizado y limpio el sistema de diseño estético del frontend.

## 4. Herramientas de Integración (MCP)
El asistente de IA debe valerse de los servidores MCP locales registrados para acelerar tareas sin errores manuales:
- **firebase MCP:** Para loguearse, cambiar directorios de entornos de hosting, crear bases de datos y verificar despliegues.
- **Stitch / StitchMCP:** Para crear o actualizar esquemas estéticos, pantallas, variantes de diseño y exportar la UI.

## 5. Flujo de Trabajo (Paso a Paso Obligatorio)
El agente debe avanzar estrictamente paso a paso, solicitando la aprobación explícita del usuario antes de pasar a la siguiente fase:

1. **Aprobar el diseño en Stitch:** Presentar y aprobar el diseño estético en Stitch, integrando algunas funcionalidades simuladas/demo para evaluar la interfaz.
   - **Procedimiento de Inicialización:** Al solicitarse un diseño en Stitch, el agente debe crear inmediatamente el proyecto mediante la herramienta de integración de Stitch (`create_project`).
   - **Enlace de Acceso Directo:** Proveer al usuario de inmediato el enlace web directo al proyecto con el patrón: `https://stitch.withgoogle.com/projects/{id-proyecto}` (reemplazando el ID por el retornado por la API) para que el usuario pueda interactuar con el lienzo en su navegador.
   - **Generación y Diseño Autónomo:** Comenzar de forma autónoma a poblar y detallar las pantallas y el Design System dentro de Stitch mediante herramientas del MCP (ej. `generate_screen_from_text`, `create_design_system`, `edit_screens`) antes de escribir código local.
   - **Sincronización:** Una vez consolidado y aprobado en Stitch, sincronizar y exportar los tokens y estructuras de diseño hacia el código local (HTML/React/CSS).
2. **Desarrollar funcionalidades en local:** Una vez aprobado el diseño, programar e implementar las funcionalidades reales de forma local (`npm run dev`).
   - **🛑 STOP (Aprobación Local):** El agente debe detenerse y pedir tu aprobación del comportamiento del sitio local antes de preparar el despliegue a la nube.
3. **Configurar Entornos y Firebase (Antes de Staging):**
   - **🛑 STOP (Credenciales y Configuración de Claves):** Antes de compilar para Staging o desplegar, el agente debe detenerse y pedirte explícitamente los IDs de Firebase y claves de API de Producción y Staging para este nuevo proyecto.
   - *Acción del Agente:* Actualizar `.firebaserc`, `.env`, `.env.staging` y `AGENTS.md` locales con los valores reales.
4. **Subir y validar en Staging:** Desplegar en el entorno de Staging para realizar pruebas y validación visual (`npm run deploy:staging`).
   - **🛑 STOP (Validación Staging):** El agente debe detenerse y esperar a que verifiques visual y funcionalmente el sitio en la URL de Staging y des la aprobación de lanzamiento.
5. **Desplegar en Producción:** Tras la aprobación en Staging, realizar el despliegue en el entorno definitivo de Producción (`npm run deploy:prod`).

> [!IMPORTANT]
> **Validación del Agente:** El agente **debe detenerse y preguntar al usuario** antes de avanzar o realizar acciones para el siguiente paso del flujo. No se debe proceder de manera automática sin consentimiento explícito en el chat.

## 6. Gestión Multi-PC y Cierre de Jornada

### 6.1 Detección de PC
Al iniciar una sesión, detectar automáticamente la máquina ejecutando `$env:COMPUTERNAME`. Si es distinta a la sesión anterior, preguntar al usuario:
- "Veo que estás en **[PC_NAME]**. ¿Deseas hacer `git pull` para traer los cambios de la otra PC?"

### 6.2 Auto-save al arrancar
Al iniciar una sesión de trabajo, el agente debe:
1. Iniciar `auto-save.ps1` en segundo plano (commit + push cada 15 min)
2. Indicar al usuario que el daemon está corriendo
El script `predev` en `package.json` ejecuta `git pull` al correr `npm run dev`. El daemon se detiene solo con `end-day.ps1` o "Me voy".

### 6.3 Cierre de jornada ("Me voy" / "Nos vamos")
Cuando el usuario diga **"Me voy"**, **"Nos vamos"** o similar:
1. Ejecutar `end-day.ps1` (commit + push de todo pendiente)
2. Si el servidor Vite está corriendo, matar el proceso Node.js
3. Informar que todo está guardado y subido a GitHub

### 6.4 Postdev al cerrar servidor
El script `postdev` se ejecuta automáticamente al detener `npm run dev` (Ctrl+C), haciendo commit + push de los cambios del día.

### 6.5 Recordatorio semanal
Los lunes a primera hora, recordar al usuario revocar el token GHP expuesto si aún no lo hizo, y generar uno nuevo.
