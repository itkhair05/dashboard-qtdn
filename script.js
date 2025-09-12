// Global state
let currentTab = 'overview';
let currentPeriod = 'month';
let currentDepartment = 'all';
let defaultChartType = 'line';
let realtimeEnabled = true;
let realtimeIntervalId = null;

// ========== [KPI Levels: Defaults] ==========
const DEFAULT_KPI_LEVELS = {
    overview: {
        revenue: { 
            target: 3_200_000_000, warn: 2_800_000_000, critical: 2_400_000_000, higherIsBetter: true, unit: 'currency',
            byDept: {
                sales:     { target: 3_500_000_000, warn: 3_000_000_000 },
                marketing: { target: 3_000_000_000, warn: 2_600_000_000 },
                finance:   { target: 3_300_000_000 }
            },
            presetScale: { Optimistic: 1.1, Baseline: 1.0, Conservative: 0.9 }
        },
        customers: { 
            target: 1300, warn: 1100, critical: 900, higherIsBetter: true, unit: 'number',
            byDept: { 
                sales: { target: 1400 }, 
                marketing: { target: 1500 } 
            },
            presetScale: { Optimistic: 1.15, Baseline: 1.0, Conservative: 0.85 }
        },
        subscribers: { 
            target: 33000, warn: 30000, critical: 28000, higherIsBetter: true, unit: 'number',
            byDept: { 
                marketing: { target: 34000, warn: 31000 }, 
                ops: { target: 32000 } 
            },
            presetScale: { Optimistic: 1.05, Baseline: 1.0, Conservative: 0.95 }
        },
        support: { 
            target: 97, warn: 90, critical: 85, higherIsBetter: true, unit: 'percent',
            byDept: { 
                ops: { target: 98, warn: 95 } 
            },
            presetScale: { Optimistic: 0.98, Baseline: 1.0, Conservative: 1.02 }
        }
    },
    kpi: {
        kpi_done: { target: 30, warn: 25, critical: 20, higherIsBetter: true, unit: 'number', presetScale: { Optimistic: 0.9, Baseline: 1.0, Conservative: 1.1 } },
        kpi_pending: { target: 10, warn: 15, critical: 20, higherIsBetter: false, unit: 'number', presetScale: { Optimistic: 1.1, Baseline: 1.0, Conservative: 0.9 } },
        on_time: { target: 90, warn: 80, critical: 70, higherIsBetter: true, unit: 'percent', presetScale: { Optimistic: 0.95, Baseline: 1.0, Conservative: 1.05 } },
        over_target: { target: 15, warn: 10, critical: 5, higherIsBetter: true, unit: 'percent', presetScale: { Optimistic: 0.9, Baseline: 1.0, Conservative: 1.1 } }
    },
    services: {
        revenue: { target: 3_200_000_000, warn: 2_800_000_000, critical: 2_400_000_000, higherIsBetter: true, unit: 'currency', presetScale: { Optimistic: 1.1, Baseline: 1.0, Conservative: 0.9 } },
        subscribers: { target: 33000, warn: 30000, critical: 28000, higherIsBetter: true, unit: 'number', presetScale: { Optimistic: 1.05, Baseline: 1.0, Conservative: 0.95 } },
        arpu: { target: 95000, warn: 85000, critical: 75000, higherIsBetter: true, unit: 'currency', presetScale: { Optimistic: 1.1, Baseline: 1.0, Conservative: 0.9 } },
        churn: { target: 2.5, warn: 3.5, critical: 4.5, higherIsBetter: false, unit: 'percent', presetScale: { Optimistic: 0.9, Baseline: 1.0, Conservative: 1.1 } }
    },
    customers: {
        new_customers: { target: 1500, warn: 1200, critical: 1000, higherIsBetter: true, unit: 'number', presetScale: { Optimistic: 0.9, Baseline: 1.0, Conservative: 1.1 } },
        active_subscribers: { target: 33000, warn: 30000, critical: 28000, higherIsBetter: true, unit: 'number', presetScale: { Optimistic: 1.05, Baseline: 1.0, Conservative: 0.95 } },
        support_tickets: { target: 1000, warn: 1200, critical: 1500, higherIsBetter: false, unit: 'number', presetScale: { Optimistic: 1.1, Baseline: 1.0, Conservative: 0.9 } },
        satisfaction: { target: 97, warn: 90, critical: 85, higherIsBetter: true, unit: 'percent', presetScale: { Optimistic: 0.98, Baseline: 1.0, Conservative: 1.02 } }
    },
    solutions: {
        revenue: { target: 1_000_000_000, warn: 800_000_000, critical: 600_000_000, higherIsBetter: true, unit: 'currency', presetScale: { Optimistic: 1.1, Baseline: 1.0, Conservative: 0.9 } },
        clients: { target: 200, warn: 150, critical: 120, higherIsBetter: true, unit: 'number', presetScale: { Optimistic: 0.9, Baseline: 1.0, Conservative: 1.1 } },
        projects: { target: 50, warn: 40, critical: 30, higherIsBetter: true, unit: 'number', presetScale: { Optimistic: 0.9, Baseline: 1.0, Conservative: 1.1 } },
        satisfaction: { target: 95, warn: 88, critical: 80, higherIsBetter: true, unit: 'percent', presetScale: { Optimistic: 0.98, Baseline: 1.0, Conservative: 1.02 } }
    },
    infrastructure: {
        uptime: { target: 99.9, warn: 99.5, critical: 99.0, higherIsBetter: true, unit: 'percent', presetScale: { Optimistic: 0.999, Baseline: 1.0, Conservative: 1.001 } },
        bandwidth: { target: 1200, warn: 1000, critical: 800, higherIsBetter: true, unit: 'number', presetScale: { Optimistic: 0.9, Baseline: 1.0, Conservative: 1.1 } },
        sites: { target: 450, warn: 400, critical: 350, higherIsBetter: true, unit: 'number', presetScale: { Optimistic: 0.95, Baseline: 1.0, Conservative: 1.05 } },
        issues: { target: 3, warn: 5, critical: 8, higherIsBetter: false, unit: 'number', presetScale: { Optimistic: 1.2, Baseline: 1.0, Conservative: 0.8 } }
    },
    finance: {
        revenue: { target: 2_500_000_000, warn: 2_200_000_000, critical: 2_000_000_000, higherIsBetter: true, unit: 'currency', presetScale: { Optimistic: 1.1, Baseline: 1.0, Conservative: 0.9 } },
        expense: { target: 1_600_000_000, warn: 1_800_000_000, critical: 2_000_000_000, higherIsBetter: false, unit: 'currency', presetScale: { Optimistic: 1.1, Baseline: 1.0, Conservative: 0.9 } },
        profit: { target: 800_000_000, warn: 600_000_000, critical: 400_000_000, higherIsBetter: true, unit: 'currency', presetScale: { Optimistic: 1.15, Baseline: 1.0, Conservative: 0.85 } },
        margin: { target: 25, warn: 20, critical: 15, higherIsBetter: true, unit: 'percent', presetScale: { Optimistic: 0.95, Baseline: 1.0, Conservative: 1.05 } }
    },
    software_games: {
        revenue: { target: 900_000_000, warn: 700_000_000, critical: 500_000_000, higherIsBetter: true, unit: 'currency', presetScale: { Optimistic: 1.1, Baseline: 1.0, Conservative: 0.9 } },
        downloads: { target: 16000, warn: 12000, critical: 8000, higherIsBetter: true, unit: 'number', presetScale: { Optimistic: 0.9, Baseline: 1.0, Conservative: 1.1 } },
        active_users: { target: 9000, warn: 7000, critical: 5000, higherIsBetter: true, unit: 'number', presetScale: { Optimistic: 0.9, Baseline: 1.0, Conservative: 1.1 } },
        retention: { target: 70, warn: 60, critical: 50, higherIsBetter: true, unit: 'percent', presetScale: { Optimistic: 0.95, Baseline: 1.0, Conservative: 1.05 } }
    }
};

const STORAGE_KEY = 'kpiLevels.v1';

// ========== [Scenario Management] ==========
const SCENARIOS = ['Optimistic','Baseline','Conservative'];
const SCENARIO_STORAGE_KEY = 'kpiScenario.v1';
let CURRENT_SCENARIO = localStorage.getItem(SCENARIO_STORAGE_KEY) || 'Baseline';

function setScenario(name) {
    if (!SCENARIOS.includes(name)) return;
    CURRENT_SCENARIO = name;
    localStorage.setItem(SCENARIO_STORAGE_KEY, name);
    // làm mới tab hiện tại để áp dụng ngưỡng mới
    renderForState();
    refreshChartsWithTargetLines();
}

function getCurrentDepartment() {
    return currentDepartment === 'all' ? undefined : currentDepartment;
}

// ========== [Theme Management] ==========
const THEME_STORAGE_KEY = 'ui.theme.v1';
let THEME_MODE = localStorage.getItem(THEME_STORAGE_KEY) || 'system'; // 'system' | 'light' | 'dark'

const mediaDark = window.matchMedia('(prefers-color-scheme: dark)');
mediaDark.addEventListener?.('change', () => {
    if (THEME_MODE === 'system') applyTheme('system');
});

function applyTheme(mode) {
    const root = document.documentElement;
    const isDark = mode === 'dark' || (mode === 'system' && mediaDark.matches);
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    THEME_MODE = mode;
    localStorage.setItem(THEME_STORAGE_KEY, mode);
    // Sync Chart.js defaults (grid/ticks/tooltip)
    syncChartTheme();
}

function initThemeToggle() {
    const sel = document.getElementById('theme-select');
    if (!sel) return;
    sel.value = THEME_MODE;
    sel.addEventListener('change', (e) => applyTheme(e.target.value));
    // Apply at startup
    applyTheme(THEME_MODE);
}

function deepMerge(base, patch) {
    for (const k in patch) {
        const v = patch[k];
        if (v && typeof v === 'object' && !Array.isArray(v)) {
            base[k] = deepMerge(base[k] || {}, v);
        } else {
            base[k] = v;
        }
    }
    return base;
}

function loadKpiLevels() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return structuredClone(DEFAULT_KPI_LEVELS);
        const parsed = JSON.parse(raw);
        return deepMerge(structuredClone(DEFAULT_KPI_LEVELS), parsed);
    } catch (_) {
        return structuredClone(DEFAULT_KPI_LEVELS);
    }
}

