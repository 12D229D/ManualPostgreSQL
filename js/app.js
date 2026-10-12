/* ==========================================================================
   Manual y Guía de PostgreSQL — Lógica SPA
   --------------------------------------------------------------------------
   Basado en el patrón de `manual-frontend-html5/js/app.js` con los init*
   estándar (tema, navegación, búsqueda, copia, progreso, menú móvil) más dos
   componentes temáticos: la Consola SQL simulada y el Quiz interactivo.
   100% vanilla, sin dependencias.
   ========================================================================== */

(() => {
    "use strict";

    /* ----------------------- Utilidades ----------------------- */
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    // Tiempo estándar 2026: puntúa cada visita de sección como "leída".
    const THEME_KEY = "pg_guide_theme";
    const PROGRESS_KEY = "pg_read_sections";
    // Número de secciones con completion-box (todas excepto inicio y consola-quiz).
    const TOTAL_SECTIONS = 6;

    /* ============================================================
       1. initTheme — tema claro/oscuro persistente
       ============================================================ */
    function initTheme() {
        const btn = $("#theme-toggle-btn");
        const icon = $("#theme-icon");
        const text = $("#theme-text");
        if (!btn) return;

        // Lee preferencia guardada o la del sistema.
        let saved = "dark";
        try {
            const s = localStorage.getItem(THEME_KEY);
            if (s === "dark" || s === "light") saved = s;
            else saved = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
        } catch (_) { /* noop */ }

        applyTheme(saved);

        btn.addEventListener("click", () => {
            const current = document.documentElement.getAttribute("data-theme") || "dark";
            const next = current === "dark" ? "light" : "dark";
            applyTheme(next);
            try { localStorage.setItem(THEME_KEY, next); } catch (_) { /* noop */ }
        });

        function applyTheme(t) {
            document.documentElement.setAttribute("data-theme", t);
            // El botón indica la ACCIÓN al hacer click (cambiar al otro tema).
            if (icon && text) {
                if (t === "dark") {
                    icon.textContent = "☀️";
                    text.textContent = "Modo Claro";
                } else {
                    icon.textContent = "🌙";
                    text.textContent = "Modo Oscuro";
                }
            }
        }
    }

    /* ============================================================
       2. initNavigation — ruteo SPA por #hash
       ============================================================ */
    function initNavigation() {
        const navItems = $$(".nav-item");
        const sections = $$(".doc-section");
        const crumb = $("#current-crumb");
        if (!navItems.length) return;

        function activateSection(targetId, updateHash = true) {
            const id = targetId || "inicio";
            const section = $(`#${id}`);
            if (!section) {
                activateSection("inicio", updateHash);
                return;
            }

            sections.forEach((s) => s.classList.remove("active"));
            section.classList.add("active");

            navItems.forEach((link) => {
                const isActive = link.dataset.target === id;
                link.classList.toggle("active", isActive);
            });

            // Migas
            const activeLink = $(`.nav-item[data-target="${id}"]`);
            if (crumb && activeLink) crumb.textContent = activeLink.textContent.trim();

            // Limpia búsqueda al cambiar de sección
            const search = $("#search-input");
            if (search) search.value = "";
            restoreNavItems();

            if (updateHash) history.pushState(null, "", "#" + id);

            window.scrollTo({ top: 0, behavior: "smooth" });

            // Marca como leída (auto-progress)
            saveProgress(id);

            // Cierra sidebar en móvil
            $(".sidebar")?.classList.remove("mobile-open");
        }

        navItems.forEach((link) => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const target = link.dataset.target || link.getAttribute("href")?.slice(1);
                activateSection(target);
            });
        });

        window.addEventListener("popstate", () => {
            const hash = (location.hash || "#inicio").slice(1);
            activateSection(hash, false);
        });

        // Carga inicial
        const initial = (location.hash || "#inicio").slice(1);
        activateSection(initial, false);
    }

    /* ============================================================
       3. initSearch — filtro en vivo de nav-items
       ============================================================ */
    function initSearch() {
        const input = $("#search-input");
        if (!input) return;

        let timer = null;
        input.addEventListener("input", (e) => {
            clearTimeout(timer);
            const q = e.target.value.toLowerCase().trim();
            timer = setTimeout(() => filterNav(q), 150);
        });
        input.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                input.value = "";
                restoreNavItems();
            }
        });
    }

    function filterNav(query) {
        const items = $$(".nav-item");
        items.forEach((item) => {
            const text = (item.textContent || "").toLowerCase();
            item.style.display = query && !text.includes(query) ? "none" : "flex";
        });
        // Oculta grupos vacíos
        $$(".nav-group").forEach((g) => {
            const anyVisible = $$(".nav-item", g).some((n) => n.style.display !== "none");
            g.style.display = anyVisible ? "" : "none";
        });
    }

    function restoreNavItems() {
        $$(".nav-item").forEach((n) => (n.style.display = "flex"));
        $$(".nav-group").forEach((g) => (g.style.display = ""));
    }

    /* ============================================================
       4. initCodeCopy — copiar bloques de código + toast
       ============================================================ */
    function initCodeCopy() {
        const buttons = $$(".copy-btn");
        if (!buttons.length) return;

        buttons.forEach((btn) => {
            btn.addEventListener("click", async () => {
                const wrapper = btn.closest(".code-wrapper");
                const codeEl = wrapper?.querySelector("code");
                if (!codeEl) return;
                const text = codeEl.innerText;
                let ok = false;
                try {
                    if (navigator.clipboard && window.isSecureContext) {
                        await navigator.clipboard.writeText(text);
                        ok = true;
                    }
                } catch (_) { /* fallback */ }
                if (!ok) {
                    try {
                        const ta = document.createElement("textarea");
                        ta.value = text;
                        ta.style.position = "fixed";
                        ta.style.opacity = "0";
                        document.body.appendChild(ta);
                        ta.select();
                        ok = document.execCommand("copy");
                        document.body.removeChild(ta);
                    } catch (_) { ok = false; }
                }
                if (ok) {
                    const orig = btn.innerHTML;
                    btn.innerHTML = "✓ ¡Copiado!";
                    btn.style.backgroundColor = "var(--accent-emerald)";
                    btn.style.color = "#fff";
                    btn.style.borderColor = "var(--accent-emerald)";
                    showToast("Código copiado al portapapeles", "ok");
                    setTimeout(() => {
                        btn.innerHTML = orig;
                        btn.style.backgroundColor = "";
                        btn.style.color = "";
                        btn.style.borderColor = "";
                    }, 1800);
                } else {
                    btn.textContent = "❌ Error";
                    showToast("No se pudo copiar", "err");
                }
            });
        });
    }

    /* ============================================================
       5. initProgressTracking — barra de progreso por sección leída
       ============================================================ */
    function getReadSections() {
        try {
            const arr = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "[]");
            return Array.isArray(arr) ? arr : [];
        } catch (_) { return []; }
    }

    function saveProgress(sectionId) {
        // No cuenta "introduccion" ni "consola-quiz"
        if (sectionId === "introduccion" || sectionId === "consola-quiz") return;
        const read = getReadSections();
        if (!read.includes(sectionId)) {
            read.push(sectionId);
            try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(read)); } catch (_) { /* noop */ }
        }
        updateProgressUI(read);
    }

    function updateProgressUI(read) {
        const pct = Math.min(Math.round((read.length / TOTAL_SECTIONS) * 100), 100);
        const val = $("#progress-val");
        const fill = $("#progress-fill");
        if (val) val.textContent = pct + "%";
        if (fill) fill.style.width = pct + "%";
    }

    function initProgressTracking() {
        const read = getReadSections();
        updateProgressUI(read);

        $$(".completion-btn").forEach((btn) => {
            const sid = btn.dataset.section;
            if (read.includes(sid)) {
                setBtnCompleted(btn);
            }
            btn.addEventListener("click", () => {
                const read2 = getReadSections();
                if (!read2.includes(sid)) {
                    read2.push(sid);
                    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(read2)); } catch (_) { /* noop */ }
                }
                setBtnCompleted(btn);
                updateProgressUI(read2);
                showToast("Sección marcada como completada", "ok");
            });
        });
    }

    function setBtnCompleted(btn) {
        btn.classList.add("completed");
        btn.innerHTML = "✓ Sección Leída y Completada";
        btn.disabled = true;
    }

    /* ============================================================
       6. initMobileMenu — toggle del sidebar en móvil
       ============================================================ */
    function initMobileMenu() {
        const btn = $("#mobile-toggle-btn");
        const sidebar = $(".sidebar");
        if (!btn || !sidebar) return;

        btn.addEventListener("click", () => {
            sidebar.classList.toggle("mobile-open");
        });

        // Click fuera del sidebar → cerrar
        document.addEventListener("click", (e) => {
            if (!sidebar.classList.contains("mobile-open")) return;
            if (sidebar.contains(e.target) || btn.contains(e.target)) return;
            sidebar.classList.remove("mobile-open");
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") sidebar.classList.remove("mobile-open");
        });
    }

    /* ============================================================
       7. initSqlConsole — Consola SQL simulada (mock)
       ============================================================
       No se conecta a ninguna base de datos: responde a un set fijo de
       consultas predefinidas con resultados tabulares mockeados.
       ============================================================ */
    function initSqlConsole() {
        const output = $("#sql-output");
        const input = $("#sql-input");
        if (!output || !input) return;

        // "Base de datos" mock in-memory
        const MOCK = {
            customers: [
                { id: 1, name: "Ada Lovelace", email: "ada@calc.com", country: "UK" },
                { id: 2, name: "Edgar Codd", email: "edgar@ibm.com", country: "USA" },
                { id: 3, name: "Grace Hopper", email: "grace@navy.mil", country: "USA" },
                { id: 4, name: "Linus Torvalds", email: "linus@kernel.org", country: "FI" },
            ],
            orders: [
                { id: 101, customer_id: 1, total: 150.00, status: "paid" },
                { id: 102, customer_id: 2, total: 990.50, status: "pending" },
                { id: 103, customer_id: 1, total: 75.25, status: "paid" },
                { id: 104, customer_id: 3, total: 2400.00, status: "shipped" },
                { id: 105, customer_id: 4, total: 320.00, status: "paid" },
            ],
        };

        const QUERIES = {
            "select * from customers;": {
                meta: "4 filas",
                columns: ["id", "name", "email", "country"],
                rows: MOCK.customers.map((c) => [c.id, c.name, c.email, c.country]),
            },
            "select * from orders;": {
                meta: "5 filas",
                columns: ["id", "customer_id", "total", "status"],
                rows: MOCK.orders.map((o) => [o.id, o.customer_id, o.total.toFixed(2), o.status]),
            },
            "select c.name, sum(o.total) as gastado from customers c join orders o on c.id = o.customer_id group by c.name order by gastado desc;": {
                meta: "4 filas",
                columns: ["name", "gastado"],
                rows: [
                    ["Grace Hopper", "2400.00"],
                    ["Edgar Codd", "990.50"],
                    ["Linus Torvalds", "320.00"],
                    ["Ada Lovelace", "225.25"],
                ],
            },
            "select count(*) from customers;": {
                meta: "1 fila",
                columns: ["count"],
                rows: [["4"]],
            },
            "select count(*) from orders;": {
                meta: "1 fila",
                columns: ["count"],
                rows: [["5"]],
            },
        };

        function appendLine(html, cls = "") {
            const div = document.createElement("div");
            div.className = "sql-line" + (cls ? " " + cls : "");
            div.innerHTML = html;
            output.appendChild(div);
            output.scrollTop = output.scrollHeight;
        }

        function renderResult(res) {
            // meta
            const meta = document.createElement("div");
            meta.className = "query-result-meta";
            meta.textContent = `(${res.meta})`;
            output.appendChild(meta);

            // table
            const wrap = document.createElement("div");
            wrap.className = "query-result";
            const table = document.createElement("table");
            const thead = document.createElement("thead");
            const trh = document.createElement("tr");
            res.columns.forEach((c) => {
                const th = document.createElement("th");
                th.textContent = c;
                trh.appendChild(th);
            });
            thead.appendChild(trh);
            table.appendChild(thead);

            const tbody = document.createElement("tbody");
            res.rows.forEach((r) => {
                const tr = document.createElement("tr");
                r.forEach((cell) => {
                    const td = document.createElement("td");
                    td.textContent = String(cell);
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            wrap.appendChild(table);
            output.appendChild(wrap);
            output.scrollTop = output.scrollHeight;
        }

        function highlightSql(sql) {
            // Resaltado muy simple de palabras clave para el eco del prompt.
            const keywords = /\b(SELECT|FROM|WHERE|JOIN|ON|GROUP BY|ORDER BY|DESC|ASC|LIMIT|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|INDEX|EXPLAIN|ANALYZE|COUNT|SUM|AS)\b/gi;
            return sql
                .replace(/&/g, "&")
                .replace(/</g, "<")
                .replace(/>/g, ">")
                .replace(keywords, '<span class="sql-keyword">$1</span>');
        }

        function handle(inputText) {
            const cmd = inputText.trim();
            if (!cmd) return;

            // Echo del prompt
            appendLine(`<span class="sql-prompt">postgres=#</span> ${highlightSql(cmd)}`);

            const lower = cmd.toLowerCase().replace(/;+\s*$/, "") + ";";

            // Comandos meta
            if (/^help;?$/i.test(cmd)) {
                appendLine("Comandos disponibles:", "sql-info");
                appendLine("  SELECT ...      — consulta mock de customers / orders.", "sql-info");
                appendLine("  EXPLAIN SELECT ... — muestra un plan EXPLAIN mock.", "sql-info");
                appendLine("  TABLES           — lista tablas disponibles.", "sql-info");
                appendLine("  HELP             — esta ayuda.", "sql-info");
                appendLine("  CLEAR            — limpia la consola.", "sql-info");
                appendLine("Prueba también: <code>SELECT c.name, SUM(o.total) AS gastado FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.name ORDER BY gastado DESC;</code>", "sql-info");
                return;
            }
            if (/^clear;?$/i.test(cmd)) {
                output.innerHTML = '<div class="sql-line sql-info">-- Consola limpia.</div>';
                return;
            }
            if (/^tables;?$/i.test(cmd)) {
                const cols = ["schema", "name", "type", "owner"];
                const rows = [
                    ["public", "customers", "table", "postgres"],
                    ["public", "orders", "table", "postgres"],
                ];
                renderResult({ meta: "2 filas", columns: cols, rows });
                return;
            }
            if (/^explain\s+/i.test(cmd)) {
                // Plan EXPLAIN mock
                appendLine('<div class="query-result-meta">Plan de ejecución mock</div>');
                const plan = document.createElement("div");
                plan.className = "explain-plan";
                plan.innerHTML = `
                    <div class="explain-node"><span class="node-type">Sort</span><span class="node-detail">Sort Key: gastado DESC</span><span class="node-cost">cost=5.20..5.30 rows=4</span></div>
                    <div class="explain-children">
                        <div class="explain-node"><span class="node-type">HashAggregate</span><span class="node-detail">Group Key: c.name</span><span class="node-cost">cost=4.10..4.20 rows=4</span></div>
                        <div class="explain-children">
                            <div class="explain-node"><span class="node-type">Hash Join</span><span class="node-detail">Hash Cond: (o.customer_id = c.id)</span><span class="node-cost">cost=2.50..3.80 rows=5</span></div>
                            <div class="explain-children">
                                <div class="explain-node"><span class="node-type">Seq Scan</span><span class="node-detail">on orders o</span><span class="node-cost">cost=0.00..1.50 rows=5</span></div>
                                <div class="explain-node"><span class="node-type">Hash</span><span class="node-detail">on customers c</span><span class="node-cost">cost=1.00..1.00 rows=4</span></div>
                            </div>
                        </div>
                    </div>`;
                output.appendChild(plan);
                output.scrollTop = output.scrollHeight;
                return;
            }

            // SELECT — lookup en tabla mock
            if (/^select/i.test(lower)) {
                const res = QUERIES[lower];
                if (res) {
                    renderResult(res);
                } else {
                    // Intento de SELECT no reconocido: muestra sugerencia + fallback de customers.
                    appendLine("ERROR: consulta no reconocida en la consola simulada.", "sql-err");
                    appendLine("Prueba con una de las consultas predefinidas (HELP para verlas).", "sql-info");
                }
                return;
            }

            // Comando no soportado
            appendLine(`ERROR:  syntax error at or near "${cmd.slice(0, 12)}"`, "sql-err");
            appendLine("LIMIT: la consola es una simulación. Prueba SELECT / EXPLAIN / TABLES / HELP / CLEAR.", "sql-info");
        }

        // Submit por Enter
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                handle(input.value);
                input.value = "";
            }
        });

        // Botones rápidos
        $$(".sql-quick-btn").forEach((b) => {
            b.addEventListener("click", () => {
                const sql = b.dataset.sql;
                input.value = sql;
                input.focus();
                // Auto-ejecuta para mejor UX
                handle(sql);
                input.value = "";
            });
        });
    }

    /* ============================================================
       8. initQuiz — quiz interactivo con feedback y puntuación
       ============================================================ */
    function initQuiz() {
        const questions = $$(".quiz-question");
        const scoreEl = $("#quiz-score");
        const resultCard = $("#quiz-result");
        const resultScore = $("#quiz-final-score");
        const resultMsg = $("#quiz-final-msg");
        const resetBtn = $("#quiz-reset-btn");
        if (!questions.length) return;

        let answered = 0;
        let correctCount = 0;

        function updateScore() {
            if (scoreEl) scoreEl.textContent = `${correctCount} / ${questions.length}`;
        }

        function maybeShowResult() {
            if (answered < questions.length) return;
            const pct = (correctCount / questions.length) * 100;
            if (resultScore) resultScore.textContent = `${correctCount} / ${questions.length}`;
            if (resultMsg) {
                let msg = "";
                if (pct === 100) msg = "¡Perfecto! Dominas PostgreSQL de punta a punta. 🏆";
                else if (pct >= 75) msg = "Muy bien. Tienes un dominio sólido. 👏";
                else if (pct >= 50) msg = "Vas por buen camino, repasa los temas marcados en rojo. 📚";
                else msg = "Conviene repasar el manual antes de volver a intentarlo. 💪";
                resultMsg.textContent = msg;
            }
            resultCard?.classList.add("show");
            resultCard?.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        function reset() {
            answered = 0;
            correctCount = 0;
            updateScore();
            resultCard?.classList.remove("show");
            questions.forEach((q) => {
                const fb = q.querySelector(".quiz-feedback");
                if (fb) {
                    fb.classList.remove("show", "correct", "incorrect");
                    fb.textContent = "";
                }
                q.querySelectorAll(".quiz-option").forEach((opt) => {
                    opt.classList.remove("correct", "incorrect");
                    opt.disabled = false;
                });
            });
            window.scrollTo({ top: 0, behavior: "smooth" });
        }

        questions.forEach((q) => {
            const correct = (q.dataset.correct || "").toLowerCase();
            const options = q.querySelectorAll(".quiz-option");
            const fb = q.querySelector(".quiz-feedback");
            const explanation = q.dataset.explanation || "";

            options.forEach((opt) => {
                opt.addEventListener("click", () => {
                    // Ignora si ya respondió esta pregunta
                    if (q.querySelectorAll(".quiz-option:disabled").length) return;

                    const ans = (opt.dataset.answer || "").toLowerCase();
                    const isCorrect = ans === correct;

                    // Marca todas las opciones como disabled y revela la correcta
                    options.forEach((o) => {
                        o.disabled = true;
                        if ((o.dataset.answer || "").toLowerCase() === correct) {
                            o.classList.add("correct");
                        }
                    });
                    if (!isCorrect) opt.classList.add("incorrect");

                    // Feedback
                    if (fb) {
                        fb.classList.add("show", isCorrect ? "correct" : "incorrect");
                        const ansLabel = ans.toUpperCase();
                        const corrLabel = correct.toUpperCase();
                        fb.innerHTML = isCorrect
                            ? `<strong>✓ Correcto.</strong> ${explanation || "Bien hecho."}`
                            : `<strong>✗ Incorrecto.</strong> Respondiste ${ansLabel}; la respuesta correcta es ${corrLabel}. ${explanation || ""}`;
                    }

                    answered++;
                    if (isCorrect) correctCount++;
                    updateScore();
                    maybeShowResult();
                });
            });
        });

        updateScore();
        resetBtn?.addEventListener("click", reset);
    }

    /* ============================================================
       Toast helper (usado por copia, progreso, etc.)
       ============================================================ */
    let toastTimer = null;
    function showToast(message, kind = "ok") {
        const toast = $("#toast");
        const msg = $("#toast-msg");
        if (!toast || !msg) return;
        msg.textContent = message;
        toast.classList.remove("ok", "err");
        toast.classList.add(kind === "err" ? "err" : "ok");
        toast.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
    }

    /* ============================================================
       Atajos de teclado globales
       ============================================================ */
    function initShortcuts() {
        document.addEventListener("keydown", (e) => {
            // "/" enfoca el buscador (si no estamos ya en un input)
            if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
                e.preventDefault();
                $("#search-input")?.focus();
            }
            // "Alt+T" alterna tema
            if (e.altKey && (e.key === "t" || e.key === "T")) {
                e.preventDefault();
                $("#theme-toggle-btn")?.click();
            }
        });
    }

    /* ============================================================
       Init
       ============================================================ */
    document.addEventListener("DOMContentLoaded", () => {
        initTheme();
        initNavigation();
        initSearch();
        initCodeCopy();
        initProgressTracking();
        initSqlConsole();
        initQuiz();
        initMobileMenu();
        initShortcuts();
    });
})();
