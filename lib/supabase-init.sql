-- 创建光伏电站基础信息表
CREATE TABLE IF NOT EXISTS solar_stations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    capacity_mw DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建实时发电数据表
CREATE TABLE IF NOT EXISTS power_generation_realtime (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    station_id UUID REFERENCES solar_stations(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    current_power_kw DECIMAL(10, 2),
    voltage_v DECIMAL(10, 2),
    current_a DECIMAL(10, 2),
    temperature_c DECIMAL(5, 2),
    efficiency_percent DECIMAL(5, 2)
);

-- 创建累计数据表
CREATE TABLE IF NOT EXISTS power_generation_summary (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    station_id UUID REFERENCES solar_stations(id),
    date DATE DEFAULT CURRENT_DATE,
    total_energy_kwh DECIMAL(15, 2),
    revenue_rmb DECIMAL(15, 2),
    co2_reduction_ton DECIMAL(10, 2),
    peak_power_kw DECIMAL(10, 2),
    average_efficiency DECIMAL(5, 2),
    UNIQUE(station_id, date)
);

-- 创建逆变器数据表
CREATE TABLE IF NOT EXISTS inverters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    station_id UUID REFERENCES solar_stations(id),
    inverter_code VARCHAR(100) NOT NULL,
    model VARCHAR(100),
    status VARCHAR(50) DEFAULT 'normal',
    current_power_kw DECIMAL(10, 2),
    temperature_c DECIMAL(5, 2),
    efficiency_percent DECIMAL(5, 2),
    last_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建告警信息表
CREATE TABLE IF NOT EXISTS alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    station_id UUID REFERENCES solar_stations(id),
    alert_type VARCHAR(50),
    severity VARCHAR(20),
    message TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 创建更新时间戳的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为solar_stations表创建触发器
CREATE TRIGGER update_solar_stations_updated_at 
    BEFORE UPDATE ON solar_stations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 插入示例数据
INSERT INTO solar_stations (name, location, capacity_mw, status) VALUES
('光伏电站-北京站', '北京市昌平区', 50.00, 'active'),
('光伏电站-上海站', '上海市浦东新区', 80.00, 'active'),
('光伏电站-深圳站', '深圳市南山区', 65.00, 'active');

-- 启用实时订阅
ALTER PUBLICATION supabase_realtime ADD TABLE power_generation_realtime;
ALTER PUBLICATION supabase_realtime ADD TABLE inverters;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;

-- 插入测试数据
-- 1. 插入光伏电站基础信息
INSERT INTO solar_stations (name, location, capacity, status, installed_date) VALUES
('南庄坪光伏电站-A区', '南庄坪工业园区A区', 500.00, 'active', '2023-01-15'),
('南庄坪光伏电站-B区', '南庄坪工业园区B区', 300.00, 'active', '2023-03-20'),
('南庄坪风电场-1号', '南庄坪山顶', 100.00, 'active', '2023-05-10'),
('南庄坪风电场-2号', '南庄坪山顶', 100.00, 'active', '2023-05-10');

-- 2. 插入逆变器设备信息
INSERT INTO inverters (station_id, name, model, power, efficiency, temperature, status) VALUES
(1, '逆变器-A01', 'SUN2000-125KTL', 125.00, 96.5, 35.2, 'normal'),
(1, '逆变器-A02', 'SUN2000-125KTL', 125.00, 97.2, 34.8, 'normal'),
(1, '逆变器-A03', 'SUN2000-125KTL', 125.00, 95.8, 36.5, 'normal'),
(1, '逆变器-A04', 'SUN2000-125KTL', 125.00, 96.1, 35.9, 'normal'),
(2, '逆变器-B01', 'SUN2000-100KTL', 100.00, 96.8, 33.2, 'normal'),
(2, '逆变器-B02', 'SUN2000-100KTL', 100.00, 97.5, 32.8, 'normal'),
(2, '逆变器-B03', 'SUN2000-100KTL', 100.00, 0, 25.0, 'offline');

-- 3. 插入实时发电数据
INSERT INTO power_generation_realtime (station_id, current_power, voltage, current, frequency, power_factor) VALUES
(1, 385.50, 690.0, 323.5, 50.02, 0.98),
(2, 256.80, 690.0, 215.4, 50.01, 0.97),
(3, 45.30, 690.0, 38.0, 50.00, 0.96),
(4, 38.70, 690.0, 32.5, 50.00, 0.95);

-- 4. 插入历史统计数据
INSERT INTO power_generation_summary (
    station_id, summary_date, total_energy, peak_power, 
    average_power, capacity_factor, revenue, co2_reduction
) VALUES
-- 今日数据
(1, CURRENT_DATE, 6230.5, 486.2, 259.6, 0.52, 3115.25, 4.36),
(2, CURRENT_DATE, 4156.3, 298.5, 173.2, 0.58, 2078.15, 2.91),
(3, CURRENT_DATE, 875.6, 95.2, 36.5, 0.36, 437.80, 0.61),
(4, CURRENT_DATE, 786.9, 88.5, 32.8, 0.33, 393.45, 0.55),
-- 昨日数据
(1, CURRENT_DATE - INTERVAL '1 day', 8056.2, 498.5, 335.7, 0.67, 4028.10, 5.64),
(2, CURRENT_DATE - INTERVAL '1 day', 5382.1, 312.6, 224.3, 0.75, 2691.05, 3.77),
(3, CURRENT_DATE - INTERVAL '1 day', 1184.5, 98.5, 49.4, 0.49, 592.25, 0.83),
(4, CURRENT_DATE - INTERVAL '1 day', 1184.5, 92.3, 49.4, 0.49, 592.25, 0.83),
-- 过去30天数据
(1, CURRENT_DATE - INTERVAL '2 days', 7856.3, 492.3, 327.3, 0.65, 3928.15, 5.50),
(1, CURRENT_DATE - INTERVAL '3 days', 7652.8, 488.5, 318.9, 0.64, 3826.40, 5.36),
(1, CURRENT_DATE - INTERVAL '4 days', 6985.2, 475.2, 291.1, 0.58, 3492.60, 4.89),
(1, CURRENT_DATE - INTERVAL '5 days', 8256.9, 502.1, 344.0, 0.69, 4128.45, 5.78),
(2, CURRENT_DATE - INTERVAL '2 days', 5123.5, 305.8, 213.5, 0.71, 2561.75, 3.59),
(2, CURRENT_DATE - INTERVAL '3 days', 4985.6, 298.2, 207.7, 0.69, 2492.80, 3.49),
(2, CURRENT_DATE - INTERVAL '4 days', 4562.3, 285.6, 190.1, 0.63, 2281.15, 3.19),
(2, CURRENT_DATE - INTERVAL '5 days', 5382.9, 315.2, 224.3, 0.75, 2691.45, 3.77);

-- 5. 插入告警信息
INSERT INTO alerts (station_id, alert_type, severity, title, description, status) VALUES
(1, 'temperature', 'warning', '逆变器温度偏高', '逆变器A03温度达到36.5°C，请注意散热', 'active'),
(2, 'device', 'error', '逆变器离线', '逆变器B03已离线，请检查设备状态', 'active'),
(3, 'efficiency', 'info', '效率略有下降', '风机1号效率降至94.2%，建议进行维护', 'acknowledged'),
(1, 'maintenance', 'info', '定期维护提醒', '光伏板清洗维护时间已到', 'resolved');

-- 6. 插入储能系统数据（扩展表）
CREATE TABLE IF NOT EXISTS energy_storage (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    capacity DECIMAL(10,2) NOT NULL, -- 容量 kWh
    current_soc DECIMAL(5,2) NOT NULL, -- 当前电量百分比
    power DECIMAL(10,2), -- 当前功率（正为放电，负为充电）
    status VARCHAR(20) DEFAULT 'normal',
    temperature DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO energy_storage (name, capacity, current_soc, power, status, temperature) VALUES
('储能电池组-1', 1000.00, 88.0, 80.0, 'normal', 25.0),
('储能电池组-2', 1000.00, 85.0, 75.5, 'normal', 24.0),
('储能电池组-3', 500.00, 92.0, -50.0, 'charging', 26.0);

-- 7. 插入充电桩数据
CREATE TABLE IF NOT EXISTS charging_stations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    power_rating DECIMAL(10,2) NOT NULL, -- 额定功率 kW
    current_power DECIMAL(10,2), -- 当前功率
    status VARCHAR(20) DEFAULT 'idle',
    total_energy_today DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO charging_stations (name, power_rating, current_power, status, total_energy_today) VALUES
('充电桩-01', 120.00, 60.0, 'charging', 486.5),
('充电桩-02', 120.00, 30.0, 'charging', 325.8),
('充电桩-03', 60.00, 0, 'idle', 156.2),
('充电桩-04', 60.00, 45.0, 'charging', 289.6);