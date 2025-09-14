/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // 修复Netlify部署问题
    trailingSlash: true,
    distDir: '.next',
    // 图片优化配置
    images: {
        unoptimized: true
    },
    // 确保静态文件正确处理
    assetPrefix: '',
    // 修复输出文件追踪问题
    outputFileTracingRoot: undefined
};

module.exports = nextConfig;
