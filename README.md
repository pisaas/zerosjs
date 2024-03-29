# Zerosjs

Zerosjs 为 Zeros 主要工程，用于提供 Zeros 业务实现，基于 Nodejs，数据库采用 MongoDB，缓存使用 Redis。
Zerosjs 为了提高开发效率，并保存组件统一发布，采用 MonoRepo 方式， 主要基于 Lerna 实现。

[关于 ZerosJs](https://pisaas.gitlab.io/zeros-docs/)

## 开发

### 主要命令

#### lerna bootstrap

启动 Lerna

过程：

- 为每个包安装依赖
- 链接相互依赖的库到具体的目录
- 执行 npm run prepublish
- 执行 npm run prepare

```bash
npm config set package-lock false
lerna bootstrap

# 构建client，否则delieveries/admin无法启动
cd packages/client && npm run build

# 安装node-sass遇到超时问题
npm i node-sass --sass_binary_site=https://npm.taobao.org/mirrors/node-sass/
```

#### lerna add

添加一个包的版本为各个包的依赖

```bash
lerna add <package>[@version] [--dev] [--exact]
```

#### lerna clean

删除各个包下的 node_modules

#### lerna link

链接互相引用的库

#### lerna create

新建包

## CI

### Gitlab CI/CD

```bash
# 同步
rsync -rav --delete sync_test/ liuting@host.docker.internal:/Users/liuting/liuyi/tmp/sync_test/
```

## Mongo backup

```bash
# 备份
mongodump -d zeros -o <path>
# 还原
mongorestore -d zeros --drop <path>
```

## 参考

- [lerna Github](https://github.com/lerna/lerna)
- [lerna 的基础使用](https://www.jianshu.com/p/8b7e6025354b)
