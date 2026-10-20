#!/usr/bin/env node
'use strict'

/**
 * 生成后自检：把 public/ 里所有页面扫一遍，检查站内链接和图片是不是都能落到实际文件上。
 *
 *   npm run check
 *
 * 检查 href / src（a、link、script、img 等），外面站的链接、锚点、mailto 直接跳过。
 * 子目录部署（/hexo-aether-blog/）也会先按 root 前缀剥掉再找文件。
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const PUBLIC = path.join(ROOT, 'public')

// 与 _config.yml 的 root 保持一致
let siteRoot = '/'
try {
  const config = fs.readFileSync(path.join(ROOT, '_config.yml'), 'utf8')
  const match = config.match(/^root:\s*(\S+)/m)
  if (match) siteRoot = match[1]
} catch (err) {
  console.warn('读不到 _config.yml，按根目录处理')
}

if (!fs.existsSync(PUBLIC)) {
  console.error('没有 public/，先跑 npm run build')
  process.exit(1)
}

function walk (dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

function exists (urlPath) {
  const rel = decodeURIComponent(urlPath.replace(/^\/+/, ''))
  const full = path.join(PUBLIC, rel)
  if (/[^\\/]$/.test(rel) && fs.existsSync(full) && fs.statSync(full).isFile()) return true
  if (fs.existsSync(path.join(full, 'index.html'))) return true
  if (fs.existsSync(full + '.html')) return true
  return false
}

const ATTR = /(?:href|src)="([^"]+)"/g
const files = walk(PUBLIC, []).filter(file => file.endsWith('.html'))
const broken = new Map()
let checked = 0

for (const file of files) {
  const pageUrl = '/' + path.relative(PUBLIC, file).replace(/\\/g, '/').replace(/(^|\/)index\.html$/, '$1')
  const html = fs.readFileSync(file, 'utf8')
  ATTR.lastIndex = 0
  let match
  while ((match = ATTR.exec(html))) {
    let href = match[1].trim()
    if (!href || /^(?:[a-z]+:|\/\/|#)/i.test(href)) continue

    const hash = href.indexOf('#')
    if (hash !== -1) href = href.slice(0, hash)
    const query = href.indexOf('?')
    if (query !== -1) href = href.slice(0, query)
    if (!href) continue

    let target
    if (href.startsWith('/')) {
      if (siteRoot !== '/' && !href.startsWith(siteRoot)) continue
      target = href.slice(siteRoot.length)
    } else {
      // 页面网址以 / 结尾时，它就是这一层的目录；dirname 会吃掉结尾的斜杠，所以先分情况
      const baseDir = pageUrl.endsWith('/') ? pageUrl : path.posix.dirname(pageUrl)
      target = path.posix.normalize(path.posix.join(baseDir, href))
    }

    checked++
    if (!exists(target)) {
      const key = target
      if (!broken.has(key)) broken.set(key, new Set())
      broken.get(key).add(pageUrl)
    }
  }
}

console.log(`[check] 扫描 ${files.length} 个页面、${checked} 条站内链接`)

if (!broken.size) {
  console.log('[check] 全部链接都有对应文件')
  process.exit(0)
}

for (const [target, pages] of [...broken].sort()) {
  console.log(`[check] 404 ${target}  ← ${[...pages].slice(0, 3).join(', ')}`)
}
console.log(`[check] 共 ${broken.size} 个失效目标`)
process.exit(1)