function saveKpiLevels(levels) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
}

let KPI_LEVELS = loadKpiLevels();

// ========== [Alerts store] ==========
const ALERTS_STORAGE_KEY = 'kpiAlerts.v1';
let ALERTS = []; // runtime list

function loadAlerts() {
    try {
        const raw = localStorage.getItem(ALERTS_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}
function saveAlerts() {
    try { localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(ALERTS)); } catch {}
}
// bật nếu muốn lưu vĩnh viễn
const PERSIST_ALERTS = true;

// Dedupe theo cặp (tabId,kpiKey) trong một khoảng thời gian (minutes)
const ALERT_DEDUPE_MINUTES = 30; // không tạo alert mới cho cùng KPI trong ~30 phút

function shouldEmitAlert(tabId, kpiKey, severity) {
    const now = Date.now();
    for (let i = ALERTS.length - 1; i >= 0; i--) {
        const a = ALERTS[i];
        if (a.tab === tabId && a.kpi === kpiKey) {
            if (now - a.ts < ALERT_DEDUPE_MINUTES * 60 * 1000) return false;
            break; // có alert cũ nhưng quá hạn, cho phép tạo mới
        }
    }
    return true;
}

function addAlert({ severity, title, message, tab, kpi, value, target, unit }) {
    const item = {
        id: `al_${Math.random().toString(36).slice(2, 9)}`,
        severity, // 'medium' | 'high'
        title,
        message,
        tab,
        kpi,
        value,
        target,
        unit,
        ts: Date.now()
    };
    ALERTS.push(item);
    if (PERSIST_ALERTS) saveAlerts();
    // nếu đang mở tab alerts thì render lại, nếu không thì toast
    if (currentTab === 'alerts') renderAlertsTab();
    else showNotification(`${severity === 'high' ? '⚠️' : 'ℹ️'} ${title}`);
}

// Initialize alerts from storage
ALERTS = PERSIST_ALERTS ? loadAlerts() : [];

// Test function to create sample alerts (for development/testing)
function createSampleAlert() {
    addAlert({
        severity: 'high',
        title: 'KPI revenue dưới mức critical',
        message: 'Giá trị: ₫50.000.000 | Target: ₫120.000.000',
        tab: 'overview',
        kpi: 'revenue',
        value: 50000000,
        target: 120000000,
        unit: 'currency'
    });
}

function maybePushAlert(tabId, kpiKey, value) {
    const dept = getCurrentDepartment();
    const cfg = resolveKpiLevel(tabId, kpiKey, dept, CURRENT_SCENARIO);
    if (!cfg) return; // chưa cấu hình thì bỏ qua
    const status = getKpiStatus(tabId, kpiKey, value);
    if (status === 'good') return;

    const unit = cfg.unit || 'number';
    const prettyVal = formatValueByUnit(value, unit);
    const prettyTarget = formatValueByUnit(cfg.target, unit);
    const kpiNameVi = KPI_NAMES_VI[kpiKey] || kpiKey;

    const severity = (status === 'bad') ? 'high' : 'medium';
    const statusText = status === 'bad' ? 'không đạt' : 'cảnh báo';
    const title = `${kpiNameVi} ở mức ${statusText}`;
    const message = `Giá trị hiện tại: ${prettyVal} | Mục tiêu: ${prettyTarget}`;

    if (!shouldEmitAlert(tabId, kpiKey, severity)) return; // dedupe window

    addAlert({
        severity,
        title,
        message,
        tab: tabId,
        kpi: kpiKey,
        value,
        target: cfg.target,
        unit
    });
}

// Helper function để test KPI status cho tất cả tabs
function testKpiStatus() {
    console.log('=== TEST KPI STATUS FOR ALL TABS ===');
    
    // Test cases for each tab
    const testCases = {
        overview: [
            { kpi: 'revenue', values: [2000000000, 3000000000, 3500000000] },
            { kpi: 'customers', values: [800, 1200, 1400] },
            { kpi: 'subscribers', values: [25000, 31000, 35000] },
            { kpi: 'support', values: [80, 95, 99] }
        ],
        kpi: [
            { kpi: 'kpi_done', values: [15, 27, 35] },
            { kpi: 'kpi_pending', values: [25, 12, 5] },
            { kpi: 'on_time', values: [60, 85, 95] },
            { kpi: 'over_target', values: [3, 12, 20] }
        ],
        services: [
            { kpi: 'revenue', values: [2000000000, 3000000000, 3500000000] },
            { kpi: 'subscribers', values: [25000, 31000, 35000] },
            { kpi: 'arpu', values: [70000, 90000, 100000] },
            { kpi: 'churn', values: [6, 3, 1.5] }
        ],
        infrastructure: [
            { kpi: 'uptime', values: [98.5, 99.7, 99.95] },
            { kpi: 'bandwidth', values: [600, 1100, 1300] },
            { kpi: 'sites', values: [300, 420, 480] },
            { kpi: 'issues', values: [10, 4, 1] }
        ]
    };
    
    Object.entries(testCases).forEach(([tabId, kpis]) => {
        console.log(`\n🏷️ === TAB: ${TAB_NAMES_VI[tabId] || tabId} ===`);
        
        kpis.forEach(({ kpi, values }) => {
            console.log(`\n--- ${KPI_NAMES_VI[kpi] || kpi} ---`);
            const cfg = resolveKpiLevel(tabId, kpi, getCurrentDepartment(), CURRENT_SCENARIO);
            if (!cfg) {
                console.log('❌ No configuration found');
                return;
            }
            
            console.log(`Target: ${cfg.target}, Warn: ${cfg.warn}, Critical: ${cfg.critical}`);
            console.log(`Higher is better: ${cfg.higherIsBetter ? 'Yes' : 'No'}`);
            
            values.forEach(val => {
                const status = getKpiStatus(tabId, kpi, val);
                const color = status === 'good' ? '🟢' : status === 'warn' ? '🟡' : '🔴';
                const formatted = formatValueByUnit(val, cfg.unit);
                console.log(`${color} ${formatted} → ${status.toUpperCase()}`);
            });
        });
    });
    
    console.log('\n✅ Test completed! Check colors on dashboard by switching tabs.');
}

// ========== [Format helpers] ==========
const fmt = {
    currency: v => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(v) || 0),
    percent:  v => `${Number(v).toFixed(1)}%`,
    number:   v => new Intl.NumberFormat('vi-VN').format(Number(v) || 0),
};
function formatValueByUnit(v, unit) { return (fmt[unit] || fmt.number)(v); }

// ========== [Config Resolution] ==========
function resolveKpiLevel(tabId, kpiKey, department, scenario = CURRENT_SCENARIO) {
    const base = KPI_LEVELS && KPI_LEVELS[tabId] && KPI_LEVELS[tabId][kpiKey];
    if (!base) return null;

    // 1) start từ default
    let eff = { ...base };

    // 2) merge byDept nếu có
    const deptCfg = base.byDept && base.byDept[department];
    if (deptCfg) {
        eff = deepMerge({ ...eff }, deptCfg); // chỉ ghi các field có trong byDept
    }

    // 3) apply presetScale nếu có (scale cho các ngưỡng số)
    const s = base.presetScale && base.presetScale[scenario];
    if (typeof s === 'number' && isFinite(s)) {
        const scaleFields = ['target','warn','critical'];
        scaleFields.forEach(f => {
            if (typeof eff[f] === 'number') eff[f] = Number((eff[f] * s).toFixed(2));
        });
    }

    return eff;
}

// ========== [Status helper] ==========
function getKpiStatus(tabId, kpiKey, value) {
    const dept = getCurrentDepartment();
    const lv = resolveKpiLevel(tabId, kpiKey, dept, CURRENT_SCENARIO);
    if (!lv) return 'good';
    const v = Number(value);
    if (lv.higherIsBetter) {
        if (v >= lv.target) return 'good';
        if (v >= lv.warn)   return 'warn';
        return 'bad';
    } else {
        if (v <= lv.target) return 'good';
        if (v <= lv.warn)   return 'warn';
        return 'bad';
    }
}

function renderKpiCard(tabId, kpiKey, label, value, unit) {
    const status = getKpiStatus(tabId, kpiKey, value);
    return (
        '\n                <div class="kpi-card ' + status + '">\n                    <div class="kpi-label">' + label + '</div>\n                    <div class="kpi-value">' + formatValueByUnit(value, unit) + '</div>\n                </div>\n            '
    );
}

// ========== [Alerts Tab Rendering] ==========
function timeAgo(ts) {
    const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
    const m = Math.floor(s / 60), h = Math.floor(m / 60), d = Math.floor(h / 24);
    if (d>0) return `${d} ngày trước`;
    if (h>0) return `${h} giờ trước`;
    if (m>0) return `${m} phút trước`;
    return `${s} giây trước`;
}

function renderAlertsTab() {
    const wrap = document.getElementById('alerts-list');
    if (!wrap) return;
    if (!ALERTS.length) {
        wrap.innerHTML = '<div class="alert-empty">Chưa có cảnh báo nào.</div>';
        return;
    }
    // sắp xếp mới nhất lên trên
    const items = [...ALERTS].sort((a,b)=>b.ts - a.ts);
    wrap.innerHTML = items.map(a => `
        <div class="alert-item">
            <span class="alert-badge ${a.severity==='high'?'alert-high':'alert-medium'}">${a.severity==='high'?'HIGH':'MED'}</span>
            <div style="flex:1;">
                <div class="alert-title">${a.title}</div>
                <div class="alert-meta">Tab: <b>${a.tab}</b> · KPI: <b>${a.kpi}</b> · ${timeAgo(a.ts)}</div>
                <div>${a.message}</div>
            </div>
            <div class="alert-actions">
                <button onclick="gotoTab('${a.tab}')">Mở tab</button>
                <button onclick="dismissAlert('${a.id}')">Ẩn</button>
            </div>
        </div>
    `).join('');
}

function gotoTab(tabId) {
    // Find the nav link and click it
    const navLink = document.querySelector(`.nav-link[data-tab="${tabId}"]`);
    if (navLink) navLink.click();
}

