-- 创建光伏电站基础信息表
CREATE TABLE IF NOT EXISTS solar_stations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    capacity_mw DECIMAL(10, 2),
    longitude DECIMAL(10, 6),
    latitude DECIMAL(10, 6),
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

-- 插入示例数据（包含真实坐标）
INSERT INTO solar_stations (name, location, capacity_mw, longitude, latitude, status) VALUES
('光伏电站-北京站', '北京市昌平区', 50.00, 116.231204, 40.22066, 'active'),
('光伏电站-上海站', '上海市浦东新区', 80.00, 121.544379, 31.221517, 'active'),
('光伏电站-深圳站', '深圳市南山区', 65.00, 113.930765, 22.531544, 'active'),
('光伏电站-广州站', '广州市番禺区', 45.00, 113.364710, 23.125178, 'active'),
('光伏电站-成都站', '成都市双流区', 55.00, 104.065735, 30.572269, 'active'),
('光伏电站-西安站', '西安市灞桥区', 40.00, 108.939847, 34.341574, 'active'),
('光伏电站-武汉站', '武汉市东西湖区', 60.00, 114.305392, 30.592849, 'active'),
('光伏电站-南京站', '南京市江宁区', 70.00, 118.796877, 32.060255, 'active');

-- 启用实时订阅
ALTER PUBLICATION supabase_realtime ADD TABLE power_generation_realtime;
ALTER PUBLICATION supabase_realtime ADD TABLE inverters;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;