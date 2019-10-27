import Parent from '@c/layout/parent'
import Main from '@c/layout/main'
import App from '@c/layout/app'

let __routeCmpts = {}

function load (path) {
  let cmpt = () => import(`@/views/${path}`)
  __routeCmpts[path] = cmpt

  return cmpt
}

/**
 * meta除了原生参数外可配置的参数:
 * meta: {
 *  hideInMenu: (false) 设为true后在左侧菜单不会显示该页面选项
 *  level: 路径级别，0为顶级菜单
 *  access: (null) 可访问该页面的权限数组，当前路由设置的权限会影响子路由
 *  icon: (-) 该页面在左侧菜单、面包屑和标签导航处显示的图标，如果是自定义图标，需要在图标名称前加下划线'_'
 * }
 */
const routes = [
  { path: '/login', name: 'login', component: load('login'),
    meta: { title: '登录', hideInMenu: true }
  },

  { path: '/', name: 'main', redirect: '/app', component: Main,
    meta: { title: '应用列表', hideInMenu: true, icon: 'md-desktop' },
    children: [
      { path: '/apps', name: 'main:apps', component: load('apps'),
        meta: { title: '应用列表', hideInMenu: true, hideSide: true }
      }
    ]
  },

  { path: '/app', name: 'app:home', redirect: '/home', component: App,
    meta: { title: '概览', icon: 'md-cube' },
    children: [
      { path: '/home', name: 'app:home:overview', component: load('home'),
        meta: { title: '概览', hideInMenu: true }
      }
    ]
  },

  { path: '/sys', name: 'app:sys', redirect: '/sys/regs', component: App,
    meta: { title: '系统', icon: 'md-cog' },
    children: [
      { path: 'regs', name: 'app:sys:regs', component: load('sys/logs'),
        meta: { title: '注册信息', icon: 'md-snow' }
      },
      { path: 'logs', name: 'app:sys:logs', component: load('sys/logs'),
        meta: { title: '系统日志', icon: 'md-list' }
      },
      { path: 'staffs', name: 'app:sys:staffs', component: load('sys/staffs'),
        meta: { title: '系统成员', icon: 'md-people' },
      },
      { path: 'livechat', name: 'app:sys:livechat', component: load('sys/livechat'),
        meta: { title: '在线客服', icon: 'ios-chatbubbles' },
      },
      { path: 'feedback', name: 'app:sys:feedback', component: load('sys/feedback'),
        meta: { title: '建议反馈', icon: 'ios-mail' },
      },
    ]
  },
  
  { path: '/stats', name: 'app:stats', redirect: '/stats/report', component: App,
    meta: { title: '数据', icon: 'md-analytics' },
    children: [
      { path: 'report', redirect: '/stats/report/m1', name: 'app:stats:report',
        meta: { title: '报表', icon: 'md-stats' },
        component: Parent,
        children: [
          { path: 'm1', name: 'app:stats:report:m1', component: load('sys/staffs'),
            meta: { title: '报表1' },
          },
          { path: 'm1', name: 'app:stats:report:m2', component: load('sys/staffs'),
            meta: { title: '报表2' },
          }
        ]
      },
    ]
  },
  
  { path: '/error/:code', name: 'error_view', component: load('error/40X'),
    meta: { title: '错误', hideInMenu: true },
  },
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('@/views/error/40X.vue')
  })
}

export const routeCmpts = __routeCmpts

export default routes
