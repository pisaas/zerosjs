import Vue from 'vue'
import Router from 'vue-router'

import { LoadingBar } from 'iview'

import routes from './routes'

Vue.use(Router)

const LOGIN_PAGE_NAME = 'login'

export default function () {
  const router = new Router({
    // mode: 'history',
    // base: process.env.BASE_URL,
    routes
  })

  router.beforeEach(function (to, from, next) {
    LoadingBar.start()

    const isLogin = router.app.$store.getters['usr/isLogin']

    // 未登陆
    if (!isLogin) {
      if (to.name === LOGIN_PAGE_NAME) {
        // 要跳转的页面是登录页
        next() // 继续
      } else {
        // 未登录且要跳转的页面不是登录页
        next({ name: LOGIN_PAGE_NAME }) // 跳转到登录页
      }

      return next()
    }

    if (to.name === LOGIN_PAGE_NAME) {
      // 已登录且要跳转的页面是登录页
      return next({ name: 'home' })  // 则跳转到home页
    }

    // store.dispatch('getUserInfo').then(user => {
    //   // 拉取用户信息，通过用户权限和跳转的页面的name来判断是否有权限访问;access必须是一个数组，如：['super_admin'] ['super_admin', 'admin']
    //   if (canTurnTo(to.name, user.access, routes)) next() // 有权限，可访问
    //   else next({ replace: true, name: 'error_401' }) // 无权限，重定向到401页面
    // })

    next()
  })

  router.afterEach(to => {
    LoadingBar.finish()
    window.scrollTo(0, 0)
  })

  return router
}
