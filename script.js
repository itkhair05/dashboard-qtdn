// Global state
let currentTab = 'overview';
let currentPeriod = 'month';
let currentDepartment = 'all';
let defaultChartType = 'line';
let realtimeEnabled = true;
let realtimeIntervalId = null;

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
    if (kpi) kpi.style.display = 'grid';
    if (charts) charts.style.display = 'grid';
    if (table) table.style.display = 'block';
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

document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    setTimeout(addDarkModeToggle, 100);
});
window.addEventListener('load', logPerformance);
window.addEventListener('resize', handleResize);