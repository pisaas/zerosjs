module.exports = function (zeros) {
  return {
    initialize: function (next) {
      loadRescGlobals(zeros);
      
      return next();
    }
  };
};

const QiniuFops = {
  thumb: 'imageView2/0/w/600/h/600/format/jpg',
  avatar: 'imageView2/0/w/64/h/64/format/jpg'
};

function loadRescGlobals (zeros) {
  if (zeros.$resc) {
    return;
  }

  zeros.$resc = {
    QiniuFops,

    fullUrl (path, domainKey) {
      if (!path) {
        return path;
      }

      domainKey = domainKey || 'default';

      let rescCfg = zeros.get('sys.resc');
      let rescDomain = rescCfg.domains[domainKey];

      if (path.indexOf(rescDomain) === 0) {
        return path;
      }

      return `${rescDomain}/${path}`;
    },

    thumbUrl (path, fopName, domainKey) {
      fopName = fopName || 'thumb';
      let fop = QiniuFops[fopName];

      if (!path || !fop) {
        return this.fullUrl(path, domainKey);
      }

      return this.fullUrl(path, domainKey) + '?' + fop;
    }
  };
}