function dismissAlert(id) {
    ALERTS = ALERTS.filter(a => a.id !== id);
    if (PERSIST_ALERTS) saveAlerts();
    renderAlertsTab();
}

// ========== [Settings Form for KPI Levels] ==========
const TAB_NAMES_VI = {
    'overview': 'Tổng quan',
    'kpi': 'KPI',
    'services': 'Dịch vụ',
    'customers': 'Khách hàng',
    'solutions': 'Giải pháp CNTT',
    'infrastructure': 'Hạ tầng',
    'finance': 'Tài chính',
    'reports': 'Báo cáo',
    'alerts': 'Thông báo',
    'software_games': 'Phần mềm & Game'
};

const KPI_NAMES_VI = {
    // Overview
    'revenue': 'Doanh thu',
    'customers': 'Khách hàng mới',
    'subscribers': 'Thuê bao',
    'support': 'Hỗ trợ khách hàng',
    
    // KPI tab
    'kpi_done': 'KPI hoàn thành',
    'kpi_pending': 'KPI đang chờ',
    'on_time': 'Đúng hạn',
    'over_target': 'Vượt mục tiêu',
    
    // Services
    'arpu': 'ARPU',
    'churn': 'Tỷ lệ rời mạng',
    
    // Customers
    'new_customers': 'Khách hàng mới',
    'active_subscribers': 'Thuê bao hoạt động',
    'support_tickets': 'Yêu cầu hỗ trợ',
    'satisfaction': 'Hài lòng khách hàng',
    
    // Solutions
    'clients': 'Khách hàng sử dụng',
    'projects': 'Dự án hoàn thành',
    
    // Infrastructure
    'uptime': 'Uptime mạng',
    'bandwidth': 'Băng thông',
    'sites': 'Trạm BTS',
    'issues': 'Sự cố mạng',
    
    // Finance
    'profit': 'Lợi nhuận',
    'expense': 'Chi phí',
    'margin': 'Biên lợi nhuận',
    
    // Software & Games
    'downloads': 'Lượt tải',
    'active_users': 'Người dùng hoạt động',
    'retention': 'Tỷ lệ giữ chân'
};

const UNIT_NAMES_VI = {
    'currency': 'Tiền tệ (VNĐ)',
    'percent': 'Phần trăm (%)',
    'number': 'Số lượng'
};

