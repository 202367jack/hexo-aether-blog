#!/usr/bin/env node
'use strict'

/**
 * 把误放进 public/ 的图片救回 source/。
 *
 * public/ 是构建产物，`hexo clean` 会整个删掉；有人习惯把海报、文章配图
 * 直接拖进 public/media/xxx/ 或 public/projects/xxx/，一构建就没了。
 *
 * 这个脚本在 clean 之前跑（package.json 的 prebuild），规则：
 *   public/media/**   → source/media/**
 *   public/projects/** → source/projects/**
 * 只处理 jpg / jpeg / png / webp；source 里已有同名文件就跳过（不覆盖改过的）。
 *
 * 也可以单独跑：node tools/rescue-public.js
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const PUBLIC = path.join(ROOT, 'public')
const SOURCE = path.join(ROOT, 'source')
const DIRS = ['media', 'projects']
const IMAGE = /\.(jpe?g|png|webp)$/i

function walk (dir, out) {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (IMAGE.test(entry.name)) out.push(full)
  }
  return out
}

let rescued = 0
let skippedBuilt = 0

// 上一次构建的产出清单：在清单里的文件是我们自己生成的，不算「误放」
let built = new Set()
try {
  built = new Set(JSON.parse(fs.readFileSync(path.join(PUBLIC, '.aether-build.json'), 'utf8')))
} catch (err) {
  built = new Set()
}

for (const dir of DIRS) {
  for (const file of walk(path.join(PUBLIC, dir), [])) {
    const rel = path.relative(PUBLIC, file)
    const relUrl = rel.replace(/\\/g, '/')
    if (built.has(relUrl)) { skippedBuilt++; continue }
    const target = path.join(SOURCE, rel)
    if (fs.existsSync(target)) continue
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.copyFileSync(file, target)
    rescued++
    console.log(`[rescue] public/${relUrl} → source/${relUrl}`)
  }
}

console.log(rescued
  ? `[rescue] 从 public/ 救回 ${rescued} 张图（已经放到 source/ 里，会正常发布）`
  : '[rescue] public/ 里没有需要救回的图片')
if (skippedBuilt) console.log(`[rescue] 跳过 ${skippedBuilt} 张上一次构建自己生成的图`)
