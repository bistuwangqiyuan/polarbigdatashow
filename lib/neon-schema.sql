-- 光伏能源关断管理系统 - Neon Postgres 数据库 Schema

-- 光伏电站基础信息表
CREATE TABLE IF NOT EXISTS solar_stations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    capacity_mw DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 实时发电数据表
CREATE TABLE IF NOT EXISTS power_generation_realtime (
    id SERIAL PRIMARY KEY,
    station_id INTEGER REFERENCES solar_stations(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    current_power_kw DECIMAL(10, 2),
    voltage_v DECIMAL(10, 2),
    current_a DECIMAL(10, 2),
    temperature_c DECIMAL(5, 2),
    efficiency_percent DECIMAL(5, 2)
);

-- 累计数据表
CREATE TABLE IF NOT EXISTS power_generation_summary (
    id SERIAL PRIMARY KEY,
    station_id INTEGER REFERENCES solar_stations(id),
    date DATE DEFAULT CURRENT_DATE,
    total_energy_kwh DECIMAL(15, 2),
    revenue_rmb DECIMAL(15, 2),
    co2_reduction_ton DECIMAL(10, 2),
    peak_power_kw DECIMAL(10, 2),
    average_efficiency DECIMAL(5, 2),
    UNIQUE(station_id, date)
);

-- 逆变器数据表
CREATE TABLE IF NOT EXISTS inverters (
    id SERIAL PRIMARY KEY,
    station_id INTEGER REFERENCES solar_stations(id),
    inverter_code VARCHAR(100) NOT NULL,
    model VARCHAR(100),
    status VARCHAR(50) DEFAULT 'normal',
    current_power_kw DECIMAL(10, 2),
    temperature_c DECIMAL(5, 2),
    efficiency_percent DECIMAL(5, 2),
    last_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 告警信息表
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    station_id INTEGER REFERENCES solar_stations(id),
    alert_type VARCHAR(50),
    severity VARCHAR(20),
    message TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 储能系统数据表
CREATE TABLE IF NOT EXISTS energy_storage (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    capacity DECIMAL(10,2) NOT NULL,
    current_soc DECIMAL(5,2) NOT NULL,
    power DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'normal',
    temperature DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 设备表
CREATE TABLE IF NOT EXISTS devices (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'online',
    power DECIMAL(10,2) DEFAULT 0,
    efficiency DECIMAL(5,2) DEFAULT 0,
    temperature DECIMAL(5,2) DEFAULT 25,
    runtime INTEGER DEFAULT 0,
    load_percent DECIMAL(5,2) DEFAULT 0,
    switchable BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 更新时间戳触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_solar_stations_updated_at
    BEFORE UPDATE ON solar_stations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_devices_updated_at
    BEFORE UPDATE ON devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_realtime_station_time ON power_generation_realtime(station_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_summary_station_date ON power_generation_summary(station_id, date);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_devices_type ON devices(type);
