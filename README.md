# Zerosjs

Zerosjs为Zeros主要工程，用于提供Zeros业务实现，基于Nodejs，数据库采用MongoDB，缓存使用Redis。
Zerosjs为了提高开发效率，并保存组件统一发布，采用MonoRepo方式，主要基于Lerna实现。

## 开发

### 主要命令

#### lerna bootstrap
启动Lerna

过程：
- 为每个包安装依赖
- 链接相互依赖的库到具体的目录
- 执行 npm run prepublish
- 执行 npm run prepare

```bash
lerna bootstrap
```

#### lerna add
添加一个包的版本为各个包的依赖

```bash
lerna add <package>[@version] [--dev] [--exact]
```

#### learn clean
删除各个包下的node_modules

#### lerna link
链接互相引用的库

#### lerna create
新建包

## 参考
- [lerna Github](https://github.com/lerna/lerna)
- [lerna的基础使用](https://www.jianshu.com/p/8b7e6025354b)




