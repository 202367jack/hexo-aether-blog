'use strict'

/**
 * 文章图片 —— 构建期把 png/jpg 换成 WebP（Hexo 侧的两件事）。
 *
 * 转换本身在 tools/convert-images.js，由 npm 的 prebuild / preserver 先跑，
 * 这样 Hexo 扫描 source 时 .webp 已经在磁盘上，路由能正常建立。
 * 这里只做 Hexo 侧的两件事：
 *
 *   1. 渲染文章时，把正文里的 ![](xxx.png / xxx.jpg) 改成 .webp
 *      —— 作者只管写普通的 Markdown 图片语法，不用管格式。
 *   2. 生成结束后，如果某个 png/jpg 在 public 里有同名 .webp，
 *      就把原图从路由表里去掉，线上只发布 WebP。
 */

const RASTER = /\.(png|jpe?g)$/i

hexo.extend.filter.register('before_post_render', function (data) {
  if (typeof data.content !== 'string' || !data.content) return data
  data.content = data.content.replace(
    /(!\[[^\]]*\]\()([^)\s]+\.(?:png|jpe?g))(?=[)\s])/gi,
    (whole, head, href) => head + href.replace(RASTER, '.webp')
  )
  return data
})

hexo.extend.filter.register('after_generate', function () {
  const routes = hexo.route.list()
  const set = new Set(routes)
  let removed = 0
  for (const route of routes) {
    if (!RASTER.test(route)) continue
    const webp = route.replace(RASTER, '.webp')
    if (set.has(webp) && route.indexOf('img/') !== 0) {
      hexo.route.remove(route)
      removed++
    }
  }
  if (removed) hexo.log.info(`[webp] 已用 WebP 取代 ${removed} 张原图`)
})
