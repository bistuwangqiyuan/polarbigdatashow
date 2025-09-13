const https = require('https');
const fs = require('fs');
const path = require('path');

// 创建public目录（如果不存在）
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 中国地图数据URL（使用阿里云的CDN数据）
const mapDataUrl = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json';

console.log('正在下载中国地图数据...');

const file = fs.createWriteStream(path.join(publicDir, 'china.json'));

https.get(mapDataUrl, (response) => {
  response.pipe(file);
  
  file.on('finish', () => {
    file.close();
    console.log('✅ 中国地图数据下载成功！');
    console.log('文件保存在: public/china.json');
  });
}).on('error', (err) => {
  fs.unlink(path.join(publicDir, 'china.json'), () => {});
  console.error('❌ 下载失败:', err.message);
  
  // 如果下载失败，创建一个简化的备用数据
  console.log('创建简化的备用地图数据...');
  createSimplifiedMapData();
});

// 创建简化的中国地图数据作为备用
function createSimplifiedMapData() {
  const simplifiedData = {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "name": "中国",
          "adcode": 100000,
          "level": "country",
          "center": [116.3683244, 39.915085],
          "centroid": [103.388611, 35.563611]
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [[
            [73.6, 53.5], [135.5, 53.5], [135.5, 15.2], 
            [108.5, 15.2], [73.6, 39.7], [73.6, 53.5]
          ]]
        }
      }
    ]
  };
  
  fs.writeFileSync(
    path.join(publicDir, 'china.json'),
    JSON.stringify(simplifiedData, null, 2)
  );
  
  console.log('✅ 已创建简化的备用地图数据');
}