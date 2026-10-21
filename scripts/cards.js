/* ==========================================================================
   tag 插件：
     {% friend_cards %}  友链卡片（数据在 source/_data/friends.yml）
     {% media_stats %}   影视与内容统计（数据全部来自各页 front-matter）
   ========================================================================== */

'use strict'

function esc (value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  })
}

function withRoot (path) {
  const root = hexo.config.root || '/'
  if (!path) return root
  if (/^(https?:)?\/\//.test(path) || path.indexOf('data:') === 0) return path
  const clean = path.charAt(0) === '/' ? path.slice(1) : path
  return root + clean
}

function toList (value) {
  if (value == null) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'object') return [value]
  return String(value).split(',').map(function (item) { return item.trim() }).filter(Boolean)
}

/* ---------------- 友链 ---------------- */

hexo.extend.tag.register('friend_cards', function () {
  const data = hexo.locals.get('data') || {}
  const list = toList(data.friends)

  if (!list.length) {
    return '<p class="empty-hint">还没有友链，欢迎来换。</p>'
  }

  const cards = list.map(function (item) {
    const name = esc(item.name || '未命名')
    const url = esc(item.url || '#')
    const desc = esc(item.desc || '')
    const avatar = withRoot(item.avatar || '/img/avatar.jpg')
    return (
      '<a class="fr-card" href="' + url + '" target="_blank" rel="noopener">' +
        '<img class="fr-avatar" src="' + esc(avatar) + '" alt="' + name + '" loading="lazy"' +
          ' onerror="this.onerror=null;this.src=\'' + withRoot('/img/avatar.jpg') + '\'">' +
        '<span class="fr-body">' +
          '<span class="fr-name">' + name + '</span>' +
          '<span class="fr-desc">' + desc + '</span>' +
        '</span>' +
      '</a>'
    )
  })

  return '<div class="fr-grid">' + cards.join('') + '</div>'
})

/* ---------------- 统计 ---------------- */

function countBy (items, pick) {
  const map = new Map()
  items.forEach(function (item) {
    toList(pick(item)).forEach(function (key) {
      map.set(key, (map.get(key) || 0) + 1)
    })
  })
  return Array.from(map.entries()).sort(function (a, b) { return b[1] - a[1] })
}

function barRows (rows, total, suffix) {
  if (!rows.length) return '<p class="empty-hint">还没有数据。</p>'
  return rows.map(function (entry) {
    const label = esc(entry[0])
    const count = entry[1]
    const percent = total ? Math.round((count / total) * 100) : 0
    const extra = entry[2] == null ? '' : '<em>' + esc(entry[2]) + '</em>'
    return (
      '<div class="st-row">' +
        '<span class="st-label">' + label + '</span>' +
        '<span class="st-track"><span class="st-fill" style="width:' + percent + '%"></span></span>' +
        '<span class="st-num">' + count + (suffix || '') + extra + '</span>' +
      '</div>'
    )
  }).join('')
}

hexo.extend.tag.register('media_stats', function () {
  const pages = hexo.locals.get('pages').toArray().filter(function (page) {
    return page.type === 'media'
  })
  const posts = hexo.locals.get('posts').toArray()

  const films = pages.map(function (page) {
    return {
      title: page.title || '',
      rating: Number(page.rating) || 0,
      medium: page.medium || '未分类',
      genre: toList(page.genre),
      region: page.region || '未知',
      year: Number(page.year) || 0,
      status: page.status || ''
    }
  })

  const rated = films.filter(function (film) { return film.rating > 0 })
  const avg = rated.length
    ? (rated.reduce(function (sum, film) { return sum + film.rating }, 0) / rated.length).toFixed(2)
    : '—'

  const byMedium = countBy(films, function (film) { return film.medium })
  const byGenre = countBy(films, function (film) { return film.genre })
  const byRegion = countBy(films, function (film) { return film.region })

  const buckets = [
    ['10 分', 0],
    ['9 – 9.9', 0],
    ['8 – 8.9', 0],
    ['7 – 7.9', 0],
    ['7 分以下', 0]
  ]
  rated.forEach(function (film) {
    let index = 4
    if (film.rating >= 10) index = 0
    else if (film.rating >= 9) index = 1
    else if (film.rating >= 8) index = 2
    else if (film.rating >= 7) index = 3
    buckets[index][1] += 1
  })

  const years = films
    .map(function (film) { return film.year })
    .filter(Boolean)
    .sort(function (a, b) { return b - a })

  const yearRows = countBy(years.map(function (year) { return { year: String(year) } }), function (item) { return item.year })

  const top = films.slice().sort(function (a, b) { return b.rating - a.rating }).slice(0, 3)

  const essayCount = posts.filter(function (post) {
    return (post.categories || []).toArray().some(function (cat) { return cat.name === '随笔' })
  }).length
  const noteCount = posts.filter(function (post) {
    return (post.categories || []).toArray().some(function (cat) { return cat.name === '笔记' })
  }).length
  const projectCount = hexo.locals.get('pages').toArray().filter(function (page) {
    return page.type === 'project'
  }).length

  const head = (
    '<div class="st-cards">' +
      '<div class="st-card"><b>' + films.length + '</b><span>部影视</span></div>' +
      '<div class="st-card"><b>' + avg + '</b><span>平均分</span></div>' +
      '<div class="st-card"><b>' + essayCount + '</b><span>篇随笔</span></div>' +
      '<div class="st-card"><b>' + noteCount + '</b><span>篇笔记</span></div>' +
      '<div class="st-card"><b>' + projectCount + '</b><span>个项目</span></div>' +
    '</div>'
  )

  const blocks = [
    ['评分分布', barRows(buckets, rated.length, ' 部')],
    ['媒介', barRows(byMedium, films.length, ' 部')],
    ['类型', barRows(byGenre, films.length, ' 部')],
    ['地区', barRows(byRegion, films.length, ' 部')],
    ['年份', barRows(yearRows, films.length, ' 部')]
  ].map(function (block) {
    return '<section class="st-block"><h2>' + block[0] + '</h2>' + block[1] + '</section>'
  }).join('')

  const topList = top.length
    ? '<section class="st-block"><h2>最高分</h2><ol class="st-top">' +
        top.map(function (film) {
          return '<li><span>' + esc(film.title) + '</span><em>' + film.rating.toFixed(1) + '</em></li>'
        }).join('') +
      '</ol></section>'
    : ''

  return '<div class="st-wrap">' + head + blocks + topList + '</div>'
})
