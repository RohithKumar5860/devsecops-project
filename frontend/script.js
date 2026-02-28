/**
 * DevSecOps Control Platform — script.js v3.1
 * ─────────────────────────────────────────────
 * All 15 features:
 *  1. Sidebar + scroll-spy + breadcrumb
 *  2. Sticky status ribbon (auto-updates)
 *  3. Risk score SVG (calculated from API, correct color scale)
 *  4. Pipeline timeline (clickable stages → modal)
 *  5. Activity log (animated, clear button, toast)
 *  6. Endpoint search filter (live, count badge)
 *  7. Component filter buttons (all/active/configured/ready)
 *  8. Modal (component detail + pipeline stage detail)
 *  9. Toast system (top-right, typed, auto-dismiss)
 * 10. Live clock + uptime counter
 * 11. Threat level indicator (dot + bars + badge)
 * 12. Compliance panel (static, rendered in HTML)
 * 13. Copy-to-clipboard (Clipboard API + feedback)
 * 14. Responsive layout (CSS handles breakpoints)
 * 15. Accessibility (aria, keyboard nav, Esc close)
 */

'use strict';

/* ═══════════════════════════════════════════════
   CONFIG
═══════════════════════════════════════════════ */
const API_ORIGIN = window.location.origin;
const REFRESH_MS = 30_000;

/* ═══════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════ */
let _bootTime = Date.now();
let _refreshTimer = null;
let _activeFilter = 'all';
let _allComponents = [];
let _allEndpoints = [];

/* ═══════════════════════════════════════════════
   COMPONENT METADATA  (icons + modal details)
═══════════════════════════════════════════════ */
const COMP_META = {
    'CI/CD Pipeline': {
        icon: '⚙️',
        stats: [{ value: '4', label: 'Pipelines' }, { value: '100%', label: 'Pass Rate' }, { value: '~2 min', label: 'Avg Build' }],
        integrations: ['GitHub Actions – push/PR triggers', 'Docker Hub – image push on success', 'Kubernetes – rolling deploy on main', 'SonarCloud – SAST quality gate', 'pip-audit – dependency CVE gate'],
    },
    'Docker': {
        icon: '🐳',
        stats: [{ value: 'Multi', label: 'Stage Build' }, { value: '0', label: 'CVEs Found' }, { value: 'Alpine', label: 'Base Image' }],
        integrations: ['Multi-stage build – minimal final image', 'Non-root user – security best practice', 'Trivy scan – CVE check on every push', 'GitHub Actions – automated image push', 'Kubernetes – imagePullPolicy Always'],
    },
    'Trivy Scanner': {
        icon: '🔍',
        stats: [{ value: '0', label: 'CVEs' }, { value: 'HIGH+', label: 'Threshold' }, { value: 'Pass', label: 'Gate Status' }],
        integrations: ['Container image scanning on every push', 'CI gate – blocks on HIGH/CRITICAL CVEs', 'SARIF report → GitHub Security tab', 'Scheduled nightly scans via cron', 'Security Scan Pipeline integration'],
    },
    'SonarCloud': {
        icon: '☁️',
        stats: [{ value: 'A', label: 'Rating' }, { value: '0', label: 'Bugs' }, { value: '0', label: 'Vulnerabilities' }],
        integrations: ['Static analysis on every PR', 'Quality gate – non-blocking (configured)', 'Code coverage tracking', 'Security hotspot detection', 'Integration with main CI/CD pipeline'],
    },
    'Kubernetes': {
        icon: '☸️',
        stats: [{ value: '3', label: 'Environments' }, { value: 'HPA', label: 'Auto-scale' }, { value: 'Kustomize', label: 'Config' }],
        integrations: ['Kustomize overlays – dev / staging / prod', 'HorizontalPodAutoscaler – CPU-based scaling', 'Non-root security context on all pods', 'APP_SECRET_KEY via Kubernetes Secret', 'Rolling deployments – zero downtime'],
    },
};

