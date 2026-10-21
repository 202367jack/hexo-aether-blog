# Aether Weblog

Aether 的个人博客：随笔、技术笔记、项目与影视。
Hexo + Butterfly，静态托管在 GitHub Pages。

- 线上地址：<https://202367jack.github.io/hexo-aether-blog/>
- 仓库：<https://github.com/202367jack/hexo-aether-blog>

## 本地预览

**双击 `预览.bat`** 就行：第一次会自动装依赖，然后生成站点、起本地服务器并打开浏览器
（<http://localhost:4000/hexo-aether-blog/>）。改文章保存后浏览器自动刷新，关掉黑窗口就停。

不想用 bat 的话：

```powershell
npm install          # 第一次
npm run server       # 预览
npm run build        # 只生成到 public/
```

## 写内容

**不用记命令**：全鼠标版步骤在 [`写作指南.md`](写作指南.md)，
要复制的东西在 [`模板/`](模板)。一句话版本：

| 要写什么 | 复制什么 | 粘到哪里 |
| --- | --- | --- |
| 随笔 | `模板/随笔.md` | `source/_posts/`，再建同名文件夹放图 |
| 笔记 | `模板/笔记.md` | 同上 |
| 影视评价 | `模板/影视评价/` 整个文件夹 | `source/media/` |
| 项目 | `模板/项目/` 整个文件夹 | `source/projects/` |

文件名（文件夹名）决定网址，用英文小写 + 数字 + 短横线。

文章在 `source/_posts/`，同名目录放这篇文章的图片：

```
source/_posts/
├── 2026-10-20-hello-java.md
└── 2026-10-20-hello-java/     ← 同名目录放这篇文章的图片
    ├── screenshot.png
    └── diagram.jpg
```

正文里就用最普通的 Markdown 图片语法：

```markdown
![](screenshot.png)
```

构建时 `tools/convert-images.js` 会把 png/jpg 压成同目录的 `.webp`（长边 1600、质量 80），
`scripts/webp.js` 把正文引用改成 `.webp`，并且不把原图发布出去。
所以**只往目录里丢 png/jpg 就够了**，不用手动转格式。

> 唯一的小提醒：`hexo server` 正在跑的时候新丢进去的图，这一轮会先用原图显示
> （不会变成死链），重开一次预览就转成 WebP 了。

分类决定进哪个板块：

| `categories` | 进哪个板块 |
| --- | --- |
| `随笔` | 随笔（每页 8 篇分页） |
| `笔记` | 笔记（技术文章，不分页） |

## 字段速查

### 影视（`source/media/<英文短名>/index.md`）

| 字段 | 作用 |
| --- | --- |
| `title` | 片名 |
| `rating` | 评分，列表卡片和详情页都显示（0–10，可以带小数） |
| `quote` | 一句话评语，显示在列表卡片上 |
| `medium` | 剧集 / 电影 / 动画 …（影视页第一组筛选） |
| `genre` | 类型，写在方括号里，如 `[奇幻, 爱情]`（第二组筛选，一部片可以有多个） |
| `region` | 地区，如 `中国`（第三组筛选） |
| `year` / `status` | 年份 / 看完·在看·弃了 |
| `poster` | 海报文件名，没有海报就把这行注释掉，卡片会显示片名占位 |

海报就放在同目录、命名 `poster.jpg`。筛选按钮是从所有影视条目的字段里自动汇总的，
加新片不用改代码。

### 项目（`source/projects/<英文短名>/index.md`）

| 字段 | 作用 |
| --- | --- |
| `title` / `summary` | 标题、一句话简介（卡片上显示） |
| `stack` | 技术栈，如 `[Hexo, Butterfly, GitHub Actions]` |
| `repo` | 仓库链接，卡片上会变成 GitHub 图标按钮 |
| `status` | 进行中 / 已完成 |
| `order` | 排序，数字小的排前面 |

项目列表页是 `source/projects/index.md` 里的 `{% project_cards %}` 自动生成的，不用手动加链接。

## 目录结构

```
├─ _config.yml            Hexo 主配置（url / root 带子目录前缀）
├─ _config.butterfly.yml  主题配置（导航、暗色模式、搜索、侧栏、giscus）
├─ 写作指南.md             全鼠标版写作步骤
├─ 模板/                  随笔 / 笔记 / 影视 / 项目模板，复制改名就能用
├─ source/
│  ├─ _posts/             随笔 + 笔记
│  ├─ projects/           项目（type: project，列表页 {% project_cards %}）
│  ├─ media/              影视（type: media，列表页 {% media_grid %}）
│  ├─ about/  resume/     关于 / 简历（简历支持打印成 PDF）
│  ├─ board/              留言板（靠 giscus 的 Discussions）
│  ├─ friends/  stats/    友链 / 统计（数据在 _data/ 和 front-matter 里）
│  ├─ _data/              友链名单 friends.yml、首页「现在」now.yml
│  ├─ 404.md robots.txt   404 页（permalink 改成 /404.html）与抓取规则
│  ├─ css/aether.css      自定义样式
│  ├─ js/aether.js        影视筛选、日夜切换、阅读进度、分享等交互
│  └─ img/                头像、图标（不参与 WebP 转换）
├─ scripts/               Hexo 插件脚本（板块分页、卡片、注入、WebP、统计、现在）
├─ tools/convert-images.js 图片压缩脚本
├─ tools/check-links.js    站内链接自检（npm run check）
├─ 预览.bat               双击预览
├─ .github/workflows/deploy.yml  push 即部署
└─ .github/workflows/snake.yml   贡献热力图贪吃蛇（每天自动更新）
```

## 部署

**第一次发布**（只需要一次）：

1. 仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**；
2. 双击 `发布.bat`。

少了第 1 步，Actions 会停在 `configure-pages` 那一步报 `Not Found`。

之后每次写完，**双击 `发布.bat`**：它提交、推送，GitHub Actions 自动构建并发布到
<https://202367jack.github.io/hexo-aether-blog/>，大约 1–2 分钟。

想手动来也行：

```powershell
git add .
git commit -m "写点什么"
git push
```

推之前想先自检站内链接和图片有没有 404：

```powershell
npm run check
```

> 站点挂在 `https://202367jack.github.io/hexo-aether-blog/` 这个子路径下，
> `_config.yml` 里的 `url` 和 `root` 必须保持带 `/hexo-aether-blog`，否则 CSS 和图片会 404。
