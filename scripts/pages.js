'use strict'

/**
 * 项目卡片墙、影视筛选墙，以及项目/影视详情页顶部的信息块。
 *
 * 数据全部来自 front-matter，不写死在模板里：
 *   type: project  项目一页
 *   type: media    影视一页
 * 列表页只需要一行 {% project_cards %} / {% media_grid %}。
 */

const fs = require('fs')
const path = require('path')

const esc = str => String(str == null ? '' : str)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')

const toArray = value => {
  if (value == null) return []
  if (Array.isArray(value)) return value.filter(v => v != null && v !== '')
  return String(value).split(/[,，]/).map(v => v.trim()).filter(Boolean)
}

function pagesOfType (type) {
  const pages = hexo.locals.get('pages')
  if (!pages) return []
  return pages.toArray()
    .filter(page => page.type === type)
    .sort((a, b) => {
      const ao = Number(a.order || 0)
      const bo = Number(b.order || 0)
      if (ao !== bo) return ao - bo
      return String(a.title).localeCompare(String(b.title), 'zh-Hans-CN')
    })
}

// page.path 是 index.html 形式，转成站点实际的漂亮网址
function pretty (path) {
  return String(path || '')
    .replace(/^\/+/, '')
    .replace(/index\.html$/i, '')
    .replace(/\.html$/i, '/')
}

// 列表页在 /projects/ 或 /media/ 下，用相对路径取子页，天然带上网址里的子目录前缀
function childPath (page, parent) {
  return pretty(page.path).replace(new RegExp(`^${parent}/`), '')
}

function webp (file) {
  return String(file || '').replace(/\.(png|jpe?g)$/i, '.webp')
}

/**
 * 海报文件到底在不在：front-matter 里只写文件名，扩展名随便（jpg/png/webp 都认）。
 * 这样提前写好 `poster: poster.jpg` 也不会因为还没放图而挂一个破图。
 */
function posterName (page) {
  const raw = page.poster
  if (!raw || !page.source) return null
  const dir = path.dirname(page.source)
  const stem = path.basename(String(raw)).replace(/\.[^.]+$/, '')
  if (!stem || !dir || dir === '.') return null
  for (const ext of ['.jpg', '.jpeg', '.png', '.webp']) {
    if (fs.existsSync(path.join(hexo.source_dir, dir, stem + ext))) return stem + ext
  }
  return null
}

/* ---------------------------------------------------------------- 项目卡片 */

function renderProjectCards () {
  const items = pagesOfType('project')
  if (!items.length) return '<p class="empty-hint">项目还在整理中。</p>'

  const cards = items.map(page => {
    const stack = toArray(page.stack)
    const status = page.status || ''
    const tags = stack.length
      ? `<div class="pj-tags">${stack.map(s => `<span>${esc(s)}</span>`).join('')}</div>`
      : ''
    return `<a class="pj-card" href="${esc(childPath(page, 'projects'))}">
  <div class="pj-card-head">
    <h3>${esc(page.title)}</h3>
    ${status ? `<span class="pj-status">${esc(status)}</span>` : ''}
  </div>
  <p class="pj-summary">${esc(page.summary || page.description || '')}</p>
  ${tags}
  <span class="pj-more">查看项目 →</span>
</a>`
  }).join('\n')

  return `<div class="pj-grid">\n${cards}\n</div>`
}

/* ---------------------------------------------------------------- 影视墙 */

