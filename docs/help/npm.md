# node安装node-sass失败，配置淘宝源

安装 node-sass 的时候总是会各种不成功，大部分安装不成功的原因都源自这里，因为 GitHub Releases 里的文件都托管在 s3.amazonaws.com上面，而这个网址在国内总是网络不稳定，所以我们需要通过第三方服务器下载这个文件。

### 方法一：使用淘宝源
```bash
npm config set sass_binary_site=https://npm.taobao.org/mirrors/node-sass/
npm config set phantomjs_cdnurl=https://npm.taobao.org/mirrors/phantomjs/
npm config set electron_mirror=https://npm.taobao.org/mirrors/electron/
npm config set registry=https://registry.npm.taobao.org
```

这样使用 npm install 安装 node-sass、electron 和 phantomjs 时都能自动从淘宝源上下载。

### 方法二：安装cnpm >>>  也是淘宝源的做法
```bash
npm install -g cnpm

cnpm install  
```
这样也可以成功安装node-sass

### 方法三：使用VPN
```bash
npm config set proxy (http://127.0.0.1:1080)此处是VPN的代理地址

npm i node-sass

# 下载完成后删除 http 代理
npm config delete proxy
```