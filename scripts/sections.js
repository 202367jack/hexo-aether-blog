'use strict'

/**
 * 随笔 / 笔记 两个板块的自动分页列表。
 *
 * 不新增文章类型，只按分类筛选文章（front-matter 里 categories: [随笔]）：
 *   随笔 → 每页 8 篇
 *   笔记 → 单页全列出
 *
 * 用 hexo-pagination 生成 page 数据（base/total/current/posts/prev/next），
 * 复用主题自带的 index 布局，所以卡片样式、分页条和首页完全一致。
 * 板块里还没有文章时，退化成一张说明页，保证导航链接不会 404。
 */

const pagination = require('hexo-pagination')

const ESSAYS_PER_PAGE = 8

function pickPosts (locals, categoryNames) {
  const posts = locals.posts
  if (!posts) return null
  const filtered = posts.filter(post => {
    if (!post.categories) return false
    return post.categories.toArray().some(cat => categoryNames.includes(cat.name))
  }).sort('-date')
  return filtered.length ? filtered : null
}

function emptyPage (base, title, hint) {
  return [{
    path: base,
    layout: 'page',
    data: {
      title,
      date: new Date(),
      type: 'page',
      content: `<p class="empty-hint">${hint}</p>`
    }
  }]
}

hexo.extend.generator.register('essays', function (locals) {
  const posts = pickPosts(locals, ['随笔'])
  if (!posts) {
    return emptyPage('essays/', '随笔',
      '还没有随笔。把 Markdown 放进 <code>source/_posts/</code>，front-matter 里写 <code>categories: [随笔]</code>，就会出现在这里。')
  }
  return pagination('essays', posts, {
    perPage: ESSAYS_PER_PAGE,
    layout: ['index'],
    format: 'page/%d/',
    data: { section: 'essays' }
  })
})

hexo.extend.generator.register('notes', function (locals) {
  const posts = pickPosts(locals, ['笔记'])
  if (!posts) {
    return emptyPage('notes/', '笔记',
      '还没有笔记。把 Markdown 放进 <code>source/_posts/</code>，front-matter 里写 <code>categories: [笔记]</code>，就会出现在这里。')
  }
  return pagination('notes', posts, {
    perPage: 0,
    layout: ['index'],
    format: 'page/%d/',
    data: { section: 'notes' }
  })
})
