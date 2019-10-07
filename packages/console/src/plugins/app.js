import iView from 'iview'

import str     from '@/lib/str'
import timeago from '@/lib/timeago'
import date    from '@/lib/date'
import format  from '@/lib/format'
import regexr  from '@/lib/regexr'

import env from '@/env'
import apis from '@/apis'

export default ({ app, Vue }) => {
  Vue.prototype.$env = env
  Vue.prototype.$util = { str, timeago, date, format, regexr }

  Vue.prototype.$apis = apis
  Vue.prototype.$service = apis.service
  Vue.prototype.$app = initApp(app, Vue)
}

function initApp (app, Vue) {
  Vue.use(iView, {
    // i18n: (key, value) => i18n.t(key, value)
  })

  function appBasic (key) {
    let appBasic = Object.assign({}, app.store.getters['app/basic'])

    if (!key || !appBasic) {
      return appBasic
    }
    return appBasic[key]
  }

  function userBasic (key) {
    let userBasic = app.store.getters['usr/basic']
    if (!key || !userBasic) {
      return userBasic
    }
    return userBasic[key]
  }

  /**
   * 返回静态文件地址
   * @param  {[type]} path [description]
   * @return {[type]}       [description]
   */
  function rescUrl (path) {
    let { code, rescDomain } = appBasic()
    return `${rescDomain}/apps/${code}/${path}`
  }

  /**
   * 临时资源文件地址
   * @param  {[type]} path [description]
   * @return {[type]}      [description]
   */
  function tmpRescUrl (path) {
    let tmpRescDomain = this.appBasic('tmpRescDomain')
    return `${tmpRescDomain}/${path}`
  }

  /**
   * topRoute - 获取当前顶级菜单
   *
   * @return {type}  description
   */
  function topRoute () {
    let routerApp = app.router.app
    if (!routerApp || !routerApp.$route || !routerApp.$route.name) {
      return null
    }
    let topRouteName = routerApp.$route.name.split(':')[0]
    let topRoute = app.store.getters['app/routesMap'][topRouteName]
    return topRoute || null
  }

  /**
   * 检查是否已登录
   * @return {Boolean} [description]
   */
  function isLogin () {
    return app.store.getters['usr/isLogin']
  }

  /**
   * 返回首页
   * @return {[type]} [description]
   */
  function goHome () {
    return app.router.push('/home')
  }

  /**
   * 调整到登录页面
   * @return {[type]} [description]
   */
  function goLogin () {
    return app.router.push('/login')
  }

  /**
   * 跳转错误页面
   * @return {[type]} [description]
   */
  function goError () {
    return app.router.push('/404')
  }

  function toast (text, opts) {
    opts = opts || {}
    opts.type = opts.type || 'info'

    const toastTypes = ['info', 'success', 'warning', 'error', 'loading']

    if (toastTypes.indexOf(opts.type) < 0) {
      return
    }

    // 根据text长度调整显示时间。
    opts.content = text
    opts.duration = (opts.duration || parseInt(2 * (text.length / 10)))
    iView.Message[opts.type](opts)
  }

  function alert (opts) {
    opts = opts || {}
    opts.type = opts.type || 'info'

    const alertTypes = ['info', 'success', 'warning', 'error', 'confirm']

    if (alertTypes.indexOf(opts.type) < 0) {
      return
    }

    iView.Modal[opts.type](opts)
  }

  function confirm (opts) {
    return iView.Modal.confirm(opts)
  }

  return {
    appBasic,
    userBasic,
    rescUrl,
    tmpRescUrl,
    topRoute,
    isLogin,
    goLogin,
    goHome,
    goError
    
  }
}