/* tsline:disable:handle-callback-err */
/* tslint:disable:no-unused-expression */
const express = require('express');

const errors = require('@zerosjs/errors');
const request = require('request');
const fs = require('fs');
const { join } = require('path');

const handler = require('../lib/error-handler');

const content = '<html><head></head><body>Error</body></html>';

let htmlHandler = jest.fn(function (error, req, res, next) {
  res.send(content);
});

const jsonHandler = jest.fn(function (error, req, res, next) {
  res.json(error);
});

describe('error-handler', () => {
  it('is CommonJS compatible', () => {
    expect(typeof require('../lib/error-handler')).toBe('function');
  });

  it('is import compatible', () => {
    expect(typeof handler).toBe('function');
  });

  describe('supports catch-all custom handlers', function () {
    let currentError;

    beforeAll(function () {
      this.app = express().get('/error', function (req, res, next) {
        next(new Error('Something went wrong'));
      }).use(handler({
        html: htmlHandler,
        json: jsonHandler,
        logger: {
          error (e) {
            currentError = e;
          }
        }
      }));

      this.server = this.app.listen(5050);
    });

    afterAll(function (done) {
      this.server.close(done);
    });

    describe('HTML handler', () => {
      const options = {
        url: 'http://localhost:5050/error',
        headers: {
          'Content-Type': 'text/html',
          'Accept': 'text/html'
        }
      };

      it('is called', done => {
        request(options, (error, res, body) => {
          expect(htmlHandler).toBeCalled(); // eslint-disable-line
          done();
        });
      });

      it('logs the error', done => {
        request(options, (error, res, body) => {
          expect(currentError.message).toBe('Something went wrong');
          done();
        });
      });

      it('can send a custom response', done => {
        request(options, (error, res, body) => {
          expect(body).toBe(content);
          done();
        });
      });
    });

    describe('JSON handler', () => {
      const options = {
        url: 'http://localhost:5050/error',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      it('is called', done => {
        request(options, (error, res, body) => {
          expect(jsonHandler).toBeCalled();
          done();
        });
      });

      it('can send a custom response', done => {
        const expected = JSON.stringify({
          name: 'GeneralError',
          message: 'Something went wrong',
          code: 500,
          className: 'general-error',
          data: {},
          errors: {}
        });
        request(options, (error, res, body) => {
          expect(body).toEqual(expected);
          done();
        });
      });
    });
  });

  describe('supports error-code specific custom handlers', () => {
    describe('HTML handler', () => {
      const req = {
        headers: { 'content-type': 'text/html' }
      };
      const makeRes = (errCode, props) => {
        return Object.assign({
          set () {},
          status (code) {
            expect(code).toBe(errCode);
          }
        }, props);
      };

      it('if the value is a string, calls res.sendFile', done => {
        const err = new errors.NotAuthenticated();
        const middleware = handler({
          logger: null,
          html: { 401: 'path/to/401.html' }
        });
        const res = makeRes(401, {
          sendFile (f) {
            expect(f).toBe('path/to/401.html');
            done();
          }
        });
        middleware(err, req, res);
      });

      it('if the value is a function, calls as middleware ', done => {
        const err = new errors.PaymentError();
        const res = makeRes(402);
        const middleware = handler({
          logger: null,
          html: { 402: (_err, _req, _res) => {
            expect(_err).toBe(err);
            expect(_req).toBe(req);
            expect(_res).toBe(res);
            done();
          } }
        });
        middleware(err, req, res);
      });

      it('falls back to default if error code config is available', done => {
        const err = new errors.NotAcceptable();
        const res = makeRes(406);
        const middleware = handler({
          logger: null,
          html: { default: (_err, _req, _res) => {
            expect(_err).toBe(err);
            expect(_req).toBe(req);
            expect(_res).toBe(res);
            done();
          } }
        });
        middleware(err, req, res);
      });
    });

    describe('JSON handler', () => {
      const req = {
        headers: { 'content-type': 'application/json' }
      };
      const makeRes = (errCode, props) => {
        return Object.assign({
          set () {},
          status (code) {
            expect(code).toBe(errCode);
          }
        }, props);
      };

      it('calls res.json by default', done => {
        const err = new errors.NotAuthenticated();
        const middleware = handler({
          logger: null,
          json: {}
        });
        const res = makeRes(401, {
          json (obj) {
            expect(obj).toEqual(err.toJSON());
            done();
          }
        });
        middleware(err, req, res);
      });

      it('if the value is a function, calls as middleware ', done => {
        const err = new errors.PaymentError();
        const res = makeRes(402);
        const middleware = handler({
          logger: null,
          json: { 402: (_err, _req, _res) => {
            expect(_err).toBe(err);
            expect(_req).toBe(req);
            expect(_res).toBe(res);
            done();
          } }
        });
        middleware(err, req, res);
      });

      it('falls back to default if error code config is available', done => {
        const err = new errors.NotAcceptable();
        const res = makeRes(406);
        const middleware = handler({
          logger: null,
          json: { default: (_err, _req, _res) => {
            expect(_err).toBe(err);
            expect(_req).toBe(req);
            expect(_res).toBe(res);
            done();
          } }
        });
        middleware(err, req, res);
      });
    });
  });

  describe('use as app error handler', function () {
    beforeAll(function () {
      this.app = express()
        .get('/error', function (req, res, next) {
          next(new Error('Something went wrong'));
        })
        .get('/string-error', function (req, res, next) {
          const e = new Error('Something was not found');
          e.code = '404';

          next(e);
        })
        .get('/bad-request', function (req, res, next) {
          next(new errors.BadRequest({
            message: 'Invalid Password',
            errors: [{
              path: 'password',
              value: null,
              message: `'password' cannot be 'null'`
            }]
          }));
        })
        .use(function (req, res, next) {
          next(new errors.NotFound('File not found'));
        })
        .use(handler({
          logger: null
        }));

      this.server = this.app.listen(5060);
    });

    afterAll(function (done) {
      this.server.close(done);
    });

    describe('converts an non-zeros error', () => {
      it('is an instance of GeneralError', done => {
        request({
          url: 'http://localhost:5060/error',
          json: true
        }, (error, res, body) => {
          expect(res.statusCode).toBe(500);
          expect(body).toEqual({
            name: 'GeneralError',
            message: 'Something went wrong',
            code: 500,
            className: 'general-error',
            data: {},
            errors: {}
          });
          done();
        });
      });

      it.skip('still has a stack trace', () => {
        expect(handler).toBe('function');
      });
    });

    describe('text/html format', () => {
      it('serves a 404.html', done => {
        fs.readFile(join(__dirname, '..', 'lib', 'public', '404.html'), function (err, html) {
          request({
            url: 'http://localhost:5060/path/to/nowhere',
            headers: {
              'Content-Type': 'text/html',
              'Accept': 'text/html'
            }
          }, (error, res, body) => {
            expect(res.statusCode).toBe(404);
            expect(html.toString()).toBe(body);
            done();
          });
        });
      });

      it('serves a 500.html', done => {
        fs.readFile(join(__dirname, '..', 'lib', 'public', 'default.html'), function (err, html) {
          request({
            url: 'http://localhost:5060/error',
            headers: {
              'Content-Type': 'text/html',
              'Accept': 'text/html'
            }
          }, (error, res, body) => {
            expect(res.statusCode).toBe(500);
            expect(html.toString()).toBe(body);
            done();
          });
        });
      });

      it('returns html when Content-Type header is set', done => {
        fs.readFile(join(__dirname, '..', 'lib', 'public', '404.html'), function (err, html) {
          request({
            url: 'http://localhost:5060/path/to/nowhere',
            headers: {
              'Content-Type': 'text/html'
            }
          }, (error, res, body) => {
            expect(res.statusCode).toBe(404);
            expect(html.toString()).toBe(body);
            done();
          });
        });
      });

      it('returns html when Accept header is set', done => {
        fs.readFile(join(__dirname, '..', 'lib', 'public', '404.html'), function (err, html) {
          request({
            url: 'http://localhost:5060/path/to/nowhere',
            headers: {
              'Accept': 'text/html'
            }
          }, (error, res, body) => {
            expect(res.statusCode).toBe(404);
            expect(html.toString()).toBe(body);
            done();
          });
        });
      });
    });

    describe('application/json format', () => {
      it('500', done => {
        request({
          url: 'http://localhost:5060/error',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          json: true
        }, (error, res, body) => {
          expect(res.statusCode).toBe(500);
          expect(body).toEqual({
            name: 'GeneralError',
            message: 'Something went wrong',
            code: 500,
            className: 'general-error',
            data: {},
            errors: {}
          });
          done();
        });
      });

      it('404', done => {
        request({
          url: 'http://localhost:5060/path/to/nowhere',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          json: true
        }, (error, res, body) => {
          expect(res.statusCode).toBe(404);
          expect(body).toEqual({ name: 'NotFound',
            message: 'File not found',
            code: 404,
            className: 'not-found',
            errors: {}
          });
          done();
        });
      });

      it('400', done => {
        request({
          url: 'http://localhost:5060/bad-request',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          json: true
        }, (error, res, body) => {
          expect(res.statusCode).toBe(400);
          expect(body).toEqual({ name: 'BadRequest',
            message: 'Invalid Password',
            code: 400,
            className: 'bad-request',
            data: {
              message: 'Invalid Password'
            },
            errors: [{
              path: 'password',
              value: null,
              message: `'password' cannot be 'null'`
            }]
          });
          done();
        });
      });

      it('returns JSON when only Content-Type header is set', done => {
        request({
          url: 'http://localhost:5060/bad-request',
          headers: {
            'Content-Type': 'application/json'
          },
          json: true
        }, (error, res, body) => {
          expect(res.statusCode).toBe(400);
          expect(body).toEqual({ name: 'BadRequest',
            message: 'Invalid Password',
            code: 400,
            className: 'bad-request',
            data: {
              message: 'Invalid Password'
            },
            errors: [{
              path: 'password',
              value: null,
              message: `'password' cannot be 'null'`
            }]
          });
          done();
        });
      });

      it('returns JSON when only Accept header is set', done => {
        request({
          url: 'http://localhost:5060/bad-request',
          headers: {
            'Accept': 'application/json'
          },
          json: true
        }, (error, res, body) => {
          expect(res.statusCode).toBe(400);
          expect(body).toEqual({ name: 'BadRequest',
            message: 'Invalid Password',
            code: 400,
            className: 'bad-request',
            data: {
              message: 'Invalid Password'
            },
            errors: [{
              path: 'password',
              value: null,
              message: `'password' cannot be 'null'`
            }]
          });
          done();
        });
      });
    });

    it('returns JSON by default', done => {
      request('http://localhost:5060/bad-request', (error, res, body) => {
        const expected = JSON.stringify({
          name: 'BadRequest',
          message: 'Invalid Password',
          code: 400,
          className: 'bad-request',
          data: {
            message: 'Invalid Password'
          },
          errors: [{
            path: 'password',
            value: null,
            message: `'password' cannot be 'null'`
          }]
        });

        expect(res.statusCode).toBe(400);
        expect(body).toEqual(expected);
        done();
      });
    });
  });
});
