'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen dashboard-bg">
      {/* 顶部标题栏 */}
      <header className="relative z-20 border-b border-primary/30 backdrop-blur-sm">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/image/logo.png"
                alt="公司Logo"
                width={60}
                height={60}
                className="object-contain"
              />
              <h1 className="text-3xl font-display text-primary glow-text">
                关于我们
              </h1>
            </div>
            <div className="flex items-center gap-6">
              <nav className="flex items-center gap-6">
                <Link href="/" className="text-neutral-400 hover:text-primary transition-colors text-sm font-medium">
                  返回首页
                </Link>
                <Link href="/devices" className="text-neutral-400 hover:text-primary transition-colors text-sm font-medium">
                  设备管理
                </Link>
                <Link href="/analytics" className="text-neutral-400 hover:text-primary transition-colors text-sm font-medium">
                  数据分析
                </Link>
                <Link href="/history" className="text-neutral-400 hover:text-primary transition-colors text-sm font-medium">
                  历史趋势
                </Link>
                <Link href="/settings" className="text-neutral-400 hover:text-primary transition-colors text-sm font-medium">
                  系统设置
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="container mx-auto px-8 py-12">
        <div className="max-w-6xl mx-auto">
          {/* 研究总院介绍 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="stat-card">
              <div className="mb-8">
                <h2 className="text-2xl font-display text-primary mb-4 text-center">
                  国家石油天然气管网集团科学技术研究总院分公司
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-8"></div>
              </div>
              
              <div className="space-y-6 text-neutral-300 leading-relaxed">
                <p className="text-lg">
                  国家石油天然气管网集团科学技术研究总院分公司（简称&ldquo;研究总院&rdquo;）是国家石油天然气管网集团所属科技研发机构，注册在天津市滨海新区。
                </p>
                
                <p>
                  研究总院以建设中国特色世界一流能源储运领域专业研发机构和科技创新高地为目标，构建&ldquo;开放、创新、数字化、平台化&rdquo;的科技创新体系，打造国家管网集团&ldquo;科技创新研发中心、战略决策支持中心、成果孵化推广中心、运维技术保障中心、高端人才培养中心&rdquo;，引领国内油气储运行业技术发展，重点实施油气管网共性、基础性及重大技术攻关，实施科技成果孵化推广和先进技术引进应用，实施数字化转型和智能化升级，为国家管网集团建成中国特色世界一流能源基础设施运营商提供技术支撑和资源保障。
                </p>
                
                <p>
                  研究总院科研实力雄厚，科研条件先进完善，拥有国家工程实验室、国家能源局油气长输管道技术装备研发（试验）中心、油气储运重点实验室、节能监测中心等研发平台。研究总院是全国首批承担国际管道研究协会（PRCI）课题的研发单位并承担国家重点研发计划公共安全专项、国家质量基础共性技术研究与应用（NQI）专项、中国科学院战略性先导科技项目，具备独立开展ISO、NACE等国际、国家、行业标准与国内外专利起草能力，是集科技创新、技术服务、成果转化、检测认证、学术期刊、人才培养等业务为一体的综合型科技企业。
                </p>
              </div>
            </div>
          </motion.div>

          {/* 宣传图片展示 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <h3 className="text-xl font-display text-primary mb-8 text-center">企业风采</h3>
            
            {/* 大图展示 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative overflow-hidden rounded-xl shadow-2xl"
              >
                <Image
                  src="/image/aboutus.png"
                  alt="企业总部"
                  width={600}
                  height={400}
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h4 className="text-lg font-medium">企业总部</h4>
                </div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative overflow-hidden rounded-xl shadow-2xl"
              >
                <Image
                  src="/image/aboutus2.jpg"
                  alt="科研设施"
                  width={600}
                  height={400}
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h4 className="text-lg font-medium">科研设施</h4>
                </div>
              </motion.div>
            </div>

            {/* 小图网格 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative overflow-hidden rounded-lg shadow-xl"
              >
                <Image
                  src="/image/aboutus3.jpg"
                  alt="实验中心"
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-2 left-2 text-white text-sm">
                  实验中心
                </div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative overflow-hidden rounded-lg shadow-xl"
              >
                <Image
                  src="/image/oilstoragetank.jpg"
                  alt="储油设施"
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-2 left-2 text-white text-sm">
                  储油设施
                </div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative overflow-hidden rounded-lg shadow-xl"
              >
                <Image
                  src="/image/oilstoragetank2.png"
                  alt="储运基地"
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-2 left-2 text-white text-sm">
                  储运基地
                </div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative overflow-hidden rounded-lg shadow-xl"
              >
                <Image
                  src="/image/oiltank.jpg"
                  alt="油罐群"
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-2 left-2 text-white text-sm">
                  油罐群
                </div>
              </motion.div>
            </div>

            {/* 管道图片 */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-xl shadow-2xl mt-8"
            >
              <Image
                src="/image/pipe.jpg"
                alt="输油管道"
                width={1200}
                height={400}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h4 className="text-xl font-medium">长输管道网络</h4>
                <p className="text-sm text-neutral-300">连接全国的能源输送大动脉</p>
              </div>
            </motion.div>
          </motion.div>

          {/* 核心业务 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-xl font-display text-primary mb-8 text-center">核心业务</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="stat-card text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-primary mb-2">科技创新</h4>
                <p className="text-neutral-400 text-sm">油气管网共性技术攻关与创新研发</p>
              </div>
              
              <div className="stat-card text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-primary mb-2">技术服务</h4>
                <p className="text-neutral-400 text-sm">检测认证与技术咨询服务</p>
              </div>
              
              <div className="stat-card text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-primary mb-2">成果转化</h4>
                <p className="text-neutral-400 text-sm">科技成果孵化推广与产业化</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
