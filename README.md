# Image Prompt — Visual Prompt Studio

**以 GPT Images 2.5 创作需求为中心的 Local-first、无 API Key 提示词工作台。**

> 当前为 **v0.1 MVP**：生成结构化提示词，然后复制到 [ChatGPT](https://chatgpt.com/) 中，使用用户现有的 ChatGPT Plus 订阅创作。不提供自动生图、官方模型选择或使用 Plus 订阅调用 API 的能力。

## 已经可以使用

- 6 套可编辑的原创起步模板：身份保留、皮肤纹理修复、时尚封面、手机随手拍、商业主视觉、创意广告。
- 可选主体、背景、人物动作、服装、情绪、精确文案；构图、镜头、光线、比例与视觉质感。
- 独立的精确约束面板：身份/五官、身材、环境、真实皮肤纹理；参考图角色的文本标注。
- **确定性 Prompt Compiler**：实时生成可复制到 ChatGPT 的中文分段提示词，且提示缺少身份参考图、文字排版需要人工校验等风险。
- 本地项目保存、恢复、删除、复制为新版本。数据存于本机当前浏览器 `localStorage`；无登录，无网络发送（不加载任何第三方字体资源）。
- 响应式界面，可在 macOS、Windows 和移动端浏览器使用。

## 在本地运行

需要 Node.js 22+。

```bash
npm install --no-audit --no-fund
npm run dev
```

浏览器打开 `http://127.0.0.1:5173`。首次使用请先运行 `npm install --no-audit --no-fund`，无需配置任何 `.env` 或 API Key。

```bash
npm test           # 编译器 + 持久化回归测试
npm run typecheck  # TypeScript 严格检查
npm run build      # 生成 dist/ 静态站点
```

## 设计边界

- **无官方生图 API**：ChatGPT Plus 与 OpenAI API 独立计费。V1 不尝试通过 Cookie、逆向接口、非官方 OAuth 绕过计费或额度。
- **GPT Images 2.5 优先，不等于可强制模型选择**：编译器按 GPT Images 的自然语言编辑场景优化措辞；ChatGPT Web 内实际使用的底层模型和支持的画幅由 ChatGPT 决定。
- **参考图管理只做文本声明**：在工作台描述每张图用途，在 ChatGPT 中手动上传；MVP 不读取、不存储参考图片。
- **安全**：所有输入文本作为内容写入最终 Prompt，绝不被解释为代码执行。没有服务端或凭据存储。请勿存入敏感个人资料；清除浏览器站点数据会永久删除本地项目。
- **第三方资产**：首批模板为原创结构化模板，不拷贝第三方图片或提示词；未来参考 `awesome-gpt-image-2` 时单独核验版权与来源。

## Engineering Harness

- **SDD**：`docs/PRD.md`（功能规格、边界、验收）→ `docs/ARCHITECTURE.md` / `docs/adr/0001-local-first.md`（设计决策）。
- **TDD**：`src/domain/compile.test.ts` 对编译器、约束、参考图和持久化进行单元回归。
- **CI**：`.github/workflows/ci.yml` 在 PR / main 上执行 `npm install --no-audit --no-fund`、测试、类型检查和构建。
- **增量 PR**：所有后续变更先更新规格、增加失败测试，再实现；PR 里说明手工验收和截图。

## 下一步

1. 提示词版本对比、导入/导出（在用户清除浏览器数据前有可靠备份）。
2. 图像角色参考的本地附件能力及敏感信息说明。
3. 20 套可参数化、许可清晰的模板；质量验证 A/B 样本集。
4. 可选官方 API Provider 插件（必须独立配置、明确计费，不阻塞无 API 用户）。

License: MIT。项目不隶属于 OpenAI。
