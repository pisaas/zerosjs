import * as qiniu from 'qiniu-js'
import { getUptoken } from '@/apis/zeros'

export const RescMimeTypes = {
  'image': "image/*",
  'video': "video/*",
  'audio': "audio/*"
}

export const RescTypeNames = {
  'image': '图片',
  'audio': '音频',
  'video': '视频'
}

// 获取文件上传key
export function isSameFile (file1, file2) {
  if (!file1 || !file2) {
    return false
  }
  return file1.name === file2.name
    && file1.size === file2.size
    && file1.lastModified === file2.lastModified
}

export function isImageFile (file) {
  if (!file || !file.type) {
    return false
  }
  return (file.type.indexOf('image/') === 0)
}

// 判断文件缩略图
export async function getFileThumbnail (file) {
  if (!isImageFile(file)) {
    return null
  }

  let vmMedia = zerosApp.vm.prototype.$media
  let url = await vmMedia.readFileAsDataUrl(file)

  return url
}

export function getRescUptoken (options) {
  return getUptoken(options)
}

export function rescUpload (file, options) {
  options = Object.assign ({
    onProgress: () => {},
    onUpload: () => {}
  }, options)

  let { key, uptoken, putExtra, config, tokenOptions } = options
  
  return Promise.resolve().then(() => {
    if (uptoken) {
      return uptoken
    }
    return getRescUptoken(tokenOptions)
  }).then((uptoken) => {
    const { token, uploadUrl, uploadData } = uptoken

    config = Object.assign({}, config)

    putExtra = Object.assign({}, putExtra)

    key = key || uploadData.key

    return new Promise((resolve, reject) => {
      const observable = qiniu.upload(file, key, token, putExtra, config)
  
      const subscription = observable.subscribe({
        next (res) { options.onProgress(res) },
        error (err) { reject(err) },
        complete (result) { resolve(result) }
      })

      options.onUpload({ subscription, observable })
    })
  })
}

export function checkPersistent (rescId, options) {
  options = Object.assign({
    silent: false
  }, options)

  if (!rescId) {
    return Promise.resolve()
  }

  const vmService = zerosApp.vm.prototype.$service

  return vmService('resc').get('check_transcoding', {
    query: { id: rescId }
  }).then((res) => {
    if (options.silent === true) {
      return res
    }

    let rtypeName = RescTypeNames[res.rtype] || '资源'

    if (res.status === 'transcoding') {
      this.$app.toast('正在转码中 ...')
    } else if (res.pubed) {
      this.$app.toast(`${rtypeName}已发布。`, { type: 'success' })
    } else {
      this.$app.toast(`${rtypeName} ${res.statusName}`)
    }

    return res
  })
}

export function postPersistent (tmpKey, rtype) {
  if (!tmpKey) {
    return Promise.resolve()
  }

  const vmService = zerosApp.vm.prototype.$service

  return vmService('resc').get('post_transcoding', {
    query: { rtype, key: tmpKey }
  })
}

export default {
  RescMimeTypes,
  RescTypeNames,
  isSameFile,
  isImageFile,
  getFileThumbnail,
  getRescUptoken,
  rescUpload,
  checkPersistent,
  postPersistent
}