function renderKpiLevelsForm() {
    const wrap = document.getElementById('kpi-levels-form');
    if (!wrap) return;

    let html = '';
    Object.entries(KPI_LEVELS).forEach(([tabId, kpis]) => {
        if (!kpis || !Object.keys(kpis).length) return;
        const tabNameVi = TAB_NAMES_VI[tabId] || tabId;
        html += `<div class="settings-group">
            <h3><i class="fas fa-chart-bar"></i> ${tabNameVi}</h3>
            <div class="grid-2">`;

        Object.entries(kpis).forEach(([kpiKey, cfg]) => {
            const unit = cfg.unit;
            const higherIsBetter = !!cfg.higherIsBetter;
            const target = cfg.target;
            const warn = cfg.warn;
            const critical = cfg.critical;
            const kpiNameVi = KPI_NAMES_VI[kpiKey] || kpiKey;
            
            html += `
                <div class="field-card">
                    <div class="field-title">
                        <i class="fas fa-bullseye"></i> ${kpiNameVi}
                    </div>
                    <label>Đơn vị hiển thị
                        <select data-bind="${tabId}.${kpiKey}.unit">
                            ${['currency','percent','number'].map(u => 
                                `<option value="${u}" ${u===unit ? 'selected' : ''}>${UNIT_NAMES_VI[u] || u}</option>`
                            ).join('')}
                        </select>
                    </label>
                    <label>
                        <input type="checkbox" data-bind="${tabId}.${kpiKey}.higherIsBetter" ${higherIsBetter ? 'checked' : ''} />
                        Giá trị cao hơn là tốt hơn
                    </label>
                    
                    <div class="threshold-section">
                        <h4><i class="fas fa-traffic-light"></i> Ngưỡng đánh giá</h4>
                        <div class="threshold-grid">
                            <label class="threshold-item target">
                                <span class="threshold-label">
                                    <span class="color-dot" style="background: var(--kpi-ok)"></span>
                                    Đạt mục tiêu (Xanh)
                                </span>
                                <input type="number" step="any" data-bind="${tabId}.${kpiKey}.target" value="${target}" placeholder="Giá trị đạt mục tiêu">
                            </label>
                            <label class="threshold-item warn">
                                <span class="threshold-label">
                                    <span class="color-dot" style="background: var(--kpi-warn)"></span>
                                    Cảnh báo (Vàng)
                                </span>
                                <input type="number" step="any" data-bind="${tabId}.${kpiKey}.warn" value="${warn}" placeholder="Giá trị cảnh báo">
                            </label>
                            <label class="threshold-item critical">
                                <span class="threshold-label">
                                    <span class="color-dot" style="background: var(--kpi-bad)"></span>
                                    Không đạt (Đỏ)
                                </span>
                                <input type="number" step="any" data-bind="${tabId}.${kpiKey}.critical" value="${critical}" placeholder="Giá trị không đạt">
                            </label>
                        </div>
                        <div class="threshold-help">
                            <i class="fas fa-info-circle"></i>
                            <span>${higherIsBetter ? 'Giá trị cao hơn sẽ có màu tốt hơn' : 'Giá trị thấp hơn sẽ có màu tốt hơn'}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div></div>';
    });

    wrap.innerHTML = html;

    // Initialize and bind scenario selector
    const scenSel = document.getElementById('scenario-select');
    if (scenSel) {
        scenSel.value = CURRENT_SCENARIO;
        scenSel.addEventListener('change', (e) => setScenario(e.target.value));
    }

    wrap.querySelectorAll('[data-bind]').forEach(el => {
        el.addEventListener('change', (e) => {
            const path = e.target.getAttribute('data-bind').split('.');
            const tabId = path[0];
            const kpiKey = path[1];
            const field = path[2];
            let val;
            if (e.target.type === 'checkbox') val = !!e.target.checked;
            else if (e.target.tagName === 'SELECT') val = e.target.value;
            else val = Number(e.target.value);
            KPI_LEVELS[tabId][kpiKey][field] = val;
        });
    });

    const btnSave = document.getElementById('btn-save-kpi-levels');
    if (btnSave && !btnSave.__bound) {
        btnSave.addEventListener('click', () => {
            saveKpiLevels(KPI_LEVELS);
            showNotification('✅ Đã lưu cài đặt thành công!');
            renderForState();
            refreshChartsWithTargetLines();
        });
        btnSave.__bound = true;
    }
    const btnReset = document.getElementById('btn-reset-kpi-levels');
    if (btnReset && !btnReset.__bound) {
        btnReset.addEventListener('click', () => {
            if (confirm('Bạn có chắc chắn muốn khôi phục tất cả cài đặt về mặc định không?')) {
                KPI_LEVELS = structuredClone(DEFAULT_KPI_LEVELS);
                saveKpiLevels(KPI_LEVELS);
                renderKpiLevelsForm();
                showNotification('🔄 Đã khôi phục cài đặt mặc định!');
                renderForState();
                refreshChartsWithTargetLines();
            }
        });
        btnReset.__bound = true;
    }
}

// ========== [Target Line Plugin] ==========
// Vẽ 1 đường ngang tại giá trị `targetValue` trên thang y chỉ định.
function targetLinePlugin(targetValue, yScaleId = 'y', color = '#e74c3c', label = 'Target') {
    return {
        id: 'targetLine-' + Math.random().toString(36).slice(2, 8), // id duy nhất mỗi lần tạo
        afterDatasetsDraw(chart) {
            if (typeof targetValue !== 'number') return;
            const { ctx, chartArea, scales } = chart;
            const yScale = scales[yScaleId];
            if (!yScale) return; // trục không tồn tại

            const y = yScale.getPixelForValue(targetValue);
            if (!isFinite(y) || y < chartArea.top || y > chartArea.bottom) return;

            ctx.save();

            // Vẽ đường target chính với gradient
            const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
            gradient.addColorStop(0, color + '40'); // 25% opacity ở đầu
            gradient.addColorStop(0.5, color); // full opacity ở giữa
            gradient.addColorStop(1, color + '40'); // 25% opacity ở cuối

            // Vẽ background shadow
            ctx.beginPath();
            ctx.setLineDash([]);
            ctx.moveTo(chartArea.left, y + 1);
            ctx.lineTo(chartArea.right, y + 1);
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            ctx.stroke();

            // Vẽ đường chính
            ctx.beginPath();
            ctx.setLineDash([8, 4]); // dash pattern nổi bật hơn
            ctx.moveTo(chartArea.left, y);
            ctx.lineTo(chartArea.right, y);
            ctx.lineWidth = 3; // tăng độ dày
            ctx.strokeStyle = gradient;
            ctx.stroke();

            // Vẽ các điểm nhấn ở 2 đầu
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.arc(chartArea.left + 5, y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(chartArea.right - 5, y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();

            // Vẽ nhãn với background
            const text = `🎯 ${label}: ${formatValueByUnit(targetValue, inferUnitFromScale(yScaleId))}`;
            ctx.font = 'bold 13px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
            const textMetrics = ctx.measureText(text);
            const textWidth = textMetrics.width;
            const textHeight = 16;
            
            // Tính toán vị trí label
            const labelPadding = 8;
            const labelX = chartArea.right - textWidth - labelPadding;
            const labelY = Math.max(chartArea.top + textHeight + 8, Math.min(y - 8, chartArea.bottom - textHeight - 8));
            
            // Vẽ background cho label
            ctx.fillStyle = color;
            ctx.fillRect(labelX - 6, labelY - textHeight + 2, textWidth + 12, textHeight + 4);
            
            // Vẽ text
            ctx.fillStyle = '#ffffff';
            ctx.fillText(text, labelX, labelY);
            
            ctx.restore();

            function inferUnitFromScale(scaleId) {
                // Map scale ID to appropriate unit
                if (yScaleId === 'y' && (label.includes('Doanh thu') || label.includes('Lợi nhuận'))) {
                    return 'currency';
                }
                return 'number';
            }
        }
    };
}

// ========== [Update Target Lines] ==========
function updateChartTargetLines(chart, cfgs) {
    // cfgs: mảng các { target, yScaleId, color, label }
    if (!chart || !chart.config) return;
    
    const newPlugins = cfgs
        .filter(c => typeof c.target === 'number')
        .map(c => targetLinePlugin(c.target, c.yScaleId, c.color, c.label));

    // Lọc bỏ plugin cũ có id bắt đầu bằng 'targetLine-'
    chart.config.plugins = (chart.config.plugins || []).filter(p => !p.id || !String(p.id).startsWith('targetLine-'));
    chart.config.plugins.push(...newPlugins);
    chart.update();
}

function refreshChartsWithTargetLines() {
    if (currentTab === 'overview' && revenueChart) {
        const dept = getCurrentDepartment();
        const lvRev = resolveKpiLevel('overview', 'revenue', dept, CURRENT_SCENARIO);
        const lvPro = resolveKpiLevel('overview', 'profit', dept, CURRENT_SCENARIO);
        const cfgs = [];
        if (lvRev && typeof lvRev.target === 'number') {
            cfgs.push({ target: lvRev.target, yScaleId: 'y', color: '#3b82f6', label: 'Doanh thu - Target' });
        }
        if (lvPro && typeof lvPro.target === 'number') {
            cfgs.push({ target: lvPro.target, yScaleId: 'y1', color: '#10b981', label: 'Lợi nhuận - Target' });
        }
        updateChartTargetLines(revenueChart, cfgs);
    }
}

// ========== [Chart Theme Sync] ==========
function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function syncChartTheme() {
    if (!window.Chart) return;
    const grid  = cssVar('--chart-grid') || '#e5e7eb';
    const tick  = cssVar('--chart-tick') || '#64748b';
    const bg    = cssVar('--chart-bg')   || '#ffffff';
    const tbg   = cssVar('--chart-tooltip-bg') || 'rgba(15,23,42,.9)';
    const ttext = cssVar('--chart-tooltip-text') || '#f8fafc';

    // Defaults
    Chart.defaults.color = tick;
    Chart.defaults.borderColor = grid;
    Chart.defaults.backgroundColor = bg;

    // Tooltips
    Chart.defaults.plugins.tooltip = Chart.defaults.plugins.tooltip || {};
    Chart.defaults.plugins.tooltip.backgroundColor = tbg;
    Chart.defaults.plugins.tooltip.titleColor = ttext;
    Chart.defaults.plugins.tooltip.bodyColor = ttext;

    // Update existing charts
    if (revenueChart) revenueChart.update();
    if (salesChannelChart) salesChannelChart.update();
}

// Utility: theme-aware chart colors (legacy compatibility)
function getThemeColors() {
    const styles = getComputedStyle(document.body);
    const grid = styles.getPropertyValue('--gray-200').trim();
    const tick = styles.getPropertyValue('--gray-600').trim();
    const bg = styles.getPropertyValue('--white').trim();
    return { gridColor: grid || '#e2e8f0', tickColor: tick || '#475569', background: bg || '#ffffff' };
}

// Sample base data for variants per tab with 12 months
const baseData = {
    months: ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'],
    overview: {
        kpis: {
            k1: { key: 'revenue', label: 'Doanh thu dịch vụ', value: 3200000000, trend: 5.2, unit: 'currency' },
            k2: { key: 'customers', label: 'Khách hàng mới', value: 1240, trend: 3.1, unit: 'number' },
            k3: { key: 'subscribers', label: 'Thuê bao hoạt động', value: 32856, trend: -2.1, unit: 'number' },
            k4: { key: 'support', label: 'Tỷ lệ xử lý hỗ trợ', value: 97.2, trend: 0.5, unit: 'percent' }
        },
        chart1: {
            title: 'Doanh thu & Lợi nhuận dịch vụ',
            type: 'line',
            dualAxis: true,
            datasets: [
                { label: 'Doanh thu', data: [2100000000,2300000000,2500000000,2700000000,3000000000,3200000000], color: '#3b82f6', unit: 'currency' },
                { label: 'Lợi nhuận', data: [420000000,460000000,510000000,550000000,600000000,640000000], color: '#10b981', unit: 'currency', yAxisID: 'y1' }
            ]
        },
        chart2: {
            title: 'Kênh liên lạc khách hàng',
            type: 'doughnut',
            labels: ['Call Center','Online','Ứng dụng'],
            data: [40, 35, 25],
            colors: ['#60a5fa','#f59e0b','#10b981'],
            unit: 'number'
        },
        table: {
            title: 'Dịch vụ/giải pháp ICT nổi bật',
            columns: ['Dịch vụ','Loại','Thuê bao/KH','Doanh thu','Tăng trưởng (%)','Trạng thái'],
            rows: [
                { name: 'Internet cáp quang', category: 'Dịch vụ viễn thông', sold: 1500, revenue: 750000000, rate: 92, status: 'active' },
                { name: 'Gói cước 4G/5G', category: 'Dịch vụ di động', sold: 1200, revenue: 600000000, rate: 88, status: 'active' },
                { name: 'Cloud Server', category: 'Giải pháp CNTT', sold: 300, revenue: 450000000, rate: 85, status: 'active' },
                { name: 'Truyền hình IPTV', category: 'Dịch vụ truyền hình', sold: 800, revenue: 320000000, rate: 80, status: 'pending' },
                { name: 'Game Mobile X', category: 'Game', sold: 5000, revenue: 250000000, rate: 90, status: 'active' }
            ]
        }
    },
    kpi: {
        kpis: {
            k1: { key: 'kpi_done', label: 'KPI hoàn thành', value: 28, trend: 12.5, unit: 'number' },
            k2: { key: 'kpi_pending', label: 'KPI đang chờ', value: 15, trend: -8.3, unit: 'number' },
            k3: { key: 'on_time', label: 'Đúng hạn', value: 86.4, trend: 3.7, unit: 'percent' },
            k4: { key: 'over_target', label: 'Vượt mục tiêu', value: 12.8, trend: 2.1, unit: 'percent' }
        },
        chart1: {
            title: 'Tiến độ KPI theo tháng',
            type: 'line',
            datasets: [
                { label: 'Hoàn thành', data: [22,24,26,25,27,28,30,32,28,26,28,30], color: '#10b981', unit: 'number' },
                { label: 'Chưa hoàn thành', data: [18,16,14,15,13,12,10,8,12,14,12,10], color: '#ef4444', unit: 'number' }
            ]
        },
        chart2: {
            title: 'Phân loại KPI',
            type: 'doughnut',
            labels: ['Doanh thu','Khách hàng','Vận hành','Tài chính'],
            data: [12, 8, 15, 8],
            colors: ['#3b82f6','#f59e0b','#10b981','#8b5cf6'],
            unit: 'number'
        },
        table: {
            title: 'Danh sách KPI chính',
            columns: ['KPI','Nhóm','Tiến độ (%)','Trọng số (VND)','Tỷ lệ đạt (%)','Trạng thái'],
            rows: [
                { name: 'Tăng doanh thu dịch vụ', category: 'Doanh thu', sold: 85, revenue: 50000000, rate: 112.5, status: 'active' },
                { name: 'Tăng khách hàng mới', category: 'Khách hàng', sold: 92, revenue: 30000000, rate: 108.7, status: 'active' },
                { name: 'Tối ưu uptime mạng', category: 'Vận hành', sold: 78, revenue: 25000000, rate: 95.2, status: 'pending' },
                { name: 'Giảm chi phí vận hành', category: 'Tài chính', sold: 65, revenue: 40000000, rate: 87.3, status: 'active' },
                { name: 'Tăng lượt tải game', category: 'Game', sold: 70, revenue: 20000000, rate: 90.0, status: 'active' }
            ]
        }
    },
    services: {
        kpis: {
            k1: { key: 'revenue', label: 'Doanh thu dịch vụ', value: 3050000000, trend: 2.8, unit: 'currency' },
            k2: { key: 'subscribers', label: 'Thuê bao', value: 32856, trend: 1.9, unit: 'number' },
            k3: { key: 'arpu', label: 'ARPU', value: 92700, trend: -0.7, unit: 'currency' },
            k4: { key: 'churn', label: 'Tỷ lệ rời mạng (%)', value: 2.6, trend: 0.1, unit: 'percent' }
        },
        chart1: {
            title: 'Doanh thu dịch vụ theo tháng',
            type: 'bar',
            datasets: [
                { label: 'Doanh thu', data: [2800000000,2900000000,3000000000,3100000000,3200000000,3050000000,3200000000,3300000000,3100000000,3250000000,3350000000,3500000000], color: '#3b82f6', unit: 'currency' }
            ]
        },
        chart2: {
            title: 'Phân bổ loại dịch vụ',
            type: 'doughnut',
            labels: ['Di động','Internet','Truyền hình'],
            data: [45, 35, 20],
            colors: ['#60a5fa','#f59e0b','#10b981'],
            unit: 'number'
        },
        table: {
            title: 'Hiệu quả dịch vụ viễn thông',
            columns: ['Dịch vụ','Loại','Thuê bao','Doanh thu','Tăng trưởng (%)','Trạng thái'],
            rows: [
                { name: 'Internet cáp quang', category: 'Internet', sold: 1500, revenue: 750000000, rate: 92, status: 'active' },
                { name: 'Gói cước 4G/5G', category: 'Di động', sold: 1200, revenue: 600000000, rate: 88, status: 'active' },
                { name: 'Truyền hình IPTV', category: 'Truyền hình', sold: 800, revenue: 320000000, rate: 80, status: 'pending' },
                { name: 'Dịch vụ VoIP', category: 'Di động', sold: 500, revenue: 200000000, rate: 75, status: 'active' },
                { name: 'Gói combo Internet + TV', category: 'Combo', sold: 300, revenue: 180000000, rate: 70, status: 'active' }
            ]
        }
    },
    customers: {
        kpis: {
            k1: { key: 'new_customers', label: 'Khách hàng mới', value: 1420, trend: 2.2, unit: 'number' },
            k2: { key: 'active_subscribers', label: 'Thuê bao hoạt động', value: 32856, trend: 1.1, unit: 'number' },
            k3: { key: 'support_tickets', label: 'Yêu cầu hỗ trợ', value: 1200, trend: -0.3, unit: 'number' },
            k4: { key: 'satisfaction', label: 'Hài lòng (%)', value: 97.2, trend: 0.5, unit: 'percent' }
        },
        chart1: {
            title: 'Khách hàng mới theo tháng',
            type: 'line',
            datasets: [
                { label: 'Khách hàng mới', data: [1100,1220,980,1350,1420,1500,1480,1390,1440,1520,1600,1710], color: '#8b5cf6', unit: 'number' }
            ]
        },
        chart2: {
            title: 'Nguồn khách hàng',
            type: 'doughnut',
            labels: ['Quảng cáo','Tự nhiên','Giới thiệu'],
            data: [45, 38, 17],
            colors: ['#f59e0b','#10b981','#3b82f6'],
            unit: 'number'
        },
        table: {
            title: 'Nhóm khách hàng tích cực',
            columns: ['Nhóm','Mô tả','Số KH','Trạng thái','Tỷ lệ hài lòng (%)','—'],
            rows: [
                { name: 'VIP', category: 'Giá trị cao', sold: 320, revenue: 0, rate: 95, status: 'active' },
                { name: 'Trung thành', category: 'Sử dụng lâu dài', sold: 540, revenue: 0, rate: 86, status: 'active' },
                { name: 'Rủi ro rời mạng', category: 'Không hoạt động 60d', sold: 210, revenue: 0, rate: 40, status: 'pending' },
                { name: 'Khách mới', category: 'Đăng ký mới', sold: 180, revenue: 0, rate: 78, status: 'active' },
                { name: 'Người chơi game', category: 'Người dùng game', sold: 1500, revenue: 0, rate: 85, status: 'active' }
            ]
        }
    },
    solutions: {
        kpis: {
            k1: { key: 'revenue', label: 'Doanh thu giải pháp', value: 950000000, trend: 3.4, unit: 'currency' },
            k2: { key: 'clients', label: 'Khách hàng sử dụng', value: 180, trend: 2.1, unit: 'number' },
            k3: { key: 'projects', label: 'Dự án hoàn thành', value: 45, trend: 1.5, unit: 'number' },
            k4: { key: 'satisfaction', label: 'Hài lòng (%)', value: 94.5, trend: 0.8, unit: 'percent' }
        },
        chart1: {
            title: 'Doanh thu giải pháp CNTT theo tháng',
            type: 'bar',
            datasets: [
                { label: 'Doanh thu', data: [700000000,750000000,800000000,850000000,900000000,950000000,1000000000,1050000000,950000000,1000000000,1100000000,1200000000], color: '#3b82f6', unit: 'currency' }
            ]
        },
        chart2: {
            title: 'Phân bổ loại giải pháp',
            type: 'doughnut',
            labels: ['Cloud','Bảo mật','Phần mềm'],
            data: [50, 30, 20],
            colors: ['#3b82f6','#10b981','#f59e0b'],
            unit: 'number'
        },
        table: {
            title: 'Hiệu quả giải pháp CNTT',
            columns: ['Giải pháp','Loại','Khách hàng','Doanh thu','Tăng trưởng (%)','Trạng thái'],
            rows: [
                { name: 'Cloud Server', category: 'Cloud', sold: 100, revenue: 300000000, rate: 90, status: 'active' },
                { name: 'Bảo mật mạng', category: 'Bảo mật', sold: 80, revenue: 240000000, rate: 85, status: 'active' },
                { name: 'ERP doanh nghiệp', category: 'Phần mềm', sold: 50, revenue: 200000000, rate: 80, status: 'active' },
                { name: 'AI Analytics', category: 'Phần mềm', sold: 30, revenue: 150000000, rate: 75, status: 'pending' },
                { name: 'IoT Solutions', category: 'IoT', sold: 20, revenue: 100000000, rate: 70, status: 'active' }
            ]
        }
    },
    infrastructure: {
        kpis: {
            k1: { key: 'uptime', label: 'Uptime mạng (%)', value: 99.8, trend: 0.2, unit: 'percent' },
            k2: { key: 'bandwidth', label: 'Băng thông (Gbps)', value: 1200, trend: 5.0, unit: 'number' },
            k3: { key: 'sites', label: 'Trạm BTS', value: 450, trend: 2.3, unit: 'number' },
            k4: { key: 'issues', label: 'Sự cố mạng', value: 5, trend: -1.0, unit: 'number' }
        },
        chart1: {
            title: 'Uptime mạng theo tháng',
            type: 'line',
            datasets: [
                { label: 'Uptime (%)', data: [99.5,99.6,99.7,99.8,99.8,99.9,99.8,99.7,99.8,99.9,99.8,99.9], color: '#10b981', unit: 'percent' }
            ]
        },
        chart2: {
            title: 'Phân bổ hạ tầng',
            type: 'doughnut',
            labels: ['Trạm BTS','Cáp quang','Data Center'],
            data: [40, 35, 25],
            colors: ['#3b82f6','#f59e0b','#10b981'],
            unit: 'number'
        },
        table: {
            title: 'Hiệu quả hạ tầng mạng',
            columns: ['Hạ tầng','Loại','Số lượng','Chi phí (VND)','Tỷ lệ uptime (%)','Trạng thái'],
            rows: [
                { name: 'Trạm BTS 5G', category: 'Trạm BTS', sold: 200, revenue: 500000000, rate: 99.9, status: 'active' },
                { name: 'Cáp quang FTTH', category: 'Cáp quang', sold: 150, revenue: 300000000, rate: 99.8, status: 'active' },
                { name: 'Data Center A', category: 'Data Center', sold: 50, revenue: 400000000, rate: 99.7, status: 'active' },
                { name: 'Trạm BTS 4G', category: 'Trạm BTS', sold: 100, revenue: 200000000, rate: 99.6, status: 'pending' },
                { name: 'Hệ thống SDN', category: 'Mạng ảo hóa', sold: 20, revenue: 150000000, rate: 99.5, status: 'active' }
            ]
        }
    },
    software_games: {
        kpis: {
            k1: { key: 'revenue', label: 'Doanh thu phần mềm & game', value: 850000000, trend: 4.5, unit: 'currency' },
            k2: { key: 'downloads', label: 'Lượt tải', value: 15000, trend: 6.2, unit: 'number' },
            k3: { key: 'active_users', label: 'Người dùng hoạt động', value: 8500, trend: 3.8, unit: 'number' },
            k4: { key: 'retention', label: 'Tỷ lệ giữ chân (%)', value: 65.5, trend: 1.2, unit: 'percent' }
        },
        chart1: {
            title: 'Doanh thu phần mềm & game theo tháng',
            type: 'bar',
            datasets: [
                { label: 'Doanh thu', data: [600000000,650000000,700000000,750000000,800000000,850000000,900000000,950000000,900000000,950000000,1000000000,1100000000], color: '#3b82f6', unit: 'currency' }
            ]
        },
        chart2: {
            title: 'Phân bổ loại sản phẩm',
            type: 'doughnut',
            labels: ['Game Mobile','Phần mềm','Game PC'],
            data: [50, 30, 20],
            colors: ['#3b82f6','#10b981','#f59e0b'],
            unit: 'number'
        },
        table: {
            title: 'Hiệu quả phần mềm & game',
            columns: ['Sản phẩm','Loại','Lượt tải','Doanh thu','Tăng trưởng (%)','Trạng thái'],
            rows: [
                { name: 'Game Mobile X', category: 'Game Mobile', sold: 5000, revenue: 250000000, rate: 90, status: 'active' },
                { name: 'Ứng dụng quản lý', category: 'Phần mềm', sold: 2000, revenue: 200000000, rate: 85, status: 'active' },
                { name: 'Game PC Y', category: 'Game PC', sold: 1500, revenue: 150000000, rate: 80, status: 'active' },
                { name: 'Game Mobile Z', category: 'Game Mobile', sold: 1000, revenue: 100000000, rate: 75, status: 'pending' },
                { name: 'Phần mềm AI', category: 'Phần mềm', sold: 500, revenue: 80000000, rate: 70, status: 'active' }
            ]
        }
    },
    finance: {
        kpis: {
            k1: { key: 'revenue', label: 'Doanh thu', value: 2450000000, trend: 12.5, unit: 'currency' },
            k2: { key: 'expense', label: 'Chi phí', value: 1720000000, trend: 5.2, unit: 'currency' },
            k3: { key: 'profit', label: 'Lợi nhuận', value: 730000000, trend: 7.1, unit: 'currency' },
            k4: { key: 'margin', label: 'Biên lợi nhuận', value: 22.9, trend: 0.6, unit: 'percent' }
        },
        chart1: {
            title: 'Doanh thu - Chi phí - Lợi nhuận',
            type: 'line',
            datasets: [
                { label: 'Doanh thu', data: [2100000000,2300000000,2450000000,2200000000,2650000000,2800000000,2750000000,2900000000,3000000000,3200000000,3150000000,3350000000], color: '#3b82f6' },
                { label: 'Chi phí', data: [1500000000,1600000000,1700000000,1650000000,1800000000,1850000000,1820000000,1900000000,1950000000,2050000000,2020000000,2100000000], color: '#ef4444' },
                { label: 'Lợi nhuận', data: [600000000,700000000,750000000,550000000,850000000,950000000,930000000,1000000000,1050000000,1150000000,1130000000,1250000000], color: '#10b981' }
            ]
        },
        chart2: {
            title: 'Cơ cấu chi phí',
            type: 'doughnut',
            labels: ['Marketing','Nhân sự','Vận hành','Khác'],
            data: [35, 30, 25, 10],
            colors: ['#3b82f6','#10b981','#f59e0b','#94a3b8'],
            unit: 'number'
        },
        table: {
            title: 'Giao dịch gần đây',
            columns: ['Ngày','Loại','Số tiền','Ghi chú','Trạng thái','Người duyệt'],
            rows: [
                { name: '2025-06-01', category: 'Thu', sold: 0, revenue: 1250000000, rate: 0, status: 'active', note: 'Thanh toán dịch vụ khách hàng A', approver: 'Kế toán' },
                { name: '2025-06-03', category: 'Chi', sold: 0, revenue: -320000000, rate: 0, status: 'pending', note: 'Chi phí bảo trì hạ tầng', approver: 'TP Vận hành' },
                { name: '2025-06-05', category: 'Chi', sold: 0, revenue: -180000000, rate: 0, status: 'active', note: 'Chi phí quảng cáo', approver: 'TP Marketing' },
                { name: '2025-06-07', category: 'Thu', sold: 0, revenue: 850000000, rate: 0, status: 'active', note: 'Thanh toán game Mobile X', approver: 'Kế toán' }
            ]
        }
    },
    reports: {
        kpis: {
            k1: { key: 'exports', label: 'Báo cáo đã xuất', value: 28, trend: 1.2, unit: 'number' },
            k2: { key: 'scheduled', label: 'Theo lịch', value: 12, trend: 0.8, unit: 'number' },
            k3: { key: 'views', label: 'Lượt xem', value: 540, trend: 2.1, unit: 'number' },
            k4: { key: 'error_rate', label: 'Lỗi xuất (%)', value: 1.6, trend: -0.3, unit: 'percent' }
        },
        chart1: {
            title: 'Báo cáo đã xuất theo tháng',
            type: 'bar',
            datasets: [
                { label: 'Số báo cáo', data: [12,14,11,9,13,16,18,15,19,20,22,24], color: '#60a5fa', unit: 'number' }
            ]
        },
        chart2: {
            title: 'Loại báo cáo',
            type: 'doughnut',
            labels: ['PDF','Excel','CSV'],
            data: [42, 36, 22],
            colors: ['#3b82f6','#10b981','#f59e0b'],
            unit: 'number'
        },
        table: {
            title: 'Nhật ký báo cáo gần đây',
            columns: ['Ngày','Loại','Mức ảnh hưởng','Ghi chú','Trạng thái','Xử lý bởi'],
            rows: [
                { name: '2025-09-06', category: 'PDF', revenue: 0, note: 'Báo cáo hiệu suất mạng tháng 8', status: 'active', approver: 'Hệ thống' },
                { name: '2025-09-05', category: 'Excel', revenue: 0, note: 'Báo cáo doanh thu dịch vụ Q3', status: 'active', approver: 'Hệ thống' },
                { name: '2025-09-04', category: 'CSV', revenue: 0, note: 'Báo cáo lượt tải game', status: 'active', approver: 'Hệ thống' },
                { name: '2025-09-03', category: 'PDF', revenue: 0, note: 'Báo cáo khách hàng theo kênh', status: 'active', approver: 'Hệ thống' },
                { name: '2025-09-02', category: 'Excel', revenue: 0, note: 'Báo cáo danh sách khách hàng VIP', status: 'active', approver: 'Hệ thống' }
            ]
        }
    },
    alerts: {
        kpis: {
            k1: { key: 'alerts_total', label: 'Tổng cảnh báo', value: 18, trend: 1.6, unit: 'number' },
            k2: { key: 'alerts_open', label: 'Chưa xử lý', value: 5, trend: -0.8, unit: 'number' },
            k3: { key: 'alerts_high', label: 'Mức cao', value: 3, trend: 0.0, unit: 'number' },
            k4: { key: 'sla', label: 'SLA TB (giờ)', value: 6, trend: -0.5, unit: 'number' }
        },
        chart1: {
            title: 'Số cảnh báo theo tháng',
            type: 'bar',
            datasets: [
                { label: 'Cảnh báo', data: [2,1,1,0,2,1,3,1,2,1,2,2], color: '#f59e0b', unit: 'number' }
            ]
        },
        chart2: {
            title: 'Phân bổ mức độ',
            type: 'doughnut',
            labels: ['Cao','Trung bình','Thấp'],
            data: [3, 7, 8],
            colors: ['#ef4444','#f59e0b','#10b981'],
            unit: 'number'
        },
        table: {
            title: 'Nhật ký cảnh báo gần đây',
            columns: ['Ngày','Loại','Mức ảnh hưởng','Ghi chú','Trạng thái','Xử lý bởi'],
            rows: [
                { name: '2025-01-15', category: 'Hạ tầng', revenue: 0, note: 'Sự cố trạm BTS khu vực A', status: 'pending', approver: 'Hệ thống' },
                { name: '2025-01-14', category: 'Dịch vụ', revenue: 0, note: 'Tỷ lệ rời mạng tăng 2.5%', status: 'active', approver: 'Hệ thống' },
                { name: '2025-01-13', category: 'Hạ tầng', revenue: 0, note: 'Lỗi cáp quang khu vực B', status: 'active', approver: 'Hệ thống' },
                { name: '2025-01-12', category: 'Phần mềm', revenue: 0, note: 'Lỗi crash game Mobile X', status: 'pending', approver: 'Dev Team' },
                { name: '2025-01-11', category: 'Thanh toán', revenue: 0, note: 'Lỗi cổng thanh toán in-app', status: 'pending', approver: 'Dev Team' }
            ]
        }
    }
};

// Helpers
function getLocale() { return 'vi-VN'; }
function getCurrency() { return 'VND'; }
function getDecimals() { return 0; }

function formatCurrency(amount) {
    try {
        return new Intl.NumberFormat(getLocale(), { 
            style: 'currency', 
            currency: getCurrency(), 
            minimumFractionDigits: getDecimals(), 
            maximumFractionDigits: getDecimals() 
        }).format(amount);
    } catch {
        return `${amount}`;
    }
}
function formatNumber(num) {
    return new Intl.NumberFormat(getLocale(), { 
        minimumFractionDigits: getDecimals(), 
        maximumFractionDigits: getDecimals() 
    }).format(num);
}
function formatPercent(num) {
    const d = getDecimals();
    return `${Number(num).toFixed(d)}%`;
}
function getMultiplier(period) {
    switch(period) {
        case 'today': return 0.1;
        case 'week': return 0.3;
        case 'month': return 1;
        case 'quarter': return 3;
        case 'year': return 12;
        default: return 1;
    }
}

function getDepartmentMultiplier(department) {
    switch(department) {
        case 'all': return 1;
        case 'sales': return 0.4;
        case 'marketing': return 0.25;
        case 'ops': return 0.2;
        case 'finance': return 0.15;
        default: return 1;
    }
}

function applyDepartmentToValue(value, unit) {
    if (unit === 'percent') return value;
    return Math.max(0, Math.round(value * getDepartmentMultiplier(currentDepartment)));
}

function applyDepartmentToArray(arr, unit) {
    if (unit === 'percent') return [...arr];
    const multiplier = getDepartmentMultiplier(currentDepartment);
    return arr.map(v => Math.max(0, Math.round(v * multiplier)));
}

function getViewForTab(tab, period) {
    const src = baseData[tab] || baseData.overview;
    const multiplier = getMultiplier(period);

    const kpis = { ...src.kpis };
    const k1 = { ...kpis.k1 }, k2 = { ...kpis.k2 }, k3 = { ...kpis.k3 }, k4 = { ...kpis.k4 };
    const scale = (val, unit) => unit === 'percent' ? val : Math.max(0, Math.round(val * multiplier));
    k1.value = applyDepartmentToValue(scale(k1.value, k1.unit), k1.unit);
    k2.value = applyDepartmentToValue(scale(k2.value, k2.unit), k2.unit);
    k3.value = applyDepartmentToValue(scale(k3.value, k3.unit), k3.unit);
    k4.value = scale(k4.value, k4.unit);

    const chart1 = { title: src.chart1.title, type: src.chart1.type, dualAxis: !!src.chart1.dualAxis };
    chart1.labels = baseData.months.slice(0, src.chart1.datasets[0].data.length);
    chart1.datasets = src.chart1.datasets.map(ds => {
        const scaledData = ds.data.map(v => ds.label.includes('%') ? v : Math.max(0, Math.round(v * multiplier)));
        const departmentData = applyDepartmentToArray(scaledData, ds.unit || 'number');
        return {
            label: ds.label,
            data: departmentData,
            borderColor: ds.color,
            backgroundColor: (ds.color || '#3b82f6') + '33',
            yAxisID: ds.yAxisID || 'y',
            isPercent: (ds.label || '').includes('%')
        };
    });

    const chart2 = { title: src.chart2.title, type: src.chart2.type };
    chart2.labels = [...src.chart2.labels];
    chart2.data = applyDepartmentToArray([...src.chart2.data], src.chart2.unit);
    chart2.colors = [...src.chart2.colors];

    const table = { title: src.table.title, columns: [...src.table.columns] };
    table.rows = src.table.rows.map(r => ({
        ...r,
        sold: applyDepartmentToValue(r.sold, 'number'),
        revenue: applyDepartmentToValue(r.revenue, 'currency')
    }));

    return { kpis: { k1, k2, k3, k4 }, chart1, chart2, table };
}

let revenueChart, salesChannelChart;

function initializeCharts() {
    if (revenueChart) {
        revenueChart.destroy();
        revenueChart = null;
    }
    if (salesChannelChart) {
        salesChannelChart.destroy();
        salesChannelChart = null;
    }

    const revenueCanvas = document.getElementById('chart1Canvas');
    if (!revenueCanvas) return;
    const revenueCtx = revenueCanvas.getContext('2d');
    
    // Get target line plugins for overview charts
    const plugins = [];
    if (currentTab === 'overview') {
        const dept = getCurrentDepartment();
        const lvRev = resolveKpiLevel('overview', 'revenue', dept, CURRENT_SCENARIO);
        const lvPro = resolveKpiLevel('overview', 'profit', dept, CURRENT_SCENARIO);
        if (lvRev && typeof lvRev.target === 'number') {
            plugins.push(targetLinePlugin(lvRev.target, 'y', '#3b82f6', 'Doanh thu - Target'));
        }
        if (lvPro && typeof lvPro.target === 'number') {
            plugins.push(targetLinePlugin(lvPro.target, 'y1', '#10b981', 'Lợi nhuận - Target'));
        }
    }
    
    revenueChart = new Chart(revenueCtx, {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { position: 'top', labels: { usePointStyle: true, padding: 20 } },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const dsLabel = ctx.dataset.label || '';
                            const val = ctx.parsed.y;
                            if (dsLabel.includes('%')) return `${dsLabel}: ${val}%`;
                            if (dsLabel.includes('ARPU') || dsLabel.includes('Doanh thu') || dsLabel.includes('Lợi nhuận') || dsLabel.includes('Chi phí'))
                                return `${dsLabel}: ${formatCurrency(val)}`;
                            return `${dsLabel}: ${formatNumber(val)}`;
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: true },
                    y1: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false } }
                }
            }
        },
        plugins: plugins
    });

    const salesCanvas = document.getElementById('chart2Canvas');
    if (!salesCanvas) return;
    const salesCtx = salesCanvas.getContext('2d');
    salesChannelChart = new Chart(salesCtx, {
        type: 'doughnut',
        data: { labels: [], datasets: [{ data: [], backgroundColor: [], borderWidth: 0, cutout: '70%' }] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.label}: ${ctx.parsed} %`
                    }
                }
            }
        }
    });
}

