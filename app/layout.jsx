import '../styles/globals.css';

export const metadata = {
    title: {
        template: '%s | 光伏电站监控中心',
        default: '光伏电站智能监控中心'
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
