const { hooks } = require('../lib');

describe('hook utilities', () => {
  describe('.makeArguments', () => {
    it('basic functionality', () => {
      let args = hooks.makeArguments({
        id: 2,
        data: { my: 'data' },
        params: { some: 'thing' },
        method: 'update'
      });

      expect(args).toEqual([2, { my: 'data' }, { some: 'thing' }]);

      args = hooks.makeArguments({
        id: 0,
        data: { my: 'data' },
        params: { some: 'thing' },
        method: 'update'
      });

      expect(args).toEqual([0, { my: 'data' }, { some: 'thing' }]);

      args = hooks.makeArguments({
        params: { some: 'thing' },
        method: 'find'
      });

      expect(args).toEqual([
        { some: 'thing' }
      ]);
    });

    it('uses .defaultMakeArguments', () => {
      let args = hooks.makeArguments({
        params: { some: 'thing' },
        method: 'something',
        data: { test: 'me' }
      });

      expect(args).toEqual([
        { test: 'me' },
        { some: 'thing' }
      ]);

      args = hooks.makeArguments({
        id: 'testing',
        method: 'something'
      });

      expect(args).toEqual([
        'testing', {}
      ]);
    });

    it('.makeArguments makes correct argument list for known methods', () => {
      let args = hooks.makeArguments({
        data: { my: 'data' },
        params: { some: 'thing' },
        method: 'update'
      });

      expect(args).toEqual([undefined, { my: 'data' }, { some: 'thing' }]);

      args = hooks.makeArguments({
        id: 2,
        data: { my: 'data' },
        params: { some: 'thing' },
        method: 'remove'
      });

      expect(args).toEqual([2, { some: 'thing' }]);

      args = hooks.makeArguments({
        id: 2,
        data: { my: 'data' },
        params: { some: 'thing' },
        method: 'create'
      });

      expect(args).toEqual([{ my: 'data' }, { some: 'thing' }]);
    });
  });

  describe('.convertHookData', () => {
    it('converts existing', () => {
      expect(hooks.convertHookData('test')).toEqual({
        all: [ 'test' ]
      });
    });

    it('converts to `all`', () => {
      expect(hooks.convertHookData([ 'test', 'me' ])).toEqual({
        all: [ 'test', 'me' ]
      });
    });

    it('converts all properties into arrays', () => {
      expect(hooks.convertHookData({
        all: 'thing',
        other: 'value',
        hi: [ 'foo', 'bar' ]
      }))
        .toEqual({
          all: [ 'thing' ],
          other: [ 'value' ],
          hi: [ 'foo', 'bar' ]
        });
    });
  });

  describe('.isHookObject', () => {
    it('with a valid hook object', () => {
      expect(hooks.isHookObject({
        type: 'before',
        method: 'here'
      })).toBe(true);
    });

    it('with an invalid hook object', () => {
      expect(hooks.isHookObject({
        type: 'before'
      })).toBe(false);
    });
  });

  describe('.createHookObject', () => {
    const service = {};
    const app = {
      services: {
        testing: service
      }
    };
    const hookData = { app, service };

    it('.toJSON', () => {
      const hookObject = hooks.createHookObject('find', hookData);

      expect(hookObject.toJSON()).toEqual({
        method: 'find',
        path: 'testing'
      });

      expect(JSON.stringify(hookObject)).toBe(JSON.stringify({
        method: 'find',
        path: 'testing'
      }));
    });

    it('for find', () => {
      let hookObject = hooks.createHookObject('find', hookData);

      expect(hookObject).toEqual({
        method: 'find',
        app,
        service,
        path: 'testing'
      });

      hookObject = hooks.createHookObject('find');

      expect(hookObject).toEqual({
        method: 'find',
        path: null
      });

      hookObject = hooks.createHookObject('find', hookData);

      expect(hookObject).toEqual({
        method: 'find',
        app,
        service,
        path: 'testing'
      });
    });

    it('for get', () => {
      let hookObject = hooks.createHookObject('get', hookData);

      expect(hookObject).toEqual({
        method: 'get',
        app,
        service,
        path: 'testing'
      });

      hookObject = hooks.createHookObject('get', hookData);

      expect(hookObject).toEqual({
        method: 'get',
        app,
        service,
        path: 'testing'
      });
    });

    it('for remove', () => {
      let hookObject = hooks.createHookObject('remove', hookData);

      expect(hookObject).toEqual({
        method: 'remove',
        app,
        service,
        path: 'testing'
      });

      hookObject = hooks.createHookObject('remove', hookData);

      expect(hookObject).toEqual({
        method: 'remove',
        app,
        service,
        path: 'testing'
      });
    });

    it('for create', () => {
      const hookObject = hooks.createHookObject('create', hookData);

      expect(hookObject).toEqual({
        method: 'create',
        app,
        service,
        path: 'testing'
      });
    });

    it('for update', () => {
      const hookObject = hooks.createHookObject('update', hookData);

      expect(hookObject).toEqual({
        method: 'update',
        app,
        service,
        path: 'testing'
      });
    });

    it('for patch', () => {
      const hookObject = hooks.createHookObject('patch', hookData);

      expect(hookObject).toEqual({
        method: 'patch',
        app,
        service,
        path: 'testing'
      });
    });

    it('for custom method', () => {
      const hookObject = hooks.createHookObject('custom', hookData);

      expect(hookObject).toEqual({
        method: 'custom',
        app,
        service,
        path: 'testing'
      });
    });
  });

  describe('.processHooks', () => {
    it('runs through a hook chain with various formats', () => {
      const dummyHook = {
        type: 'dummy',
        method: 'something'
      };

      const promise = hooks.processHooks([
        function (hook) {
          hook.chain = [ 'first' ];

          return Promise.resolve(hook);
        },

        (hook) => {
          hook.chain.push('second');
        },

        function (hook) {
          hook.chain.push('third');

          return hook;
        }
      ], dummyHook);

      return promise.then((result) => {
        expect(result).toEqual({
          type: 'dummy',
          method: 'something',
          chain: [ 'first', 'second', 'third' ]
        });
      });
    });

    it('errors when invalid hook object is returned', () => {
      const dummyHook = {
        type: 'dummy',
        method: 'something'
      };

      const promise = hooks.processHooks([
        function () {
          return {};
        }
      ], dummyHook);

      return promise.catch((e) => {
        expect(e.message).toBe(`dummy hook for 'something' method returned invalid hook object`);
        expect(typeof e.hook).toBe('object');
      });
    });
  });

  describe('.enableHooks', () => {
    it('with custom types', () => {
      const base = {};

      hooks.enableHooks(base, [], ['test']);

      expect(typeof base.__hooks).toBe('object');
      expect(typeof base.__hooks.test).toBe('object');
      expect(typeof base.__hooks.before).toBe('undefined');
    });

    it('does nothing when .hooks method exists', () => {
      const base = {
        hooks () {}
      };

      hooks.enableHooks(base, [], ['test']);
      expect(typeof base.__hooks).toBe('undefined');
    });

    describe('.hooks method', () => {
      let base = {};

      beforeEach(() => {
        base = hooks.enableHooks({}, [ 'testMethod' ], [ 'dummy' ]);
      });

      it('registers hook with custom type and `all` method', () => {
        expect(typeof base.hooks).toBe('function');

        const fn = function () {};

        base.hooks({ dummy: fn });

        expect(base.__hooks.dummy.testMethod).toEqual([ fn ]);
      });

      it('registers hook with custom type and specific method', () => {
        base.hooks({
          dummy: {
            testMethod () {}
          }
        });

        expect(base.__hooks.dummy.testMethod.length).toBe(1);
      });

      it('throws an error when registering invalid hook type', () => {
        try {
          base.hooks({ wrong () {} });
          throw new Error('Should never get here');
        } catch (e) {
          expect(e.message).toBe(`'wrong' is not a valid hook type`);
        }
      });

      it('throws an error when registering invalid method', () => {
        try {
          base.hooks({ dummy: {
            wrongMethod () {}
          } });
          throw new Error('Should never get here');
        } catch (e) {
          expect(e.message).toBe(`'wrongMethod' is not a valid hook method`);
        }
      });
    });
  });

  describe('.getHooks', () => {
    const app = hooks.enableHooks({}, [ 'testMethod' ], [ 'dummy' ]);
    const service = hooks.enableHooks({}, [ 'testMethod' ], [ 'dummy' ]);
    const appHook = function () {};
    const serviceHook = function () {};

    app.hooks({
      dummy: appHook
    });

    service.hooks({
      dummy: serviceHook
    });

    it('combines app and service hooks', () => {
      expect(hooks.getHooks(app, service, 'dummy', 'testMethod'))
        .toEqual([ appHook, serviceHook ]);
    });

    it('combines app and service hooks with appLast', () => {
      expect(hooks.getHooks(app, service, 'dummy', 'testMethod', true))
        .toEqual([ serviceHook, appHook ]);
    });
  });
});
