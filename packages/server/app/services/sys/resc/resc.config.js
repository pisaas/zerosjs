const _ = require('lodash');

module.exports = function (app) {
  const qiniuCfg = app.get('open.qiniu');

  return {
    domains: qiniuCfg.domains,

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
        'name': '用户头像',
        'type': 'usr',
        'storage': 'qiniu',
        'getKey': (options) => {
          return { key: `avatars/${options.key}`, options };
        }
      },

      'usrAvatar': {
        'name': '用户头像',
        'type': 'usr',
        'avatar': true,
        'storage': 'qiniu',
        'getKey': (options) => {
          let opts = _.defaultsDeep(options, { ts: (+new Date()) });
          return {
            key: `users/${opts.ucode}/avatar_${opts.ts}`,
            avatarKey: `usr.${opts.ucode}`,
            options: opts
          };
        }
      },

      'usrResc': {
        'name': '用户资源',
        'type': 'usr',
        'storage': 'qiniu',
        'getKey': (options) => {
          let opts = options || {};
          return {
            key: `apps/${opts.appId}/users/${opts.ucode}/${opts.key}`,
            options: opts
          };
        }
      },

      'appLogo': {
        'name': '应用Logo',
        'type': 'app',
        'avatar': true,
        'storage': 'qiniu',
        'getKey': (options) => {
          let opts = _.defaultsDeep(options, { ts: (+new Date()) });
          return {
            key: `apps/${opts.appId}/logo_${opts.ts}`,
            avatarKey: `app.${opts.appId}`,
            options: opts
          };
        }
      },

      'appMaterial': {
        'name': '应用素材',
        'type': 'app',
        'storage': 'qiniu',
        'categories': {
          'required': true,
          'default': 'others',
          'items': {
            'logo': '应用标志',
            'app_banner': '应用头部',
            'others': '其他'
          }
        },
        'getKey': (options) => {
          let opts = options || {};
          return {
            key: `apps/${opts.appId}/m/${opts.category}/${opts.key}`,
            options: opts
          };
        }
      },

      'topicResc': {
        'name': 'topic图片',
        'type': 'app',
        'storage': 'qiniu',
        'getKey': (options) => {
          let opts = options || {};
          return {
            key: `apps/${opts.appId}/topics/${opts.key}`,
            options: opts
          };
        }
      },
      
      'roomIcon': {
        'name': '聊天室icon',
        'type': 'app',
        'avatar': true,
        'storage': 'qiniu',
        'getKey': (options) => {
          let opts = _.defaultsDeep(options, { ts: (+new Date()) });
          return {
            key: `rooms/${opts.rcode}/icon_${opts.ts}`,
            avatarKey: `room.${opts.rcode}`,
            options: opts
          };
        }
      }
    }
  };
};
