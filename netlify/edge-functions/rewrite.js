// 简化的Edge函数 - 避免不必要的重写
const rewrite = async (request, context) => {
    // 直接返回原始请求，不进行重写
    return;
};

export const config = {
    path: '/edge'
};

export default rewrite;
