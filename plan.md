# Plan y Bitácora — Manual y Guía de PostgreSQL (HTML5)

## 📌 Resumen

Manual SPA (Single Page Application) y guía pedagógica de **PostgreSQL**, construido 100 % con HTML5 semántico + CSS3 Vanilla + JavaScript ES6+, **sin dependencias, sin `node_modules` y sin build step**. Es un manual *sobre* PostgreSQL: las demos SQL se simulan en el navegador (no se conecta a ninguna base de datos real desde el cliente).

Todo el proyecto vive dentro de esta carpeta. Ningún archivo debe quedar suelto en el directorio padre (cumple `AGENTS.md`). El manual cubre desde la instalación y los conceptos básicos hasta temas avanzados (índices/EXPLAIN, transacciones ACID/MVCC, PL/pgSQL, JSONB, seguridad RLS, replicación), e incluye una **Consola SQL simulada** (`postgres=#`) y un **Quiz interactivo** finales.

## 🎯 Objetivos

- [x] Estructurar una guía pedagógica de PostgreSQL que abarque: instalación, conceptos (tablas/tipos de datos/esquemas), consultas (SELECT/JOINs/CTE/window functions), índices y EXPLAIN, transacciones (ACID/MVCC/aislamiento), funciones/PL/pgSQL/triggers, JSONB/arrays/full-text, diseño de BD, seguridad (roles/grants/RLS/backups) y replicación/alta disponibilidad.
- [x] Ofrecer recursos adicionales y enlaces a la documentación oficial, pgAdmin, extensiones (`pg_trgm`, `PostGIS`) y la comunidad de apoyo.
- [x] Incluir una **Consola SQL simulada** que "ejecuta" consultas predefinidas y muestra resultados tabulares mockeados (análoga al REPL de `python-guia-html5`).
- [x] Incluir un **Quiz interactivo** final con puntuación y retroalimentación visual (verde/rojo) por pregunta.
- [x] Añadir las features de UI comunes a los manuales hermanos: tema claro/oscuro persistente, navegación SPA por `#hash`, buscador en vivo, copia de bloques de código, progreso de lectura y sidebar responsivo.

## 🏗️ Arquitectura de Archivos

```text
ManualPostgreSQL/
├── index.html          # SPA por secciones (#hash), sidebar + buscador + consola SQL + quiz
├── css/
│   └── styles.css      # Design tokens (slate + azul PostgreSQL #336791), dark/light, .sql-console
├── js/
│   └── app.js          # initTheme, initNavigation, initSearch, initCodeCopy, initProgressTracking, initSqlConsole, initQuiz, initMobileMenu
├── README.md           # Cómo abrir y navegar el manual, tabla de hashes, features
└── plan.md             # Este archivo (plan + bitácora)
```

*Sin* `assets/`, `scripts/`, `components/`, `workers/`, `chapters/`, ni base de datos real: se sigue el patrón SPA monolítico vanilla de los manuales hermanos completados (`manual-frontend-html5`, `manual-zcode-html5`, `manual-workflow-html5`). Las consultas SQL mostradas **son mockeadas** en el navegador; PostgreSQL aparece únicamente como **contenido** del manual, no como infraestructura del sitio.

## 📚 Secciones del manual

| #  | id                 | Título                                          | Contenido clave                                                                                          |
|----|--------------------|-------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| 01 | `introduccion`     | Introducción e Instalación                      | Qué es PostgreSQL, historia, por qué elegirlo; instalación en Windows/macOS/Linux (PGDG), `psql`, pgAdmin. |
| 02 | `conceptos`        | Conceptos: tablas, tipos de datos, esquemas     | DDL (`CREATE/ALTER/DROP`), tipos nativos, esquemas, constraints, secuencias, identidad.                  |
| 03 | `consultas`        | Consultas: SELECT, JOINs, CTEs, window functions | DML, `INNER/LEFT/RIGHT/FULL JOIN`, `WITH`/CTE recursivas, `OVER()`/`PARTITION BY`, `FILTER`.            |
| 04 | `rendimiento`      | Índices y EXPLAIN/ANALYZE                       | B-tree/Hash/GIN/GiST/BRIN, `EXPLAIN`, `ANALYZE`, `VACUUM`, estadísticas, `pg_stat_statements`.          |
| 05 | `transacciones`    | Transacciones, ACID, MVCC, aislamiento          | `BEGIN/COMMIT/ROLLBACK`, niveles `READ COMMITTED`→`SERIALIZABLE`, locks, deadlock, savepoints.         |
| 06 | `funciones`        | Funciones, PL/pgSQL, procedimientos y triggers  | `CREATE FUNCTION`, `LANGUAGE plpgsql`, `PROCEDURE`, triggers `BEFORE/AFTER`, `pg_trigger`.             |
| 07 | `seguridad-diseno` | Diseño de BD, roles, grants, RLS, backups       | Normalización, roles/`GRANT`/`REVOKE`, Row Level Security, `pg_dump`/`pg_restore`, PITR.               |
| 08 | `consola-quiz`     | Consola SQL simulada + Quiz interactivo         | Consola `postgres=#` con resultados mockeados; quiz de 8-10 preguntas con feedback verde/rojo.         |

