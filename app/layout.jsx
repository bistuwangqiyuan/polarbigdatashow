import '../styles/globals.css';

export const metadata = {
    title: {
        template: '%s | 光伏新能源路由和关断管理系统',
        default: '光伏新能源路由和关断管理系统'
    }
};

export default function RootLayout({ children }) {
    return (
        <html lang="zh-CN">
            <head>
                <link rel="icon" href="/favicon.svg" sizes="any" />
            </head>
            <body className="antialiased text-white">
                {children}
            </body>
        </html>
    );
}
