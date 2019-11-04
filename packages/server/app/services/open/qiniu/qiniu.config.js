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
            'mime': '$(mimeType)'
          }
        }
      }
    }
  };
};
