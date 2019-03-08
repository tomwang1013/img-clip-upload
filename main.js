let ctx, width, height, img, canvas, canvasPos
let dashRect = { x: 0, y: 0, width: 0, height: 0 }
let lastMousePos = { x: 0, y: 0 }
let delta = { dx: 0, dy: 0 }
const halfBoxSize = 3
let clipping = false
let target = ''

document.addEventListener('DOMContentLoaded', function(e) {
  init()

  document.getElementById('file').addEventListener('change', function(e) {
    onImgChange(this.files[0])
  })

  const painterWrapper = document.getElementsByClassName('painter-wrapper')[0]

  painterWrapper.addEventListener('mousedown', function (e) {
    if (e.target.classList.contains('box')) {
      lastMousePos.x = e.clientX
      lastMousePos.y = e.clientY
      clipping = true
      target = e.target.getAttribute('id')
    }
  })

  painterWrapper.addEventListener('mousemove', function (e) {
    if (clipping) {
      delta.dx = e.clientX - lastMousePos.x
      delta.dy = e.clientY - lastMousePos.y
      lastMousePos.x = e.clientX
      lastMousePos.y = e.clientY

      switch (target) {
        case 'tl':
          dashRect.x -= delta.dx
          dashRect.width -= delta.dx
          dashRect.y -= delta.dy
          dashRect.height -= delta.dy
          break

        case 'tm':
          dashRect.y += delta.dy
          dashRect.height -= delta.dy
          break

        case 'tr':
          dashRect.width += delta.dx
          dashRect.y += delta.dy
          dashRect.height -= delta.dy
          break

        case 'ml':
          dashRect.x += delta.dx
          dashRect.width -= delta.dx
          break

        case 'mr':
          dashRect.width += delta.dx
          break

        case 'bl':
          dashRect.x += delta.dx
          dashRect.width -= delta.dx
          dashRect.height += delta.dy
          break

        case 'bm':
          dashRect.height += delta.dy
          break

        case 'br':
          dashRect.width += delta.dx
          dashRect.height += delta.dy
          break
      }

      paint()
    }
  })

  painterWrapper.addEventListener('mouseup', function (e) {
    clipping = false
  })
})

function init() {
  canvas = document.getElementById('painter')
  width = canvas.width
  height = canvas.height
  canvasPos = canvas.getBoundingClientRect()
  ctx = canvas.getContext('2d')
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.strokeStyle = '#ffff00'
  ctx.lineWidth = 2
  ctx.setLineDash([4, 4])
  dashRect = { 
    x: width / 4, 
    y: height / 4, 
    width: width / 2, 
    height: height / 2
  };

  ['tl', 'tm', 'tr', 'ml', 'mr', 'bl', 'bm', 'br'].forEach(element => {
    window[element] = document.getElementById(element)
  });
}

function onImgChange(file) {
  img = document.createElement('img')
  img.src = URL.createObjectURL(file)
  img.onload = function() {
    paint();
  }
}

function paint() {
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
  ctx.strokeRect(dashRect.x, dashRect.y, dashRect.width, dashRect.height)

  let rx = dashRect.x - halfBoxSize
  let ry = dashRect.y - halfBoxSize
  let w = dashRect.width
  let h = dashRect.height

  setBoxPos(tl, { left: rx, top: ry })
  setBoxPos(tm, { left: rx + w / 2, top: ry })
  setBoxPos(tr, { left: rx + w, top: ry })

  setBoxPos(ml, { left: rx, top: ry + h / 2 })
  setBoxPos(mr, { left: rx + w, top: ry + h / 2 })

  setBoxPos(bl, { left: rx, top: ry + h })
  setBoxPos(bm, { left: rx + w / 2, top: ry + h })
  setBoxPos(br, { left: rx + w, top: ry + h })
}

function setBoxPos(box, pos) {
  Object.assign(box.style, {
    left: pos.left + 'px',
    top: pos.top + 'px'
  })
}