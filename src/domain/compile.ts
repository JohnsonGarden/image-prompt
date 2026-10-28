import { framingOptions, lensOptions, lightOptions, promptProjectSchema, referenceRoles, type PromptProject } from './schema';
import { scenes } from './templates';

export type CompileResult = {
  prompt: string;
  warnings: string[];
  wordCount: number;
};

const optionText = <T extends { id: string; text: string }>(items: readonly T[], id: string): string =>
  items.find((item) => item.id === id)?.text ?? '';

/** Deterministic, provider-free compiler: all output derives from user-controlled fields. */
export function compilePrompt(input: PromptProject): CompileResult {
  const project = promptProjectSchema.parse(input);
  const sections: string[] = [];
  const warnings: string[] = [];
  const details = (items: Array<[string, string]>) => items.filter(([, value]) => value.trim()).map(([name, value]) => `${name}：${value.trim()}。`);

  sections.push(`【创作任务】\n请创作一张${scenes[project.scene]}作品。主体：${project.subject}。`);
  const scene = details([
    ['场景与背景', project.setting], ['服装与造型', project.clothing], ['动作与表情', project.action], ['氛围与情绪', project.mood],
  ]);
  if (scene.length) sections.push(`【画面内容】\n${scene.join('\n')}`);

  sections.push(`【摄影与画面】\n${[optionText(framingOptions, project.framing), optionText(lensOptions, project.lens), optionText(lightOptions, project.lighting), `目标画面比例为 ${project.aspectRatio}`].join('；')}。`);
  sections.push(`【质感风格】\n${{
    natural: '真实自然的摄影质感，保留合理的不完美与真实细节，不进行夸张美颜',
    editorial: '专业商业摄影质感，材质、光线和视觉层级精确且具有设计感',
    stylized: '保留艺术化造型和清晰的风格语言，同时控制主体结构的一致性',
  }[project.realism]}。`);

  const preserve: string[] = [];
  if (project.preserveIdentity) preserve.push('优先保持参考人物的身份辨识特征、五官布局、比例和原有相貌，不主动重塑面部');
  if (project.preserveBody) preserve.push('优先保留参考人物的身材比例、骨骼结构与肢体轮廓，避免肢体压缩、拉宽或比例漂移');
  if (project.preserveEnvironment) preserve.push('保留参考图片的背景环境、场景结构和主要空间关系');
  if (project.naturalSkin) preserve.push('皮肤应保留自然毛孔、细微色差和不规则纹理；避免塑料皮肤、规律格子伪影、过度磨皮');
  if (preserve.length) sections.push(`【必须遵守的约束】\n${preserve.map((line, idx) => `${idx + 1}. ${line}。`).join('\n')}`);

  if (project.references.length) {
    sections.push(`【参考图说明】\n${project.references.map((ref, idx) => {
      const role = referenceRoles.find((item) => item.id === ref.role);
      return `参考图 ${idx + 1}（${role?.label ?? ref.role}）：${role?.help ?? ''}${ref.note ? `；补充：${ref.note}` : ''}。`;
    }).join('\n')}\n将参考图作为对应属性的依据，不要把不同参考图的身份和服装混淆。`);
  }
  if (project.visibleText.trim()) sections.push(`【图中需要出现的文字】\n请准确呈现以下文字（仅这些文字）：「${project.visibleText.trim()}」。保持清晰可读，注意拼写。`);
  if (project.constraints.trim()) sections.push(`【补充要求】\n${project.constraints.trim()}`);
  sections.push('【输出要求】\n生成单张完整成品，不要拼贴展示方案、不要添加未经要求的水印、边框或多余文字。');

  if (project.preserveIdentity && !project.references.some((ref) => ref.role === 'identity')) {
    warnings.push('已启用身份保留，但未声明“身份 / 面貌”参考图。请在 ChatGPT 中上传身份原图并补充参考图说明。');
  }
  if (project.preserveBody && !project.references.some((ref) => ref.role === 'identity' || ref.role === 'pose')) {
    warnings.push('身材比例保留通常需要人物参考图；仅靠文字无法保证一致。');
  }
  if (project.visibleText.trim()) warnings.push('生成式模型可能出现文字拼写偏差，出图后请人工检查。');
  return { prompt: sections.join('\n\n'), warnings, wordCount: sections.join('\n\n').length };
}
