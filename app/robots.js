export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/private/', '/_next/'],
                crawlDelay: 0,
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/api/', '/private/', '/_next/'],
                crawlDelay: 0,
            },
            {
                userAgent: 'Baiduspider',
                allow: '/',
                disallow: ['/api/', '/private/', '/_next/'],
                crawlDelay: 0,
            },
            {
                userAgent: 'bingbot',
                allow: '/',
                disallow: ['/api/', '/private/', '/_next/'],
                crawlDelay: 0,
            },
            {
                userAgent: '360Spider',
                allow: '/',
                disallow: ['/api/', '/private/', '/_next/'],
                crawlDelay: 0,
            },
            {
                userAgent: 'Sogou',
                allow: '/',
                disallow: ['/api/', '/private/', '/_next/'],
                crawlDelay: 0,
            },
        ],
        sitemap: 'https://polarbigdatashow.netlify.app/sitemap.xml',
        host: 'https://polarbigdatashow.netlify.app',
    };
}


