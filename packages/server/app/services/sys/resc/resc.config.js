const _ = require('lodash');

module.exports = function (app) {
  const qiniuCfg = app.get('open.qiniu');

  return {
    domains: qiniuCfg.domains,

    maxUploadSize: 500 * 1024 * 1024,  // 500MB

    // 上传前缀限制
    rescPrefixs: [
      'APP',  // 应用
      'ORG',  // 组织
      'USER',  // 用户
      'MESSAGE',  // 消息文件
      'TOPICS',  // 主题
      'POSTS',  // 跟贴
      'RESUME',   // 简历
    ],

    'stores': {
      'app/logo': {
        'name': '应用Logo',
        'type': 'app',
        'rtype': 'image',
        'avatar': true,
        'storage': 'qiniu',
        'getKey': (options) => {
          let opts = Object.assign({}, options);
          let { appid } = opts.model;

          return {
            refid: appid,
            key: `apps/${appid}/logo`,
            avatarKey: `a_${appid}`,
            options: opts
          };
        }
      },

      'app/material': {
        'name': '应用素材',
        'type': 'app',
        'storage': 'qiniu',
        'getKey': (options) => {
          let opts = Object.assign({}, options);
          let { id, appid } = opts.model;

          return {
            refid: appid,
            key: `apps/${appid}/m/${id}`,
            options: opts
          };
        }
      },

      'usr/avatar': {
        'name': '用户头像',
        'type': 'usr',
        'avatar': true,
        'storage': 'qiniu',
        'getKey': (options) => {
          let opts = Object.assign({}, options);
          let { uid } = opts.model;

          return {
            refid: uid,
            key: `users/${uid}/avatar`,
            avatarKey: `u_${uid}`,
            options: opts
          };
        }
      },

      'usr/resc': {
        'name': '用户资源',
        'type': 'usr',
        'storage': 'qiniu',
        'getKey': (options) => {
          let opts = Object.assign({}, options);
          let { model, key } = opts;

          return {
            refid: model.uid,
            key: `apps/${model.appid}/users/${model.uid}/${key}`,
            options: opts
          };
        }
      },

      'topic/material': {
        'name': '主题素材',
        'type': 'app',
        'storage': 'qiniu',
        'getKey': (options) => {
          let opts = Object.assign({}, options);
          let { model, tid, key } = opts;
          
          return {
            refid: tid,
            key: `apps/${model.appid}/t/${tid}/${key}`,
            options: opts
          };
        }
      },
      
      'room/avatar': {
        'name': '聊天室logo',
        'type': 'app',
        'avatar': true,
        'storage': 'qiniu',
        'getKey': (options) => {
          let opts = Object.assign({}, options);
          let { rid } = opts;
          
          return {
            refid: rid,
            key: `rooms/${rid}/avatar`,
            avatarKey: `r_${rid}`,
            options: opts
          };
        }
      }
    }
  };
};
