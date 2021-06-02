import Vue from 'vue'
import Router from 'vue-router'

import { LoadingBar } from 'view-design'

import routes from './routes'

Vue.use(Router)

const LOGIN_PAGE_NAME = 'login'
const APP_HOME_PAGE_NAME = 'app:home'
const APP_LIST_PAGE_NAME = 'main:apps'

const routesMap = {}

function getRoutesMap (r, m) {
  if (r.name) {
    m[r.name] = r
  }
  if (r.children) {
    r.children.forEach((child) => {
      getRoutesMap(child, m)
    })
  }
}

routes.forEach((r) => {
  getRoutesMap(r, routesMap)
})

export default function () {
  const router = new Router({
    // mode: 'history',
    // base: process.env.BASE_URL,
    routes
  })

  router.routesMap = () => {
    return routesMap
  }

  router.topRoutes = (prefix) => {
    if (prefix && !prefix.endsWith(':')) {
      prefix += ':'
    }

    let topRoutes = routes.filter((r) => {
      if (!r || !r.name || !r.meta || r.meta.hideInMenu) {
        return false
      }

      let nameParts = r.name.split(':')
      
      if (!prefix) {
        return nameParts.length <= 1
      }

      if (r.name.indexOf(prefix) !== 0) {
        return false
      }

      let prefixParts = prefix.split(':')

      return nameParts.length === prefixParts.length
    })

    return topRoutes
  }

  router.tryPush = (location) => {
    return router.push(location).catch(() => {})
  }

  router.tryReplace = (location) => {
    return router.push(location).catch(() => {})
  }

  router.isAppPageName = (name) => {
    if (!name) {
      return false
    }

    return (name === 'app' || (name.indexOf('app:') === 0))
  }

  // topRoute - 获取当前level级别的顶级菜单
  router.topRoute = (routeName, level) => {
    if (!routeName) {
      return null
    }

    let topRoutePartsLength = level + 1
    let routeParts = routeName.split(':')

    if (routeParts.length < topRoutePartsLength) {
      return null
    }

    let topRouteName = routeParts.slice(0, topRoutePartsLength).join(':')
    let topRoute = routesMap[topRouteName]
    
    return topRoute
  }

  router.goHome = () => {
    return router.tryPush('/home')
  }

  router.goLogin = () => {
    return router.tryPush('/login')
  }

  /**
   * 跳转错误页面
   * @return {[type]} [description]
   */
  router.goError = (code) => {
    code = code || '404'
    return router.tryPush(`/${code}`)
  }

  /**
   * topRoute - 获取当前顶级菜单
   *
   * @return {type}  description
   */
  // function topRoute () {
  //   let routerApp = zeros.router.app
  //   if (!routerApp || !routerApp.$route || !routerApp.$route.name) {
  //     return null
  //   }
  //   let topRouteName = routerApp.$route.name.split(':')[0]
  //   let topRoute = zeros.store.getters['zeros/routesMap'][topRouteName]
  //   return topRoute || null
  // }

  router.beforeEach(function (to, from, next) {
    LoadingBar.start()

    const isLogin = router.app.$store.getters['usr/isLogin']
    const isAppLoaded = router.app.$store.getters['app/isLoaded']

    // 未登陆
    if (!isLogin) {
      if (to.name === LOGIN_PAGE_NAME) {
        // 要跳转的页面是登录页
        next() // 继续
      } else {
        // 未登录且要跳转的页面不是登录页
        next({ name: LOGIN_PAGE_NAME, query: { redirect: to.fullPath } }) // 跳转到登录页
      }

      return next()
    }

    const isAppPage = router.isAppPageName(to.name)

    if (isAppPage && !isAppLoaded) {
      return next({ name: APP_LIST_PAGE_NAME })
    }

    if (to.name === LOGIN_PAGE_NAME) {
      // 已登录且要跳转的页面是登录页
      return next({ name: APP_HOME_PAGE_NAME })  // 则跳转到home页
    }

    next()
  })

  router.afterEach(to => {
    LoadingBar.finish()
    window.scrollTo(0, 0)
  })

  return router
}
