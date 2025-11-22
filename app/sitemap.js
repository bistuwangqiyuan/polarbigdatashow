export default function sitemap() {
    const baseUrl = 'https://polarbigdatashow.netlify.app';
    const currentDate = new Date().toISOString();

    return [
        {
            url: baseUrl,
            lastModified: currentDate,
            changeFrequency: 'hourly',
            priority: 1.0,
            alternates: {
                languages: {
                    'zh-CN': baseUrl,
                },
            },
        },
        {
            url: `${baseUrl}/about`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
            alternates: {
                languages: {
                    'zh-CN': `${baseUrl}/about`,
                },
            },
        },
        {
            url: `${baseUrl}/devices`,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 0.9,
            alternates: {
                languages: {
                    'zh-CN': `${baseUrl}/devices`,
                },
            },
        },
        {
            url: `${baseUrl}/analytics`,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 0.9,
            alternates: {
                languages: {
                    'zh-CN': `${baseUrl}/analytics`,
                },
            },
        },
        {
            url: `${baseUrl}/history`,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 0.8,
            alternates: {
                languages: {
                    'zh-CN': `${baseUrl}/history`,
                },
            },
        },
        {
            url: `${baseUrl}/settings`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.6,
            alternates: {
                languages: {
                    'zh-CN': `${baseUrl}/settings`,
                },
            },
        },
    ];
}


