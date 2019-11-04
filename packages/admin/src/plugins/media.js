export default ({ zeros, router, Vue }) => {
  Vue.prototype.$media = initialize(zeros, Vue)
}

function initialize (zeros, Vue) {
  // 缩放照片(file，文件，)
  // spec: {
  //   MimeType: 'image/jpeg', // 图片格式
  //   MaxSize: 200 * 1024, // 最大图片大小 200k
  //   MaxWidth: 800,   //最大图片宽度
  //   MaxHeight: 800,  //最大图片高度
  // }
  function scalePhoto (file, spec) {
    return new Promise((resolve, reject) => {
      if (typeof file === 'string') {
        return _loadPhotoUrl(file, spec, (_url) => {
          return resolve(_url, spec)
        })
      }

      let reader = new FileReader()
      reader.onload = function (event) {
        let url = event.target.result
        _loadPhotoUrl(url, spec, (_url) => {
          return resolve(_url, spec)
        })
      }
      reader.readAsDataURL(file)
    })
  }

  function isImageDataUrl (url) {
    if (url && url.indexOf('data:image') === 0) {
      return true
    }
    return false
  }

  function dataURItoBlob (dataURI) {
    var byteString = atob(dataURI.split(',')[1])
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    var ab = new ArrayBuffer(byteString.length)
    var ia = new Uint8Array(ab)
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }
    return new Blob([ab], { type: mimeString })
  }

  function readFileAsDataUrl (file) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader()

      reader.onload = function (event) {
        let url = event.target.result

        return resolve(url)
      }

      return reader.readAsDataURL(file)
    })
  }

  return {
    scalePhoto,
    dataURItoBlob,
    isImageDataUrl,
    readFileAsDataUrl
  }
}

function _loadPhotoUrl (url, spec, cb) {
  const bufferImg = document.getElementById('appBufferImg')

  bufferImg.onload = function () {
    // 缩放图片
    let sUrl = _scalePhoto(bufferImg, spec)
    return cb(sUrl)
  }

  bufferImg.src = url
}

function _scalePhoto (bufferImg, spec) {
  const bufferCanvas = document.getElementById('appBufferCanvas')
  const bfx = bufferCanvas.getContext('2d')

  if (typeof spec.draw === 'function') {
    spec.draw(bfx, bufferImg)
  } else {
    const computedRec = _computeSaclePhotoRec(bufferImg, spec)

    bufferCanvas.width = computedRec.cwidth
    bufferCanvas.height = computedRec.cheight

    bfx.drawImage(bufferImg, (computedRec.sx || 0), (computedRec.sy || 0), computedRec.swidth, computedRec.sheight,
      (computedRec.x || 0), (computedRec.y || 0), computedRec.width, computedRec.height)
  }

  let _url = bufferCanvas.toDataURL(spec.MimeType, 0.9)

  return _url
}

// 计算缩放图片的宽和高
function _computeSaclePhotoRec (bufferImg, spec) {
  if (typeof spec.compute === 'function') {
    return spec.compute(bufferImg)
  }

  let nw = bufferImg.naturalWidth
  let nh = bufferImg.naturalHeight

  let maxWidth = spec.MaxWidth || spec.MaxHeight || 0
  let maxHeight = spec.MaxHeight || spec.MaxWidth || 0

  let _rate = (nw / nh).toFixed(2)

  let rec = {
    cwidth: nw, // 画布宽
    cheight: nh, // 画布高
    sx: 0, // 原画x
    sy: 0, // 原画y
    swidth: nw, // 原画宽
    sheight: nh, // 原画高
    x: 0, // 目标x
    y: 0, // 目标y
    width: nw, // 目标宽
    height: nh // 目标高
  }

  // 正方形
  if (spec.Square) {
    // 最大边长
    let maxSide = maxWidth < maxHeight ? maxWidth : maxHeight

    rec.cheight = rec.cwidth = maxSide

    if (rec.swidth < rec.sheight) {
      rec.width = maxSide
      rec.height = (rec.width / _rate)
      rec.sy = (((rec.height - rec.width) * _rate) / 2)
    } else {
      rec.height = maxSide
      rec.width = (rec.height * _rate)
      rec.sx = (((rec.width - rec.height) / _rate) / 2)
    }
  } else {
    // 等比例缩放
    if (rec.cwidth > maxWidth) {
      rec.cwidth = maxWidth
      rec.cheight = (rec.cwidth / _rate)
    }

    if (rec.cheight > maxHeight) {
      rec.cheight = maxHeight
      rec.cwidth = (rec.cheight * _rate)
    }

    rec.width = rec.cwidth
    rec.height = rec.cheight
  }

  return rec
}
