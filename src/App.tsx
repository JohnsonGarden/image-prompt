import { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Check, CheckCheck, ChevronDown, CircleHelp, Copy, ExternalLink, FileText, Image as ImageIcon, Layers3, Menu, Plus, RefreshCw, Save, ShieldCheck, SlidersHorizontal, Sparkles, Trash2, WandSparkles, X } from 'lucide-react';
import { compilePrompt } from './domain/compile';
import { lensOptions, framingOptions, lightOptions, ratioOptions, referenceRoles, type PromptProject, type ReferenceRole } from './domain/schema';
import { loadProjects, saveProjects } from './domain/storage';
import { newProject, scenes, starterTemplates, type StarterTemplate } from './domain/templates';

type Tab = 'content' | 'camera' | 'constraints';
type Filter = '全部' | '肖像' | '创意' | '摄影' | '商业';
const filters: Filter[] = ['全部', '肖像', '创意', '摄影', '商业'];

const getInitialProjects = (): PromptProject[] => {
  if (typeof window === 'undefined') return [];
  return loadProjects(window.localStorage);
};

function App() {
  const [saved, setSaved] = useState<PromptProject[]>(getInitialProjects);
  const [draft, setDraft] = useState<PromptProject>(() => getInitialProjects()[0] ?? newProject());
  const [tab, setTab] = useState<Tab>('content');
  const [filter, setFilter] = useState<Filter>('全部');
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [view, setView] = useState<'studio' | 'library'>('studio');
  const compiler = useMemo(() => { try { return compilePrompt(draft); } catch { return null; } }, [draft]);
  const clean = saved.some((s) => JSON.stringify(s) === JSON.stringify(draft));
  const activeTemplate = starterTemplates.find((template) => template.id === draft.templateId);
  const update = <K extends keyof PromptProject>(key: K, value: PromptProject[K]) => {
    setDraft((previous) => ({ ...previous, [key]: value }));
    setCopied(false);
  };
  const applyTemplate = (template: StarterTemplate) => {
    setDraft(newProject(template));
    setTab('content');
    setView('studio');
    setCopied(false);
    setNotice('已载入模板，可以自由修改每个字段。');
    setMobileMenu(false);
  };
  const startBlank = () => {
    const next = newProject();
    setDraft({ ...next, title: '未命名创作', templateId: 'custom', subject: '在此描述需要创作的主体', setting: '', action: '', clothing: '', constraints: '', preserveIdentity: false, preserveBody: false, preserveEnvironment: false });
    setView('studio');
    setTab('content');
    setMobileMenu(false);
    setNotice('新建项目成功，保存后将出现在本地项目中。');
  };
  const persist = (next: PromptProject[]) => {
    if (saveProjects(window.localStorage, next)) {
      setSaved(next);
      setNotice('已保存到此浏览器的本地存储。');
    } else {
      setNotice('保存失败：浏览器可能禁止本地存储，或存储空间已满。');
    }
  };
  const save = () => {
    const next = [draft, ...saved.filter((p) => p.id !== draft.id)].slice(0, 100);
    persist(next);
  };
  const remove = (id: string) => {
    const next = saved.filter((p) => p.id !== id);
    persist(next);
    if (draft.id === id) setDraft(newProject());
  };
  const duplicate = () => {
    setDraft((previous) => ({ ...previous, id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()), title: `${previous.title} · 副本` }));
    setNotice('已创建未保存的副本。');
  };
  const copy = async () => {
    if (!compiler) return;
    try {
      await navigator.clipboard.writeText(compiler.prompt);
      setCopied(true);
      setNotice('提示词已复制。打开 ChatGPT 后粘贴，并按需上传参考图。');
    } catch {
      setNotice('复制失败：请手动选中下方提示词进行复制。');
    }
  };
  const selectProject = (project: PromptProject) => {
    setDraft(project);
    setView('studio');
    setTab('content');
    setMobileMenu(false);
    setNotice('已载入本地项目。');
  };
  const updateRef = (id: string, patch: Partial<PromptProject['references'][number]>) => update('references', draft.references.map((ref) => ref.id === id ? { ...ref, ...patch } : ref));
  const addRef = () => {
    if (draft.references.length >= 6) return;
    update('references', [...draft.references, { id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()), role: 'identity', note: '' }]);
  };
  const templates = starterTemplates.filter((template) => filter === '全部' || template.category === filter);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-icon"><Layers3 size={22} strokeWidth={1.8}/></div>
          <div><div className="brand-title">image prompt<span className="brand-star">✳</span></div><div className="brand-subtitle">VISUAL PROMPT STUDIO</div></div>
          <button type="button" className="icon-btn close-mobile" aria-label="关闭菜单" onClick={() => setMobileMenu(false)}><X size={17}/></button>
        </div>
        <div className="sidebar-divider"/>
        <div className="sidebar-nav">
          <button type="button" className={`nav-item ${view === 'studio' ? 'active' : ''}`} onClick={() => { setView('studio'); setMobileMenu(false); }}><SlidersHorizontal size={18}/> 创作工作台 <span className="nav-shortcut">01</span></button>
          <button type="button" className={`nav-item ${view === 'library' ? 'active' : ''}`} onClick={() => { setView('library'); setMobileMenu(false); }}><BookOpen size={18}/> 我的项目 <span className="counter">{saved.length}</span></button>
        </div>
        <div className="sidebar-label-row"><span className="sidebar-label">STARTER COLLECTION</span><span className="small-dot"/></div>
        <div className="template-list">
          {starterTemplates.map((template, index) => (
            <button type="button" key={template.id} onClick={() => applyTemplate(template)} className={`template-item ${draft.templateId === template.id && view === 'studio' ? 'selected' : ''}`}>
              <div className={`thumb thumb-${template.thumbnail}`}><span>{String(index + 1).padStart(2, '0')}</span></div>
              <div className="template-item-copy"><strong>{template.title}</strong><small>{template.category} · {template.tags[0]}</small></div>
              <ArrowRight size={14} className="template-arrow"/>
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="offline-card"><ShieldCheck size={18}/><div><strong>零 API 成本</strong><span>仅在本地构建并保存提示词</span></div></div>
          <div className="sidebar-footer"><span>V0.1 PREVIEW</span><span>LOCAL FIRST</span></div>
        </div>
      </aside>

      <main className="main-pane">
        <header className="topbar">
          <button type="button" className="icon-btn mobile-menu" aria-label="打开菜单" onClick={() => setMobileMenu(true)}><Menu size={21}/></button>
          <div className="breadcrumbs"><span>WORKSPACE</span><span className="chevron">/</span><strong>{view === 'studio' ? '创作工作台' : '我的项目'}</strong></div>
          <div className="top-actions"><span className="offline-indicator"><i/> Local only</span><button className="new-btn" type="button" onClick={startBlank}><Plus size={16}/> 新建创作</button></div>
        </header>

        {view === 'library' ? (
          <section className="library-view">
            <div className="eyebrow"><span className="eyebrow-line"/> YOUR COLLECTION</div>
            <h1>我的项目<span className="heading-star">✳</span></h1>
            <p className="intro-text">所有项目仅保存于当前浏览器。清除站点数据会删除本地内容；不同设备不会自动同步。</p>
            {saved.length === 0 ? <div className="empty-state"><BookOpen size={36}/><h3>还没有保存的作品</h3><p>进入创作工作台，调节模板并点击「保存项目」。</p><button type="button" onClick={() => setView('studio')}>前往工作台 <ArrowRight size={15}/></button></div> :
              <div className="library-grid">{saved.map((project) => <article key={project.id} className="library-card"><div className={`library-art thumb-${starterTemplates.find((t) => t.id === project.templateId)?.thumbnail ?? 'portrait'}`}><ImageIcon size={34}/></div><div className="library-content"><span>{scenes[project.scene]}</span><h3>{project.title}</h3><p>{project.subject}</p><div className="library-actions"><button type="button" onClick={() => selectProject(project)}>继续编辑 <ArrowRight size={14}/></button><button type="button" aria-label={`删除 ${project.title}`} title="删除" onClick={() => remove(project.id)}><Trash2 size={15}/></button></div></div></article>)}</div>
            }
          </section>
        ) : (
          <div className="studio-layout">
            <section className="editor-pane">
              <div className="editor-head">
                <div className="eyebrow"><span className="eyebrow-line"/> CREATIVE WORKSPACE <span className="meta-number">/ 001</span></div>
                <h1>让好创意，<em>更可控。</em><span className="heading-star">✳</span></h1>
                <p className="intro-text">从灵感到专业提示词，精确控制每个视觉细节。</p>
                <div className="project-toolbar">
                  <div className="project-ident"><div className="project-icon"><ImageIcon size={20}/></div><div><label htmlFor="project-title">当前项目</label><input id="project-title" aria-label="项目名称" value={draft.title} maxLength={80} onChange={(e) => update('title', e.target.value)}/></div></div>
                  <div className="project-buttons"><span className={`draft-status ${clean ? 'saved' : ''}`}><span/> {clean ? '已保存' : '未保存'}</span><button type="button" title="另存为副本" className="small-icon-btn" onClick={duplicate}><Copy size={16}/></button><button type="button" className="save-btn" onClick={save} disabled={!draft.subject.trim() || !draft.title.trim()}><Save size={15}/> 保存项目</button></div>
                </div>
              </div>

              <section className="starter-section">
                <div className="section-heading"><div><span className="section-kicker">01 — FIND YOUR DIRECTION</span><h2>选择创作起点</h2></div><span className="section-sub">从模板开始，随时可以修改</span></div>
                <div className="filter-row">{filters.map((item) => <button type="button" key={item} className={`filter-btn ${filter === item ? 'on' : ''}`} onClick={() => setFilter(item)}>{item}</button>)}</div>
                <div className="starter-grid">
                  {templates.map((template) => <button type="button" key={template.id} className={`starter-card ${draft.templateId === template.id ? 'is-selected' : ''}`} onClick={() => applyTemplate(template)}>
                    <div className={`starter-image thumb-${template.thumbnail}`}><div className="image-orbit"/><div className="thumbnail-text">{template.category === '肖像' ? 'PORTRAIT' : template.category === '创意' ? 'EDITORIAL' : template.category === '摄影' ? 'LIFESTYLE' : 'PRODUCT'}</div><div className="thumbnail-glyph">{template.thumbnail === 'portrait' ? '◉' : template.thumbnail === 'fashion' ? '✳' : template.thumbnail === 'lifestyle' ? '◒' : '◈'}</div></div>
                    <div className="starter-card-copy"><strong>{template.title}</strong><span>{template.description}</span></div>
                    {draft.templateId === template.id && <span className="selected-mark"><Check size={12}/></span>}
                  </button>)}
                </div>
              </section>

              <section className="controls-section">
                <div className="section-heading"><div><span className="section-kicker">02 — SHAPE THE DETAILS</span><h2>精细调整画面</h2></div><span className="section-sub"><Sparkles size={14}/> {activeTemplate?.title ?? '自由创作'}</span></div>
                <div className="tabs" role="tablist" aria-label="创作设置">
                  <button type="button" role="tab" aria-selected={tab === 'content'} className={tab === 'content' ? 'on' : ''} onClick={() => setTab('content')}><FileText size={16}/> 内容与场景</button>
                  <button type="button" role="tab" aria-selected={tab === 'camera'} className={tab === 'camera' ? 'on' : ''} onClick={() => setTab('camera')}><SlidersHorizontal size={16}/> 镜头与风格</button>
                  <button type="button" role="tab" aria-selected={tab === 'constraints'} className={tab === 'constraints' ? 'on' : ''} onClick={() => setTab('constraints')}><ShieldCheck size={16}/> 精确约束</button>
                </div>

                {tab === 'content' && <div className="fields-area">
                  <TextField label="画面主体" required value={draft.subject} onChange={(value) => update('subject', value)} placeholder="例如：参考图中的成年女性人物" multiline hint="谁是画面的视觉中心？"/>
                  <TextField label="场景 / 背景" value={draft.setting} onChange={(value) => update('setting', value)} placeholder="例如：干净的白色摄影棚，简洁无干扰"/>
                  <div className="two-fields"><TextField label="动作 / 表情" value={draft.action} onChange={(value) => update('action', value)} placeholder="自然微笑，轻微侧身"/><TextField label="服装 / 造型" value={draft.clothing} onChange={(value) => update('clothing', value)} placeholder="简洁的黑色针织上衣"/></div>
                  <TextField label="氛围与情绪" value={draft.mood} onChange={(value) => update('mood', value)} placeholder="例如：自然、舒展、真实、克制"/>
                  <TextField label="图中准确文字（可选）" value={draft.visibleText} onChange={(value) => update('visibleText', value)} placeholder="例如：IMAGE / ISSUE 01" hint="只在需要在图片中出现精确文案时填写。"/>
                </div>}

                {tab === 'camera' && <div className="fields-area">
                  <OptionField title="画面构图" options={framingOptions} value={draft.framing} onChange={(value) => update('framing', value as PromptProject['framing'])}/>
                  <OptionField title="镜头焦段" options={lensOptions} value={draft.lens} onChange={(value) => update('lens', value as PromptProject['lens'])}/>
                  <OptionField title="光线风格" options={lightOptions} value={draft.lighting} onChange={(value) => update('lighting', value as PromptProject['lighting'])}/>
                  <div className="field-group"><div className="field-label">画面比例</div><div className="ratio-options">{ratioOptions.map((ratio) => <button type="button" key={ratio} className={ratio === draft.aspectRatio ? 'selected' : ''} onClick={() => update('aspectRatio', ratio)}><span className={`ratio-box ${ratio === '9:16' || ratio === '2:3' || ratio === '3:4' ? 'portrait-box' : ratio === '1:1' ? 'square-box' : ''}`}/>{ratio}</button>)}</div><small>比例是创作意图；最终能否严格输出取决于 ChatGPT 当前支持的画幅选项。</small></div>
                  <div className="field-group"><div className="field-label">成片质感</div><div className="segmented">{([{ id: 'natural', label: '自然写实' }, { id: 'editorial', label: '商业精修' }, { id: 'stylized', label: '艺术风格' }] as const).map((style) => <button type="button" key={style.id} className={draft.realism === style.id ? 'on' : ''} onClick={() => update('realism', style.id)}>{style.label}</button>)}</div></div>
                </div>}

                {tab === 'constraints' && <div className="fields-area">
                  <div className="tip-note"><ShieldCheck size={18}/> <div><strong>先声明什么不能变</strong><p>约束会被编译到提示词中，但不是像素级锁定。尤其是身份和身材保留，建议同时上传清晰的参考图。</p></div></div>
                  <ToggleRow checked={draft.preserveIdentity} onChange={(value) => update('preserveIdentity', value)} title="保持面部与身份一致" desc="保留五官布局、比例和面貌辨识特征"/>
                  <ToggleRow checked={draft.preserveBody} onChange={(value) => update('preserveBody', value)} title="保持身材比例" desc="减少肢体压缩、变形与比例漂移"/>
                  <ToggleRow checked={draft.preserveEnvironment} onChange={(value) => update('preserveEnvironment', value)} title="保持原有环境" desc="不主动修改背景结构与场景空间关系"/>
                  <ToggleRow checked={draft.naturalSkin} onChange={(value) => update('naturalSkin', value)} title="自然皮肤纹理" desc="控制塑料皮、网格伪影与过度磨皮"/>
                  <TextField label="其他不可变条件 / 补充要求" multiline value={draft.constraints} onChange={(value) => update('constraints', value)} placeholder="例如：只改变衣着和光线，不改变面部表情。"/>
                  <div className="reference-head"><div><div className="field-label">参考图角色说明</div><small>这里只记录每张参考图的用途，不上传和保存图片本身。</small></div><button type="button" onClick={addRef} disabled={draft.references.length >= 6}><Plus size={15}/> 添加参考图说明</button></div>
                  {draft.references.map((ref, index) => <div className="ref-card" key={ref.id}><div className="ref-card-head"><span><ImageIcon size={16}/> 参考图 {index + 1}</span><button type="button" onClick={() => update('references', draft.references.filter((item) => item.id !== ref.id))} aria-label={`删除参考图说明 ${index + 1}`}><X size={16}/></button></div><select aria-label={`参考图 ${index + 1} 的作用`} value={ref.role} onChange={(e) => updateRef(ref.id, { role: e.target.value as ReferenceRole })}>{referenceRoles.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}</select><input aria-label={`参考图 ${index + 1} 的补充说明`} placeholder="可选：说明此图需要提取哪些信息" value={ref.note} onChange={(e) => updateRef(ref.id, { note: e.target.value })}/></div>)}
                </div>}
              </section>
            </section>

            <aside className="output-pane">
              <div className="output-inner">
                <div className="output-title"><div><span className="section-kicker">03 — YOUR RESULT</span><h2>提示词预览 <WandSparkles size={20}/></h2></div><span className="live-pill"><i/> 实时编译</span></div>
                <div className="model-card"><div className="model-icon"><Sparkles size={23}/></div><div><span>优化方向</span><strong>GPT Images 2.5</strong><small>ChatGPT 复制粘贴模式</small></div><ChevronDown size={17} className="model-arrow"/></div>
                <div className="model-hint"><CircleHelp size={15}/><span>本工具不接入 API，不会替你选定 ChatGPT 内部模型；最终使用哪个模型由 ChatGPT 界面决定。</span></div>
                <div className="prompt-heading"><span>COMPILED PROMPT</span><span>{compiler?.wordCount ?? 0} 字符</span></div>
                <div className="prompt-content" aria-label="编译后的提示词"><pre>{compiler?.prompt ?? '请先填写画面主体，生成提示词预览。'}</pre></div>
                {!!compiler?.warnings.length && <div className="warnings"><strong><CircleHelp size={15}/> 使用提醒</strong>{compiler.warnings.map((warning) => <p key={warning}>{warning}</p>)}</div>}
                <button type="button" className="primary-btn" disabled={!compiler} onClick={copy}>{copied ? <CheckCheck size={18}/> : <Copy size={18}/>} {copied ? '已复制，前往 ChatGPT' : '复制完整提示词'} <ArrowRight size={18}/></button>
                <a className="chatgpt-link" href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">打开 ChatGPT 创作 <ExternalLink size={15}/></a>
                <div className="handoff"><div className="handoff-title"><RefreshCw size={16}/> 使用流程</div><div className="handoff-steps"><div><span>1</span> 在这里配置并复制 Prompt</div><div><span>2</span> 在 ChatGPT 中粘贴并上传参考图</div><div><span>3</span> 保存项目，持续迭代参数</div></div></div>
                <div className="privacy-foot"><ShieldCheck size={15}/> 无 API Key · 无云端上传 · 本地存储</div>
              </div>
            </aside>
          </div>
        )}
        {notice && <div className="toast" role="status"><Check size={15}/>{notice}<button type="button" aria-label="关闭提示" onClick={() => setNotice('')}><X size={14}/></button></div>}
      </main>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder, hint, required = false, multiline = false }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; hint?: string; required?: boolean; multiline?: boolean }) {
  return <div className="field-group"><label className="field-label">{label}{required && <span className="required"> *</span>}</label>{multiline ? <textarea rows={3} maxLength={1000} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)}/> : <input type="text" maxLength={1000} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)}/>} {hint && <small>{hint}</small>}</div>;
}

function OptionField({ title, options, value, onChange }: { title: string; options: ReadonlyArray<{ id: string; label: string; text: string }>; value: string; onChange: (value: string) => void }) {
  return <div className="field-group"><div className="field-label">{title}</div><div className="option-grid">{options.map((option) => <button type="button" key={option.id} className={`option-card ${option.id === value ? 'selected' : ''}`} onClick={() => onChange(option.id)}><span className="option-title">{option.label}{option.id === value && <Check size={15}/>}</span><span className="option-desc">{option.text}</span></button>)}</div></div>;
}

function ToggleRow({ title, desc, checked, onChange }: { title: string; desc: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="toggle-row"><div><strong>{title}</strong><small>{desc}</small></div><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)}/><span className="toggle-ui" aria-hidden="true"/></label>;
}

export default App;