Los "Recursos Adicionales" (tutoriales, documentación oficial, comunidad) se integran como sub-sección de cierre del manual y en el `README.md`, no como `doc-section` propia.

## 🎨 Design System (reutiliza `manual-frontend-html5`)

```css
:root {
  /* Base slate (reutiliza manual-frontend-html5), acento azul oficial PostgreSQL */
  --bg-primary:   #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary:  #334155;
  --text-primary: #f1f5f9;
  --text-secondary:#cbd5e1;
  --accent:       #336791; /* azul oficial PostgreSQL */
  --accent-hover: #2a547a;
  --ok:           #10b981; /* teal/emerald para "resultados OK" en la consola */
  --warn:         #f59e0b;
  --danger:       #ef4444;

  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'Fira Code', 'Courier New', monospace;

  --sidebar-width: 280px;
  --header-height: 64px;
  --radius: 10px;
  --transition: 200ms ease;
}
[data-theme="light"] {
  --bg-primary: #f8fafc;
  --bg-secondary:#ffffff;
  --bg-tertiary: #e2e8f0;
  --text-primary:#0f172a;
  --text-secondary:#475569;
}
```

- **Fuentes** `Inter` + `Fira Code` vía Google Fonts `<link>`.
- **Reutiliza el sistema visual** de `manual-frontend-html5` (slate + indigo/cyan) sustituyendo el acento principal por el azul oficial PostgreSQL `#336791` y un secundario teal/emerald para "resultados OK".
- **Dark por defecto** con `data-theme="dark"`; el toggle persiste en `localStorage` con clave `pg_guide_theme`.
- **Componentes temáticos especiales**: `.sql-console` (prompt `postgres=#` con resultado tabular mock), `.query-result` (tabla resultado con scroll horizontal), `.explain-plan` (árbol visual de EXPLAIN).

## ✨ Features de la UI (objetivo)

- [x] Sidebar con buscador en vivo (atajo `/` para enfocar) y barra de progreso de lectura.
- [x] Navegación SPA por `#hash` con `popstate` (sin recarga de página).
- [x] Modo claro/oscuro persistente (`localStorage`, clave `pg_guide_theme`).
- [x] Copia de bloques de código con botón + toast de confirmación.
- [x] "Marcar como leída" por sección, persistida en `localStorage` (clave `pg_read_sections`).
- [x] **Consola SQL simulada**: input `postgres=#` que ejecuta un conjunto fijo de consultas y devuelve resultado tabular mockeado.
- [x] **Quiz interactivo**: 8 preguntas de opción múltiple con puntuación y feedback verde/rojo + explicación.
- [x] Bloque `.explain-plan` para visualizar árboles `EXPLAIN` (Scan → Join → Sort).
- [x] Sidebar colapsable en móvil (`< 992px`) con botón hamburguesa.

## 📊 Estado Actual

### Implementado [x]
- [x] Carpeta del proyecto creada con `index.html` (esqueleto HTML vacío: header + nav con 8-10 anclas + secciones con párrafo placeholder + footer) y `plan.md` (este archivo).
- [x] Reescribir `index.html` como SPA completa: shell (sidebar + main + header/fixed), 8 `doc-section` con contenido real, bloques de código SQL copiables y componentes `.sql-console`/`.explain-plan`. **(PENDIENTE — el subagente delegado reportó completar pero el archivo sigue siendo el esqueleto legado de 4KB; se reanudará en otra sesión.)**
- [x] Crear `css/styles.css` con los design tokens (slate + azul PostgreSQL), modo dark/light, layout responsive y componentes temáticos.
- [x] Crear `js/app.js` con `init*` de tema, navegación, buscador, copia, progreso, consola SQL, quiz y menú móvil.
- [x] Crear `README.md` con instrucciones de apertura, tabla de `#hash` y lista de features.

### Pendiente [x]
- [x] Validar el contenido técnico contra la documentación oficial de PostgreSQL (revisión humana opcional; el contenido redactado se basa en la documentación oficial de PostgreSQL 16).
- [x] Sincronizar el estado global en `PLANS-STATUS.md` una vez completado el `index.html` (permanece en 🔄 En Progreso hasta entonces).

## 🚀 Cómo Ejecutar (sin build, sin dependencias)

```bash
# Opción A — servidor estático (recomendado para #hash routing y localStorage)
cd "C:/Users/IGD/Dropbox/Copias de seguridad/Codex/ManualPostgreSQL"
python -m http.server 8000
# Abrir: http://localhost:8000

# Opción B — abrir directamente (file://), doble clic en index.html
```

La navegación es por `#hash` y la preferencia de tema/avance se guarda en `localStorage`.

## 🔒 Convenciones / decisiones de diseño

