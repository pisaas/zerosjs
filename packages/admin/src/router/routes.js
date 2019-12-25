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
      { path: '/apps', name: 'main:apps', component: load('apps/views'),
        meta: { title: '应用列表', hideInMenu: true, hideSide: true }
      }
    ]
  },

  { path: '/app', name: 'app:home', component: App,
    redirect: '/home',
    meta: { title: '概览', icon: 'ios-browsers' },
    children: [
      { path: '/home', name: 'app:home:overview', component: load('home'),
        meta: { title: '概览', hideInMenu: true }
      }
    ]
  },
  
  { path: '/custom', name: 'app:custom', component: App,
    redirect: '/custom/c',
    meta: { title: '定制', icon: 'md-aperture' },
    children: [
      { path: 'c', name: 'app:custom:cont', component: Parent,
        redirect: '/custom/c/pages',
        meta: { title: '内容', icon: 'md-color-palette' },
        children: [
          { path: 'pages', name: 'app:custom:cont:pages', component: load('settings/logs'),
            meta: { title: '页面' },
          }
        ]
      },
    ]
  },

  { path: '/act', name: 'app:act', component: App,
    redirect: '/act/t',
    meta: { title: '活动', icon: 'md-bonfire' },
    children: [
      { path: 't', name: 'app:act:topic', component: Parent,
        redirect: '/act/t/list',
        meta: { title: '话题', icon: 'ios-book' },
        children: [
          { path: 'list', name: 'app:act:topic:list',
            component: load('acts/topics/views/list'),
            meta: { title: '话题列表' },
          },
          { path: 'categories', name: 'app:act:topic:cats',
            component: load('acts/topics/views/cats'),
            meta: { title: '话题分类' },
          }
        ]
      }
    ]
  },

  { path: '/ops', name: 'app:ops',  component: App,
    redirect: '/ops/resc',
    meta: { title: '管理', icon: 'ios-bulb' },
    children: [
      { path: 'msgs', name: 'app:ops:msgs', component: Parent,
        redirect: '/ops/msgs/feedback',
        meta: { title: '消息管理', icon: 'md-chatbubbles' },
        children: [
          { path: 'feedback', name: 'app:ops:msgs:feedback', component: load('settings/feedback'),
            meta: { title: '建议反馈', icon: 'ios-mail' },
          },
          { path: 'livechat', name: 'app:ops:msgs:livechat', component: load('settings/livechat'),
            meta: { title: '在线客服', icon: 'ios-chatbubbles' },
          },
        ]
      },
      { path: 'users', name: 'app:ops:usrs', component: Parent,
        redirect: '/ops/users/list',
        meta: { title: '用户管理', icon: 'md-contacts' },
        children: [
          { path: 'list', name: 'app:ops:usrs:list',
            component: load('settings/staffs'),
            meta: { title: '用户列表' },
          },
        ]
      },
      { path: 'resc', name: 'app:ops:resc', component: Parent,
        redirect: '/ops/resc/materials',
        meta: { title: '素材管理', icon: 'md-filing' },
        children: [
          { path: 'materials', name: 'app:ops:resc:materials',
            component: load('ops/rescs/views/materials'),
            meta: { title: '素材列表' },
          },
        ]
      },
    ]
  },
  
  { path: '/stats', name: 'app:stats', component: App,
    redirect: '/stats/report',
    meta: { title: '统计', icon: 'md-analytics' },
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

  { path: '/settings', name: 'app:set', component: App,
    redirect: '/settings/gen',
    meta: { title: '设置', icon: 'md-cog' },
    children: [
      { path: 'gen', name: 'app:set:gen', component: Parent,
        redirect: '/settings/gen/app',
        meta: { title: '通用设置', icon: 'ios-construct' },
        children: [
          { path: 'app', name: 'app:set:gen:app', component: load('settings/logs'),
            meta: { title: '应用信息' }
          },
          { path: 'staffs', name: 'app:set:gen:staffs', component: load('settings/staffs'),
            meta: { title: '成员管理' },
          },
        ]
      },
      { path: 'sys', name: 'app:set:sys', component: Parent,
        redirect: '/settings/sys/logs',
        meta: { title: '系统设置', icon: 'md-code-working' },
        children: [
          { path: 'cats', name: 'app:set:sys:cats', component: load('settings/categories'),
            meta: { title: '信息分类' },
          },
          { path: 'logs', name: 'app:set:sys:logs', component: load('settings/logs'),
            meta: { title: '系统日志' }
          },
          { path: 'api', name: 'app:set:sys:api', component: load('settings/staffs'),
            meta: { title: 'API' },
          },
          { path: 'workflow', name: 'app:set:sys:workflow', component: load('settings/staffs'),
            meta: { title: '工作流' },
          },
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
