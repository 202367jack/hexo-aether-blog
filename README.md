# Aether Weblog

Aether 的个人博客：随笔、技术笔记、项目与影视。
Hexo + Butterfly，静态托管在 GitHub Pages。

- 线上地址：<https://202367jack.github.io/aether-weblog-hexo/>
- 仓库：<https://github.com/202367jack/aether-weblog-hexo>

## 本地预览

**双击 `预览.bat`** 就行：第一次会自动装依赖，然后生成站点、起本地服务器并打开浏览器
（<http://localhost:4000/aether-weblog-hexo/>）。改文章保存后浏览器自动刷新，关掉黑窗口就停。

不想用 bat 的话：

```powershell
npm install          # 第一次
npm run server       # 预览
npm run build        # 只生成到 public/
```

## 写文章

文章在 `source/_posts/`，文件名决定网址（用英文短横线）：

```
source/_posts/
├── 2026-10-20-hello-java.md
└── 2026-10-20-hello-java/     ← 同名目录放这篇文章的图片
    ├── 截图.png
    └── 流程图.jpg
```

正文里就用最普通的 Markdown 图片语法：

```markdown
![](截图.png)
```

构建时 `tools/convert-images.js` 会把 png/jpg 压成同目录的 `.webp`（长边 1600、质量 80），
`scripts/webp.js` 把正文引用改成 `.webp`，并且不把原图发布出去。
所以**只往目录里丢 png/jpg 就够了**，不用手动转格式。

分类决定进哪个板块：

| `categories` | 进哪个板块 |
| --- | --- |
| `随笔` | 随笔（每页 8 篇分页） |
| `笔记` | 笔记（技术文章，不分页） |

## 目录结构

```
├─ _config.yml            Hexo 主配置（url / root 带子目录前缀）
├─ _config.butterfly.yml  主题配置（导航、暗色模式、搜索、侧栏）
├─ source/
│  ├─ _posts/             随笔 + 笔记
│  ├─ projects/           项目（type: project，列表页 {% project_cards %}）
│  ├─ media/              影视（type: media，列表页 {% media_grid %}）
│  ├─ about/  resume/     关于 / 简历（简历支持打印成 PDF）
│  ├─ css/aether.css      自定义样式
│  ├─ js/aether.js        影视筛选、简历打印等交互
│  └─ img/                头像、图标（不参与 WebP 转换）
├─ scripts/               Hexo 插件脚本（板块分页、卡片、注入、WebP）
├─ tools/convert-images.js 图片压缩脚本
├─ 预览.bat               双击预览
└─ .github/workflows/deploy.yml  push 即部署
```

## 部署

推到 `main` 就会触发 GitHub Actions 构建并发布到 GitHub Pages：

```powershell
git add .
git commit -m "写点什么"
git push
```

仓库 Settings → Pages → Build and deployment 的 Source 需要选 **GitHub Actions**。

> 站点挂在 `https://202367jack.github.io/aether-weblog-hexo/` 这个子路径下，
> `_config.yml` 里的 `url` 和 `root` 必须保持带 `/aether-weblog-hexo`，否则 CSS 和图片会 404。
