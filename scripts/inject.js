'use strict'

/**
 * 把站点自己的 CSS / JS 注入到每个页面。
 *
 * 为什么不用 _config.butterfly.yml 的 inject？
 * 因为站点挂在 GitHub Pages 的子目录 /aether-weblog-hexo/ 下，
 * 直接写 /css/aether.css 会 404，这里用 hexo.config.root 拼出正确路径。
 */

const root = () => hexo.config.root || '/'

hexo.extend.injector.register('head_end', () => [
  `<link rel="stylesheet" href="${root()}css/aether.css">`,
  `<script>window.AETHER_ROOT=${JSON.stringify(root())};</script>`
].join('\n'), 'default')

hexo.extend.injector.register('body_end', () => `<script src="${root()}js/aether.js" defer></script>`, 'default')
