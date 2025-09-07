// Global state
        let currentTab = 'overview';
        let currentPeriod = 'month';
        let currentDepartment = 'all';
        let defaultChartType = 'line';
        let realtimeEnabled = true;
        let realtimeIntervalId = null;

        // Settings persistence
        const SETTINGS_KEY = 'bp_settings';
        function loadSettings() {
            try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; } catch { return {}; }
        }
        function saveSettings(obj) {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(obj));
        }
        function getDefaultSettings() {
            return { defaultTab: 'overview', defaultPeriod: 'month', defaultChartType: 'line', realtime: true };
        }
        function applySettingsToState() {
            const s = { ...getDefaultSettings(), ...loadSettings() };
            currentTab = s.defaultTab;
            currentPeriod = s.defaultPeriod;
            defaultChartType = s.defaultChartType;
            realtimeEnabled = !!s.realtime;
        }
        function syncSettingsUI() {
            const s = { defaultTab: currentTab, defaultPeriod: currentPeriod, defaultChartType: defaultChartType, realtime: realtimeEnabled };
            const tabSel = document.getElementById('settingDefaultTab');
            const perSel = document.getElementById('settingDefaultPeriod');
            const chartSel = document.getElementById('settingDefaultChartType');
            const realtimeCb = document.getElementById('settingRealtime');
            if (tabSel) tabSel.value = s.defaultTab;
            if (perSel) perSel.value = s.defaultPeriod;
            if (chartSel) chartSel.value = s.defaultChartType;
            if (realtimeCb) realtimeCb.checked = s.realtime;
        }
        function wireSettingsActions() {
            const saveBtn = document.getElementById('settingsSaveBtn');
            const resetBtn = document.getElementById('settingsResetBtn');
            if (saveBtn) saveBtn.addEventListener('click', () => {
                const tabSel = document.getElementById('settingDefaultTab');
                const perSel = document.getElementById('settingDefaultPeriod');
                const chartSel = document.getElementById('settingDefaultChartType');
                const realtimeCb = document.getElementById('settingRealtime');
                const payload = {
                    defaultTab: tabSel ? tabSel.value : currentTab,
                    defaultPeriod: perSel ? perSel.value : currentPeriod,
                    defaultChartType: chartSel ? chartSel.value : defaultChartType,
                    realtime: realtimeCb ? realtimeCb.checked : realtimeEnabled
                };
                saveSettings(payload);
                applySettingsToState();
                // reflect to UI
                const periodSelector = document.getElementById('periodSelector');
                if (periodSelector) periodSelector.value = currentPeriod;
                const navLinks = document.querySelectorAll('.nav-link');
                navLinks.forEach(l => l.classList.remove('active'));
                const active = Array.from(navLinks).find(l => l.getAttribute('data-tab') === currentTab);
                if (active) active.classList.add('active');
                renderForState();
                showNotification('Đã lưu cài đặt.');
            });
            if (resetBtn) resetBtn.addEventListener('click', () => {
                const def = getDefaultSettings();
                saveSettings(def);
                applySettingsToState();
                syncSettingsUI();
                const periodSelector = document.getElementById('periodSelector');
                if (periodSelector) periodSelector.value = currentPeriod;
                showNotification('Đã khôi phục mặc định.');
            });
        }

        // Utility: theme-aware chart colors
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
                    k1: { key: 'revenue',    label: 'Doanh thu',        value: 3200000000, trend: 5.2, unit: 'currency' },
                    k2: { key: 'customers',  label: 'Khách hàng mới',   value: 1240,       trend: 3.1, unit: 'number'   },
                    k3: { key: 'orders',     label: 'Đơn hàng',         value: 980,        trend: -1.4, unit: 'number'   },
                    k4: { key: 'conversion', label: 'Tỷ lệ chuyển đổi', value: 3.4,        trend: 0.6, unit: 'percent'  }
                },
                chart1: {
                    title: 'Doanh thu & Lợi nhuận',
                    type: 'line',
                    dualAxis: true,
                    datasets: [
                        { label: 'Doanh thu', data: [2100000000,2300000000,2500000000,2700000000,3000000000,3200000000], color: '#3b82f6', unit: 'currency' },
                        { label: 'Lợi nhuận', data: [420000000,460000000,510000000,550000000,600000000,640000000], color: '#10b981', unit: 'currency', yAxisID: 'y1' }
                    ]
                },
                chart2: {
                    title: 'Kênh bán hàng',
                    type: 'doughnut',
                    labels: ['Online','Cửa hàng','Đối tác'],
                    data: [48, 34, 18],
                    colors: ['#60a5fa','#f59e0b','#10b981'],
                    unit: 'number'
                },
                table: {
                    title: 'Sản phẩm bán chạy',
                    columns: ['Sản phẩm','Nhóm','Đã bán','Doanh thu','Tỷ lệ đạt (%)','Trạng thái'],
                    rows: [
                        { name: 'Áo thun oversize', category: 'Thời trang', sold: 420, revenue: 125000000, rate: 92, status: 'active' },
                        { name: 'Quần jean slim',   category: 'Thời trang', sold: 310, revenue: 98000000, rate: 85, status: 'active' },
                        { name: 'Giày chạy bộ X',   category: 'Giày dép',   sold: 205, revenue: 85000000, rate: 78, status: 'pending' },
                        { name: 'Túi xách nữ',     category: 'Phụ kiện',   sold: 180, revenue: 72000000, rate: 70, status: 'active' },
                        { name: 'Đồng hồ nam',     category: 'Phụ kiện',   sold: 95,  revenue: 47500000, rate: 65, status: 'inactive' }
                    ]
                }
            },
            kpi: {
                kpis: {
                    k1: { key: 'kpi_done',    label: 'KPI hoàn thành',   value: 28,   trend: 12.5, unit: 'number'  },
                    k2: { key: 'kpi_pending', label: 'KPI đang chờ',     value: 15,   trend: -8.3, unit: 'number'  },
                    k3: { key: 'on_time',     label: 'Đúng hạn',         value: 86.4, trend: 3.7,  unit: 'percent' },
                    k4: { key: 'over_target', label: 'Vượt mục tiêu',    value: 12.8, trend: 2.1,  unit: 'percent' }
                },
                chart1: {
                    title: 'Tiến độ KPI theo tháng',
                    type: 'line',
                    datasets: [
                        { label: 'Hoàn thành',       data: [22,24,26,25,27,28,30,32,28,26,28,30], color: '#10b981', unit: 'number' },
                        { label: 'Chưa hoàn thành',  data: [18,16,14,15,13,12,10,8,12,14,12,10],  color: '#ef4444', unit: 'number' }
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
                        { name: 'Tăng doanh thu Q3',        category: 'Doanh thu',   sold: 85,  revenue: 50000000, rate: 112.5, status: 'active' },
                        { name: 'Tăng khách hàng mới',      category: 'Khách hàng',  sold: 92,  revenue: 30000000, rate: 108.7, status: 'active' },
                        { name: 'Tối ưu quy trình',         category: 'Vận hành',    sold: 78,  revenue: 25000000, rate: 95.2,  status: 'pending' },
                        { name: 'Giảm chi phí vận hành',    category: 'Tài chính',   sold: 65,  revenue: 40000000, rate: 87.3,  status: 'active' },
                        { name: 'Cải thiện chất lượng',     category: 'Vận hành',    sold: 45,  revenue: 20000000, rate: 72.1,  status: 'inactive' },
                        { name: 'Mở rộng thị trường',       category: 'Doanh thu',   sold: 38,  revenue: 60000000, rate: 63.8,  status: 'pending' }
                    ]
                }
            },
            alerts: {
                kpis: {
                    k1: { key: 'alerts_total', label: 'Tổng cảnh báo',   value: 18, trend: 1.6,  unit: 'number' },
                    k2: { key: 'alerts_open',  label: 'Chưa xử lý',     value: 5,  trend: -0.8, unit: 'number' },
                    k3: { key: 'alerts_high',  label: 'Mức cao',        value: 3,  trend: 0.0,  unit: 'number' },
                    k4: { key: 'sla',          label: 'SLA TB (giờ)',   value: 6,  trend: -0.5, unit: 'number' }
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
                        { name: '2025-01-15', category: 'Doanh thu',    revenue: 0, note: 'Doanh thu giảm 12% so với tháng trước',     status: 'pending',  approver: 'Hệ thống' },
                        { name: '2025-01-14', category: 'Chuyển đổi',  revenue: 0, note: 'Tỷ lệ CV < 2.5%',                          status: 'active',   approver: 'Hệ thống' },
                        { name: '2025-01-13', category: 'Đơn hàng',    revenue: 0, note: 'Tồn kho thấp nhóm Sản phẩm A',             status: 'active',   approver: 'Hệ thống' },
                        { name: '2025-01-12', category: 'Hệ thống',    revenue: 0, note: 'Thời gian phản hồi > 3 giây',              status: 'inactive', approver: 'IT Team' },
                        { name: '2025-01-11', category: 'Thanh toán',  revenue: 0, note: 'Lỗi gateway thanh toán Momo',              status: 'pending',  approver: 'Dev Team' },
                        { name: '2025-01-10', category: 'Khách hàng',  revenue: 0, note: 'Tăng đột biến khiếu nại chất lượng',       status: 'active',   approver: 'CS Team' }
                    ]
                }
            },
            sales: {
                kpis: {
                    k1: { key: 'gmv',     label: 'Doanh thu (GMV)', value: 3050000000, trend: 2.8,  unit: 'currency' },
                    k2: { key: 'orders',  label: 'Đơn hàng',        value: 1120,       trend: 1.9,  unit: 'number'   },
                    k3: { key: 'aov',     label: 'AOV',             value: 2720000,    trend: -0.7, unit: 'currency' },
                    k4: { key: 'returns', label: 'Hoàn trả (%)',    value: 2.6,        trend: 0.1,  unit: 'percent'  }
                },
                chart1: {
                    title: 'Doanh thu theo tháng',
                    type: 'bar',
                    datasets: [
                        { label: 'Doanh thu', data: [2800000000,2900000000,3000000000,3100000000,3200000000,3050000000,3200000000,3300000000,3100000000,3250000000,3350000000,3500000000], color: '#3b82f6', unit: 'currency' }
                    ]
                },
                chart2: {
                    title: 'Tỉ trọng kênh bán hàng',
                    type: 'doughnut',
                    labels: ['Online','Cửa hàng','Đối tác'],
                    data: [48, 34, 18],
                    colors: ['#60a5fa','#f59e0b','#10b981'],
                    unit: 'number'
                },
                table: {
                    title: 'Top sản phẩm theo doanh thu',
                    columns: ['Sản phẩm','Nhóm','Đã bán','Doanh thu','Tỷ lệ đạt (%)','Trạng thái'],
                    rows: [
                        { name: 'Áo thun oversize',  category: 'Thời trang', sold: 420, revenue: 125000000, rate: 92, status: 'active' },
                        { name: 'Quần jean slim',    category: 'Thời trang', sold: 310, revenue: 98000000,  rate: 85, status: 'active' },
                        { name: 'Giày chạy bộ X',    category: 'Giày dép',   sold: 205, revenue: 85000000,  rate: 78, status: 'pending' },
                        { name: 'Áo sơ mi basic',    category: 'Thời trang', sold: 180, revenue: 72000000,  rate: 74, status: 'active' },
                        { name: 'Túi xách nữ',       category: 'Phụ kiện',   sold: 165, revenue: 66000000,  rate: 71, status: 'active' },
                        { name: 'Giày cao gót',      category: 'Giày dép',   sold: 140, revenue: 56000000,  rate: 68, status: 'pending' }
                    ]
                }
            },
            customers: {
                kpis: {
                    k1: { key: 'new_customers',    label: 'KH mới',          value: 1420, trend: 2.2,  unit: 'number'   },
                    k2: { key: 'active_customers', label: 'KH hoạt động',    value: 3860, trend: 1.1,  unit: 'number'   },
                    k3: { key: 'aoc',              label: 'Đơn/khách (AOC)', value: 1.2,  trend: -0.3, unit: 'number'   },
                    k4: { key: 'churn',            label: 'Churn (%)',       value: 3.1,  trend: 0.2,  unit: 'percent'  }
                },
                chart1: {
                    title: 'Khách hàng mới theo tháng',
                    type: 'line',
                    datasets: [
                        { label: 'KH mới', data: [1100,1220,980,1350,1420,1500,1480,1390,1440,1520,1600,1710], color: '#8b5cf6', unit: 'number' }
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
                    columns: ['Nhóm','Mô tả','Số KH','Trạng thái','Tỷ lệ đạt (%)','—'],
                    rows: [
                        { name: 'VIP',           category: 'Giá trị cao',     sold: 320, revenue: 0, rate: 95, status: 'active'  },
                        { name: 'Trung thành',   category: 'Mua lặp lại',     sold: 540, revenue: 0, rate: 86, status: 'active'  },
                        { name: 'Rủi ro rời bỏ', category: 'Inactive 60d',    sold: 210, revenue: 0, rate: 40, status: 'pending' },
                        { name: 'Khách mới',     category: 'Lần đầu mua',     sold: 180, revenue: 0, rate: 78, status: 'active'  },
                        { name: 'Ngủ đông',      category: 'Không hoạt động', sold: 95,  revenue: 0, rate: 25, status: 'inactive' }
                    ]
                }
            },
            products: {
                kpis: {
                    k1: { key: 'sku_active',  label: 'SKU đang bán',     value: 320, trend: 1.2,  unit: 'number'   },
                    k2: { key: 'units_sold',  label: 'Đã bán (units)',   value: 860, trend: 2.1,  unit: 'number'   },
                    k3: { key: 'revenue',     label: 'Doanh thu',        value: 950000000, trend: 3.4,  unit: 'currency' },
                    k4: { key: 'stock_safe',  label: 'Tồn kho an toàn',  value: 78,  trend: -0.5, unit: 'percent'  }
                },
                chart1: {
                    title: 'Đã bán theo tháng',
                    type: 'bar',
                    datasets: [
                        { label: 'Đã bán', data: [760,820,780,840,900,860,920,980,950,970,1010,1080], color: '#f59e0b', unit: 'number' }
                    ]
                },
                chart2: {
                    title: 'Danh mục sản phẩm',
                    type: 'doughnut',
                    labels: ['Thời trang','Giày dép','Phụ kiện'],
                    data: [52, 28, 20],
                    colors: ['#3b82f6','#10b981','#8b5cf6'],
                    unit: 'number'
                },
                table: {
                    title: 'Hiệu quả theo sản phẩm',
                    columns: ['Sản phẩm','Nhóm','Đã bán','Doanh thu','Tỷ lệ đạt (%)','Trạng thái'],
                    rows: [
                        { name: 'Áo thun oversize',  category: 'Thời trang', sold: 420, revenue: 125000000, rate: 92, status: 'active'  },
                        { name: 'Quần jean slim',    category: 'Thời trang', sold: 310, revenue: 98000000,  rate: 85, status: 'active'  },
                        { name: 'Giày chạy bộ X',    category: 'Giày dép',   sold: 205, revenue: 85000000,  rate: 78, status: 'pending' },
                        { name: 'Áo sơ mi basic',    category: 'Thời trang', sold: 180, revenue: 72000000,  rate: 74, status: 'active'  },
                        { name: 'Túi xách nữ',       category: 'Phụ kiện',   sold: 165, revenue: 66000000,  rate: 71, status: 'active'  },
                        { name: 'Giày cao gót',      category: 'Giày dép',   sold: 140, revenue: 56000000,  rate: 68, status: 'pending' }
                    ]
                }
            },
            finance: {
                kpis: {
                    k1: { key: 'revenue', label: 'Doanh thu', value: 2450000, trend: 12.5, unit: 'currency' },
                    k2: { key: 'expense', label: 'Chi phí', value: 1720000, trend: 5.2, unit: 'currency' },
                    k3: { key: 'profit', label: 'Lợi nhuận', value: 730000, trend: 7.1, unit: 'currency' },
                    k4: { key: 'margin', label: 'Biên lợi nhuận', value: 22.9, trend: 0.6, unit: 'percent' }
                },
                chart1: {
                    title: 'Doanh thu - Chi phí - Lợi nhuận', type: 'line',
                    datasets: [
                        { label: 'Doanh thu', data: [2100000,2300000,2450000,2200000,2650000,2800000,2750000,2900000,3000000,3200000,3150000,3350000], color: '#3b82f6' },
                        { label: 'Chi phí', data: [1500000,1600000,1700000,1650000,1800000,1850000,1820000,1900000,1950000,2050000,2020000,2100000], color: '#ef4444' },
                        { label: 'Lợi nhuận', data: [600000,700000,750000,550000,850000,950000,930000,1000000,1050000,1150000,1130000,1250000], color: '#10b981' }
                    ]
                },
                chart2: {
                    title: 'Cơ cấu chi phí', type: 'doughnut',
                    labels: ['Marketing','Nhân sự','Vận hành','Khác'], data: [35,30,25,10], colors: ['#3b82f6','#10b981','#f59e0b','#94a3b8']
                },
                table: {
                    title: 'Giao dịch gần đây',
                    columns: ['Ngày','Loại','Số tiền','Ghi chú','Trạng thái','Người duyệt'],
                    rows: [
                        { name: '2025-06-01', category: 'Thu', sold: 0, revenue: 12500000, rate: 0, status: 'active', note: 'Thanh toán khách hàng A', approver: 'Kế toán' },
                        { name: '2025-06-03', category: 'Chi', sold: 0, revenue: -3200000, rate: 0, status: 'pending', note: 'Chi phí quảng cáo', approver: 'TP Marketing' },
                        { name: '2025-06-05', category: 'Chi', sold: 0, revenue: -1800000, rate: 0, status: 'active', note: 'Vận chuyển', approver: 'TP Kho' },
                        { name: '2025-06-07', category: 'Thu', sold: 0, revenue: 8500000, rate: 0, status: 'active', note: 'Khách hàng B', approver: 'Kế toán' }
                    ]
                }
            },
            reports: {
                kpis: {
                    k1: { key: 'exports',     label: 'Báo cáo đã xuất', value: 28,  trend: 1.2,  unit: 'number'  },
                    k2: { key: 'scheduled',   label: 'Theo lịch',       value: 12,  trend: 0.8,  unit: 'number'  },
                    k3: { key: 'views',       label: 'Lượt xem',        value: 540, trend: 2.1,  unit: 'number'  },
                    k4: { key: 'error_rate',  label: 'Lỗi xuất (%)',    value: 1.6, trend: -0.3, unit: 'percent' }
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
                        { name: '2025-09-06', category: 'PDF',   revenue: 0, note: 'Export báo cáo KPI tháng 8',      status: 'active',  approver: 'Hệ thống' },
                        { name: '2025-09-05', category: 'Excel', revenue: 0, note: 'Export top sản phẩm Q3',          status: 'active',  approver: 'Hệ thống' },
                        { name: '2025-09-04', category: 'CSV',   revenue: 0, note: 'Lỗi do timeout khi export lớn',   status: 'pending', approver: 'Hệ thống' },
                        { name: '2025-09-03', category: 'PDF',   revenue: 0, note: 'Báo cáo doanh thu theo kênh',      status: 'active',  approver: 'Hệ thống' },
                        { name: '2025-09-02', category: 'Excel', revenue: 0, note: 'Export danh sách khách hàng VIP', status: 'active',  approver: 'Hệ thống' },
                        { name: '2025-09-01', category: 'CSV',   revenue: 0, note: 'Báo cáo tồn kho cuối tháng',       status: 'inactive', approver: 'Hệ thống' }
                    ]
                }
            },
            settings: {
                defaults: {
                    period: '12m',
                    department: 'all',
                    locale: 'vi-VN',
                    currency: 'VND',
                    decimals: 0,
                    alert: { high: 3, medium: 7 },
                    targets: { revenue: 3000000000, conversion: 3.5 },
                    darkMode: false,
                    chartType: 'line'
                }
            }
        };

        // Helpers
        function getLocale() { return localStorage.getItem('settings.locale') || 'vi-VN'; }
        function getCurrency() { return localStorage.getItem('settings.currency') || 'VND'; }
        function getDecimals() { return +(localStorage.getItem('settings.decimals') || 0); }

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

        // Department multipliers
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

        // Compute view data for a tab without mutating base
        function getViewForTab(tab, period) {
            const src = baseData[tab] || baseData.overview;
            const multiplier = getMultiplier(period);

            // KPIs - apply period scaling, then department filtering
            const kpis = { ...src.kpis };
            const k1 = { ...kpis.k1 }, k2 = { ...kpis.k2 }, k3 = { ...kpis.k3 }, k4 = { ...kpis.k4 };
            const scale = (val, unit) => unit === 'percent' ? val : Math.max(0, Math.round(val * multiplier));
            k1.value = applyDepartmentToValue(scale(k1.value, k1.unit), k1.unit);
            k2.value = applyDepartmentToValue(scale(k2.value, k2.unit), k2.unit);
            k3.value = applyDepartmentToValue(scale(k3.value, k3.unit), k3.unit);
            k4.value = scale(k4.value, k4.unit); // conversion rate không áp dụng department

            // Chart1
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

            // Chart2 - apply department filter to data
            const chart2 = { title: src.chart2.title, type: src.chart2.type };
            chart2.labels = [...src.chart2.labels];
            chart2.data = applyDepartmentToArray([...src.chart2.data], src.chart2.unit);
            chart2.colors = [...src.chart2.colors];

            // Table - apply department filter to revenue and sold
            const table = { title: src.table.title, columns: [...src.table.columns] };
            table.rows = src.table.rows.map(r => ({
                ...r,
                sold: applyDepartmentToValue(r.sold, 'number'),
                revenue: applyDepartmentToValue(r.revenue, 'currency')
            }));

            return { kpis: { k1, k2, k3, k4 }, chart1, chart2, table };
        }

        // Charts
        let revenueChart, salesChannelChart;

        function initializeCharts() {
            // Destroy existing charts to prevent memory leaks
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
                                    if (dsLabel.includes('AOV') || dsLabel.includes('Doanh thu') || dsLabel.includes('Lợi nhuận') || dsLabel.includes('Chi phí'))
                                        return `${dsLabel}: ${formatCurrency(val)}`;
                                    return `${dsLabel}: ${formatNumber(val)}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: { beginAtZero: true },
                        y1: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false } }
                    }
                }
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
            // respect default chart type if user set
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

        // KPI rendering
        function renderKPIValues(kpis) {
            const map = [
                { id: 'revenueValue', trendId: 'revenueTrend', item: kpis.k1 },
                { id: 'customersValue', trendId: 'customersTrend', item: kpis.k2 },
                { id: 'ordersValue', trendId: 'ordersTrend', item: kpis.k3 },
                { id: 'conversionValue', trendId: 'conversionTrend', item: kpis.k4 }
            ];
            const labelMap = [ 'kpi1Label', 'kpi2Label', 'kpi3Label', 'kpi4Label' ];
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
            });
        }

        // Table rendering
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
                case 'inactive': return 'Ngừng bán';
                case 'pending': return 'Chờ duyệt';
                default: return status;
            }
        }

        // Search filtering (works on current table)
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

        // Notification
        function showNotification(message) {
            const notification = document.getElementById('notification');
            const notificationText = document.getElementById('notificationText');
            if (!notification || !notificationText) return;
            notificationText.textContent = message;
            notification.classList.add('show');
            setTimeout(() => { notification.classList.remove('show'); }, 3000);
        }

        // Route loader
        function showRouteLoader() {
            const rl = document.getElementById('routeLoader');
            if (rl) rl.style.display = 'flex';
        }
        function hideRouteLoader() {
            const rl = document.getElementById('routeLoader');
            if (rl) rl.style.display = 'none';
        }

        // Refresh uses currentTab/currentPeriod
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

        // Export current table
        function exportData() {
            const exportBtn = document.getElementById('exportBtn');
            const originalHTML = exportBtn ? exportBtn.innerHTML : '';
            if (exportBtn) { 
                exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xuất...'; 
                exportBtn.disabled = true; 
            }
            setTimeout(() => {
                const view = getViewForTab(currentTab, currentPeriod);
                
                // Tạo workbook Excel
                const wb = XLSX.utils.book_new();
                
                // Chuẩn bị dữ liệu cho Excel
                const excelData = [];
                excelData.push(view.table.columns); // Header
                
                view.table.rows.forEach(r => {
                    const cells = [];
                    if (view.table.columns[0] === 'Ngày') {
                        cells.push(r.name, r.category, r.revenue, r.note || '', getStatusText(r.status), r.approver || '');
                    } else {
                        cells.push(r.name, r.category, r.sold, r.revenue, `${r.rate}%`, getStatusText(r.status));
                    }
                    excelData.push(cells);
                });
                
                // Tạo worksheet
                const ws = XLSX.utils.aoa_to_sheet(excelData);
                
                // Định dạng cột cho tiền tệ
                const range = XLSX.utils.decode_range(ws['!ref']);
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const col = XLSX.utils.encode_col(C);
                    if (view.table.columns[C] && (view.table.columns[C].includes('Doanh thu') || view.table.columns[C].includes('Số tiền'))) {
                        ws[`!cols`] = ws[`!cols`] || [];
                        ws[`!cols`][C] = { wch: 15 };
                    }
                }
                
                // Thêm worksheet vào workbook
                XLSX.utils.book_append_sheet(wb, ws, "Báo cáo");
                
                // Xuất file Excel
                const fileName = `bao_cao_${currentTab}_${new Date().toISOString().split('T')[0]}.xlsx`;
                XLSX.writeFile(wb, fileName);
                
                if (exportBtn) { 
                    exportBtn.innerHTML = originalHTML; 
                    exportBtn.disabled = false; 
                }
                showNotification('Đã xuất báo cáo Excel thành công!');
            }, 600);
        }

        // Download chart images
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

        // Navigation handling
        function handleNavigation() {
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (link.classList.contains('active')) return; // no-op
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                    const nextTab = link.getAttribute('data-tab') || 'overview';
                    showRouteLoader();
                    setTimeout(() => {
                        currentTab = nextTab;
                        updateHeaderByTab(currentTab);
                        // Toggle settings vs content
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
            const settingsSection = document.getElementById('settings');
            const kpi = document.getElementById('kpiGrid');
            const charts = document.getElementById('chartsGrid');
            const table = document.getElementById('tableSection');
            const isSettings = currentTab === 'settings';
            if (settingsSection) settingsSection.style.display = isSettings ? 'block' : 'none';
            if (kpi) kpi.style.display = isSettings ? 'none' : 'grid';
            if (charts) charts.style.display = isSettings ? 'none' : 'grid';
            if (table) table.style.display = isSettings ? 'none' : 'block';
            // also hide period selector when in settings? keep it visible; but sync value
        }

        function updateHeaderByTab(tab) {
            const headerTitle = document.querySelector('.header-left h2');
            const headerDesc = document.querySelector('.header-left p');
            const map = {
                overview: ['Dashboard Tổng quan','Chào mừng trở lại! Dưới đây là tóm tắt hiệu suất kinh doanh của bạn.'],
                kpi: ['Dashboard KPI','Theo dõi và đánh giá các chỉ số hiệu suất chính của doanh nghiệp.'],
                sales: ['Quản lý Bán hàng','Theo dõi và phân tích hiệu suất bán hàng của doanh nghiệp.'],
                customers: ['Quản lý Khách hàng','Quản lý thông tin và theo dõi hành vi khách hàng.'],
                products: ['Quản lý Sản phẩm','Quản lý danh mục sản phẩm và theo dõi hiệu suất bán hàng.'],
                finance: ['Quản lý Tài chính','Theo dõi doanh thu, chi phí và báo cáo tài chính.'],
                reports: ['Báo cáo & Phân tích','Tạo và xem các báo cáo chi tiết về hoạt động kinh doanh.'],
                alerts: ['Quản lý Thông báo','Theo dõi tình trạng cảnh báo và sự cố theo thời gian thực.'],
                settings: ['Cài đặt Hệ thống','Cấu hình và tùy chỉnh hệ thống theo nhu cầu.']
            };
            const [t, d] = map[tab] || map.overview;
            if (headerTitle) headerTitle.textContent = t;
            if (headerDesc) headerDesc.textContent = d;
        }

        // Period selector handling
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

        // Department filter handling
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

        // Chart type toggle for chart1
        function handleChartTypeToggle() {
            const chartTypeBtn = document.getElementById('chartTypeBtn');
            if (!chartTypeBtn) return;
            chartTypeBtn.addEventListener('click', () => {
                if (!revenueChart) return;
                defaultChartType = revenueChart.config.type === 'line' ? 'bar' : 'line';
                revenueChart.config.type = defaultChartType;
                chartTypeBtn.innerHTML = defaultChartType === 'line' ? '<i class="fas fa-chart-line"></i> Line Chart' : '<i class="fas fa-chart-bar"></i> Bar Chart';
                revenueChart.update();
                const s = { ...getDefaultSettings(), ...loadSettings(), defaultChartType };
                saveSettings(s);
            });
        }

        // Real-time updates simulation (refreshes current view)
        function startRealTimeUpdates() {
            // clear existing
            if (realtimeIntervalId) { clearInterval(realtimeIntervalId); realtimeIntervalId = null; }
            if (realtimeEnabled) {
                realtimeIntervalId = setInterval(() => { if (currentTab !== 'settings') renderForState(); }, 30000);
            }
        }

        // Mobile menu toggle (unchanged)
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

        // Keyboard shortcuts
        function addKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'r') { e.preventDefault(); refreshData(); }
                if ((e.ctrlKey || e.metaKey) && e.key === 'e') { e.preventDefault(); exportData(); }
                if (e.key >= '1' && e.key <= '7') {
                    const navLinks = document.querySelectorAll('.nav-link');
                    const index = parseInt(e.key) - 1;
                    if (navLinks[index]) { navLinks[index].click(); }
                }
            });
        }

        // Render pipeline for current state
        function renderForState() {
            const periodSelector = document.getElementById('periodSelector');
            const departmentFilter = document.getElementById('departmentFilter');
            if (periodSelector && periodSelector.value !== currentPeriod) periodSelector.value = currentPeriod;
            if (departmentFilter && departmentFilter.value !== currentDepartment) departmentFilter.value = currentDepartment;

            if (currentTab === 'settings') {
                syncSettingsUI();
                return; // settings does not render KPIs/charts/table
            }

            const view = getViewForTab(currentTab, currentPeriod);
            renderKPIValues(view.kpis);
            renderChart1(view.chart1);
            renderChart2(view.chart2);
            renderTable(view.table);
        }

        // Dark mode toggle (with persistence)
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

        // Settings Management
        function loadSettings() {
            const d = (baseData.settings && baseData.settings.defaults) || {};
            return {
                period:        localStorage.getItem('period') ?? d.period ?? '12m',
                department:    localStorage.getItem('department') ?? d.department ?? 'all',
                locale:        localStorage.getItem('settings.locale') ?? d.locale ?? 'vi-VN',
                currency:      localStorage.getItem('settings.currency') ?? d.currency ?? 'VND',
                decimals:     +(localStorage.getItem('settings.decimals') ?? d.decimals ?? 0),
                alertHigh:    +(localStorage.getItem('settings.alert.high') ?? (d.alert?.high ?? 3)),
                alertMedium:  +(localStorage.getItem('settings.alert.medium') ?? (d.alert?.medium ?? 7)),
                targetRevenue:+(localStorage.getItem('settings.target.revenue') ?? (d.targets?.revenue ?? 3000000000)),
                targetConv:   +(localStorage.getItem('settings.target.conversion') ?? (d.targets?.conversion ?? 3.5)),
                darkMode:       (localStorage.getItem('settings.darkMode') ?? (d.darkMode ?? false)) === 'true',
                chartType:      localStorage.getItem('settings.chart.type') ?? d.chartType ?? 'line'
            };
        }

        function applySettingsToUI() {
            const s = loadSettings();
            const byId = id => document.getElementById(id);
            
            // Chỉ cập nhật nếu element tồn tại (tránh lỗi khi chưa render tab settings)
            if (byId('settingDefaultPeriod')) byId('settingDefaultPeriod').value = s.period;
            if (byId('settingDefaultDepartment')) byId('settingDefaultDepartment').value = s.department;
            if (byId('settingLocale')) byId('settingLocale').value = s.locale;
            if (byId('settingCurrency')) byId('settingCurrency').value = s.currency;
            if (byId('settingDecimals')) byId('settingDecimals').value = s.decimals;
            if (byId('settingAlertHigh')) byId('settingAlertHigh').value = s.alertHigh;
            if (byId('settingAlertMedium')) byId('settingAlertMedium').value = s.alertMedium;
            if (byId('settingTargetRevenue')) byId('settingTargetRevenue').value = s.targetRevenue;
            if (byId('settingTargetConversion')) byId('settingTargetConversion').value = s.targetConv;
            if (byId('settingDarkMode')) byId('settingDarkMode').checked = s.darkMode;
            if (byId('settingChartType')) byId('settingChartType').value = s.chartType;
        }

        function saveSettingsFromUI() {
            const get = id => document.getElementById(id);
            localStorage.setItem('period',                     get('settingDefaultPeriod').value);
            localStorage.setItem('department',                 get('settingDefaultDepartment').value);
            localStorage.setItem('settings.locale',            get('settingLocale').value);
            localStorage.setItem('settings.currency',          get('settingCurrency').value);
            localStorage.setItem('settings.decimals',          get('settingDecimals').value);
            localStorage.setItem('settings.alert.high',        get('settingAlertHigh').value);
            localStorage.setItem('settings.alert.medium',      get('settingAlertMedium').value);
            localStorage.setItem('settings.target.revenue',    get('settingTargetRevenue').value);
            localStorage.setItem('settings.target.conversion', get('settingTargetConversion').value);
            localStorage.setItem('settings.darkMode',          get('settingDarkMode').checked);
            localStorage.setItem('settings.chart.type',        get('settingChartType').value);
        }

        function handleSettingsEvents() {
            const byId = id => document.getElementById(id);
            
            // Save Settings
            byId('btnSaveSettings')?.addEventListener('click', () => {
                saveSettingsFromUI();
                // Đồng bộ state hiện hành
                const s = loadSettings();
                currentPeriod = s.period;
                currentDepartment = s.department;
                defaultChartType = s.chartType;
                
                // Áp dụng dark mode
                document.documentElement.dataset.theme = s.darkMode ? 'dark' : 'light';
                
                showNotification('Đã lưu cài đặt.');
                renderForState(); // re-render toàn bộ
            });

            // Reset Settings
            byId('btnResetSettings')?.addEventListener('click', () => {
                localStorage.removeItem('period');
                localStorage.removeItem('department');
                [
                    'settings.locale','settings.currency','settings.decimals',
                    'settings.alert.high','settings.alert.medium',
                    'settings.target.revenue','settings.target.conversion',
                    'settings.darkMode','settings.chart.type'
                ].forEach(k => localStorage.removeItem(k));
                applySettingsToUI();
                showNotification('Đã khôi phục mặc định.');
                renderForState();
            });

            // Export Settings
            byId('btnExportSettings')?.addEventListener('click', () => {
                const s = loadSettings();
                const blob = new Blob([JSON.stringify(s, null, 2)], {type: 'application/json'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; 
                a.download = 'dashboard-settings.json'; 
                a.click();
                URL.revokeObjectURL(url);
                showNotification('Đã xuất cấu hình.');
            });

            // Import Settings
            byId('btnImportSettings')?.addEventListener('click', () => byId('inputImportSettings')?.click());
            byId('inputImportSettings')?.addEventListener('change', (e) => {
                const file = e.target.files?.[0]; 
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (evt) => {
                    try {
                        const s = JSON.parse(String(evt.target.result || '{}'));
                        // Ghi vào localStorage (chỉ các khóa hợp lệ)
                        if (s.period)                      localStorage.setItem('period', s.period);
                        if (s.department)                  localStorage.setItem('department', s.department);
                        if (s.locale)                      localStorage.setItem('settings.locale', s.locale);
                        if (s.currency)                    localStorage.setItem('settings.currency', s.currency);
                        if (Number.isFinite(+s.decimals))  localStorage.setItem('settings.decimals', s.decimals);
                        if (Number.isFinite(+s.alertHigh)) localStorage.setItem('settings.alert.high', s.alertHigh);
                        if (Number.isFinite(+s.alertMedium)) localStorage.setItem('settings.alert.medium', s.alertMedium);
                        if (Number.isFinite(+s.targetRevenue)) localStorage.setItem('settings.target.revenue', s.targetRevenue);
                        if (Number.isFinite(+s.targetConv)) localStorage.setItem('settings.target.conversion', s.targetConv);
                        if (typeof s.darkMode === 'boolean') localStorage.setItem('settings.darkMode', s.darkMode);
                        if (s.chartType)                  localStorage.setItem('settings.chart.type', s.chartType);
                        applySettingsToUI();
                        renderForState();
                        showNotification('Đã nhập cấu hình.');
                    } catch(err) {
                        showNotification('Tệp cấu hình không hợp lệ.');
                    }
                };
                reader.readAsText(file);
            });
        }

        // Performance monitoring
        function logPerformance() {
            if (window.performance && window.performance.timing && window.performance.timing.loadEventEnd) {
                const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
                console.log(`Dashboard loaded in ${loadTime}ms`);
            }
        }

        // Initialize dashboard
        function initializeDashboard() {
            // Load settings and apply to state
            const settings = loadSettings();
            currentPeriod = settings.period;
            currentDepartment = settings.department;
            defaultChartType = settings.chartType;
            
            // Apply dark mode from settings
            document.documentElement.dataset.theme = settings.darkMode ? 'dark' : 'light';
            // set initial period selector
            const periodSelector = document.getElementById('periodSelector');
            const departmentFilter = document.getElementById('departmentFilter');
            if (periodSelector) periodSelector.value = currentPeriod;
            if (departmentFilter) departmentFilter.value = currentDepartment;
            // set initial active tab
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(l => l.classList.remove('active'));
            const active = Array.from(navLinks).find(l => l.getAttribute('data-tab') === currentTab) || navLinks[0];
            if (active) active.classList.add('active');

            initializeCharts();
            handleNavigation();
            handlePeriodChange();
            handleDepartmentChange();
            handleChartTypeToggle();
            setupChartDownloads();
            setupTableSearch();
            addMobileMenu();
            addKeyboardShortcuts();
            wireSettingsActions();
            handleSettingsEvents();
            applySettingsToUI();
            startRealTimeUpdates();
            
            // Thêm event listeners cho các nút export và refresh
            const exportBtn = document.getElementById('exportBtn');
            const refreshBtn = document.getElementById('refreshBtn');
            if (exportBtn) {
                exportBtn.addEventListener('click', exportData);
            }
            if (refreshBtn) {
                refreshBtn.addEventListener('click', refreshData);
            }
            
            // toggle sections by initial tab
            toggleSectionsByTab();
            // initial render
            renderForState();
            // fade-in delays
            const elements = document.querySelectorAll('.fade-in');
            elements.forEach((element, index) => { element.style.animationDelay = `${index * 0.1}s`; });
            console.log('Dashboard initialized successfully!');
        }

        // Debounced resize handler
        let resizeTimeout;
        function handleResize() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (revenueChart) revenueChart.resize();
                if (salesChannelChart) salesChannelChart.resize();
            }, 250);
        }

        document.addEventListener('DOMContentLoaded', () => {
            initializeDashboard();
            setTimeout(addDarkModeToggle, 100);
        });
        window.addEventListener('load', logPerformance);
        window.addEventListener('resize', handleResize);