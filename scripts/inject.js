'use strict'

/**
 * 把站点自己的 CSS / JS 注入到每个页面。
 *
 * 为什么不用 _config.butterfly.yml 的 inject？
 * 因为站点挂在 GitHub Pages 的子目录 /hexo-aether-blog/ 下，
 * 直接写 /css/aether.css 会 404，这里用 hexo.config.root 拼出正确路径。
 *
 * 为什么 URL 后面带 ?v=<内容哈希>？
 * 自定义样式表的地址是固定的，浏览器和 GitHub Pages 的 CDN 都会缓存它，
 * 改了 CSS 用户可能几天都加载不到新版本。内容一变哈希就变，URL 跟着变，
 * 缓存自然失效；内容没变时哈希不变，缓存照常命中。
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const root = () => hexo.config.root || '/'

function versionOf (relPath) {
  try {
    const file = path.join(hexo.base_dir, 'source', relPath)
    return crypto.createHash('md5').update(fs.readFileSync(file)).digest('hex').slice(0, 8)
  } catch (err) {
    return ''
  }
}

const query = (relPath) => {
  const v = versionOf(relPath)
  return v ? `?v=${v}` : ''
}

hexo.extend.injector.register('head_end', () => [
  `<link rel="stylesheet" href="${root()}css/aether.css${query('css/aether.css')}">`,
  `<script>window.AETHER_ROOT=${JSON.stringify(root())};</script>`
].join('\n'), 'default')

hexo.extend.injector.register('body_end', () => `<script src="${root()}js/aether.js${query('js/aether.js')}" defer></script>`, 'default')
