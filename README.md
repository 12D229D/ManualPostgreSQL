# Manual y Guía de PostgreSQL (HTML5)

Manual SPA (Single Page Application) y guía pedagógica de **PostgreSQL**, construido
100 % con HTML5 semántico + CSS3 Vanilla + JavaScript ES6+, **sin dependencias,
sin `node_modules` y sin build step**. Es un manual *sobre* PostgreSQL: las demos SQL
se simulan en el navegador (no se conecta a ninguna base de datos real desde el cliente).

## ✨ Características

- **SPA con 8 secciones** navegables por `#hash` (deep-linking) sin recarga de página.
- **Tema claro/oscuro persistente** (clave `localStorage`: `pg_guide_theme`),
  respeta `prefers-color-scheme` del sistema.
- **Buscador en vivo** del sidebar con filtro de nav-items (atajo `/`).
- **Copia de bloques de código** con un click + toast de confirmación.
- **Progreso de lectura** por sección persistente (clave `pg_read_sections`) con
  barra visual en el sidebar.
- **Sidebar colapsable** en móvil (`< 992px`) con botón hamburguesa.
- **Consola SQL simulada** (`postgres=#`) que "ejecuta" un set fijo de consultas y
  devuelve resultados tabulares mockeados. Comandos: `SELECT`, `EXPLAIN`, `TABLES`,
  `HELP`, `CLEAR`.
- **Quiz interactivo** final de 8 preguntas de opción múltiple con feedback
  verde/rojo, explicación por pregunta, puntuación en vivo y mensaje de resultado
  según porcentaje.
- **Visor EXPLAIN** mock con árbol visual (`.explain-plan`) — Scan → Join → Sort.
- **Diseño premium** con paleta slate + azul oficial PostgreSQL `#336791`,
  glassmorphism en la topbar, fuentes *Inter* + *Fira Code* y microinteracciones.

## 🗂 Estructura

```
ManualPostgreSQL/
├── index.html          # SPA por secciones (#hash), sidebar + buscador + consola SQL + quiz
├── css/
│   └── styles.css      # Design tokens (slate + azul PostgreSQL #336791), dark/light, .sql-console
├── js/
│   └── app.js          # initTheme, initNavigation, initSearch, initCodeCopy,
│                       #   initProgressTracking, initSqlConsole, initQuiz, initMobileMenu
├── README.md           # Este documento
└── plan.md             # Bitácora y plan de desarrollo
```

## 🚀 Cómo ejecutar (sin build, sin dependencias)

### Opción A — servidor estático (recomendado)
```bash
cd ManualPostgreSQL
python -m http.server 8000
# Abrir: http://localhost:8000
```

### Opción B — Node con `serve`
```bash
cd ManualPostgreSQL
npx serve -l 8000
```

### Opción C — abrir directamente
Doble clic en `index.html` (funciona, pero el ruteo por `#hash` y la persistencia
de `localStorage` son más fiables bajo un origen `http://`).

## 📑 Tabla de navegación (#hash)

| #hash                  | Sección                                            | Contenido clave                                                                        |
|------------------------|----------------------------------------------------|----------------------------------------------------------------------------------------|
| `#introduccion`        | Introducción e Instalación                         | Qué es PostgreSQL, historia, instalación en Windows/macOS/Linux, `psql`, pgAdmin.     |
| `#conceptos`           | Conceptos: tablas, tipos, esquemas                 | DDL, tipos nativos (incl. JSONB/arrays/uuid), constraints, secuencias, `IDENTITY`.     |
| `#consultas`           | Consultas: SELECT, JOINs, CTEs, window functions   | JOINs, CTEs recursivas, `OVER()`/`PARTITION BY`, `FILTER`, `UNION`/`INTERSECT`.        |
| `#rendimiento`         | Índices y EXPLAIN/ANALYZE                          | B-tree/Hash/GIN/GiST/BRIN, `EXPLAIN ANALYZE`, `VACUUM`, `pg_stat_statements`.         |
| `#transacciones`       | Transacciones, ACID, MVCC, aislamiento             | `BEGIN/COMMIT/ROLLBACK`, niveles de aislamiento, locks, deadlocks, savepoints.         |
| `#funciones`           | Funciones, PL/pgSQL, procedimientos y triggers     | `CREATE FUNCTION ... LANGUAGE plpgsql`, `CREATE PROCEDURE`, triggers `BEFORE/AFTER`.  |
| `#seguridad-diseno`    | Diseño de BD, roles, grants, RLS, backups          | Normalización, `GRANT`/`REVOKE`, Row Level Security, `pg_dump`/PITR, replicación.      |
| `#consola-quiz`        | Consola SQL simulada + Quiz interactivo           | Consola `postgres=#` con resultados mock; quiz de 8 preguntas con feedback verde/rojo. |

## ⌨️ Atajos de teclado

| Atajo | Acción |
|-------|--------|
| `/` | Enfocar el buscador del sidebar |
| `Esc` | Limpiar la búsqueda / cerrar el sidebar móvil |
| `Alt` + `T` | Alternar tema claro/oscuro |
| `Enter` (en la consola SQL) | Ejecutar la consulta introducida |

## 🧩 Consola SQL simulada — consultas predefinidas

La consola reconoce (vía botones rápidos o escritura manual):

```sql
SELECT * FROM customers;
SELECT * FROM orders;
SELECT c.name, SUM(o.total) AS gastado
  FROM customers c JOIN orders o ON c.id = o.customer_id
 GROUP BY c.name ORDER BY gastado DESC;
SELECT COUNT(*) FROM customers;
```

Comandos meta: `HELP`, `TABLES`, `EXPLAIN <select>`, `CLEAR`.

> ⚠️ Las consultas y resultados son **mockeados en el navegador**; no hay conexión
> a una base de datos real. PostgreSQL se documenta como **contenido** del manual,
> no como infraestructura del sitio.

## 🔐 Privacidad

Manual 100% client-side: sin llamadas a red, sin analítica. El tema y el progreso
se guardan en `localStorage` del propio navegador.

## 🔗 Recursos adicionales

- [Documentación oficial de PostgreSQL](https://www.postgresql.org/docs/)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [pgAdmin (GUI oficial)](https://www.pgadmin.org/)
- [EXPLAIN — PostgreSQL Docs](https://www.postgresql.org/docs/current/sql-explain.html)
- [pg_stat_statements](https://www.postgresql.org/docs/current/pgstatstatements.html)
- [pg_trgm (búsqueda difusa)](https://www.postgresql.org/docs/current/pgtrgm.html)
- [PostGIS (datos geoespaciales)](https://postgis.net/)
- [Comunidad PostgreSQL](https://www.postgresql.org/community/)

## 📄 Licencia

Proyecto bajo licencia MIT. Documentación mantenida por IGD con asistencia de IA.
