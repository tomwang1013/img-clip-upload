var ctx, img;
var dashRect = { x: 0, y: 0, width: 0, height: 0 };
var lastMousePos = { x: 0, y: 0 };
var boxWidth = 6;
var borderWidth = 2;
var clipping = false;
var moving = false;
var target = '';

document.addEventListener('DOMContentLoaded', function(e) {
  init();

  document.getElementById('file').addEventListener('change', function(e) {
    onImgChange(this.files[0]);
  })

  var painterWrapper = document.getElementsByClassName('painter-wrapper')[0];

  painterWrapper.addEventListener('dragstart', function() {
    return false;
  });

  painterWrapper.addEventListener('mousedown', function (e) {
    if (e.target.classList.contains('box') || e.target.classList.contains('clip-area')) {
      lastMousePos.x = e.clientX;
      lastMousePos.y = e.clientY;
      clipping = e.target.classList.contains('box');
      moving = e.target.classList.contains('clip-area');
      target = e.target.getAttribute('id');
    }
  });

  document.addEventListener('mousemove', function (e) {
    if (clipping) {
      clip(e);
    } else if (moving) {
      move(e);
    }
  });

  document.addEventListener('mouseup', function (e) {
    clipping = false;
    moving = false;
    target = '';
  });

  // 上传裁减后的图片
  document.getElementById('upload').addEventListener('click', function(e) {    
    var clippedImgData = ctx.getImageData(dashRect.x, dashRect.y, dashRect.width, dashRect.height);
    var tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = dashRect.width;
    tmpCanvas.height = dashRect.height;
    var tmpCtx = tmpCanvas.getContext('2d');
    tmpCtx.putImageData(clippedImgData, 0, 0);


    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://127.0.0.1:3000/upload', true);
    xhr.onload = function(e) {
      if (xhr.readyState === 4) {
        document.getElementById('server-img').setAttribute('src', xhr.response);
      }
    };
    tmpCanvas.toBlob(function (blob) {
      xhr.send(blob);
    });
  })
})

function init() {
  var canvas = document.getElementById('painter');
  ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  
  ['tl', 'tm', 'tr', 'ml', 'mr', 'bl', 'bm', 'br', 'clipArea'].forEach(function(element) {
    window[element] = document.getElementById(element);
    window[element].addEventListener('dragstart', function() {
      return false;
    });
  });
}

function onImgChange(file) {
  img = document.createElement('img');
  img.src = URL.createObjectURL(file);
  img.onload = function() {
    dashRect = {
      x: ctx.canvas.width / 4,
      y: ctx.canvas.height / 4,
      width: ctx.canvas.width / 2,
      height: ctx.canvas.height / 2
    };
    paint();
  };
}

