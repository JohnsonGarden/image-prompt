import { z } from 'zod';

export const sceneOptions = [
  { id: 'portrait', name: '人像摄影', subtitle: '肖像 / 身份一致性' },
  { id: 'fashion', name: '时尚大片', subtitle: '杂志 / 造型 / 排版' },
  { id: 'product', name: '商业产品', subtitle: '电商 / 品牌视觉' },
  { id: 'lifestyle', name: '生活纪实', subtitle: '手机随手拍' },
] as const;

export const lightOptions = [
  { id: 'softbox', label: '影棚柔光', text: '柔和的摄影棚主光与自然阴影，肤质和材质细节清晰' },
  { id: 'golden', label: '黄金时刻', text: '接近日落的暖色自然光，微妙逆光和真实环境反射' },
  { id: 'window', label: '窗边自然光', text: '透过窗户的自然散射光，光影层次细腻' },
  { id: 'cinematic', label: '电影布光', text: '具有方向感的电影级灯光，层次清晰，反差可控' },
] as const;

export const lensOptions = [
  { id: '35mm', label: '35mm', text: '35mm 环境人像视角，兼顾人物与环境叙事' },
  { id: '50mm', label: '50mm', text: '50mm 自然透视，主体比例协调' },
  { id: '85mm', label: '85mm', text: '85mm 人像镜头效果，透视自然，背景适度虚化' },
  { id: 'wide', label: '广角', text: '广角摄影透视，近景元素有明显但合理的视觉张力' },
] as const;

export const framingOptions = [
  { id: 'closeup', label: '面部特写', text: '面部特写，精确展现五官及自然细节' },
  { id: 'half', label: '半身', text: '半身构图，头肩与躯干比例协调' },
  { id: 'full', label: '全身', text: '全身构图，人物完整入镜且四肢比例自然' },
  { id: 'wide', label: '环境全景', text: '宽阔的环境构图，主体与背景层次清楚' },
] as const;

export const ratioOptions = ['1:1', '3:2', '2:3', '4:3', '3:4', '16:9', '9:16'] as const;
export const referenceRoles = [
  { id: 'identity', label: '身份 / 面貌', help: '以参考图身份为依据，不主动重塑五官' },
  { id: 'pose', label: '姿势 / 构图', help: '借鉴动作与构图，不复制非指定身份' },
  { id: 'outfit', label: '服装 / 材质', help: '参考服饰与纹理' },
  { id: 'environment', label: '场景 / 光线', help: '参考背景与氛围' },
] as const;

const optionalText = z.string().trim().max(1000);
export const promptProjectSchema = z.object({
  version: z.literal(1),
  id: z.string().min(1),
  title: z.string().trim().min(1).max(80),
  templateId: z.string().min(1),
  scene: z.enum(['portrait', 'fashion', 'product', 'lifestyle']),
  subject: z.string().trim().min(1).max(1000),
  setting: optionalText,
  clothing: optionalText,
  action: optionalText,
  mood: optionalText,
  visibleText: optionalText,
  lighting: z.enum(['softbox', 'golden', 'window', 'cinematic']),
  lens: z.enum(['35mm', '50mm', '85mm', 'wide']),
  framing: z.enum(['closeup', 'half', 'full', 'wide']),
  aspectRatio: z.enum(ratioOptions),
  realism: z.enum(['natural', 'editorial', 'stylized']),
  preserveIdentity: z.boolean(),
  preserveBody: z.boolean(),
  preserveEnvironment: z.boolean(),
  naturalSkin: z.boolean(),
  constraints: optionalText,
  references: z.array(z.object({ id: z.string().min(1), role: z.enum(['identity', 'pose', 'outfit', 'environment']), note: optionalText })).max(6),
});

export type PromptProject = z.infer<typeof promptProjectSchema>;
export type Scene = PromptProject['scene'];
export type ReferenceRole = PromptProject['references'][number]['role'];