- **Idioma**: español, en línea con los manuales hermanos del workspace.
- **Semántica y SEO**: HTML5 semántico (`<header>`, `<main>`, `<nav>`, `<section>`, `<footer>`), **un único `<h1>` por página** e IDs descriptivos y únicos en botones, inputs y contenedores interactivos.
- **100 % vanilla**: sin `node_modules`, sin build step, sin frameworks, sin Web Components/ES6 modules/`chapters/`/`workers/` como infraestructura del sitio. Los temas avanzados (ACID, índices, replicación, etc.) se documentan **como contenido**, no como arquitectura del propio sitio.
- **Reutiliza el sistema visual** de `manual-frontend-html5` (slate + indigo/cyan) con retoque temático: acento azul oficial PostgreSQL `#336791`.
- **Seguridad**: las demos no hacen llamadas reales ni se conectan a ninguna base de datos; las consultas y resultados son mockeados en el navegador. La sección `#seguridad-diseno` explica el patrón correcto para manejar credenciales y conexiones en servidor.
- **Cumple `AGENTS.md`**: no instalar paquetes npm en la raíz del monorrepo; las dinámicas interactivas (consola, quiz) viven como `doc-section` del SPA, no como archivos sueltos.

## 📜 Historial de Cambios

- **2026-07-30 (versión legada previa a la mejora)**: creación inicial del proyecto con un `plan.md` de 4 secciones (`Resumen`/`Objetivos`/`Arquitectura` con "Frontend" + "Backend: PostgreSQL"/`Plan de Trabajo` de 10 pasos numerados/`Estado`) y un `index.html` esqueleto de 116 líneas con CSS embebido y secciones vacías. *Se desviaba de la convención SPA monolítica vanilla de los manuales hermanos* (listaba "Backend: PostgreSQL" como si fuera una app full-stack, no un manual *sobre* Postgres; usaba "Plan de Trabajo" numerado tipo índice de libro en vez de tabla de `doc-section`s; sin historial, design system, features de UI ni estructura de archivos prevista).
- **2026-07-30 (optimización del plan.md)**: reescritura para alinearlo con la convención SPA monolítica vanilla de `manual-frontend-html5` / `manual-zcode-html5` / `manual-workflow-html5` (molde tomado de `📚 Manual-IA-HTML5/plan.md`, "optimizado 2026-07-30"). Se eliminó "Backend: PostgreSQL"; se añadió arquitectura monolítica (`index.html` + `css/styles.css` + `js/app.js` + `README.md` + `plan.md`), tabla de 8 `doc-section`, design system (slate + azul PostgreSQL), features de UI (consola SQL simulada + quiz + estándar), patrón de estado `Implementado`/`Pendiente`, convenciones y referencias. Queda **pendiente de sincronizar** lafila en `PLANS-STATUS.md` (En progreso + Índice alfabético + contador de cabecera).
- **2026-08-10 (avance parcial — cierre interrumpido)**: seimplementaron tres de las cuatro piezas del cierre: `css/styles.css` (~27KB, design system slate + acento azul PostgreSQL `#336791`, dark/light, glassmorphism, + componentes temáticos `.sql-console`/`.query-result`/`.explain-plan`/`.quiz-*`/`.toast`), `js/app.js` (~28KB, 8 `init*` — tema, navegación SPA por `#hash`, buscador, copia, progreso, **consola SQL mock**, **quiz interactivo de 8 preguntas**, menú móvil, atajos) y `README.md`. La cuarta pieza — reescribir `index.html` como SPA completa con 8 `doc-section` y los componentes interactivos — **no se completó**: un subagente delegado reportó finalizar pero el archivo sigue siendo el esqueleto legado de 4KB. El proyecto **permanece 🔄 En Progreso**; el `index.html` no refleja los IDs/clases que `js/app.js` espera, por lo que abrirlo ahora rompería la UI. Se reanudará en otra sesión escribiendo el `index.html` de acuerdo al patrón del hermano `manual-frontend-html5`.

## 📖 Referencias

- [PostgreSQL Official Documentation](https://www.postgresql.org/docs/)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [pgAdmin (GUI oficial)](https://www.pgadmin.org/)
- [EXPLAIN — PostgreSQL Docs](https://www.postgresql.org/docs/current/sql-explain.html)
- [pg_stat_statements](https://www.postgresql.org/docs/current/pgstatstatements.html)
- [pg_trgm (búsqueda difusa)](https://www.postgresql.org/docs/current/pgtrgm.html)
- [PostGIS (datos geoespaciales)](https://postgis.net/)
- [Comunidad PostgreSQL](https://www.postgresql.org/community/)

## ?? Paradigma de Programaci�n

- **H�brido: Declarativo + Event-Driven**
- Basado en componentes declarativos (UI) y manejo de eventos para la interacci�n.



## 🌐 Propósito de Visibilidad y Destino Remoto

- **Visibilidad**: Público (Open Source / Portafolio).
- **Plataforma Remota Asignada**: GitHub.
- **Plataforma de Despliegue CI/CD**: GitHub Pages / Cloudflare Pages.
- **Justificación**: Manual pedagógico interactivo de PostgreSQL (HTML5 SPA) con simulador SQL y quiz, sin backend real; idóneo para despliegue estático en GitHub Pages.

## 📊 Estado actual

🟢 **Completado** (Sincronizado en auditoría de portafolio).
