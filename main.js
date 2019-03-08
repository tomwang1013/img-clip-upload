let ctx, img
let dashRect = { x: 0, y: 0, width: 0, height: 0 }
let lastMousePos = { x: 0, y: 0 }
const boxWidth = 6
const borderWidth = 2
let clipping = false
let moving = false
let target = ''

document.addEventListener('DOMContentLoaded', function(e) {
  document.getElementById('file').addEventListener('change', function(e) {
    onImgChange(this.files[0])
  })

  const painterWrapper = document.getElementsByClassName('painter-wrapper')[0]

  painterWrapper.addEventListener('mousedown', function (e) {
    if (e.target.classList.contains('box') || e.target.classList.contains('clip-area')) {
      lastMousePos.x = e.clientX
      lastMousePos.y = e.clientY
      clipping = e.target.classList.contains('box')
      moving = e.target.classList.contains('clip-area')
      target = e.target.getAttribute('id')
    }
  })

  painterWrapper.addEventListener('mousemove', function (e) {
    if (clipping) {
      let dx = e.clientX - lastMousePos.x
      let dy = e.clientY - lastMousePos.y

      const minBoxWidth = boxWidth * 3
      const maxDx = dashRect.width - minBoxWidth
      const maxDy = dashRect.height - minBoxWidth
      const minDx = -maxDx
      const minDy = -maxDy

      lastMousePos.x = e.clientX
      lastMousePos.y = e.clientY

      switch (target) {
        case 'tl':
          dx = Math.min(dx, maxDx)
          dy = Math.min(dy, maxDy)
          dashRect.x += dx
          dashRect.y += dy
          dashRect.width -= dx
          dashRect.height -= dy
          break

        case 'tm':
          dy = Math.min(dy, maxDy)
          dashRect.y += dy
          dashRect.height -= dy
          break

        case 'tr':
          dx = Math.max(dx, minDx)
          dy = Math.min(dy, maxDy)
          dashRect.y += dy
          dashRect.width += dx
          dashRect.height -= dy
          break

        case 'ml':
          dx = Math.min(dx, maxDx)
          dashRect.x += dx
          dashRect.width -= dx
          break

        case 'mr':
          dx = Math.max(dx, minDx)
          dashRect.width += dx
          break

        case 'bl':
          dx = Math.min(dx, maxDx)
          dy = Math.max(dy, minDy)
          dashRect.x += dx
          dashRect.width -= dx
          dashRect.height += dy
          break

        case 'bm':
          dy = Math.max(dy, minDy)
          dashRect.height += dy
          break

        case 'br':
          dx = Math.max(dx, minDx)
          dy = Math.max(dy, minDy)
          dashRect.width += dx
          dashRect.height += dy
          break
      }

      requestAnimationFrame(() => paint())
    } else if (moving) {
      let dx = e.clientX - lastMousePos.x
      let dy = e.clientY - lastMousePos.y
      lastMousePos.x = e.clientX
      lastMousePos.y = e.clientY

      if (dx < 0) {
        dx = Math.max(dx, -dashRect.x)
      } else {
        dx = Math.min(dx, ctx.canvas.width - (dashRect.x + dashRect.width))
      }

      if (dy < 0) {
        dy = Math.max(dy, -dashRect.y)
      } else {
        dy = Math.min(dy, ctx.canvas.height - (dashRect.y + dashRect.height))
      }

      dashRect.x += dx
      dashRect.y += dy

      requestAnimationFrame(() => paint())
    }
  })

  painterWrapper.addEventListener('mouseup', function (e) {
    clipping = false
    moving = false
    target = ''
  })
})

function init() {
  const canvas = document.getElementById('painter')
  const canvasPos = canvas.getBoundingClientRect()

  ctx = canvas.getContext('2d')
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  dashRect = { 
    x: canvasPos.width / 4, 
    y: canvasPos.height / 4, 
    width: canvasPos.width / 2, 
    height: canvasPos.height / 2
  };

  ['tl', 'tm', 'tr', 'ml', 'mr', 'bl', 'bm', 'br', 'clipArea'].forEach(element => {
    window[element] = document.getElementById(element)
  });
}

function onImgChange(file) {
  img = document.createElement('img')
  img.src = URL.createObjectURL(file)
  img.onload = function() {
    init()
    paint();
  }
}

function paint() {
  const width = ctx.canvas.width
  const height = ctx.canvas.height

  ctx.clearRect(0, 0, width, height)

  // image and shadow overlay
  ctx.drawImage(img, 0, 0)
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(0, height)
  ctx.lineTo(width, height)
  ctx.lineTo(width, 0)
  ctx.lineTo(0, 0)
  ctx.lineTo(dashRect.x, dashRect.y)
  ctx.rect(dashRect.x, dashRect.y, dashRect.width, dashRect.height)
  ctx.lineTo(0, 0)
  ctx.save()
  ctx.clip()
  ctx.restore()
  ctx.fill()

  // clip area
  const x = dashRect.x
  const y = dashRect.y
  const w = dashRect.width
  const h = dashRect.height

  const a = (boxWidth - borderWidth) / 2
  const b = (w - boxWidth) / 2
  const c = (h - boxWidth) / 2
  const d = (boxWidth + borderWidth) / 2

  setBoxPos(tl, { left: x - a, top: y - a })
  setBoxPos(tm, { left: x + b, top: y - a })
  setBoxPos(tr, { left: x + w - d, top: y - a })

  setBoxPos(ml, { left: x - a, top: y + c })
  setBoxPos(mr, { left: x + w - d, top: y + c })

  setBoxPos(bl, { left: x - a, top: y + h - d })
  setBoxPos(bm, { left: x + b, top: y + h - d })
  setBoxPos(br, { left: x + w - d, top: y + h - d })

  Object.assign(clipArea.style, {
    left: dashRect.x + 'px',
    top: dashRect.y + 'px',
    width: dashRect.width + 'px',
    height: dashRect.height + 'px'
  })
}

function setBoxPos(box, pos) {
  Object.assign(box.style, {
    left: pos.left + 'px',
    top: pos.top + 'px'
  })
}