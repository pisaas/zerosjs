module.exports.authentication = {
  entity: 'user',
  service: 'data/users',
  secret: 'Hi5r9X2h9CrohaxQD9MF7oNof6Y=',
  secrets: {
    client: 'Hi5r9X2h9CrohaxQD9MF7oNof6Y=',
    admin: 'Hi5r9X2h9CrohaxQD9MF7oNof6Y=',
    console: 'Hi5r9X2h9CrohaxQD9MF7oNof6Y='
  },
  authStrategies: [
    'jwt',
    'local'
  ],
  jwtOptions: {
    header: {
      typ: 'access'
    },
    audience: 'https://pisaas.com',
    issuer: 'zero',
    algorithm: 'HS256',
    expiresIn: '1d'
  },
  local: {
    usernameField: 'username',
    passwordField: 'password',
    verifyFields: [ 'id', 'uname', 'email', 'mobile' ]
  }
};
