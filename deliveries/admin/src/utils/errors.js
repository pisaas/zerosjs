export const ErrorCodes = {
  400: {
    name: '无效请求',
    desc: '无效请求，服务器无法解析当前请求'
  },
  401: {
    name: '未登陆或权限不足',
    desc: '您还没有访问当前页面或接口的权限'
  },
  403: {
    name: '资源不可用',
    desc: '您还没有访问当前页面或接口的权限'
  },
  404: {
    name: '资源不存在',
    desc: '没有找到您访问的页面或接口'
  },
  498: {
    name: '登陆已过期',
    desc: '登陆已过期，请重新登陆'
  },
  500: {
    name: '服务器错误',
    desc: '服务器错误，请联系管理员'
  }
}

export default {
  ErrorCodes
}