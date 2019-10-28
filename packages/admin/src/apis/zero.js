import uni from '../utils/uni'
import service from './service'

export default {
  getUptoken,
  uploadFile
}

/**
 * 获取上传token
 * @param  {[type]} prefix [description]
 * @return {[type]}        [description]
 */
export function getUptoken (params) {
  return service('resc').get('uptoken', {
    query: params
  }).then((uploadData) => {
    let token = uploadData.token

    let rescDomain = uploadData.domain
    delete uploadData.domain
  
    let uploadUrl = uploadData.uploadUrl
    delete uploadData.uploadUrl
  
    return { token, rescDomain, uploadUrl, uploadData }
  })
  
}

/**
 * 上传文件
 * @return {[type]} [description]
 */
export function uploadFile (file, data, params) {
  if (!file) {
    return Promise.reject(new Error('上传文件不能为空。'))
  }

  return getUptoken(params).then((uptoken) => {
    let { uploadUrl, uploadData } = uptoken
    uploadData = Object.assign({}, uploadData, data)
    
    // let rescDomain = uptoken.rescDomain
  
    let formData = new FormData()
    formData.append('file', file)
  
    for (let fname in uploadData) {
      formData.append(fname, uploadData[fname])
    }
  
    return uni.request({
      method: 'post',
      url: uploadUrl,
      data: formData
    })
  })
}
