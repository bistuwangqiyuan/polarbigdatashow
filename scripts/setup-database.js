const { createClient } = require('@supabase/supabase-js')

// 配置
const supabaseUrl = 'https://zzyueuweeoakopuuwfau.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6eXVldXdlZW9ha29wdXV3ZmF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDM4MTMwMSwiZXhwIjoyMDU5OTU3MzAxfQ.CTLF9Ahmxt7alyiv-sf_Gl3U6SNIWZ01PapTI92Hg0g'

console.log('==============================================')
console.log('数据库设置说明')
console.log('==============================================')
console.log('')
console.log('请按以下步骤在 Supabase 控制台中执行：')
console.log('')
console.log('1. 登录 Supabase 控制台：https://app.supabase.com')
console.log('2. 选择您的项目（URL中包含 zzyueuweeoakopuuwfau）')
console.log('3. 点击左侧菜单的 "SQL Editor"')
console.log('4. 将以下 SQL 脚本复制并执行：')
console.log('')
console.log('==============================================')
console.log('SQL 脚本开始')
console.log('==============================================')
console.log('')

const sqlScript = `
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
DROP TRIGGER IF EXISTS update_solar_stations_updated_at ON solar_stations;
CREATE TRIGGER update_solar_stations_updated_at 
    BEFORE UPDATE ON solar_stations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 插入示例数据
INSERT INTO solar_stations (name, location, capacity_mw, status) VALUES
('光伏电站-北京站', '北京市昌平区', 50.00, 'active'),
('光伏电站-上海站', '上海市浦东新区', 80.00, 'active'),
('光伏电站-深圳站', '深圳市南山区', 65.00, 'active')
ON CONFLICT DO NOTHING;

-- 启用实时订阅（需要在 Supabase 控制台的 Replication 设置中启用）
-- 注意：以下命令可能需要在 Replication 设置界面手动启用
-- ALTER PUBLICATION supabase_realtime ADD TABLE power_generation_realtime;
-- ALTER PUBLICATION supabase_realtime ADD TABLE inverters;
-- ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
`

console.log(sqlScript)
console.log('')
console.log('==============================================')
console.log('SQL 脚本结束')
console.log('==============================================')
console.log('')
console.log('5. 执行完成后，在 "Database" -> "Replication" 中启用以下表的实时订阅：')
console.log('   - power_generation_realtime')
console.log('   - inverters')
console.log('   - alerts')
console.log('')
console.log('6. 完成后运行: node scripts/test-functionality.js 验证设置')
console.log('')