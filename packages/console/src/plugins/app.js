import lodash  from 'lodash'

import str     from '@/utils/str'
import timeago from '@/utils/timeago'
import date    from '@/utils/date'
import format  from '@/utils/format'
import regexr  from '@/utils/regexr'
import errors  from '@/utils/errors'
import uni     from '@/utils/uni'

import env from '@/env'
import apis from '@/apis'

export default ({ app, Vue }) => {
  Vue.prototype.$env = env
  Vue.prototype.$util = { lodash, str, timeago, date, format, regexr }
  Vue.prototype.$errors = errors
  Vue.prototype.$uni = uni

  Vue.prototype.$apis = apis
  Vue.prototype.$service = apis.service
  Vue.prototype.$app = initApp(app, Vue)
}

function initApp (app, Vue) {
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
  function goError (code) {
    code = code || '404'
    return app.router.push(`/${code}`)
  }

  function toast (title, opts) {
    opts = Object.assign({ title }, opts)
    uni.showToast(opts)
  }

  function loading (type) {
    uni.showLoading(type)
  }

  function alert (opts) {
    uni.showModal(opts)
  }

  function confirm (opts) {
    opts = Object.assign({
      type: 'confirm'
    }, opts)

    uni.showModal(opts)
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
    goError,
    toast,
    loading,
    confirm
  }
}