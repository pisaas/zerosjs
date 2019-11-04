const { JWTStrategy: FJWTStrategy } = require('@feathersjs/authentication');

class JWTStrategy extends FJWTStrategy {
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
