module.exports = async function() {
  await new Promise((resolve, reject) => {
    if (global.zerosServer) {
      global.zerosServer.stop((err) => {
        if (err) { return reject(err); }
        
        return resolve();
      });
    }
    return resolve();
  });
};
