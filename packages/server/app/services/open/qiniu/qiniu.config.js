module.exports = function () {
  const domains = {
    'default': 'http://resc.pisaas.com',
    'tmp': 'http://resc-tmp.pisaas.com'
  };

  return {
    domains,

    'AccessKey': 'NaBGgt0FeN6Hza1YAwmZ3NHrB-rRYzDljm6IaCsR',
    'SecretKey': 'eif4-lScxZStteETV4S-GwdJtuoT5Vz-MuSKFo9e',
    'clientUploadUrl': 'https://upload.qiniup.com',

    'pipelines': {
      'default': 'pisaas-resc',
      'media': 'pisaas-resc-media'
    },

    'fops': {
      'thumb': {
        'cmd': 'imageView2/0/w/600/h/600/format/jpg'
      },
      'avatar': {
        'cmd': 'imageView2/0/w/600/h/600/format/jpg'
      },
      'audio': {
        'pipelineKey': 'media',
        'cmd': 'avthumb/mp3/ab/128k/ar/44100/acodec/libmp3lame'
      },
      'video': {
        'pipelineKey': 'media',
        'cmd': 'imageView2/0/w/600/h/600/format/jpg'
      }
    },
  
    'buckets': {
      'resc': {
        'name': 'pisaas-resc',
        'domain': domains.default,
        'uptoken': {
          'expires': 600,
          'returnBody': {
            'key': '$(key)',
            'hash': '$(etag)',
            'fsize': '$(fsize)',
            'bucket': '$(bucket)',
            'persistentId': '$(persistentId)',
            'w': '$(imageInfo.width)',
            'h': '$(imageInfo.height)',
            'mime': '$(mimeType)'
          }
        }
      },
  
      'tmp': {
        'name': 'pisaas-resc-tmp',
        'domain': domains.tmp,
        'deleteAfterDays': 3,
        'uptoken': {
          'expires': 600,
          'returnBody': {
            'key': '$(key)',
            'fsize': '$(fsize)',
            'persistentId': '$(persistentId)',
            'w': '$(imageInfo.width)',
            'h': '$(imageInfo.height)',
            'mime': '$(mimeType)'
          }
        }
      }
    }
  };
};
