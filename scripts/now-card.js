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

  const marker = '<div class="recent-posts'
  const at = str.indexOf(marker)
  if (at === -1) return str
  return str.slice(0, at) + card + str.slice(at)
}, 10)