// drag and clip the wanted image fragment
function clip(e) {
  var dx = e.clientX - lastMousePos.x;
  var dy = e.clientY - lastMousePos.y;

  var minBoxWidth = boxWidth * 3;
  var maxDx = dashRect.width - minBoxWidth;
  var maxDy = dashRect.height - minBoxWidth;
  var minDx = -maxDx;
  var minDy = -maxDy;

  lastMousePos.x = e.clientX;
  lastMousePos.y = e.clientY;

  switch (target) {
    case 'tl':
      if (dx < 0) {
        dx = Math.max(dx, -dashRect.x);
      } else {
        dx = Math.min(dx, maxDx);
      }

      if (dy < 0) {
        dy = Math.max(dy, -dashRect.y);
      } else {
        dy = Math.min(dy, maxDy);
      }

      dashRect.x += dx;
      dashRect.y += dy;
      dashRect.width -= dx;
      dashRect.height -= dy;
      break

    case 'tm':
      if (dy < 0) {
        dy = Math.max(dy, -dashRect.y);
      } else {
        dy = Math.min(dy, maxDy);
      }

      dashRect.y += dy;
      dashRect.height -= dy;
      break

    case 'tr':
      if (dx < 0) {
        dx = Math.max(dx, minDx);
      } else {
        dx = Math.min(dx, ctx.canvas.width - (dashRect.x + dashRect.width));
      }

      if (dy < 0) {
        dy = Math.max(dy, -dashRect.y);
      } else {
        dy = Math.min(dy, maxDy);
      }

      dashRect.y += dy;
      dashRect.width += dx;
      dashRect.height -= dy;
      break

    case 'ml':
      if (dx < 0) {
        dx = Math.max(dx, -dashRect.x);
      } else {
        dx = Math.min(dx, maxDx);
      }

      dashRect.x += dx;
      dashRect.width -= dx;
      break

    case 'mr':
      if (dx < 0) {
        dx = Math.max(dx, minDx);
      } else {
        dx = Math.min(dx, ctx.canvas.width - (dashRect.x + dashRect.width));
      }

      dashRect.width += dx;
      break

    case 'bl':
      if (dx < 0) {
        dx = Math.max(dx, -dashRect.x);
      } else {
        dx = Math.min(dx, maxDx);
      }

      if (dy < 0) {
        dy = Math.max(dy, minDy);
      } else {
        dy = Math.min(dy, ctx.canvas.height - (dashRect.y + dashRect.height));
      }

      dashRect.x += dx;
      dashRect.width -= dx;
      dashRect.height += dy;
      break

    case 'bm':
      if (dy < 0) {
        dy = Math.max(dy, minDy);
      } else {
        dy = Math.min(dy, ctx.canvas.height - (dashRect.y + dashRect.height));
      }

      dashRect.height += dy;
      break

    case 'br':
      if (dx < 0) {
        dx = Math.max(dx, minDx);
      } else {
        dx = Math.min(dx, ctx.canvas.width - (dashRect.x + dashRect.width))
      }

      if (dy < 0) {
        dy = Math.max(dy, minDy);
      } else {
        dy = Math.min(dy, ctx.canvas.height - (dashRect.y + dashRect.height));
      }

      dashRect.width += dx;
      dashRect.height += dy;
      break
  }

  requestAnimationFrame(function () { paint() })
}

// drag and move the clip area to pick the wanted image fragment
function move(e) {
  var dx = e.clientX - lastMousePos.x;
  var dy = e.clientY - lastMousePos.y;
  lastMousePos.x = e.clientX;
  lastMousePos.y = e.clientY;

  if (dx < 0) {
    dx = Math.max(dx, -dashRect.x);
  } else {
    dx = Math.min(dx, ctx.canvas.width - (dashRect.x + dashRect.width));
  }

  if (dy < 0) {
    dy = Math.max(dy, -dashRect.y);
  } else {
    dy = Math.min(dy, ctx.canvas.height - (dashRect.y + dashRect.height));
  }

  dashRect.x += dx;
  dashRect.y += dy;

  requestAnimationFrame(function () { paint() });
}

function paint() {
  var width = ctx.canvas.width;
  var height = ctx.canvas.height;

  ctx.clearRect(0, 0, width, height);

  // image and shadow overlay
  ctx.drawImage(img, 0, 0);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, height);
  ctx.lineTo(width, height);
  ctx.lineTo(width, 0);
  ctx.lineTo(0, 0);
  ctx.lineTo(dashRect.x, dashRect.y);
  ctx.rect(dashRect.x, dashRect.y, dashRect.width, dashRect.height);
  ctx.lineTo(0, 0);
  ctx.save();
  ctx.clip();
  ctx.restore();
  ctx.fill();

  // clip area
  var x = dashRect.x;
  var y = dashRect.y;
  var w = dashRect.width;
  var h = dashRect.height;

  var a = (boxWidth - borderWidth) / 2;
  var b = (w - boxWidth) / 2;
  var c = (h - boxWidth) / 2;
  var d = (boxWidth + borderWidth) / 2;

  setBoxPos(tl, { left: x - a, top: y - a });
  setBoxPos(tm, { left: x + b, top: y - a });
  setBoxPos(tr, { left: x + w - d, top: y - a });

  setBoxPos(ml, { left: x - a, top: y + c });
  setBoxPos(mr, { left: x + w - d, top: y + c });

  setBoxPos(bl, { left: x - a, top: y + h - d });
  setBoxPos(bm, { left: x + b, top: y + h - d });
  setBoxPos(br, { left: x + w - d, top: y + h - d });

  Object.assign(clipArea.style, {
    left: dashRect.x + 'px',
    top: dashRect.y + 'px',
    width: dashRect.width + 'px',
    height: dashRect.height + 'px'
  });
}

function setBoxPos(box, pos) {
  Object.assign(box.style, {
    left: pos.left + 'px',
    top: pos.top + 'px'
  });
}