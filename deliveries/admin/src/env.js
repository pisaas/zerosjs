/**
 * 获取配置信息
 *
 * Created by Ray Liu on 2016-10-26
 *
 * 描述：获取配置信息
 */

const __env = process.env

// userAgent相关方法
const __navUserAgnet = navigator.userAgent
const __navUseragnet = navigator.userAgent.toLowerCase()
export const appId = '0'
export const hostBaseUrl = window.location.protocol + '//' + window.location.host
export const baseUrl = (__env.BASE_URL === '@host' ? hostBaseUrl : __env.BASE_URL)
export const apiDomain = (__env.API_DOMAIN === '@host' ? hostBaseUrl : __env.API_DOMAIN)

export const is = {
  wechat: (__navUseragnet.match(/MicroMessenger/i) == 'micromessenger'), // 判断是否是Wechat环境
  // isWechat: true, // 判断是否是Wechat环境
  pcWechat: (__navUseragnet.match(/WindowsWechat/i) == 'windowswechat'),
  android: (__navUserAgnet.indexOf('Android') > -1 || __navUserAgnet.indexOf('Linux') > -1), // 判断是否是安卓设备
  iOS: (!!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)),
  chrome: (__navUseragnet.indexOf('chrome') > -1),
  safari: (__navUseragnet.indexOf('safari') > -1),
  firefox: (__navUseragnet.indexOf('firefox') > -1),
  dolphin: (__navUseragnet.indexOf('dolfin') > -1),
  ucBrowser: (__navUseragnet.indexOf('ucbrowser') > -1),
  app: () => { return (is.android || is.iOS) && !!window.Cordova },
  qq: () => { return (navigator.userAgent.toLowerCase().match(/\bqq\b/i) == 'qq') },
  mobile: () => {
    var agents = ['android', 'iphone', 'symbianos', 'windows phone', 'ipad', 'ipod']

    for (var v = 0; v < agents.length; v++) {
      if (__navUseragnet.indexOf(agents[v]) > 0) {
        return true
      }
    }

    return false
  }
}

export const ViewSizes = {
  xs: 575,
  sm: 767,
  md: 991,
  lg: 1199
}

export const viewSize = () => {
  return window.document.body.clientWidth
}

export const viewSizeName = () => {
  let pgSize = viewSize()

  // 计算pageSizeName
  let sizeName = 'xl'
  for (let name in ViewSizes) {
    if (pgSize <= ViewSizes[name]) {
      sizeName = name
      break
    }
  }

  return sizeName
}

export default {
  appId,
  baseUrl,
  apiDomain,
  is,
  viewSize,
  viewSizeName
}