/* ═══════════════════════════════════════════════
   PIPELINE STAGE METADATA
═══════════════════════════════════════════════ */
const PIPELINE_STAGES = {
    'Main CI/CD Pipeline': [
        { name: 'test', status: 'passed', desc: 'Runs pytest with 6 unit tests. Coverage enforced. Fails fast on any test failure.' },
        { name: 'sonar', status: 'passed', desc: 'SonarCloud static analysis. Non-blocking quality gate for code quality and security.' },
        { name: 'build', status: 'passed', desc: 'Docker multi-stage build. Tags image with commit SHA and pushes to Docker Hub.' },
        { name: 'deploy', status: 'passed', desc: 'kubectl apply via Kustomize. Rolling update to dev/staging Kubernetes cluster.' },
    ],
    'PR Check Pipeline': [
        { name: 'lint', status: 'passed', desc: 'flake8 linting. Enforces PEP8 and custom rules. Blocks PR on lint failures.' },
        { name: 'test', status: 'passed', desc: 'Fast test subset. Runs all unit tests. Provides quick feedback on PRs.' },
    ],
    'Security Scan Pipeline': [
        { name: 'trivy-scan', status: 'passed', desc: 'Trivy container scan for CVEs. Fails on HIGH or CRITICAL vulnerabilities.' },
        { name: 'sonar', status: 'passed', desc: 'SonarCloud full analysis run. Includes security hotspot review.' },
    ],
    'Release Pipeline': [
        { name: 'build-push', status: 'passed', desc: 'Builds Docker image with version tag. Pushes to Docker Hub with semver tag.' },
        { name: 'deploy', status: 'passed', desc: 'Deploys to production Kubernetes cluster. Requires manual approval gate.' },
    ],
};

/* ═══════════════════════════════════════════════
   UTILITY
═══════════════════════════════════════════════ */
function esc(s) {
    return String(s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function $$(id) { return document.getElementById(id); }
function setText(id, v) { const e = $$(id); if (e) e.textContent = v; }
function setHTML(id, v) { const e = $$(id); if (e) e.innerHTML = v; }

/* ═══════════════════════════════════════════════
   TOAST SYSTEM  (top-right)
═══════════════════════════════════════════════ */
function toast(msg, type = 'info', ms = 3500) {
    const con = $$('toast-container');
    if (!con) return;
    const t = document.createElement('div');
    t.className = `toast toast--${type}`;
    t.innerHTML = `
    <div class="toast-dot" aria-hidden="true"></div>
    <span class="toast-msg">${esc(msg)}</span>
    <button class="toast-close" aria-label="Dismiss notification">✕</button>`;
    const dismiss = () => {
        t.classList.add('out');
        setTimeout(() => t.remove(), 280);
    };
    t.querySelector('.toast-close').addEventListener('click', dismiss);
    con.appendChild(t);
    setTimeout(dismiss, ms);
}

/* ═══════════════════════════════════════════════
   ACTIVITY LOG
═══════════════════════════════════════════════ */
function log(msg, type = 'info') {
    const list = $$('activity-list');
    if (!list) return;
    const empty = list.querySelector('.act-empty');
    if (empty) empty.remove();

    const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `
    <div class="act-dot act-dot--${type}" aria-hidden="true"></div>
    <div class="act-body">
      <div class="act-msg">${esc(msg)}</div>
      <time class="act-time">${esc(ts)}</time>
    </div>`;
    list.insertBefore(item, list.firstChild);
    const items = list.querySelectorAll('.activity-item');
    if (items.length > 50) items[items.length - 1].remove();
}

window.clearActivityLog = function () {
    const list = $$('activity-list');
    if (list) list.innerHTML = '<div class="act-empty">Log cleared.</div>';
    toast('Activity log cleared', 'info');
};

/* ═══════════════════════════════════════════════
   LIVE CLOCK + UPTIME
═══════════════════════════════════════════════ */
function startClock() {
    function tick() {
        const now = new Date();
        const pad = n => String(n).padStart(2, '0');
        setText('live-clock', `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`);

        const sec = Math.floor((Date.now() - _bootTime) / 1000);
        const hh = Math.floor(sec / 3600);
        const mm = Math.floor((sec % 3600) / 60);
        const ss = sec % 60;
        setText('uptime-counter', `${pad(hh)}:${pad(mm)}:${pad(ss)}`);
    }
    tick();
    setInterval(tick, 1000);
}

/* ═══════════════════════════════════════════════
   SIDEBAR — toggle + scroll-spy
═══════════════════════════════════════════════ */
function initSidebar() {
    const sidebar = $$('sidebar');
    const mainWrap = $$('main-wrap');
    const hamburger = $$('hamburger');
    if (!sidebar || !hamburger) return;

    const isMobile = () => window.innerWidth <= 860;

    hamburger.addEventListener('click', () => {
        if (isMobile()) {
            const open = sidebar.classList.toggle('mobile-open');
            hamburger.setAttribute('aria-expanded', String(open));
        } else {
            const collapsed = sidebar.classList.toggle('collapsed');
            mainWrap.classList.toggle('expanded', collapsed);
            hamburger.setAttribute('aria-expanded', String(!collapsed));
        }
    });

    // Smooth scroll + breadcrumb on link click
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const target = $$(link.dataset.section);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (isMobile()) sidebar.classList.remove('mobile-open');
        });
    });

    // Scroll-spy with IntersectionObserver
    const sections = document.querySelectorAll('.section[id]');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const id = entry.target.id;
            document.querySelectorAll('.sidebar-link').forEach(l => {
                const active = l.dataset.section === id;
                l.classList.toggle('active', active);
                if (active) {
                    const label = l.querySelector('span')?.textContent;
                    if (label) setText('breadcrumb-leaf', label);
                }
            });
        });
    }, { threshold: 0.3, rootMargin: `-${56 + 38}px 0px 0px 0px` });
    sections.forEach(s => observer.observe(s));
}

