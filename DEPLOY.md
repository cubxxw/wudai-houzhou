# 部署说明

本站是 [Quartz v5](https://quartz.jzhao.xyz/) 构建的「郭威·乱世为龙」沉浸式历史阅读站点。
共 27 轮迭代、133 个历史专名注释、唐宋碑拓视觉气质。

## 一、部署前必须修改

### 1. baseUrl（最关键）

修改 `quartz.config.yaml`：

```yaml
configuration:
  baseUrl: your-real-domain.com  # ← 把 localhost:8080 改成真实域名（不带 https://）
```

这会影响：
- `sitemap.xml` 中所有 URL
- `index.xml`（RSS）中所有 URL
- `<meta property="og:image">` 中的 OG 图片 URL
- 所有 `<link rel="canonical">` URL

### 2. CNAME（仅 GitHub Pages 自定义域名）

修改 `quartz/static/CNAME`：

```
your-real-domain.com
```

如果不用 GitHub Pages 或不用自定义域名，**删除这个文件**。

### 3. robots.txt（已自动化，v59 起）

本站修改了 `quartz/plugins/emitters/static.ts`：
- 任何放在 `quartz/static/_root/` 的文件**自动 emit 到 `public/` 根**
- robots.txt 已移到 `quartz/static/_root/robots.txt`
- 部署后 `https://your-domain.com/robots.txt` 直接可用，无需手工 copy

### 4. sitemap URL（如果你的 sitemap 路径非默认）

修改 `quartz/static/_root/robots.txt` 末尾的 Sitemap 行：

```
Sitemap: https://your-real-domain.com/sitemap.xml
```

## 二、部署步骤

### GitHub Pages

**自动方案（v70 起本仓库自带 workflow）**：

本仓库 `.github/workflows/deploy-site.yaml` 是为本站特化的部署 workflow，push 到 `main` 或 `master` 分支自动触发：

1. Fork 本仓库到自己的 GitHub
2. 在 GitHub Settings → Pages → Source 选择「GitHub Actions」
3. 修改 `quartz.config.yaml` 的 `baseUrl` 为 `<username>.github.io/<repo-name>`
4. 直接 `git push origin main`
5. Actions 自动 build + deploy，约 2-3 分钟后访问 `https://<username>.github.io/<repo-name>/`

注意：quartz 自带的 `deploy-v5.yaml` 是 jackyzha0 部署 quartz 文档用，本站用 `deploy-site.yaml`。

**手动方案**：

```bash
npx quartz build
# 把 public/ 内容推到 gh-pages 分支
git subtree push --prefix site/public origin gh-pages
```

### Vercel

```bash
# Build Command: npx quartz build
# Output Directory: public
```

直接连 GitHub 仓库即可。

### Netlify

```bash
# Build command: npx quartz build
# Publish directory: public
```

### 本地预览构建产物

```bash
cd site && npx quartz build
npx serve public
```

## 三、部署后检查清单

- [ ] 浏览器打开 `https://your-real-domain.com` 显示首页 Hero
- [ ] `/sitemap.xml` 内容包含真实域名（非 localhost）
- [ ] `/robots.txt` 可访问且内容正确
- [ ] `/index.xml` (RSS) 可访问
- [ ] 移动端 sidebar sticky 正常、abbr 可 tap 出 tooltip
- [ ] 桌面 hover popover 正常
- [ ] Google Lighthouse 性能 > 90 分
- [ ] 用 [opengraph.xyz](https://www.opengraph.xyz/) 检查 OG image 与 description

## 四、当前性能基准（v68 真实 Lighthouse）

| 指标 | 分数/数值 | 说明 |
|---|---|---|
| SEO | **100/100** 🏆 | OG + JSON-LD + canonical 全 |
| Best Practices | **100/100** 🏆 | |
| Accessibility | **95/100** ✅ | skip-link + main landmark + WCAG 2.4.1 |
| Performance | **48/100** ⏳ | dev server 测；CDN 部署后预计 75+ |
| LCP | 5.8s | dev server；CDN 后预计 < 3s |
| TBT | 460ms | |
| CLS | 0 | 完美 |
| **总体积** | **3.1MB** | v61-v62 减重 47%（从 5.8MB） |
| HTML 页面数 | 108 | 含 tags / folder / 7 部正文 / 30 人物 |
| Sitemap URL | 104 | 0 死链 |

## 五、维护说明

### 加新文章

```bash
# 在 content/ 下加 .md 文件，frontmatter 至少包含：
---
title: 标题
tags: [标签]
---
```

quartz dev server 会自动 reload。

### 加历史专名注释（abbr）

```html
<abbr tabindex="0" title="注释内容（用「」代替英文双引号避免 markdown 解析问题）">专名</abbr>
```

注意：`tabindex="0"` 是 mobile tooltip 工作的关键，**不要省略**。

### 修改视觉

修改 `quartz/styles/custom.scss`。dev server 自动重载。

### 常见坑

- **abbr title 内含双引号** → 用「」中文引号替代，否则 markdown smart-quotes 会破坏 HTML
- **mobile sidebar 高度爆炸** → flex-component 不要 flex-direction:column
- **OG image 是 localhost** → 检查 baseUrl 是否修改

## 六、二十七轮迭代总览

| 阶段 | 内容 |
|---|---|
| 1–10 轮 | 视觉/排版/交互/响应式（碑拓气、卷甲~卷庚卡片、章节扉页、章节计数器、TOC 朱印脉动、卷尾导航） |
| 11–17 轮 | 七部正文 83 个历史专名注释 |
| 18 轮 | 大事年表 20 个注释 |
| 19 轮 | 时代/郭威底层逻辑 9 个注释 |
| 20 轮 | 5 个核心人物图谱 8 个注释 |
| 21 轮 | favicon + OG image + frontmatter description |
| 22 轮 | mobile sidebar 高度修复（128→68px） |
| 23 轮 | mobile abbr 视觉提示 |
| 24 轮 | 76 个 abbr 加 tabindex（mobile tooltip 真工作） |
| 25 轮 | 清理 + 性能优化（5.4→5.2MB，移除 latex/copy-tex） |
| 26 轮 | 史料考据档案 13 个注释（学术闭环） |
| **27 轮** | **部署文档**（本文件） |

**全书 133 个历史专名注释 + 完整碑拓沉浸式视觉体验。**
