---
title: 本站说明：怎么写文章、放图片、预览和发布
date: 2026-10-20 21:30:00
categories:
  - 笔记
tags:
  - Hexo
  - 写作
---

这篇写给以后的我：这套站怎么加文章、图片放哪、怎么本地看、怎么上线。

## 加一篇文章

在 `source/_posts/` 下新建一个 `.md`，文件名用英文短横线（它决定网址），标题写在 front-matter 里：

```yaml
---
title: 文章标题
date: 2026-10-20 21:30:00
categories:
  - 随笔        # 随笔 / 笔记 二选一
---
```

- 分类写「随笔」，文章会进 `随笔` 板块，每页 8 篇自动分页
- 分类写「笔记」，文章会进 `笔记` 板块
- 两个都会出现在首页最新文章里

## 图片放哪

**一篇文章一个同名目录。** 比如文章是 `my-post.md`，就在旁边建 `my-post/`，图丢进去：

```
source/_posts/
├── my-post.md
└── my-post/
    ├── 截图.png
    └── 流程图.jpg
```

正文里用最普通的 Markdown 图片语法就行，路径写图名：

```markdown
![](截图.png)
```

不用写 `../../images/` 这种相对路径，Hexo 会把图按文章网址归位。

## 图片会自动压成 WebP

构建时 `scripts/webp.js` 会：

1. 把文章目录里的 png/jpg 转成同名 `.webp`（长边 1600px，质量 80）
2. 把正文里的 `.png` / `.jpg` 引用改成 `.webp`
3. 生成完后，`public/` 里只保留 WebP，原图不随站点发布

所以**只需要往目录里丢 png/jpg**，不用手动转格式，也不用上传 WebP。

## 本地预览

双击仓库根目录的 **`预览.bat`**：它会装依赖（第一次）、生成站点、起本地服务器并打开浏览器。

改文章保存后浏览器会自动刷新；关掉那个黑窗口就停了。

## 发布

```powershell
git add .
git commit -m "写点什么"
git push
```

push 到 `main` 后 GitHub Actions 自动构建并发布到 GitHub Pages，地址是
<https://202367jack.github.io/aether-weblog-hexo/>。

## 加影视 / 加项目

- 影视：在 `source/media/` 下建一个目录（如 `source/media/interstellar/`），里面放 `index.md` 和海报 `poster.jpg`，front-matter 里写 `type: media`、`rating`、`medium`、`genre`、`region`、`year`、`quote`
- 项目：在 `source/projects/` 下建目录放 `index.md`，front-matter 里写 `type: project`、`summary`、`stack`、`repo`

列表页会自动多出一张卡，不用改任何模板。