/* ═══════════════════════════════════════════════
   MODAL — reusable
═══════════════════════════════════════════════ */
let _modalOpen = false;

function openModal({ icon, title, subtitle, stats = [], description = '', integrations = [] }) {
    const overlay = $$('modal-overlay');
    if (!overlay) return;
    setText('modal-icon', icon || '🔧');
    setText('modal-title', title);
    setText('modal-subtitle', subtitle || '');
    setText('modal-description', description);

    setHTML('modal-stats', stats.map(s => `
    <div class="modal-stat">
      <div class="modal-stat-val">${esc(s.value)}</div>
      <div class="modal-stat-lbl">${esc(s.label)}</div>
    </div>`).join(''));

    setHTML('modal-integrations', integrations.map(
        i => `<li>${esc(i)}</li>`
    ).join(''));

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    _modalOpen = true;

    // Focus the close button
    setTimeout(() => $$('modal-close')?.focus(), 60);
}

function closeModal() {
    const overlay = $$('modal-overlay');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
    _modalOpen = false;
}

function initModal() {
    const overlay = $$('modal-overlay');
    const closeBtn = $$('modal-close');
    if (!overlay) return;
    closeBtn?.addEventListener('click', closeModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && _modalOpen) closeModal(); });
}

/* ═══════════════════════════════════════════════
   RISK SCORE WIDGET
   Score 0–100. Higher = MORE risk (danger meter).
    0–30  → Low Risk    (green)
   31–70  → Medium Risk (orange)
   71–100 → High Risk   (red)
═══════════════════════════════════════════════ */
function calcRiskScore({ vulns = 0, failedTests = 0, ciRunning = true } = {}) {
    // Start at 0 (safe). Add points for bad events → higher score = more danger.
    let score = 0;
    score += vulns * 10; // each vulnerability adds 10 pts
    score += failedTests * 5; // each failing test adds 5 pts
    if (!ciRunning) score += 15; // CI down adds 15 pts
    return Math.max(0, Math.min(100, score));
}

