/* ==========================================================================
   随机一篇
   生成 random.json（所有已发布文章的路径），导航栏那个骰子按钮读它跳转。
   路径不带 root 前缀，前端自己拼 _config.yml 里的 root。
   ========================================================================== */

'use strict'

hexo.extend.generator.register('random_json', function (locals) {
  const paths = locals.posts
    .sort('-date')
    .filter(function (post) {
      return !post.draft && post.published !== false
    })
    .map(function (post) {
      return post.path
    })

  return {
    path: 'random.json',
    data: JSON.stringify(paths)
  }
})
