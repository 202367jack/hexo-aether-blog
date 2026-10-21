/* ==========================================================================
   首页「现在」卡片
   数据来自 source/_data/now.yml，注入到首页文章列表上方。
   只动 index.html，其它页面原样返回。
   ========================================================================== */

'use strict'

function esc (value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  })
}

hexo.extend.filter.register('after_render:html', function (str, data) {
  if (!data || data.path !== 'index.html') return str

  const now = (hexo.locals.get('data') || {}).now
  if (!now || !Array.isArray(now.items) || !now.items.length) return str

  const items = now.items.map(function (item) {
    return (
      '<li><span class="now-label">' + esc(item.label) + '</span>' +
      '<p>' + esc(item.text) + '</p></li>'
    )
  }).join('')

  const card = (
    '<section class="now-card">' +
      '<div class="now-head">' +
        '<h2>现在</h2>' +
        (now.updated ? '<span class="now-date">' + esc(now.updated) + '</span>' : '') +
      '</div>' +
      '<ul>' + items + '</ul>' +
    '</section>'
  )

  // 注意：必须插在 .recent-posts 里面，不能插到 #content-inner 下——
  // 那个容器是 flex，多一个子元素会把正文和侧栏一起挤窄（标签会一个字一行）。
  const marker = /<div class="recent-posts[^"]*"[^>]*>/
  const found = str.match(marker)
  if (!found) return str
  const at = found.index + found[0].length
  return str.slice(0, at) + card + str.slice(at)
}, 10)
