---
title: Aether Weblog
date: 2026-10-20
layout: page
type: project
top_img: false
order: 1
summary: 这个博客本身：内容全在 Git，一条 push 完成发布。
stack: [Hexo, Butterfly, GitHub Actions, GitHub Pages]
repo: https://github.com/202367jack/hexo-aether-blog
status: 进行中
---

## 结构

- **内容仓库**：Markdown 是唯一真源，文章历史就是 `git log`
- **图片**：每篇文章一个同名目录放配图，构建时自动压成 WebP
- **部署**：push 触发 GitHub Actions，构建产物交给 GitHub Pages，服务器和 Nginx 都不用管

## 为什么不用动态博客

不需要登录、不需要访客提交内容、不需要后台。文章写完 push 一次，页面就是现成的 HTML。

代价是不能在网页后台写作，但我本来就在本地写代码，这个代价值得。

## 技术细节

- **从 Hugo 迁到 Hexo + Butterfly**：分页、搜索、暗色模式这些轮子不再自己写，样式跟上游升级也不用打架
- **搜索**：`hexo-generator-searchdb` 在构建时生成索引，前端做本地检索，不依赖任何服务
- **影视 / 项目墙**：front-matter 驱动，列表页一行 `{% media_grid %}` / `{% project_cards %}` 就够了
- **图片**：`post_asset_folder` + 自动 WebP，作者只要往文章同名目录里丢 jpg/png
- **简历**：同一份 Markdown，网页展示 + 打印样式导出 PDF
