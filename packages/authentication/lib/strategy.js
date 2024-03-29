exports.AuthenticationBaseStrategy = class AuthenticationBaseStrategy {
  setAuthentication (auth) {
    this.authentication = auth;
  }

  setApplication (app) {
    this.app = app;
  }

  setName (name) {
    this.name = name;
  }

  get configuration () {
    return this.authentication.configuration[this.name];
  }

  get entityService () {
    const { service } = this.configuration;

    if (!service) {
      return null;
    }

    return this.app.service(service) || null;
  }
}
