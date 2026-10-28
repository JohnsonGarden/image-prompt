import type { PromptProject, Scene } from './schema';

export type StarterTemplate = {
  id: string;
  title: string;
  category: string;
  description: string;
  thumbnail: 'portrait' | 'fashion' | 'product' | 'lifestyle';
  tags: string[];
  values: Partial<PromptProject> & Pick<PromptProject, 'scene' | 'subject'>;
};

export const starterTemplates: StarterTemplate[] = [
  {
    id: 'portrait-identity', title: '人像身份精确保留', category: '肖像', description: '尽量保持参考人物五官、面貌与身材结构', thumbnail: 'portrait', tags: ['身份一致性', '参考图'],
    values: { scene: 'portrait', subject: '参考图中的成年人物', setting: '干净、克制的专业摄影棚背景', action: '自然站姿，视线看向镜头，神态放松', clothing: '质感自然的简洁日常服装', lighting: 'softbox', lens: '85mm', framing: 'half', preserveIdentity: true, preserveBody: true, naturalSkin: true, constraints: '只调整背景、服装与光线，不主动修改五官比例。' },
  },
  {
    id: 'skin-repair', title: '真实皮肤纹理修复', category: '肖像', description: '针对网格伪影、磨皮和不自然肤质', thumbnail: 'portrait', tags: ['自然皮肤', '修图'],
    values: { scene: 'portrait', subject: '参考图中的成年人物', setting: '保持原始场景与光照方向', lighting: 'window', framing: 'closeup', lens: '85mm', preserveIdentity: true, preserveBody: true, preserveEnvironment: true, naturalSkin: true, constraints: '优先消除规律网格状伪影；保留不均匀的细腻毛孔、轻微色差和自然皮肤纹理，尽量不改动原图身份与轮廓。' },
  },
  {
    id: 'fashion-cover', title: '先锋时尚杂志封面', category: '创意', description: '大胆排版、广角表现力与高级时装摄影', thumbnail: 'fashion', tags: ['时尚', '字体'],
    values: { scene: 'fashion', subject: '具有鲜明个性的成年时尚人物', setting: '极简高端时装摄影棚', clothing: '先锋廓形剪裁，精确表现织物细节', action: '具有设计感的动态姿态', mood: '先锋、大胆、具有国际时尚杂志质感', visibleText: 'IMAGE / ISSUE 01', lighting: 'cinematic', lens: 'wide', framing: 'full', aspectRatio: '9:16', realism: 'editorial', constraints: '杂志文字必须清晰、准确、自然地与人物前后层叠，不要产生乱码或多余文案。' },
  },
  {
    id: 'iphone-candid', title: '手机自然随手拍', category: '摄影', description: '拒绝 AI 过度修饰，保持生活感', thumbnail: 'lifestyle', tags: ['手机摄影', '真实感'],
    values: { scene: 'lifestyle', subject: '真实生活场景中的人物', setting: '真实城市街道或自然户外', action: '不刻意摆拍的自然动作', mood: '日常、松弛、自然', lighting: 'golden', lens: '35mm', framing: 'half', realism: 'natural', naturalSkin: true, constraints: '画面像未经滤镜过度处理的手机直出照片，不要夸张锐化、磨皮、假景深或不真实的高动态范围。' },
  },
  {
    id: 'product-hero', title: '极简商业产品主视觉', category: '商业', description: '产品比例、材质、文字与光影控制', thumbnail: 'product', tags: ['产品摄影', '商业'],
    values: { scene: 'product', subject: '高级香氛玻璃瓶产品', setting: '米色无缝影棚背景，干净的展示台', lighting: 'softbox', lens: '50mm', framing: 'closeup', mood: '克制、高级、商业摄影', realism: 'editorial', preserveIdentity: false, preserveBody: false, naturalSkin: false, constraints: '准确呈现产品主体、材质反射及包装几何结构；留出自然的品牌排版空间。' },
  },
  {
    id: 'editorial-product', title: '彩色创意广告', category: '商业', description: '彩色背景、形体与精确商业文案', thumbnail: 'product', tags: ['广告', '色彩'],
    values: { scene: 'product', subject: '设计感鲜明的饮料包装', setting: '高对比的彩色背景与几何展示道具', lighting: 'cinematic', lens: '50mm', framing: 'half', mood: '现代、充满活力、精致', realism: 'editorial', preserveIdentity: false, preserveBody: false, naturalSkin: false, constraints: '产品正面标签文字清晰，材质反射准确，视觉层级明确。' },
  },
];

export const newProject = (template: StarterTemplate = starterTemplates[0]): PromptProject => ({
  version: 1,
  id: globalThis.crypto?.randomUUID?.() ?? `project-${Date.now()}`,
  title: template.title,
  templateId: template.id,
  setting: '',
  clothing: '',
  action: '',
  mood: '',
  visibleText: '',
  lighting: 'softbox',
  lens: '85mm',
  framing: 'half',
  aspectRatio: '3:4',
  realism: 'natural',
  preserveIdentity: false,
  preserveBody: false,
  preserveEnvironment: false,
  naturalSkin: false,
  constraints: '',
  references: [],
  ...template.values,
});

export const scenes: Record<Scene, string> = {
  portrait: '人像摄影与修图',
  fashion: '时尚造型和杂志视觉',
  product: '商业产品摄影',
  lifestyle: '自然生活纪实摄影',
};