function renderRiskScore(score) {
    const arc = $$('risk-arc');
    const num = $$('risk-num');

    // ── Geometry (matches SVG r="48" in index.html) ───────
    // circumference = 2 * π * radius
    // No inverted math. Canonical formula only.
    const radius = 48;
    const circumference = 2 * Math.PI * radius; // ≈ 301.593

    // ── Color scale ───────────────────────────────────────
    //  0–30  → green  (Low Risk)
    // 31–70  → orange (Medium Risk)
    // 71–100 → red    (High Risk)
    const colour = score <= 30 ? 'var(--success)'
        : score <= 70 ? 'var(--warning)'
            : 'var(--danger)';

    // ── Arc ───────────────────────────────────────────────
    // progress  = score / 100
    // dashoffset = circumference * (1 - progress)
    //   score=0   → offset = circumference → empty ring
    //   score=50  → offset = circumference/2 → half ring
    //   score=100 → offset = 0             → full ring
    if (arc) {
        const progress = score / 100;
        const dashoffset = circumference * (1 - progress);

        // Reset to empty instantly (no transition) so animation always starts from 0
        arc.style.transition = 'none';
        arc.style.strokeDasharray = String(circumference);
        arc.style.strokeDashoffset = String(circumference);
        arc.style.stroke = colour;

        // Force reflow so browser commits the empty state before transition fires
        void arc.getBoundingClientRect();

        // Re-enable CSS transition, then apply target offset in next frame
        arc.style.transition = '';
        requestAnimationFrame(() => {
            arc.style.strokeDashoffset = String(dashoffset);
        });
    }

    // ── Number: count-up 0 → score over 900ms ─────────────
    if (num) {
        num.style.color = colour;
        const duration = 900;
        const startTime = performance.now();
        function countUp(now) {
            const elapsed = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - elapsed, 3); // ease-out cubic
            num.textContent = Math.round(eased * score);
            if (elapsed < 1) requestAnimationFrame(countUp);
        }
        requestAnimationFrame(countUp);
    }
}

/* ═══════════════════════════════════════════════
   THREAT LEVEL INDICATOR
═══════════════════════════════════════════════ */
function renderThreatLevel(vulnCount = 0) {
    const dot = $$('threat-dot');
    const label = $$('threat-label');
    const badge = $$('threat-overall-badge');

    let level, dotCls, badgeCls;
    if (vulnCount === 0) { level = 'Minimal'; dotCls = ''; badgeCls = 'badge--success'; }
    else if (vulnCount <= 2) { level = 'Low'; dotCls = 'warn'; badgeCls = 'badge--warning'; }
    else { level = 'High'; dotCls = 'high'; badgeCls = 'badge--danger'; }

    if (dot) { dot.className = `threat-dot ${dotCls}`; }
    if (label) { label.textContent = `${level} Risk`; }
    if (badge) { badge.textContent = level.toUpperCase(); badge.className = `badge ${badgeCls}`; }
}

/* ═══════════════════════════════════════════════
   STATUS RIBBON
═══════════════════════════════════════════════ */
function updateRibbon({ metadata, status }) {
    const healthy = status.health === 'healthy' && status.application === 'running';
    const riEl = $$('ribbon-health');
    setText('ribbon-health-text', `Health: ${healthy ? '✓ Healthy' : '✗ Degraded'}`);
    if (riEl) riEl.className = `ribbon-item ribbon-health${healthy ? '' : ' unhealthy'}`;
    setText('ribbon-version-text', `v${metadata.version || '?'}`);

    const tr = status.test_results || {};
    setText('ribbon-tests-text', `Tests: ${tr.passed || 0}/${tr.total || 0} passing`);

    const now = new Date();
    setText('ribbon-refresh-text', `Refreshed: ${now.toLocaleTimeString()}`);
}