function applyAxisTheme(chart, conf) {
    const theme = getThemeColors();
    const hasPercentY1 = (conf.datasets || []).some(ds => ds.yAxisID === 'y1' && ds.isPercent);
    chart.options.scales.y = {
        beginAtZero: true,
        grid: { color: theme.gridColor },
        ticks: {
            color: theme.tickColor,
            callback: (v) => conf.datasets.some(d => (d.label || '').includes('Doanh thu') || (d.label || '').includes('Lợi nhuận') || (d.label || '').includes('Chi phí')) ? formatCurrency(v) : formatNumber(v)
        }
    };
    chart.options.scales.y1 = conf.dualAxis ? {
        beginAtZero: true,
        position: 'right',
        grid: { drawOnChartArea: false, color: theme.gridColor },
        ticks: {
            color: theme.tickColor,
            callback: (v) => hasPercentY1 ? `${v}%` : formatNumber(v)
        }
    } : { display: false };
}

function renderChart1(conf) {
    if (!revenueChart) return;
    const chartTitleEl = document.getElementById('chart1Title');
    if (chartTitleEl) chartTitleEl.textContent = conf.title;
    revenueChart.config.type = defaultChartType === 'bar' ? 'bar' : conf.type;
    revenueChart.data.labels = conf.labels;
    revenueChart.data.datasets = conf.datasets.map(ds => ({
        label: ds.label,
        data: ds.data,
        borderColor: ds.borderColor,
        backgroundColor: ds.backgroundColor,
        borderWidth: 3,
        fill: revenueChart.config.type === 'line',
        tension: revenueChart.config.type === 'line' ? 0.4 : 0,
        yAxisID: ds.yAxisID || 'y'
    }));
    applyAxisTheme(revenueChart, conf);
    revenueChart.update();
}

