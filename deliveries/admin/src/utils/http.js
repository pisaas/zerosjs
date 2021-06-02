import axios from 'axios'

class HttpRequest {
  constructor (baseUrl = null) {
    this.baseUrl = baseUrl
    this.queue = {}
  }

  getInnerConfig () {
    const config = {
      baseURL: this.baseUrl,
      headers: { }
    }
    return config
  }

  destroy (url) {
    delete this.queue[url]
    if (!Object.keys(this.queue).length) {
      // Spin.hide()
    }
  }

  interceptors (instance, url) {
    // 请求拦截
    instance.interceptors.request.use(config => {
      this.queue[url] = true
      return config
    }, error => {
      return Promise.reject(error)
    })

    // 响应拦截
    instance.interceptors.response.use(res => {
      this.destroy(url)

      return res.data
    }, error => {
      this.destroy(url)

      let errorData = null

      if (error.response) {
        errorData = error.response
      }

      return Promise.reject(errorData)
    })
  }

  request (options) {
    const instance = axios.create()
    options = Object.assign(this.getInnerConfig(), options)
    this.interceptors(instance, options.url)
    return new Promise((resolve) => {
      let ins = instance(options)

      // 延时100ms，缓存
      setTimeout(() => {
        resolve(ins)
      }, 100)
    })
  }
}

export default HttpRequest