function renderMediaGrid () {
  const items = pagesOfType('media')
  if (!items.length) return '<p class="empty-hint">还没有记录。</p>'

  const dims = [
    { key: 'medium', label: '类型', order: ['电影', '剧集', '动画', '综艺', '纪录片'] },
    { key: 'genre', label: '剧情', order: [] },
    { key: 'region', label: '地区', order: ['中国', '日本', '韩国', '美国', '欧洲', '其他'] }
  ]

  const values = {}
  for (const dim of dims) {
    const set = new Set()
    for (const page of items) toArray(page[dim.key]).forEach(v => set.add(v))
    let list = [...set]
    if (dim.key === 'medium' || dim.key === 'region') {
      list = list.sort((a, b) => {
        const ai = dim.order.indexOf(a)
        const bi = dim.order.indexOf(b)
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.localeCompare(b, 'zh-Hans-CN')
      })
    } else {
      list = list.sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
    }
    values[dim.key] = list
  }

  const filters = dims.map(dim => {
    const buttons = [`<button type="button" class="mv-btn is-active" data-value="*">全部</button>`]
      .concat(values[dim.key].map(v => `<button type="button" class="mv-btn" data-value="${esc(v)}">${esc(v)}</button>`))
      .join('')
    return `<div class="mv-filter" data-dim="${dim.key}">
  <span class="mv-filter-label">${dim.label}</span>
  <div class="mv-filter-btns">${buttons}</div>
</div>`
  }).join('\n')

  const cards = items.map(page => {
    const genres = toArray(page.genre)
    const medium = toArray(page.medium).join(',')
    const region = toArray(page.region).join(',')
    const rating = page.rating == null || page.rating === ''
      ? ''
      : `<span class="mv-score">${Number(page.rating).toFixed(1)}</span>`
    const posterFile = posterName(page)
    const poster = posterFile
      ? `<img src="${esc(webp(childPath(page, 'media').replace(/\/$/, '') + '/' + posterFile))}" alt="${esc(page.title)}" loading="lazy">`
      : `<div class="mv-poster-empty">${esc(page.title)}</div>`
    const meta = [medium || '未分类'].concat(genres.length ? [genres.join(' · ')] : [])
      .concat(region ? [region] : [])
      .concat(page.year ? [String(page.year)] : [])
      .filter(Boolean)
      .join(' ｜ ')
    return `<a class="mv-card" href="${esc(childPath(page, 'media'))}" data-medium="${esc(medium)}" data-genre="${esc(genres.join('|'))}" data-region="${esc(region)}">
  <div class="mv-poster">${poster}${rating}</div>
  <div class="mv-body">
    <h3>${esc(page.title)}</h3>
    <p class="mv-quote">${esc(page.quote || page.summary || '')}</p>
    <div class="mv-meta">${esc(meta)}</div>
  </div>
</a>`
  }).join('\n')

  return `<div class="mv-filters">\n${filters}\n</div>\n<div class="mv-grid">\n${cards}\n</div>`
}

/* -------------------------------------------------- 详情页顶部的信息块 */

function mediaHeader (data) {
  const genres = toArray(data.genre)
  const rating = data.rating == null || data.rating === ''
    ? ''
    : `<div class="mv-detail-score"><strong>${Number(data.rating).toFixed(1)}</strong><span>分</span></div>`
  const rows = [
    ['类型', toArray(data.medium).join(' / ')],
    ['剧情', genres.join(' / ')],
    ['地区', toArray(data.region).join(' / ')],
    ['年份', data.year ? String(data.year) : ''],
    ['状态', data.status || '']
  ].filter(([, v]) => v)

  const posterFile = posterName(data)
  const poster = posterFile
    ? `<div class="mv-detail-poster"><img src="${esc(webp(posterFile))}" alt="${esc(data.title)}"></div>`
    : ''

  return `<div class="mv-detail">
  ${poster}
  <div class="mv-detail-info">
    ${rating}
    <p class="mv-detail-quote">${esc(data.quote || data.summary || '')}</p>
    <dl class="mv-detail-meta">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
  </div>
</div>\n`
}

function projectHeader (data) {
  const stack = toArray(data.stack)
  const links = []
  if (data.repo) links.push(`<a class="pj-repo" href="${esc(data.repo)}" target="_blank" rel="noopener" aria-label="在 GitHub 上查看源码" title="在 GitHub 上查看源码"><i class="fab fa-github"></i></a>`)
  if (data.demo) links.push(`<a href="${esc(data.demo)}" target="_blank" rel="noopener">在线体验</a>`)

  return `<div class="pj-detail">
  <div class="pj-detail-stack">${stack.map(s => `<span>${esc(s)}</span>`).join('')}</div>
  <div class="pj-detail-foot">
    ${data.status ? `<span class="pj-status">${esc(data.status)}</span>` : ''}
    ${links.join('')}
  </div>
</div>\n`
}

/* ---------------------------------------------------------------- 注册 */

hexo.extend.tag.register('project_cards', renderProjectCards)
hexo.extend.tag.register('media_grid', renderMediaGrid)

hexo.extend.filter.register('after_post_render', function (data) {
  if (!data.type || data.type === 'page') return data
  if (data.type === 'media') {
    data.content = mediaHeader(data) + (data.content || '')
  } else if (data.type === 'project') {
    data.content = projectHeader(data) + (data.content || '')
  }
  return data
})
