#!/usr/bin/env node
/* ==========================================================================
   Aether Weblog —— 新建文章向导
   用法：双击根目录的「新建.bat」，或在命令行跑 node tools/new-post.js
   ========================================================================== */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const ROOT = path.resolve(__dirname, '..')

/* 终端里交互用 readline；被重定向/管道喂数据时（测试用）改成读整段队列 */
const isTTY = process.stdin.isTTY
const rl = isTTY ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null
const queue = isTTY ? null : fs.readFileSync(0, 'utf8').split(/\r?\n/)

const ask = (text, fallback) =>
  new Promise((resolve) => {
    process.stdout.write(text)
    const done = (answer) => resolve((answer || '').trim() || fallback || '')
    if (isTTY) {
      rl.question('', done)
    } else {
      const line = queue.length > 1 ? queue.shift() : ''
      process.stdout.write('\n')
      done(line)
    }
  })

const close = () => {
  if (rl) rl.close()
}

const pad = (n) => String(n).padStart(2, '0')
const now = new Date()
const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`

const TYPES = {
  1: { label: '随笔', category: '随笔', slug: 'essay' },
  2: { label: '笔记', category: '笔记', slug: 'note' },
  3: { label: '影视评价', media: true, slug: 'movie' }
}

const exists = (p) => fs.existsSync(p)

const uniquePath = (dir, slug) => {
  let candidate = slug
  let i = 2
  while (exists(path.join(dir, candidate)) || exists(path.join(dir, `${candidate}.md`))) {
    candidate = `${slug}-${i++}`
  }
  return candidate
}

const postTemplate = ({ title, category, date, name }) => `---
title: ${title}
date: ${date}
categories: [${category}]
tags: []
---

<!-- 图片放在与本文同名的目录里（${name}/），正文直接用普通的 Markdown 图片语法：
     ![说明](图片名.png)
     构建时会自动压成 WebP 并把引用改过去，原图不会被发布。 -->

`

const mediaTemplate = ({ title, date, rating, quote, year }) => `---
title: ${title}
date: ${date}
layout: page
type: media
top_img: false
medium: 剧集
genre: [剧情]
region: 中国
year: ${year}
rating: ${rating}
status: 看完
quote: ${quote}
# 把海报命名为 poster.jpg 放进本文件夹，然后取消下面这行的注释：
# poster: poster.jpg
---

## 简介

在这里写剧情简介。

## 评语

在这里写完整版影评。一句话评语已经填在 front-matter 的 quote 里，会显示在列表卡片上。

`

const main = async () => {
  console.log('')
  console.log('  新建内容 ————————————————')
  console.log('    1) 随笔     日常记录（每页 8 篇分页）')
  console.log('    2) 笔记     技术文章')
  console.log('    3) 影视评价  电影 / 剧集，带评分和筛选')
  console.log('')

  const typeKey = await ask('  选哪个？（1/2/3，回车默认 1）: ', '1')
  const type = TYPES[typeKey]
  if (!type) {
    console.log('  只认 1 / 2 / 3，重新双击一次吧。')
    return close()
  }

  const title = await ask('  标题（中文没问题）: ')
  if (!title) {
    console.log('  标题不能为空，重新双击一次吧。')
    return close()
  }

  console.log('  文件名决定网址，只能用英文小写、数字、短横线（例如 java-thread-pool）。')
  const slugInput = await ask(`  文件名（回车用 ${type.slug}）: `, type.slug)
  const slug = slugInput
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  if (!slug) {
    console.log('  文件名不合法，重新双击一次吧。')
    return close()
  }

  if (type.media) {
    const rating = await ask('  评分（0–10，回车 8.0）: ', '8.0')
    const quote = await ask('  一句话评语: ', '')
    const year = await ask(`  年份（回车 ${now.getFullYear()}）: `, String(now.getFullYear()))

    const dir = path.join(ROOT, 'source', 'media')
    fs.mkdirSync(dir, { recursive: true })
    const name = uniquePath(dir, slug)
    const folder = path.join(dir, name)
    fs.mkdirSync(folder, { recursive: true })

    const file = path.join(folder, 'index.md')
    fs.writeFileSync(file, mediaTemplate({ title, date: today, rating, quote, year }), 'utf8')

    console.log('')
    console.log(`  建好了：source/media/${name}/index.md`)
    console.log(`  海报放这里：source/media/${name}/poster.jpg`)
    console.log('  （然后在 front-matter 里把 poster: poster.jpg 那一行的 # 去掉）')
    console.log('  列表页的筛选按钮会自动多出这部片的类型/地区。')
    console.log('')
    console.log('  接下来：双击「预览.bat」看效果。')
    return close()
  }

  const dir = path.join(ROOT, 'source', '_posts')
  fs.mkdirSync(dir, { recursive: true })
  const name = uniquePath(dir, `${today}-${slug}`)
  const file = path.join(dir, `${name}.md`)
  fs.writeFileSync(file, postTemplate({ title, category: type.category, date: `${today} 10:00:00`, name }), 'utf8')
  fs.mkdirSync(path.join(dir, name), { recursive: true })

  console.log('')
  console.log(`  建好了：source/_posts/${name}.md`)
  console.log(`  图片放这里：source/_posts/${name}/`)
  console.log(`  分类是「${type.category}」，会自动出现在对应板块。`)
  console.log('')
  console.log('  接下来：双击「预览.bat」看效果，写完双击「发布.bat」上线。')
  close()
}

main().catch((error) => {
  console.error(error.message)
  close()
  process.exitCode = 1
})
