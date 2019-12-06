import * as qiniu from 'qiniu-js'
import uni from '@/utils/uni'
import { getUptoken } from '@/apis/zeros'
import { delay } from '../../../../utils/uni'

export const RescMimeTypes = {
  'image': "image/*",
  'video': "video/*",
  'audio': "audio/*"
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

export function checkPersistent (rescId, persistentId) {
  return qiniuRequest ('/status/get/prefop', {
    id: persistentId
  }).then((res) => {
    if (!res || isNaN(res.code)) {
      return Promise.reject(new Error('请求转码状态错误'))
    }

    // res.code: 状态码 0成功，1等待处理，2正在处理，3处理失败，4通知提交失败
    if (res.code === 0) {
      return res;
    }

    if (res.code <= 2) {
      return delay(3000).then(() => {
        return checkPersistent(persistentId)
      })
    }

    return Promise.reject(new Error(res.desc))
  }).catch (() => {
    return Promise.reject(new Error('请求转码状态错误'))
  })
}

export function qiniuRequest (uri, options) {
  options = Object.assign({
    method: 'GET',
    url: `https://api.qiniu.com${uri}`
  }, options)

  return uni.request(options)
}

export default {
  RescMimeTypes,
  isSameFile,
  isImageFile,
  getFileThumbnail,
  getRescUptoken,
  rescUpload,
  checkPersistent
}