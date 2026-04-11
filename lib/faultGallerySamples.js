/**
 * 光伏组件图像样本说明（演示图库，文案参考典型识别场景分类）
 * 图片位于 public/image/fault-gallery/
 */

export const FAULT_GALLERY_INTRO = {
  title: '典型光伏板图像库',
  subtitle: '真实现场采集样本，可用于对照识别与运维培训（本站为静态展示）。',
  body:
    '下列图片来自示范电站及周边现场采集，涵盖正常对照与常见表面异常（遮挡、污染、阴影等）。可点击缩略图查看大图，便于与 AI 识别流程或人工巡检标准对照。',
}

/** @typedef {'normal' | 'field' | 'fault'} FaultGalleryKind */

/** @type {Array<{ id: string; file: string; title: string; badge: string; description: string; tags: string[]; kind: FaultGalleryKind }>} */
export const FAULT_GALLERY_ITEMS = [
  {
    id: 'normal-a',
    file: 'normal-1.png',
    title: '正常对照 · 样本 A',
    badge: '正常',
    description: '组件表面清洁、栅线清晰，用于建立「无异常」基准。',
    tags: ['对照组', '基准'],
    kind: 'normal',
  },
  {
    id: 'normal-b',
    file: 'normal-2.png',
    title: '正常对照 · 样本 B',
    badge: '正常',
    description: '不同角度与光照下的正常组件外观，便于校准曝光与色彩。',
    tags: ['对照组', '多角度'],
    kind: 'normal',
  },
  {
    id: 's1',
    file: 'sample.png',
    title: '光伏板阵列 - 样本 1',
    badge: '现场采集',
    description: '典型阵列安装场景，展示标准排布与日照下的面板状态。',
    tags: ['阵列', '标准安装'],
    kind: 'field',
  },
  {
    id: 's2',
    file: 'sample2.png',
    title: '光伏板阵列 - 样本 2',
    badge: '现场采集',
    description: '斜视视角下的阵列，可用于测试不同视角下的识别稳定性。',
    tags: ['阵列', '视角'],
    kind: 'field',
  },
  {
    id: 's3',
    file: 'sample3.png',
    title: '光伏板阵列 - 样本 3',
    badge: '现场采集',
    description: '运行环境中组件整体状态，可见安装面与环境背景关系。',
    tags: ['阵列', '环境'],
    kind: 'field',
  },
  {
    id: 's4',
    file: 'sample4.png',
    title: '光伏板特写',
    badge: '现场采集',
    description: '近距离拍摄，便于观察表面纹理、焊带与潜在微裂、脏污区域。',
    tags: ['特写', '细节'],
    kind: 'field',
  },
  {
    id: 's5',
    file: 'sample5.png',
    title: '植被严重遮挡',
    badge: '异常',
    description: '杂草或灌木大面积覆盖组件，透光受阻，需清理并评估遮挡比。',
    tags: ['遮挡', '植被', '需清理'],
    kind: 'fault',
  },
  {
    id: 's6',
    file: 'sample6.png',
    title: '阴影遮挡分析',
    badge: '异常',
    description: '条状或块状阴影落在组件表面，对应发电损失与组串失配风险。',
    tags: ['阴影', '失配'],
    kind: 'fault',
  },
  {
    id: 's7',
    file: 'sample7.png',
    title: '灰尘轻度覆盖',
    badge: '异常',
    description: '表面均匀或局部积灰，透光率下降，建议纳入定期清洗计划。',
    tags: ['灰尘', '轻度'],
    kind: 'fault',
  },
  {
    id: 's8',
    file: 'sample8.png',
    title: '灰尘特写',
    badge: '异常',
    description: '近距离可见积灰纹理与附着形态，便于与「正常」纹理对比。',
    tags: ['灰尘', '特写'],
    kind: 'fault',
  },
  {
    id: 's9',
    file: 'sample9.png',
    title: '落叶与植物遮挡',
    badge: '异常',
    description: '落叶或边缘植物接触组件，局部遮挡，需巡检清理排水与周边。',
    tags: ['落叶', '维护'],
    kind: 'fault',
  },
  {
    id: 's10',
    file: 'sample10.png',
    title: '杂草严重覆盖',
    badge: '严重',
    description: '茂密杂草覆盖组件表面，发电能力大幅下降，应优先治理。',
    tags: ['杂草', '严重遮挡'],
    kind: 'fault',
  },
  {
    id: 's11',
    file: 'sample11.png',
    title: '鸟粪与污渍',
    badge: '异常',
    description: '局部强遮挡与腐蚀风险，需清洗并记录频次以优化运维策略。',
    tags: ['鸟粪', '清洗'],
    kind: 'fault',
  },
]

export function faultGallerySrc(file) {
  return `/image/fault-gallery/${file}`
}
