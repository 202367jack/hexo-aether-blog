#!/usr/bin/env node
'use strict'

/**
 * 把文章目录里的 png / jpg 转成同名 .webp。
 *
 * 由 package.json 的 prebuild / preserver 自动调用，也可以手动跑：
 *   node tools/convert-images.js
 *
 * 只看这些目录（相对 source/），其余不动：
 *   _posts   随笔 / 笔记的文章与其同名图片目录
 *   projects 项目页
 *   media    影视页
 *
 * source/img 是头像和站点图标，永远保持原格式，跳过。
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const SOURCE = path.join(ROOT, 'source')
const TARGETS = ['_posts', 'projects', 'media']
const RASTER = /\.(png|jpe?g)$/i
const MAX_WIDTH = 1600
const QUALITY = 80

function walk (dir, out) {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (RASTER.test(entry.name)) out.push(full)
  }
  return out
}

async function main () {
  const files = TARGETS.flatMap(dir => walk(path.join(SOURCE, dir), []))
  if (!files.length) {
    console.log('[images] 没有需要处理的图片')
    return
  }

  let sharp
  try {
    sharp = require('sharp')
  } catch (err) {
    console.warn('[images] 没找到 sharp，跳过转换（先 npm install）：' + err.message)
    return
  }

  let converted = 0
  let skipped = 0
  let bytes = 0

  for (const file of files) {
    const target = file.replace(RASTER, '.webp')
    try {
      if (fs.existsSync(target) && fs.statSync(target).mtimeMs >= fs.statSync(file).mtimeMs) {
        skipped++
        continue
      }
      const info = await sharp(file)
        .rotate()
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: QUALITY, effort: 4 })
        .toFile(target)
      converted++
      bytes += info.size || 0
      console.log(`[images] ${path.relative(ROOT, file)} -> .webp (${Math.round((info.size || 0) / 1024)} KB)`)
    } catch (err) {
      console.warn(`[images] 转换失败 ${path.relative(ROOT, file)}：${err.message}`)
    }
  }

  console.log(`[images] 完成：转换 ${converted} 张，跳过 ${skipped} 张（已是最新），共 ${Math.round(bytes / 1024)} KB`)
}

main().catch(err => {
  console.error('[images] 出错：', err)
  process.exitCode = 1
})
