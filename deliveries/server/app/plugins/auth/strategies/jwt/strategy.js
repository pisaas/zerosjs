const { JWTStrategy: ZJWTStrategy } = require('@zerosjs/authentication');

class JWTStrategy extends ZJWTStrategy {
  /**
   * Return the entity for a given id
   * @param id The id to use
   * @param params Service call parameters
   */
  async getEntity (id, params) {
    let entityObj = await super.getEntity(id, params);
    return entityObj;
  }
}

module.exports = {
  JWTStrategy
};
