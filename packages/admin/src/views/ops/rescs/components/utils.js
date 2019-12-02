import * as qiniu from 'qiniu-js'
import { getUptoken } from '@/apis/zeros'

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

export function rescUpload (file, options) {
  options = Object.assign ({
    onProgress: () => {},
    onUpload: () => {}
  }, options)

  let { key, putExtra, config } = options

  return getUptoken().then((uptoken) => {
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

export default {
  RescMimeTypes,
  isSameFile,
  isImageFile,
  getFileThumbnail,
  rescUpload
}