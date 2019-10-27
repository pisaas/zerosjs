/**
 * 应用程序模块
 */
import env from '@/env'
const rescDomain = 'http://resc.pisaas.com'
const tmpRescDomain = 'http://resc-tmp.pisaas.com'

export default {
  versionNo: '',

  // smscodeInterval: 100, // 发送验证码间隔，默认100秒

  basic: {
    appId: env.appId,
    name: '应用管理平台',
    logo: `${rescDomain}/apps/${env.appId}/logo.png`,
    loginBg: `${rescDomain}/apps/${env.appId}/console/login_bg`,
    rescDomain,
    tmpRescDomain
  },

  // 是否已初始化
  initialized: false,

  // 是否链接websocket
  connected: false,

  // 是否正确订阅消息
  subscribed: false,

  localAddress: null
}
