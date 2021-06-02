const path = require('path')

const resolve = dir => {
  return path.join(__dirname, dir)
}

// 项目部署基础
// 默认情况下，我们假设你的应用将被部署在域的根目录下,
// 例如：https://www.my-app.com/
// 默认：'/'
// 如果您的应用程序部署在子路径中，则需要在这指定子路径
// 例如：https://www.foobar.com/my-app/
// 需要将它改为'/my-app/'
const PUBLIC_PATH = process.env.NODE_ENV === 'production'
  ? '/'
  : '/'

module.exports = {
  publicPath: PUBLIC_PATH,

  // tweak internal webpack configuration.
  // see https://github.com/vuejs/vue-cli/blob/dev/docs/webpack.md
  chainWebpack: config => {
    config.resolve.alias
      .set('@', resolve('src')) // key,value自行定义，比如.set('@@', resolve('src/components'))
      .set('@c', resolve('src/components'))
      .set('@conf', resolve('config'))

    config.resolve.symlinks(false)

    const types = ['vue-modules', 'vue', 'normal-modules', 'normal']
    types.forEach(type => addStyleResource(config.module.rule('less').oneOf(type)))

    config.plugin('define').tap((definitions) => {
      definitions[0]['process.env'] = JSON.stringify({
        BASE_URL: process.env.VUE_APP_BASE_URL,
        API_DOMAIN: process.env.VUE_APP_API_DOMAIN
      })
      return definitions
    })
  },

  css: {
    loaderOptions: {
      'less': {
        javascriptEnabled: true
      }
    }
  },

  // 打包时不生成.map文件
  productionSourceMap: false,

  // 这里写你调用接口的基础路径，来解决跨域，如果设置了代理，那你本地开发环境的axios的baseUrl要写为 '' ，即空字符串
  devServer: {
    disableHostCheck: true,
  //   // proxy: 'localhost:3000'
  //
  //   overlay: {
  //     warnings: false,
  //     errors: false
  //   }
  },

  // 禁用eslint
  lintOnSave: process.env.NODE_ENV !== 'production'
}

function addStyleResource (rule) {
  rule.use('style-resource')
    .loader('style-resources-loader')
    .options({
      patterns: [
        resolve('src/styles/theme.less'),
      ],
    })
}