/* ═══════════════════════════════════════════════
   ENVIRONMENT BADGE
═══════════════════════════════════════════════ */
function updateEnvBadge(env = '') {
    const badge = $$('env-badge');
    if (!badge) return;
    const e = env.toLowerCase();
    badge.textContent = e.charAt(0).toUpperCase() + e.slice(1);
    badge.className = `env-badge env-${e}`;
}

/* ═══════════════════════════════════════════════
   STATUS UPDATE
═══════════════════════════════════════════════ */
function updateStatus(status) {
    const ok = status.application === 'running' && status.health === 'healthy';

    // Sidebar health dot
    const dot = $$('sb-health-dot');
    if (dot) dot.className = `sidebar-health-dot ${ok ? 'healthy' : 'error'}`;
    setText('sb-health-label', ok ? 'Operational' : 'Degraded');

    // Status message
    const msg = $$('status-message');
    if (msg) {
        msg.textContent = status.message || (ok ? 'All systems operational' : 'System degraded');
        msg.className = `status-msg ${ok ? 'ok' : 'error'}`;
    }

    // KPI — health
    setText('kpi-health-val', ok ? '100%' : '—');
    setText('kpi-health-badge', ok ? 'Operational' : 'Degraded');
    const hBadge = $$('kpi-health-badge');
    if (hBadge) hBadge.className = `badge ${ok ? 'badge--success' : 'badge--danger'}`;

    // KPI — tests
    const tr = status.test_results || {};
    const passed = tr.passed || 0;
    const total = tr.total || 0;
    const failed = tr.failed || 0;
    setText('kpi-tests-val', `${passed}/${total}`);
    const tBadge = $$('kpi-tests-badge');
    if (tBadge) {
        tBadge.textContent = failed === 0 ? 'All Passed' : `${failed} Failed`;
        tBadge.className = `badge ${failed === 0 ? 'badge--success' : 'badge--danger'}`;
    }

    return { ok, failed, total };
}

/* ═══════════════════════════════════════════════
   RENDER COMPONENTS
═══════════════════════════════════════════════ */
const STATUS_BADGE_MAP = {
    active: { cls: 'cmp-active', label: 'Active' },
    ready: { cls: 'cmp-ready', label: 'Ready' },
    configured: { cls: 'cmp-configured', label: 'Configured' },
    inactive: { cls: 'cmp-inactive', label: 'Inactive' },
};

function renderComponents(components) {
    const list = $$('components-list');
    if (!list) return;

    const shown = _activeFilter === 'all'
        ? components
        : components.filter(c => c.status === _activeFilter);

    if (shown.length === 0) {
        list.innerHTML = `<p style="color:var(--t3);font-size:.8rem;padding:.5rem">No components match this filter.</p>`;
        return;
    }

    list.innerHTML = shown.map(comp => {
        const meta = COMP_META[comp.name] || {};
        const badge = STATUS_BADGE_MAP[comp.status] || { cls: 'cmp-default', label: comp.status };
        return `
      <div class="comp-card" tabindex="0" role="button"
           data-name="${esc(comp.name)}" data-status="${esc(comp.status)}"
           aria-label="View details for ${esc(comp.name)}">
        <div class="comp-top">
          <div class="comp-emoji" aria-hidden="true">${meta.icon || '🔧'}</div>
          <div>
            <div class="comp-name">${esc(comp.name)}</div>
            <div class="comp-badge-wrap">
              <span class="badge ${badge.cls}">${badge.label}</span>
            </div>
          </div>
        </div>
        <p class="comp-desc">${esc(comp.description)}</p>
        <div class="comp-footer">
          <span class="comp-detail">View details →</span>
          <span class="comp-hint">Click to inspect</span>
        </div>
      </div>`;
    }).join('');

    list.querySelectorAll('.comp-card').forEach(card => {
        const comp = components.find(c => c.name === card.dataset.name);
        if (!comp) return;
        const open = () => {
            const meta = COMP_META[comp.name] || {};
            openModal({
                icon: meta.icon || '🔧',
                title: comp.name,
                subtitle: `Status: ${comp.status}`,
                stats: meta.stats || [{ value: comp.status, label: 'Status' }],
                description: comp.description,
                integrations: meta.integrations || [],
            });
            log(`Viewed component: ${comp.name}`, 'info');
        };
        card.addEventListener('click', open);
        card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
}

/* ═══════════════════════════════════════════════
   COMPONENT FILTER BUTTONS
═══════════════════════════════════════════════ */
function initFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            _activeFilter = btn.dataset.filter;
            renderComponents(_allComponents);
            toast(`Filter: ${btn.textContent}`, 'info', 1800);
        });
    });
}

