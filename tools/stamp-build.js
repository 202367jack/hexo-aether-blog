#!/usr/bin/env node
'use strict'

/**
 * 给刚构建完的 public/ 盖个戳（列出所有产出文件），配合 tools/rescue-public.js：
 * 只有「不在戳里」的图片才被认为是用户手动拖进 public/ 的，才会被救回 source/。
 * 这样你从 source/ 删掉一张图后重新构建，public/ 里的旧副本不会被又救回来。
 *
 * 由 package.json 的 postbuild 自动调用。
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const PUBLIC = path.join(ROOT, 'public')
const STAMP = path.join(PUBLIC, '.aether-build.json')

if (!fs.existsSync(PUBLIC)) process.exit(0)

const stampRel = path.relative(PUBLIC, STAMP).replace(/\\/g, '/')
const files = []

function walk (dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else {
      const rel = path.relative(PUBLIC, full).replace(/\\/g, '/')
      if (rel !== stampRel) files.push(rel)
    }
  }
}
walk(PUBLIC)

fs.writeFileSync(STAMP, JSON.stringify(files) + '\n')
console.log(`[stamp] 记录本次构建产出 ${files.length} 个文件`)
