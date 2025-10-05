import Link from 'next/link';

export const metadata = {
    title: '页面未找到 - 404',
    description: '抱歉，您访问的页面不存在。返回光伏新能源管理系统首页。',
};

export default function NotFound() {
    return (
        <div className="min-h-screen dashboard-bg flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-6xl font-display text-primary mb-4">404</h1>
                <h2 className="text-2xl font-display text-neutral-300 mb-6">页面未找到</h2>
                <p className="text-neutral-400 mb-8">抱歉，您访问的页面不存在</p>
                <Link 
                    href="/"
                    className="px-6 py-3 bg-primary text-black rounded-lg font-medium hover:bg-primary/80 transition-colors"
                >
                    返回首页
                </Link>
            </div>
        </div>
    );
}

