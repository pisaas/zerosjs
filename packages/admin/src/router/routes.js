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

  { path: '/', name: 'main', component: Main,
    redirect: '/app', 
    meta: { title: '应用列表', hideInMenu: true, icon: 'md-desktop' },
    children: [
      { path: '/apps', name: 'main:apps', component: load('apps'),
        meta: { title: '应用列表', hideInMenu: true, hideSide: true }
      }
    ]
  },

  { path: '/app', name: 'app:home', component: App,
    redirect: '/home',
    meta: { title: '概览', icon: 'md-cube' },
    children: [
      { path: '/home', name: 'app:home:overview', component: load('home'),
        meta: { title: '概览', hideInMenu: true }
      }
    ]
  },
  
  { path: '/customize', name: 'app:customize', component: App,
    redirect: '/customize/content',
    meta: { title: '定制', icon: 'md-aperture' },
    children: [
      { path: 'content', name: 'app:customize:content', component: Parent,
        redirect: '/customize/content/pages',
        meta: { title: '内容', icon: 'md-color-palette' },
        children: [
          { path: 'pages', name: 'app:customize:content:pages', component: load('settings/logs'),
            meta: { title: '页面' },
          }
        ]
      },
    ]
  },

  { path: '/stream', name: 'app:stream', component: App,
    redirect: '/stream/topic',
    meta: { title: '活动', icon: 'md-bonfire' },
    children: [
      { path: 'topic', name: 'app:topic:categories', component: Parent,
        redirect: '/stream/topic/categories',
        meta: { title: '话题', icon: 'ios-book' },
        children: [
          { path: 'categories', name: 'app:stream:topic:categories', component: load('settings/staffs'),
            meta: { title: '分类' },
          }
        ]
      }
    ]
  },

  { path: '/members', name: 'app:members',  component: App,
    meta: { title: '用户', icon: 'md-people' },
    children: [
    ]
  },
  
  
  { path: '/stats', name: 'app:stats', component: App,
    redirect: '/stats/report',
    meta: { title: '数据', icon: 'md-analytics' },
    children: [
      { path: 'report', name: 'app:stats:report', component: Parent,
        redirect: '/stats/report/m1',
        meta: { title: '报表', icon: 'md-stats' },
        children: [
          { path: 'm1', name: 'app:stats:report:m1', component: load('settings/staffs'),
            meta: { title: '报表1' },
          },
          { path: 'm1', name: 'app:stats:report:m2', component: load('settings/staffs'),
            meta: { title: '报表2' },
          }
        ]
      },
    ]
  },

  { path: '/settings', name: 'app:settings', component: App,
    redirect: '/settings/logs',
    meta: { title: '设置', icon: 'md-cog' },
    children: [
      { path: 'logs', name: 'app:settings:logs', component: load('settings/logs'),
        meta: { title: '系统日志', icon: 'md-list' }
      },
      { path: 'api', name: 'app:settings:api', component: load('settings/staffs'),
        meta: { title: 'API', icon: 'md-cloud' },
      },
      { path: 'livechat', name: 'app:settings:livechat', component: load('settings/livechat'),
        meta: { title: '在线客服', icon: 'ios-chatbubbles' },
      },
      { path: 'feedback', name: 'app:settings:feedback', component: load('settings/feedback'),
        meta: { title: '建议反馈', icon: 'ios-mail' },
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