function renderChart2(conf) {
    if (!salesChannelChart) return;
    const chartTitleEl = document.getElementById('chart2Title');
    if (chartTitleEl) chartTitleEl.textContent = conf.title;
    salesChannelChart.config.type = conf.type;
    salesChannelChart.data.labels = conf.labels;
    salesChannelChart.data.datasets[0].data = conf.data;
    salesChannelChart.data.datasets[0].backgroundColor = conf.colors;
    salesChannelChart.update();
}

function renderKPIValues(kpis) {
    const map = [
        { id: 'revenueValue', trendId: 'revenueTrend', item: kpis.k1 },
        { id: 'customersValue', trendId: 'customersTrend', item: kpis.k2 },
        { id: 'subscribersValue', trendId: 'subscribersTrend', item: kpis.k3 },
        { id: 'supportValue', trendId: 'supportTrend', item: kpis.k4 }
    ];
    const labelMap = ['kpi1Label', 'kpi2Label', 'kpi3Label', 'kpi4Label'];
    map.forEach((m, idx) => {
        const valueEl = document.getElementById(m.id);
        const trendEl = document.getElementById(m.trendId);
        const labelEl = document.getElementById(labelMap[idx]);
        if (labelEl) labelEl.textContent = m.item.label;
        const formatted = m.item.unit === 'currency' ? formatCurrency(m.item.value)
            : m.item.unit === 'percent' ? `${m.item.value}%`
            : formatNumber(m.item.value);
        if (valueEl) valueEl.textContent = formatted;
        if (trendEl) trendEl.textContent = `${m.item.trend > 0 ? '+' : ''}${m.item.trend}%`;

        // Apply KPI status colors for all tabs
        if (valueEl) {
            const cardEl = valueEl.closest('.kpi-card');
            if (cardEl) {
                // Map the KPI key based on the current tab and item properties
                let statusKey = m.item.key;
                
                // Handle special mappings for different tabs
                if (currentTab === 'overview') {
                    if (m.item.key === 'support') statusKey = 'support';
                } else if (currentTab === 'customers') {
                    if (m.item.key === 'satisfaction') statusKey = 'satisfaction';
                    if (m.item.key === 'support_tickets') statusKey = 'support_tickets';
                }
                
                // Check if we have configuration for this KPI
                const cfg = resolveKpiLevel(currentTab, statusKey, getCurrentDepartment(), CURRENT_SCENARIO);
                if (cfg) {
                    const status = getKpiStatus(currentTab, statusKey, m.item.value);
                    cardEl.classList.remove('good','warn','bad');
                    cardEl.classList.add(status);
                    
                    // Generate alert if KPI is in warn/bad status
                    maybePushAlert(currentTab, statusKey, m.item.value);
                }
            }
        }
    });
}