/* ═══════════════════════════════════════════════
   RENDER ENDPOINTS + SEARCH FILTER
═══════════════════════════════════════════════ */
function renderEndpoints(endpoints) {
    const list = $$('ep-list');
    if (!list) return;
    _allEndpoints = endpoints;

    list.innerHTML = endpoints.map(ep => {
        const url = `${API_ORIGIN}${ep.path}`;
        return `
      <li class="ep-item" data-path="${esc(ep.path)}">
        <span class="ep-method">${esc(ep.method)}</span>
        <a class="ep-path" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(ep.path)}</a>
        <span class="ep-desc">${esc(ep.description)}</span>
        <button class="ep-copy" data-url="${esc(url)}" aria-label="Copy URL for ${esc(ep.path)}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copy
        </button>
      </li>`;
    }).join('');

    // Wire copy buttons
    list.querySelectorAll('.ep-copy').forEach(btn => {
        btn.addEventListener('click', () => copyEndpoint(btn.dataset.url, btn));
    });

    updateEpCount();
    initEpSearch();
}

function updateEpCount() {
    const visible = document.querySelectorAll('.ep-item:not(.hidden)').length;
    const total = _allEndpoints.length;
    setText('ep-count', `${visible}/${total}`);
}

function initEpSearch() {
    const input = $$('ep-search');
    if (!input) return;
    // Avoid double-binding on re-render
    input.replaceWith(input.cloneNode(true));
    const fresh = $$('ep-search');
    if (!fresh) return;
    fresh.addEventListener('input', () => {
        const q = fresh.value.toLowerCase().trim();
        document.querySelectorAll('.ep-item').forEach(row => {
            row.classList.toggle('hidden', q !== '' && !row.textContent.toLowerCase().includes(q));
        });
        updateEpCount();
    });
}

/* ═══════════════════════════════════════════════
   COPY TO CLIPBOARD
═══════════════════════════════════════════════ */
async function copyEndpoint(url, btn) {
    try {
        await navigator.clipboard.writeText(url);
        const orig = btn.innerHTML;
        btn.classList.add('copied');
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
        toast(`Copied: ${url}`, 'success', 2200);
        log(`Endpoint URL copied: ${url}`, 'success');
        setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('copied'); }, 2000);
    } catch {
        toast('Copy failed — please copy manually', 'error');
    }
}
window.copyEndpoint = copyEndpoint;

