/* ==========================================================================
   Aether Weblog —— 站点自定义脚本
   ========================================================================== */

(function () {
  'use strict'

  var path = window.location.pathname
  var root = window.AETHER_ROOT || '/'
  if (root !== '/' && path.indexOf(root) === 0) {
    path = path.slice(root.length - 1)
  }

  var segments = path.split('/').filter(Boolean)
  var section = segments[0] || 'home'

  /* ---------- 导航栏：日夜模式切换按钮 ---------- */

  var isDark = function () {
    return document.documentElement.getAttribute('data-theme') === 'dark'
  }

  var paintToggle = function (btn) {
    var icon = btn.querySelector('i')
    if (!icon) return
    icon.className = isDark() ? 'fas fa-sun' : 'fas fa-moon'
    btn.setAttribute('title', isDark() ? '切换到日间模式' : '切换到夜间模式')
  }

  var menus = document.getElementById('menus')
  if (menus) {
    var toggle = document.createElement('span')
    toggle.id = 'ae-darkmode'
    toggle.setAttribute('role', 'button')
    toggle.setAttribute('tabindex', '0')
    toggle.innerHTML = '<i class="fas fa-moon"></i>'

    var flip = function () {
      var native = document.getElementById('darkmode')
      if (!native) return
      native.click()
      window.setTimeout(function () {
        paintToggle(toggle)
      }, 60)
    }

    toggle.addEventListener('click', flip)
    toggle.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        flip()
      }
    })

    // 放到导航栏最右边：菜单项之后、汉堡按钮之前
    var hamburger = document.getElementById('toggle-menu')
    if (hamburger) {
      menus.insertBefore(toggle, hamburger)
    } else {
      menus.appendChild(toggle)
    }
    paintToggle(toggle)

    if (window.MutationObserver) {
      new MutationObserver(function () {
        paintToggle(toggle)
      }).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
      })
    }
  }

  /* ---------- 导航栏：随机一篇 ---------- */

  var goRandom = function (event) {
    if (event) event.preventDefault()
    fetch(root + 'random.json', { cache: 'no-store' })
      .then(function (res) { return res.json() })
      .then(function (list) {
        if (!Array.isArray(list) || !list.length) return
        var here = path.replace(/^\/+/, '')
        var pool = list.filter(function (item) { return item !== here })
        if (!pool.length) pool = list
        var pick = pool[Math.floor(Math.random() * pool.length)]
        window.location.href = window.location.origin + root + pick
      })
      .catch(function () { window.location.href = root })
  }

  var randomItem = function () {
    var wrap = document.createElement('div')
    wrap.className = 'menus_item'
    var link = document.createElement('a')
    link.className = 'site-page ae-random'
    link.href = 'javascript:;'
    link.title = '随便翻一篇'
    link.innerHTML = '<i class="fa-fw fas fa-dice"></i><span> 随机</span>'
    link.addEventListener('click', goRandom)
    wrap.appendChild(link)
    return wrap
  }

  var headerItems = document.querySelector('#menus .menus_items')
  if (headerItems) headerItems.appendChild(randomItem())

  var sidebarItems = document.querySelector('#sidebar-menus .menus_items')
  if (sidebarItems) sidebarItems.appendChild(randomItem())

  /* ---------- 给 body 打上板块 class，方便 CSS 精确控制 ---------- */

  document.body.classList.add('sec-' + section)

  /* ---------- 随笔 / 笔记 列表页顶部标题 ---------- */

  var INTROS = {
    essays: ['随笔', '日常记录，想到什么写什么。'],
    notes: ['笔记', '技术文章、踩坑记录与源码笔记。']
  }

  var intro = INTROS[section]
  if (intro && segments.indexOf('page') === -1) {
    var recent = document.getElementById('recent-posts')
    if (recent) {
      var head = document.createElement('div')
      head.className = 'section-intro'
      head.innerHTML = '<h1></h1><p></p>'
      head.querySelector('h1').textContent = intro[0]
      head.querySelector('p').textContent = intro[1]
      // 必须塞进 #recent-posts 内部：它是 #content-inner（flex）的子项，
      // 多一个兄弟元素会把正文和侧栏一起挤窄（侧栏标签会一个字一行）。
      recent.insertBefore(head, recent.firstChild)
    }
  }

  /* ---------- 影视筛选 ---------- */

  var filterBox = document.querySelector('.mv-filters')
  if (filterBox) {
    var state = {}
    var cards = Array.prototype.slice.call(document.querySelectorAll('.mv-card'))
    var grid = document.querySelector('.mv-grid')

    var empty = document.createElement('p')
    empty.className = 'empty-hint mv-empty'
    empty.textContent = '没有符合条件的结果，试试换个筛选。'
    empty.style.display = 'none'
    if (grid) grid.parentNode.insertBefore(empty, grid.nextSibling)

    var apply = function () {
      var visible = 0
      cards.forEach(function (card) {
        var ok = Object.keys(state).every(function (dim) {
          var want = state[dim]
          if (!want || want === '*') return true
          var have = (card.getAttribute('data-' + dim) || '').split(/[|,]/).filter(Boolean)
          return have.indexOf(want) !== -1
        })
        card.classList.toggle('is-hidden', !ok)
        if (ok) visible++
      })
      empty.style.display = visible ? 'none' : 'block'
    }

    filterBox.addEventListener('click', function (event) {
      var btn = event.target.closest('.mv-btn')
      if (!btn) return
      var group = btn.closest('.mv-filter')
      if (!group) return
      var dim = group.getAttribute('data-dim')
      state[dim] = btn.getAttribute('data-value')
      Array.prototype.forEach.call(group.querySelectorAll('.mv-btn'), function (item) {
        item.classList.toggle('is-active', item === btn)
      })
      apply()
    })
  }

  /* ---------- 简历：打印 / 导出 PDF ---------- */

  if (section === 'resume') {
    var container = document.getElementById('article-container')
    if (container) {
      var toolbar = document.createElement('div')
      toolbar.className = 'resume-toolbar'
      var button = document.createElement('button')
      button.type = 'button'
      button.className = 'resume-print-btn'
      button.textContent = '打印 / 导出 PDF'
      button.addEventListener('click', function () {
        window.print()
      })
      toolbar.appendChild(button)
      container.parentNode.insertBefore(toolbar, container)
    }
  }
  /* ---------- 文章页：顶部阅读进度条 ---------- */

  var pageType = window.GLOBAL_CONFIG_SITE && window.GLOBAL_CONFIG_SITE.pageType

  if (pageType === 'post') {
    var progress = document.createElement('div')
    progress.id = 'ae-progress'
    document.body.appendChild(progress)

    var ticking = false
    var paintProgress = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight
      var ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      progress.style.width = (ratio * 100).toFixed(2) + '%'
      ticking = false
    }
    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true
        window.requestAnimationFrame(paintProgress)
      }
    }, { passive: true })
    window.addEventListener('resize', paintProgress, { passive: true })
    paintProgress()
  }

  /* ---------- 文章页：底部分享 ---------- */

  if (pageType === 'post') {
    var article = document.getElementById('article-container')

    if (article) {
      var shareUrl = window.location.href
      var shareTitle = (document.title || '').split('|')[0].trim()
      var row = document.createElement('div')
      row.className = 'ae-share'

      var makeLink = function (href, text, icon) {
        var link = document.createElement('a')
        link.className = 'ae-share-btn'
        link.href = href
        link.target = '_blank'
        link.rel = 'noopener'
        link.innerHTML = '<i class="' + icon + '"></i><span>' + text + '</span>'
        return link
      }

      row.appendChild(makeLink(
        'https://x.com/intent/tweet?text=' + encodeURIComponent(shareTitle) +
          '&url=' + encodeURIComponent(shareUrl), 'X', 'fab fa-x-twitter'))
      row.appendChild(makeLink(
        'https://service.weibo.com/share/share.php?title=' +
          encodeURIComponent(shareTitle + ' ' + shareUrl), '微博', 'fab fa-weibo'))

      var copyBtn = document.createElement('button')
      copyBtn.type = 'button'
      copyBtn.className = 'ae-share-btn'
      copyBtn.innerHTML = '<i class="fas fa-link"></i><span>复制链接</span>'
      copyBtn.addEventListener('click', function () {
        var label = copyBtn.querySelector('span')
        var done = function () {
          label.textContent = '已复制'
          window.setTimeout(function () { label.textContent = '复制链接' }, 1600)
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(shareUrl).then(done, function () {
            window.prompt('复制这个链接：', shareUrl)
          })
        } else {
          window.prompt('复制这个链接：', shareUrl)
        }
      })
      row.appendChild(copyBtn)

      article.parentNode.insertBefore(row, article.nextSibling)
    }
  }
  /* ---------- 关于页：热力图还没生成时给个提示 ---------- */

  var snake = document.querySelector('.snake-wrap')
  if (snake) {
    var images = snake.querySelectorAll('img')
    Array.prototype.forEach.call(images, function (img) {
      var markMissing = function () {
        if (img.naturalWidth === 0) snake.classList.add('snake-missing')
      }
      if (img.complete) markMissing()
      else img.addEventListener('error', markMissing)
    })
  }
  /* ---------- Mermaid：把 ```mermaid 代码块画成图 ---------- */

  var DIAGRAM = /^\s*(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|mindmap|timeline|gitGraph|quadrantChart|xychart|block-beta|architecture-beta|C4Context)\b/

  var MERMAID_CDNS = [
    'https://fastly.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js',
    'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js',
    'https://unpkg.com/mermaid@11/dist/mermaid.min.js'
  ]

  var diagramBlocks = []
  Array.prototype.forEach.call(
    document.querySelectorAll('#article-container figure.highlight, #article-container pre > code.mermaid'),
    function (node) {
      var isCode = node.tagName === 'CODE'
      var figure = isCode ? node.closest('figure, pre') : node
      var sourceEl = isCode
        ? node
        : (node.querySelector('td.code pre') || node.querySelector('pre'))
      if (!figure || !sourceEl) return
      var code = sourceEl.innerText.replace(/\u00a0/g, ' ')
      if (!DIAGRAM.test(code)) return
      diagramBlocks.push({ el: figure, code: code })
    }
  )

  if (diagramBlocks.length) {
    var drawDiagrams = function () {
      window.mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        theme: isDark() ? 'dark' : 'default'
      })
      diagramBlocks.forEach(function (item) {
        window.mermaid.render('ae-mm-' + Math.random().toString(36).slice(2), item.code)
          .then(function (out) {
            var holder = document.createElement('div')
            holder.className = 'ae-mermaid'
            holder.dataset.code = item.code
            holder.innerHTML = out.svg
            item.el.parentNode.replaceChild(holder, item.el)
            item.el = holder
          })
          .catch(function () {})
      })
    }

    var loadMermaid = function (done) {
      if (window.mermaid) return done()
      var index = 0
      var next = function () {
        if (index >= MERMAID_CDNS.length) return
        var script = document.createElement('script')
        script.src = MERMAID_CDNS[index++]
        script.onload = function () { window.mermaid ? done() : next() }
        script.onerror = next
        document.body.appendChild(script)
      }
      next()
    }

    loadMermaid(drawDiagrams)

    // 切换日夜模式后重画一遍，配色跟着变
    if (window.MutationObserver) {
      var redrawTimer
      new MutationObserver(function () {
        window.clearTimeout(redrawTimer)
        redrawTimer = window.setTimeout(function () {
          if (!window.mermaid) return
          window.mermaid.initialize({ startOnLoad: false, securityLevel: 'loose', theme: isDark() ? 'dark' : 'default' })
          Array.prototype.forEach.call(document.querySelectorAll('.ae-mermaid'), function (holder) {
            if (!holder.dataset.code) return
            window.mermaid.render('ae-mm-' + Math.random().toString(36).slice(2), holder.dataset.code)
              .then(function (out) { holder.innerHTML = out.svg })
              .catch(function () {})
          })
        }, 220)
      }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    }
  }
})()