function renderTable(tableConf) {
    const titleEl = document.getElementById('tableTitle');
    if (titleEl) titleEl.textContent = tableConf.title;
    const headerRow = document.getElementById('tableHeaderRow');
    if (headerRow) {
        headerRow.innerHTML = '';
        tableConf.columns.forEach(c => {
            const th = document.createElement('th');
            th.textContent = c;
            headerRow.appendChild(th);
        });
    }
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    tableConf.rows.forEach(row => {
        const tr = document.createElement('tr');
        const cells = [];
        if (tableConf.columns[0] === 'Ngày') {
            cells.push(`<td><strong>${row.name}</strong></td>`);
            cells.push(`<td>${row.category}</td>`);
            cells.push(`<td>${formatCurrency(row.revenue)}</td>`);
            cells.push(`<td>${row.note || ''}</td>`);
            cells.push(`<td><span class="status-badge status-${row.status}">${getStatusText(row.status)}</span></td>`);
            cells.push(`<td>${row.approver || ''}</td>`);
        } else {
            cells.push(`<td><strong>${row.name}</strong></td>`);
            cells.push(`<td>${row.category}</td>`);
            cells.push(`<td>${formatNumber(row.sold)}</td>`);
            cells.push(`<td>${formatCurrency(row.revenue)}</td>`);
            cells.push(`<td>${row.rate}%</td>`);
            cells.push(`<td><span class="status-badge status-${row.status}">${getStatusText(row.status)}</span></td>`);
        }
        tr.innerHTML = cells.join('');
        tbody.appendChild(tr);
    });
}

function getStatusText(status) {
    switch(status) {
        case 'active': return 'Hoạt động';
        case 'inactive': return 'Ngừng hoạt động';
        case 'pending': return 'Chờ duyệt';
        default: return status;
    }
}

function setupTableSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim().toLowerCase();
        const view = getViewForTab(currentTab, currentPeriod);
        let rows = view.table.rows;
        if (q) {
            rows = rows.filter(r =>
                (r.name && r.name.toLowerCase().includes(q)) ||
                (r.category && r.category.toLowerCase().includes(q))
            );
        }
        renderTable({ ...view.table, rows });
    });
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    if (!notification || !notificationText) return;
    notificationText.textContent = message;
    notification.classList.add('show');
    setTimeout(() => { notification.classList.remove('show'); }, 3000);
}

function showRouteLoader() {
    const rl = document.getElementById('routeLoader');
    if (rl) rl.style.display = 'flex';
}
function hideRouteLoader() {
    const rl = document.getElementById('routeLoader');
    if (rl) rl.style.display = 'none';
}

function refreshData() {
    const refreshBtn = document.getElementById('refreshBtn');
    const originalHTML = refreshBtn ? refreshBtn.innerHTML : '';
    if (refreshBtn) { 
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang làm mới...'; 
        refreshBtn.disabled = true; 
    }
    setTimeout(() => {
        renderForState();
        if (refreshBtn) { 
            refreshBtn.innerHTML = originalHTML; 
            refreshBtn.disabled = false; 
        }
        showNotification('Đã làm mới dữ liệu thành công!');
    }, 1000);
}

