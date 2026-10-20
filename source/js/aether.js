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
      recent.parentNode.insertBefore(head, recent)
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
})()
