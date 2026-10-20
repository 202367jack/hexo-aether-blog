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
 *      只有同目录下真的存在 .webp 才改，所以 hexo server 边写边看时
 *      新丢进去的图不会变成死链（重启预览后会补齐）。
 *   2. 生成结束后，如果某个 png/jpg 在 public 里有同名 .webp，
 *      就把原图从路由表里去掉，线上只发布 WebP。
 */

const fs = require('fs')
const path = require('path')

const RASTER = /\.(png|jpe?g)$/i
const RAW_IMG_RE = /(!\[[^\]]*\]\()([^)\s]+\.(?:png|jpe?g))(?=[)\s])/gi

// 文章的资源目录：_posts/foo.md -> _posts/foo/；页面 projects/bar/index.md -> projects/bar/
function assetDirOf (source) {
  if (!source) return ''
  const dir = path.posix.dirname(source.replace(/\\/g, '/'))
  const base = path.posix.basename(source, path.posix.extname(source))
  const folder = base === 'index' ? dir : path.posix.join(dir, base)
  return folder === '.' ? '' : folder + '/'
}

hexo.extend.filter.register('before_post_render', function (data) {
  if (typeof data.content !== 'string' || !data.content) return data
  const assetDir = assetDirOf(data.source || data.path)
  if (!assetDir) return data

  const isPost = data.layout === 'post' || String(data.source).indexOf('_posts/') === 0
  const PostAsset = isPost ? hexo.model('PostAsset') : null

  data.content = data.content.replace(RAW_IMG_RE, (whole, head, href) => {
    if (/^[a-z]+:|^\/\//i.test(href)) return whole
    const webp = href.replace(RASTER, '.webp')
    const rel = assetDir + decodeURIComponent(webp)
    const abs = path.join(hexo.source_dir, rel)
    if (!fs.existsSync(abs)) return whole
    // 文章资源要真的进了 PostAsset 模型，才会被渲染成文章目录下的网址；
    // 边写边看时新丢的图还没登记，就先保持原图引用，避免生成死链。
    if (PostAsset && !PostAsset.findOne({ _id: rel })) return whole
    return head + webp
  })
  return data
})

hexo.extend.filter.register('after_generate', function () {
  const routes = hexo.route.list()
  const set = new Set(routes)
  let removed = 0
  for (const route of routes) {
    if (!RASTER.test(route)) continue
    if (route.indexOf('img/') === 0) continue
    if (set.has(route.replace(RASTER, '.webp'))) {
      hexo.route.remove(route)
      removed++
    }
  }
  if (removed) hexo.log.info(`[webp] 已用 WebP 取代 ${removed} 张原图`)
})
