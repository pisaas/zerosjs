/**
 * 应用程序模块
 */
import env from '@/env'
const rescDomain = 'http://resc.pisaas.com'
const tmpRescDomain = 'http://resc-tmp.pisaas.com'

export default {
  versionNo: '',

  basic: {
    id: env.appId,
    name: 'Zero',
    logo: `${rescDomain}/apps/${env.appId}/logo.png`,
    rescDomain,
    tmpRescDomain
  },

  // smscodeInterval: 100, // 发送验证码间隔，默认100秒

  // 是否已初始化
  appInitialized: false,

  // 是否链接websocket
  appConnected: false,

  // 是否正确订阅消息
  appSubscribed: false,

  localAddress: null
}