function exportData() {
    const exportBtn = document.getElementById('exportBtn');
    const originalHTML = exportBtn ? exportBtn.innerHTML : '';
    if (exportBtn) { 
        exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xuất...'; 
        exportBtn.disabled = true; 
    }
    setTimeout(() => {
        const view = getViewForTab(currentTab, currentPeriod);
        const wb = XLSX.utils.book_new();
        const excelData = [];
        excelData.push(view.table.columns);
        view.table.rows.forEach(r => {
            const cells = [];
            if (view.table.columns[0] === 'Ngày') {
                cells.push(r.name, r.category, r.revenue, r.note || '', getStatusText(r.status), r.approver || '');
            } else {
                cells.push(r.name, r.category, r.sold, r.revenue, `${r.rate}%`, getStatusText(r.status));
            }
            excelData.push(cells);
        });
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const col = XLSX.utils.encode_col(C);
            if (view.table.columns[C] && (view.table.columns[C].includes('Doanh thu') || view.table.columns[C].includes('Số tiền'))) {
                ws[`!cols`] = ws[`!cols`] || [];
                ws[`!cols`][C] = { wch: 15 };
            }
        }
        XLSX.utils.book_append_sheet(wb, ws, "Báo cáo");
        const fileName = `bao_cao_${currentTab}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
        if (exportBtn) { 
            exportBtn.innerHTML = originalHTML; 
            exportBtn.disabled = false; 
        }
        showNotification('Đã xuất báo cáo Excel thành công!');
    }, 600);
}

function setupChartDownloads() {
    const btn1 = document.getElementById('downloadChart1');
    const btn2 = document.getElementById('downloadChart2');
    if (btn1) btn1.addEventListener('click', () => downloadChart(revenueChart, `chart1_${currentTab}.png`));
    if (btn2) btn2.addEventListener('click', () => downloadChart(salesChannelChart, `chart2_${currentTab}.png`));
}
function downloadChart(chart, filename) {
    if (!chart) return;
    const a = document.createElement('a');
    a.href = chart.toBase64Image('image/png', 1);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function handleNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (link.classList.contains('active')) return;
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            const nextTab = link.getAttribute('data-tab') || 'overview';
            showRouteLoader();
            setTimeout(() => {
                currentTab = nextTab;
                updateHeaderByTab(currentTab);
                toggleSectionsByTab();
                renderForState();
                const headerTitle = document.querySelector('.header-left h2');
                showNotification(`Đã chuyển đến ${headerTitle ? headerTitle.textContent : 'mục đã chọn'}`);
                hideRouteLoader();
            }, 400);
        });
    });
}

function toggleSectionsByTab() {
    const kpi = document.getElementById('kpiGrid');
    const charts = document.getElementById('chartsGrid');
    const table = document.getElementById('tableSection');
    const settings = document.getElementById('settings');
    const alerts = document.getElementById('alerts');
    
    if (currentTab === 'settings') {
        if (kpi) kpi.style.display = 'none';
        if (charts) charts.style.display = 'none';
        if (table) table.style.display = 'none';
        if (settings) settings.style.display = 'block';
        if (alerts) alerts.style.display = 'none';
        renderKpiLevelsForm();
    } else if (currentTab === 'alerts') {
        if (kpi) kpi.style.display = 'none';
        if (charts) charts.style.display = 'none';
        if (table) table.style.display = 'none';
        if (settings) settings.style.display = 'none';
        if (alerts) alerts.style.display = 'block';
        renderAlertsTab();
    } else {
        if (kpi) kpi.style.display = 'grid';
        if (charts) charts.style.display = 'grid';
        if (table) table.style.display = 'block';
        if (settings) settings.style.display = 'none';
        if (alerts) alerts.style.display = 'none';
    }
}

function updateHeaderByTab(tab) {
    const headerTitle = document.querySelector('.header-left h2');
    const headerDesc = document.querySelector('.header-left p');
    const map = {
        overview: ['Dashboard Tổng quan', 'Chào mừng trở lại! Đây là tóm tắt hiệu suất kinh doanh & dịch vụ viễn thông của bạn.'],
        kpi: ['Dashboard KPI', 'Theo dõi và đánh giá các chỉ số hiệu suất chính của doanh nghiệp.'],
        services: ['Quản lý Dịch vụ', 'Theo dõi hiệu suất các dịch vụ viễn thông như di động, internet, truyền hình.'],
        customers: ['Quản lý Khách hàng & Hỗ trợ', 'Theo dõi hành vi khách hàng và hiệu quả hỗ trợ.'],
        solutions: ['Quản lý Giải pháp CNTT', 'Theo dõi hiệu quả các giải pháp CNTT như cloud, bảo mật, phần mềm.'],
        infrastructure: ['Quản lý Hạ tầng mạng', 'Theo dõi hiệu suất hạ tầng mạng như trạm BTS, cáp quang, data center.'],
        finance: ['Quản lý Tài chính', 'Theo dõi doanh thu, chi phí và báo cáo tài chính.'],
        reports: ['Báo cáo & Phân tích', 'Tạo và xem các báo cáo chi tiết về hoạt động kinh doanh.'],
        alerts: ['Quản lý Thông báo', 'Theo dõi tình trạng cảnh báo và sự cố theo thời gian thực.'],
        software_games: ['Quản lý Phần mềm & Game', 'Theo dõi hiệu suất kinh doanh phần mềm và game, bao gồm lượt tải và doanh thu.']
    };
    const [t, d] = map[tab] || map.overview;
    if (headerTitle) headerTitle.textContent = t;
    if (headerDesc) headerDesc.textContent = d;
}

function handlePeriodChange() {
    const periodSelector = document.getElementById('periodSelector');
    if (!periodSelector) return;
    periodSelector.addEventListener('change', (e) => {
        currentPeriod = e.target.value;
        localStorage.setItem('currentPeriod', currentPeriod);
        renderForState();
        showNotification(`Đã cập nhật dữ liệu cho ${e.target.options[e.target.selectedIndex].text}`);
    });
}

function handleDepartmentChange() {
    const departmentFilter = document.getElementById('departmentFilter');
    if (!departmentFilter) return;
    departmentFilter.addEventListener('change', (e) => {
        currentDepartment = e.target.value;
        localStorage.setItem('currentDepartment', currentDepartment);
        renderForState();
        showNotification('Đã áp dụng bộ lọc phòng ban.');
    });
}

function handleChartTypeToggle() {
    const chartTypeBtn = document.getElementById('chartTypeBtn');
    if (!chartTypeBtn) return;
    chartTypeBtn.addEventListener('click', () => {
        if (!revenueChart) return;
        defaultChartType = revenueChart.config.type === 'line' ? 'bar' : 'line';
        revenueChart.config.type = defaultChartType;
        chartTypeBtn.innerHTML = defaultChartType === 'line' ? '<i class="fas fa-chart-line"></i> Line Chart' : '<i class="fas fa-chart-bar"></i> Bar Chart';
        revenueChart.update();
    });
}

function startRealTimeUpdates() {
    if (realtimeIntervalId) { clearInterval(realtimeIntervalId); realtimeIntervalId = null; }
    if (realtimeEnabled) {
        realtimeIntervalId = setInterval(() => { renderForState(); }, 30000);
    }
}

function addMobileMenu() {
    const header = document.querySelector('.header-left');
    if (!header) return;
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.className = 'btn btn-outline mobile-menu-btn';
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    mobileMenuBtn.style.display = 'none';
    header.appendChild(mobileMenuBtn);
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 1024px) {
            .mobile-menu-btn { display: inline-flex !important; position: fixed; top: 1rem; left: 1rem; z-index: 1001; background: var(--white); box-shadow: var(--shadow-md); }
            .sidebar { position: fixed; left: -280px; top: 0; height: 100vh; z-index: 1000; transition: left 0.3s ease; }
            .sidebar.open { left: 0; }
            .overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); z-index: 999; display: none; }
            .overlay.show { display: block; }
        }
    `;
    document.head.appendChild(style);
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);
    mobileMenuBtn.addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;
        sidebar.classList.toggle('open');
        overlay.classList.toggle('show');
    });
    overlay.addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
    });
}

function addKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') { e.preventDefault(); refreshData(); }
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') { e.preventDefault(); exportData(); }
        if (e.key >= '1' && e.key <= '9') {
            const navLinks = document.querySelectorAll('.nav-link');
            const index = parseInt(e.key) - 1;
            if (navLinks[index]) { navLinks[index].click(); }
        }
    });
}

function renderForState() {
    const periodSelector = document.getElementById('periodSelector');
    const departmentFilter = document.getElementById('departmentFilter');
    if (periodSelector && periodSelector.value !== currentPeriod) periodSelector.value = currentPeriod;
    if (departmentFilter && departmentFilter.value !== currentDepartment) departmentFilter.value = currentDepartment;

    const view = getViewForTab(currentTab, currentPeriod);
    renderKPIValues(view.kpis);
    renderChart1(view.chart1);
    renderChart2(view.chart2);
    renderTable(view.table);

    // Ensure target lines are displayed after rendering
    refreshChartsWithTargetLines();
}

function addDarkModeToggle() {
    const darkModeBtn = document.createElement('button');
    darkModeBtn.className = 'btn btn-outline';
    darkModeBtn.innerHTML = '<i class="fas fa-moon"></i>';
    darkModeBtn.id = 'darkModeBtn';
    const headerRight = document.querySelector('.header-right');
    if (!headerRight) return;
    headerRight.insertBefore(darkModeBtn, headerRight.firstChild);
    const applyTheme = (isDark) => {
        document.body.classList.toggle('dark-mode', isDark);
        darkModeBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        const view = getViewForTab(currentTab, currentPeriod);
        if (revenueChart) { applyAxisTheme(revenueChart, view.chart1); revenueChart.update(); }
    };
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(stored ? stored === 'dark' : prefersDark);
    darkModeBtn.addEventListener('click', () => {
        const isDark = !document.body.classList.contains('dark-mode');
        applyTheme(isDark);
        showNotification(isDark ? 'Đã bật chế độ tối' : 'Đã tắt chế độ tối');
    });
}

function logPerformance() {
    if (window.performance && window.performance.timing && window.performance.timing.loadEventEnd) {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        console.log(`Dashboard loaded in ${loadTime}ms`);
    }
}

function initializeDashboard() {
    const periodSelector = document.getElementById('periodSelector');
    const departmentFilter = document.getElementById('departmentFilter');
    if (periodSelector) periodSelector.value = currentPeriod;
    if (departmentFilter) departmentFilter.value = currentDepartment;
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(l => l.classList.remove('active'));
    const active = Array.from(navLinks).find(l => l.getAttribute('data-tab') === currentTab) || navLinks[0];
    if (active) active.classList.add('active');

    initThemeToggle();
    initializeCharts();
    handleNavigation();
    handlePeriodChange();
    handleDepartmentChange();
    handleChartTypeToggle();
    setupChartDownloads();
    setupTableSearch();
    addMobileMenu();
    addKeyboardShortcuts();
    startRealTimeUpdates();
    
    const exportBtn = document.getElementById('exportBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    if (exportBtn) exportBtn.addEventListener('click', exportData);
    if (refreshBtn) refreshBtn.addEventListener('click', refreshData);
    
    toggleSectionsByTab();
    renderForState();
    const elements = document.querySelectorAll('.fade-in');
    elements.forEach((element, index) => { element.style.animationDelay = `${index * 0.1}s`; });
    console.log('Dashboard initialized successfully!');
}

let resizeTimeout;
function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (revenueChart) revenueChart.resize();
        if (salesChannelChart) salesChannelChart.resize();
    }, 250);
}

// ========== [Accordion Functionality] ==========
function initializeAccordions() {
    document.querySelectorAll('.accordion .acc-head').forEach(head => {
        head.addEventListener('click', function() {
            const accordion = this.closest('.accordion');
            const isOpen = accordion.classList.contains('open');
            
            // Toggle current accordion
            accordion.classList.toggle('open', !isOpen);
            
            // Add smooth animation
            const body = accordion.querySelector('.acc-body');
            if (body) {
                if (isOpen) {
                    body.style.maxHeight = '0px';
                    body.style.opacity = '0';
                } else {
                    body.style.maxHeight = body.scrollHeight + 'px';
                    body.style.opacity = '1';
                }
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    initializeAccordions();
});
window.addEventListener('load', logPerformance);
window.addEventListener('resize', handleResize);