/* ═══════════════════════════════════════════════
   RENDER PIPELINES
═══════════════════════════════════════════════ */
function renderPipelines(pipelines) {
    const list = $$('pipeline-list');
    if (!list || !Array.isArray(pipelines)) return;

    setText('pipeline-count-badge', `${pipelines.length} Pipelines`);
    setText('kpi-pipelines-val', pipelines.length);
    setText('kpi-pipelines-badge', `${pipelines.length} defined`);

    const STATUS_ICON = { passed: '✓', failed: '✗', running: '…', queued: '⏳', skipped: '–' };

    list.innerHTML = pipelines.map(pl => {
        const stages = PIPELINE_STAGES[pl.name] || (pl.jobs || []).map(j => ({ name: j, status: 'passed', desc: '' }));

        const timelineHtml = stages.map((stage, i) => {
            const icon = STATUS_ICON[stage.status] || '–';
            const isLast = i === stages.length - 1;
            return `
        <div class="tl-stage">
          <div class="tl-node">
            <button class="tl-dot ${stage.status}"
                    data-pipeline="${esc(pl.name)}"
                    data-stage="${esc(stage.name)}"
                    title="${esc(stage.name)} — ${esc(stage.status)}"
                    aria-label="Stage ${esc(stage.name)}: ${esc(stage.status)}. Click for details."
            >${icon}</button>
            <div class="tl-label">${esc(stage.name)}</div>
          </div>
          ${!isLast ? `<div class="tl-line ${stage.status === 'passed' ? 'passed' : ''}"></div>` : ''}
        </div>`;
        }).join('');

        const triggersHtml = (pl.triggers || []).map(t => `<span class="trigger-chip">${esc(t)}</span>`).join('');

        return `
      <article class="pipeline-card" aria-label="${esc(pl.name)} pipeline">
        <div class="pipeline-top">
          <div>
            <div class="pipeline-name">${esc(pl.name)}</div>
            <div class="pipeline-file">${esc(pl.file)}</div>
            <div class="pipeline-desc">${esc(pl.description)}</div>
          </div>
          <span class="badge badge--success">Passing</span>
        </div>
        <div class="timeline" role="list" aria-label="Pipeline stages">${timelineHtml}</div>
        <div class="pipeline-triggers" aria-label="Trigger conditions">${triggersHtml}</div>
      </article>`;
    }).join('');

    // Wire stage-dot clicks → modal
    list.querySelectorAll('.tl-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            const plName = dot.dataset.pipeline;
            const stageName = dot.dataset.stage;
            const pl = pipelines.find(p => p.name === plName);
            const stages = PIPELINE_STAGES[plName] || [];
            const stage = stages.find(s => s.name === stageName);
            if (!pl || !stage) return;

            openModal({
                icon: '⚙️',
                title: `${esc(stage.name)}`,
                subtitle: `Pipeline: ${plName} · Status: ${stage.status}`,
                stats: [
                    { value: stage.status.charAt(0).toUpperCase() + stage.status.slice(1), label: 'Status' },
                    { value: plName.split(' ')[0], label: 'Pipeline' },
                    { value: `Step ${stages.indexOf(stage) + 1}/${stages.length}`, label: 'Position' },
                ],
                description: stage.desc || 'No additional details available for this stage.',
                integrations: [`Part of: ${plName}`, `File: ${pl.file}`, ...(pl.triggers || []).map(t => `Trigger: ${t}`)],
            });
            log(`Inspected pipeline stage: ${stageName} (${plName})`, 'info');
        });
    });
}

/* ═══════════════════════════════════════════════
   FETCH ALL DATA
═══════════════════════════════════════════════ */
async function fetchAll() {
    const [projRes, pipeRes, healthRes] = await Promise.all([
        fetch(`${API_ORIGIN}/api/project`, { cache: 'no-store' }),
        fetch(`${API_ORIGIN}/api/pipelines`, { cache: 'no-store' }),
        fetch(`${API_ORIGIN}/health`, { cache: 'no-store' }),
    ]);
    if (!projRes.ok) throw new Error(`/api/project → ${projRes.status}`);
    if (!pipeRes.ok) throw new Error(`/api/pipelines → ${pipeRes.status}`);
    if (!healthRes.ok) throw new Error(`/health → ${healthRes.status}`);
    return { project: await projRes.json(), pipelines: await pipeRes.json(), health: await healthRes.json() };
}

async function loadDashboard() {
    const { project, pipelines, health } = await fetchAll();
    _allComponents = project.devsecops_components || [];

    updateEnvBadge(project.metadata.environment);
    updateRibbon(project);

    const { failed, total } = updateStatus(project.status);

    renderComponents(_allComponents);
    renderEndpoints(project.endpoints || []);
    renderPipelines(pipelines.pipelines || []);

    // Risk score: 0 vulns + all tests pass + CI running → high score
    const score = calcRiskScore({ vulns: 0, failedTests: failed, ciRunning: health.status === 'healthy' });
    renderRiskScore(score);
    renderThreatLevel(0);

    log('Dashboard data loaded from API', 'success');
}

