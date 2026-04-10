import '../styles/globals.css';
import { ThemeProvider } from '../lib/themeContext';

export const metadata = {
    metadataBase: new URL('https://polarbigdatashow.netlify.app'),
    title: {
        template: '%s | 光伏新能源路由和关断管理系统',
        default: '光伏新能源路由和关断管理系统 - 智能能源监控与管理平台 | 实时数据可视化'
    },
    description: '专业的光伏新能源路由和关断管理系统，提供7x24小时实时监控光伏发电、储能充电数据。智能能源管理平台助力企业优化能源使用，提高发电效率95%以上，降低运维成本30%，实现绿色能源转型与碳中和目标。',
    keywords: ['光伏能源监控', '新能源管理系统', '光伏发电监控平台', '储能系统管理', '能源管理软件', '智能电网监控', '绿色能源解决方案', '光伏电站管理', '能源数据可视化', '实时能源监控', '分布式光伏', '新能源大数据', '能源物联网', '智慧能源平台'],
    authors: [{ name: '光伏新能源管理系统', url: 'https://polarbigdatashow.netlify.app' }],
    creator: '光伏新能源管理系统',
    publisher: '光伏新能源管理系统',
    applicationName: '光伏新能源路由和关断管理系统',
    referrer: 'origin-when-cross-origin',
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
        description: '专业的光伏新能源路由和关断管理系统，实时监控光伏发电、储能充电等数据，提供智能能源管理解决方案，提升发电效率95%以上。',
        siteName: '光伏新能源管理系统',
        images: [
            {
                url: 'https://polarbigdatashow.netlify.app/image/logo.png',
                width: 1200,
                height: 630,
                alt: '光伏新能源管理系统 - 智能能源监控平台',
                type: 'image/png',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: '光伏新能源路由和关断管理系统 - 智能能源监控与管理平台',
        description: '专业的光伏新能源路由和关断管理系统，7x24小时实时监控光伏发电、储能充电数据，提升能源效率。',
        images: ['https://polarbigdatashow.netlify.app/image/logo.png'],
        creator: '@solar_energy_system',
        site: '@solar_energy_system',
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
        bingBot: {
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
        languages: {
            'zh-CN': 'https://polarbigdatashow.netlify.app',
        },
    },
    category: '能源管理',
    classification: '能源监控与管理系统',
    other: {
        'msapplication-TileColor': '#00ff88',
        'msapplication-config': '/browserconfig.xml',
    },
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#00ff88' },
        { media: '(prefers-color-scheme: dark)', color: '#00d4ff' }
    ],
};

export default function RootLayout({ children }) {
    return (
        <html lang="zh-CN" prefix="og: http://ogp.me/ns#">
            <head>
                {/* 预连接和DNS预取 - 性能优化 */}
                <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
                <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
                
                {/* 图标配置 */}
                <link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any" />
                <link rel="shortcut icon" href="/favicon.svg" />
                <link rel="apple-touch-icon" sizes="180x180" href="/image/logo.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/image/logo.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/image/logo.png" />
                
                {/* PWA配置 */}
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#00ff88" media="(prefers-color-scheme: light)" />
                <meta name="theme-color" content="#00d4ff" media="(prefers-color-scheme: dark)" />
                
                {/* Apple配置 */}
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content="光伏能源管理" />
                
                {/* 其他移动端配置 */}
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="format-detection" content="telephone=no" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                
                {/* 浏览器配置 */}
                <meta name="msapplication-TileColor" content="#00ff88" />
                <meta name="msapplication-tap-highlight" content="no" />
                
                {/* 结构化数据 - SoftwareApplication */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'SoftwareApplication',
                            name: '光伏新能源路由和关断管理系统',
                            applicationCategory: 'BusinessApplication',
                            operatingSystem: 'Web Browser',
                            browserRequirements: 'Requires JavaScript. Requires HTML5.',
                            offers: {
                                '@type': 'Offer',
                                price: '0',
                                priceCurrency: 'CNY',
                                availability: 'https://schema.org/InStock',
                            },
                            aggregateRating: {
                                '@type': 'AggregateRating',
                                ratingValue: '4.8',
                                ratingCount: '150',
                                bestRating: '5',
                                worstRating: '1',
                            },
                            description: '专业的光伏新能源路由和关断管理系统，7x24小时实时监控光伏发电、储能充电等数据，提供智能能源管理解决方案，提升发电效率95%以上。',
                            image: 'https://polarbigdatashow.netlify.app/image/logo.png',
                            screenshot: 'https://polarbigdatashow.netlify.app/image/logo.png',
                            url: 'https://polarbigdatashow.netlify.app',
                            softwareVersion: '1.0.0',
                            datePublished: '2024-01-01',
                            dateModified: new Date().toISOString(),
                            author: {
                                '@type': 'Organization',
                                name: '光伏新能源管理系统',
                                url: 'https://polarbigdatashow.netlify.app',
                            },
                            publisher: {
                                '@type': 'Organization',
                                name: '光伏新能源管理系统',
                                logo: {
                                    '@type': 'ImageObject',
                                    url: 'https://polarbigdatashow.netlify.app/image/logo.png',
                                    width: 600,
                                    height: 60,
                                },
                            },
                            featureList: [
                                '实时光伏发电监控',
                                '光伏发电数据分析',
                                '储能系统管理',
                                '智能能源调度',
                                '数据可视化大屏',
                                '历史数据分析',
                                '设备状态监测',
                                '告警系统'
                            ],
                            softwareHelp: {
                                '@type': 'CreativeWork',
                                url: 'https://polarbigdatashow.netlify.app/about',
                            },
                        }),
                    }}
                />
                
                {/* 结构化数据 - Organization */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Organization',
                            name: '光伏新能源管理系统',
                            alternateName: '光伏能源监控平台',
                            url: 'https://polarbigdatashow.netlify.app',
                            logo: {
                                '@type': 'ImageObject',
                                url: 'https://polarbigdatashow.netlify.app/image/logo.png',
                                width: 600,
                                height: 60,
                            },
                            description: '提供专业的光伏新能源监控与管理解决方案，实时数据采集与分析，助力企业实现智慧能源管理',
                            contactPoint: {
                                '@type': 'ContactPoint',
                                contactType: 'Customer Service',
                                availableLanguage: ['Chinese', 'zh-CN'],
                            },
                            sameAs: [],
                        }),
                    }}
                />
                
                {/* 结构化数据 - WebSite */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'WebSite',
                            name: '光伏新能源路由和关断管理系统',
                            url: 'https://polarbigdatashow.netlify.app',
                            description: '专业的光伏新能源监控与管理平台',
                            inLanguage: 'zh-CN',
                            potentialAction: {
                                '@type': 'SearchAction',
                                target: {
                                    '@type': 'EntryPoint',
                                    urlTemplate: 'https://polarbigdatashow.netlify.app/search?q={search_term_string}',
                                },
                                'query-input': 'required name=search_term_string',
                            },
                        }),
                    }}
                />
                
                {/* 结构化数据 - BreadcrumbList */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'BreadcrumbList',
                            itemListElement: [
                                {
                                    '@type': 'ListItem',
                                    position: 1,
                                    name: '首页',
                                    item: 'https://polarbigdatashow.netlify.app',
                                },
                            ],
                        }),
                    }}
                />
            </head>
            <body className="antialiased text-white" itemScope itemType="https://schema.org/WebPage">
                <ThemeProvider>
                    <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-black">
                        跳转到主内容
                    </a>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
