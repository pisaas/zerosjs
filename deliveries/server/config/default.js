module.exports = {
  host: 'localhost',
  port: 1337,
  http: {
    public: './public/',
  },
  paginate: {
    default: 10,
    max: 50
  },
  log: {
    level: 'silly'
  },
  datastores: {
    mongodb: {
      url: 'mongodb://localhost:27017/zeros'
    }
  },
  plugins: {
    // 'authentication': false
  }
};
