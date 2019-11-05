const { JWTStrategy: ZJWTStrategy } = require('@zerosjs/authentication');

class JWTStrategy extends ZJWTStrategy {
  /**
   * Return the entity for a given id
   * @param id The id to use
   * @param params Service call parameters
   */
  getEntity (id, params) {
    return super.getEntity(id, params);
  }
}

module.exports = {
  JWTStrategy
};