function showError(msg) {
    const msgEl = $$('status-message');
    if (msgEl) { msgEl.textContent = 'Unable to reach backend'; msgEl.className = 'status-msg error'; }
    const dot = $$('sb-health-dot');
    if (dot) dot.className = 'sidebar-health-dot error';
    setText('sb-health-label', 'Error');
    toast(msg || 'API connection failed', 'error');
    log(msg || 'API connection failed', 'error');
}

/* ═══════════════════════════════════════════════
   REFRESH + RESET
═══════════════════════════════════════════════ */
async function triggerRefresh() {
    const btn = $$('refresh-btn');
    if (!btn || btn.disabled) return;
    btn.disabled = true;
    btn.classList.add('is-refreshing');
    log('Manual refresh triggered', 'info');
    toast('Refreshing…', 'info', 1500);
    try {
        await loadDashboard();
        toast('Dashboard refreshed', 'success', 2200);
    } catch (err) {
        showError(err.message);
    } finally {
        setTimeout(() => { btn.disabled = false; btn.classList.remove('is-refreshing'); }, 700);
    }
}
window.triggerRefresh = triggerRefresh;

function resetDashboard() {
    const rb = $$('reset-btn');
    if (rb) rb.disabled = true;

    // Clear KPI values
    ['kpi-health-val', 'kpi-tests-val', 'kpi-pipelines-val'].forEach(id => setText(id, '—'));
    const msg = $$('status-message');
    if (msg) { msg.textContent = 'Initializing…'; msg.className = 'status-msg'; }
    const dot = $$('sb-health-dot');
    if (dot) dot.className = 'sidebar-health-dot';
    setText('sb-health-label', 'Connecting…');

    // Skeleton loaders
    const skels = `
    <div class="skel-card"><div class="skel skel--short"></div><div class="skel skel--long"></div></div>
    <div class="skel-card"><div class="skel skel--short"></div><div class="skel skel--long"></div></div>
    <div class="skel-card"><div class="skel skel--short"></div><div class="skel skel--long"></div></div>`;
    const compList = $$('components-list');
    const pipeList = $$('pipeline-list');
    if (compList) compList.innerHTML = skels;
    if (pipeList) pipeList.innerHTML = skels;
    const epList = $$('ep-list');
    if (epList) epList.innerHTML = `
    <li class="ep-skel"><div class="skel skel--short"></div><div class="skel skel--long"></div></li>
    <li class="ep-skel"><div class="skel skel--short"></div><div class="skel skel--long"></div></li>`;

    renderRiskScore(0);
    log('Dashboard reset to initial state', 'warning');
    toast('Dashboard reset', 'warning', 2000);

    setTimeout(async () => {
        try { await loadDashboard(); } catch (err) { showError(err.message); }
        if (rb) rb.disabled = false;
    }, 500);
}
window.resetDashboard = resetDashboard;

/* ═══════════════════════════════════════════════
   AUTO-REFRESH
═══════════════════════════════════════════════ */
function startAutoRefresh() {
    if (_refreshTimer) clearInterval(_refreshTimer);
    _refreshTimer = setInterval(async () => {
        try { await loadDashboard(); log('Auto-refresh completed', 'info'); }
        catch { /* silently skip; next cycle will retry */ }
    }, REFRESH_MS);
}

/* ═══════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════ */
async function init() {
    console.log('[DevSecOps] Control Platform v3.1 booting…');
    startClock();
    initSidebar();
    initModal();
    initFilters();

    log('Platform initialized', 'success');
    log('Connecting to backend API…', 'info');

    try {
        await loadDashboard();
        log('All systems operational', 'success');
        toast('Platform online', 'success', 2500);
    } catch (err) {
        showError(err.message);
    }

    startAutoRefresh();
    console.log(`[DevSecOps] Auto-refresh every ${REFRESH_MS / 1000}s`);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
