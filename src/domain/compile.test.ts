import { describe, expect, it } from 'vitest';
import { compilePrompt } from './compile';
import { newProject, starterTemplates } from './templates';
import { loadProjects, saveProjects, STORAGE_KEY } from './storage';

const project = () => newProject(starterTemplates[0]);

describe('GPT Image prompt compiler', () => {
  it('produces a deterministic user-copyable prompt without API jargon', () => {
    const subject = project();
    const a = compilePrompt(subject);
    expect(a).toEqual(compilePrompt(subject));
    expect(a.prompt).toContain('【创作任务】');
    expect(a.prompt).toContain('参考图中的成年人物');
    expect(a.prompt).not.toContain('--ar');
    expect(a.prompt).not.toContain('API_KEY');
  });
  it('preserves explicit identity / body / texture constraints', () => {
    const output = compilePrompt(project());
    expect(output.prompt).toContain('五官布局');
    expect(output.prompt).toContain('身材比例');
    expect(output.prompt).toContain('规律格子伪影');
    expect(output.warnings).toHaveLength(2);
  });
  it('writes reference roles separately and warns about image text', () => {
    const subject = project();
    subject.references = [{ id: 'ref01', role: 'identity', note: '仅用于五官参考' }];
    subject.visibleText = 'ISSUE 01';
    const output = compilePrompt(subject);
    expect(output.prompt).toContain('参考图 1（身份 / 面貌）');
    expect(output.prompt).toContain('仅用于五官参考');
    expect(output.prompt).toContain('ISSUE 01');
    expect(output.warnings.some((warning) => warning.includes('未声明“身份'))).toBe(false);
    expect(output.warnings.some((warning) => warning.includes('拼写'))).toBe(true);
  });
  it('omits blank optional fields and rejects invalid projects', () => {
    const subject = project();
    subject.clothing = '';
    expect(compilePrompt(subject).prompt).not.toContain('服装与造型：');
    expect(() => compilePrompt({ ...subject, aspectRatio: '44:55' } as unknown as typeof subject)).toThrow();
  });
});

describe('local persistence', () => {
  it('roundtrips valid projects', () => {
    const map = new Map<string, string>();
    const storage = { getItem: (key: string) => map.get(key) ?? null, setItem: (key: string, value: string) => { map.set(key, value); } };
    expect(saveProjects(storage, [project()])).toBe(true);
    expect(loadProjects(storage)).toHaveLength(1);
    expect(map.has(STORAGE_KEY)).toBe(true);
  });
  it('recovers from corrupt storage and denied writes', () => {
    expect(loadProjects({ getItem: () => '{not-json' })).toEqual([]);
    expect(saveProjects({ setItem: () => { throw new Error('denied'); } }, [project()])).toBe(false);
  });
});
