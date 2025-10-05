import '../styles/globals.css';
import { ThemeProvider } from '../lib/themeContext';

export const metadata = {
    metadataBase: new URL('https://polarbigdatashow.netlify.app'),
    title: {
        template: '%s | 光伏新能源路由和关断管理系统',
        default: '光伏新能源路由和关断管理系统 - 智能能源监控与管理平台'
    },
    description: '专业的光伏新能源路由和关断管理系统，实时监控光伏发电、风力发电、储能充电等数据，提供智能能源管理解决方案，助力企业实现绿色能源转型。',
    keywords: ['光伏能源', '新能源管理', '光伏监控系统', '风力发电', '储能系统', '能源管理平台', '智能电网', '绿色能源', '光伏发电', '能源数据可视化'],
    authors: [{ name: '光伏新能源管理系统' }],
    creator: '光伏新能源管理系统',
    publisher: '光伏新能源管理系统',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        type: 'website',
        locale: 'zh_CN',
        url: 'https://polarbigdatashow.netlify.app',
        title: '光伏新能源路由和关断管理系统 - 智能能源监控与管理平台',
        description: '专业的光伏新能源路由和关断管理系统，实时监控光伏发电、风力发电、储能充电等数据，提供智能能源管理解决方案。',
        siteName: '光伏新能源管理系统',
        images: [
            {
                url: '/image/logo.png',
                width: 1200,
                height: 630,
                alt: '光伏新能源管理系统',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: '光伏新能源路由和关断管理系统 - 智能能源监控与管理平台',
        description: '专业的光伏新能源路由和关断管理系统，实时监控光伏发电、风力发电、储能充电等数据。',
        images: ['/image/logo.png'],
        creator: '@solar_energy_system',
    },
    robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: 'your-google-verification-code',
        yandex: 'your-yandex-verification-code',
        baidu: 'your-baidu-verification-code',
    },
    alternates: {
        canonical: 'https://polarbigdatashow.netlify.app',
    },
    category: '能源管理',
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
};

export default function RootLayout({ children }) {
    return (
        <html lang="zh-CN">
            <head>
                <link rel="icon" href="/favicon.svg" sizes="any" />
                <link rel="canonical" href="https://polarbigdatashow.netlify.app" />
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#00ff88" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content="光伏能源管理" />
                <link rel="apple-touch-icon" href="/image/logo.png" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                
                {/* 结构化数据 */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'SoftwareApplication',
                            name: '光伏新能源路由和关断管理系统',
                            applicationCategory: 'BusinessApplication',
                            operatingSystem: 'Web',
                            offers: {
                                '@type': 'Offer',
                                price: '0',
                                priceCurrency: 'CNY',
                            },
                            aggregateRating: {
                                '@type': 'AggregateRating',
                                ratingValue: '4.8',
                                ratingCount: '150',
                            },
                            description: '专业的光伏新能源路由和关断管理系统，实时监控光伏发电、风力发电、储能充电等数据，提供智能能源管理解决方案。',
                            image: 'https://polarbigdatashow.netlify.app/image/logo.png',
                            url: 'https://polarbigdatashow.netlify.app',
                            author: {
                                '@type': 'Organization',
                                name: '光伏新能源管理系统',
                            },
                            publisher: {
                                '@type': 'Organization',
                                name: '光伏新能源管理系统',
                                logo: {
                                    '@type': 'ImageObject',
                                    url: 'https://polarbigdatashow.netlify.app/image/logo.png',
                                },
                            },
                        }),
                    }}
                />
                
                {/* 组织结构化数据 */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Organization',
                            name: '光伏新能源管理系统',
                            url: 'https://polarbigdatashow.netlify.app',
                            logo: 'https://polarbigdatashow.netlify.app/image/logo.png',
                            description: '提供专业的光伏新能源管理解决方案',
                            sameAs: [
                                'https://www.example.com/social',
                            ],
                        }),
                    }}
                />
            </head>
            <body className="antialiased text-white">
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
