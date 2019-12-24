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
      'avatar': {
        'name': '头像', // 用户/应用头像
        'type': 'app',
        'storage': 'qiniu',
        'getKey': (options) => {
          return { key: `avatars/${options.key}`, options };
        }
      },

      'app/logo': {
        'name': '应用Logo',
        'type': 'app',
        'avatar': true,
        'storage': 'qiniu',
        'getKey': (options) => {
          let opts = _.defaultsDeep(options, { ts: (+new Date()) });
          return {
            key: `apps/${opts.appid}/logo_${opts.ts}`,
            avatarKey: `a_${opts.appid}`,
            options: opts
          };
        }
      },

      'app/material': {
        'name': '应用素材',
        'type': 'app',
        'storage': 'qiniu',
        'getKey': (options) => {
          let opts = options || {};
          let { model } = opts;

          return {
            key: `apps/${model.appid}/m/${model.id}`,
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
          let opts = _.defaultsDeep(options, { ts: (+new Date()) });
          return {
            key: `users/${opts.uid}/avatar_${opts.ts}`,
            avatarKey: `usr.${opts.uid}`,
            options: opts
          };
        }
      },

      'usr/resc': {
        'name': '用户资源',
        'type': 'usr',
        'storage': 'qiniu',
        'getKey': (options) => {
          let opts = options || {};
          return {
            key: `apps/${opts.appid}/users/${opts.uid}/${opts.key}`,
            options: opts
          };
        }
      },

      'topic/material': {
        'name': '主题素材',
        'type': 'app',
        'storage': 'qiniu',
        'getKey': (options) => {
          let opts = options || {};
          return {
            key: `apps/${opts.appid}/t/${opts.tid}/${opts.key}`,
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
          let opts = _.defaultsDeep(options, { ts: (+new Date()) });
          return {
            key: `rooms/${opts.rcode}/avatar_${opts.ts}`,
            avatarKey: `r_${opts.rcode}`,
            options: opts
          };
        }
      }
    }
  };
};
