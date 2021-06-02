/* eslint-disable no-unused-expressions */
const { hooks } = require('../lib');

describe('zeros Mongoose Hooks', () => {
  describe('toObject', () => {
    describe('options', () => {
      let toObject, hook;

      beforeEach(() => {
        toObject = jest.fn();
        hook = {
          result: { toObject }
        };
      });

      it('sets default options', () => {
        hooks.toObject()(hook);
        expect(toObject).toHaveBeenCalledWith({});
      });

      it('supports custom options', () => {
        const options = { zeros: 'awesome' };
        hooks.toObject(options)(hook);
        expect(toObject).toHaveBeenCalledWith(options);
      });
    });

    describe('when results are mongoose model(s)', () => {
      let user1, user2, users;

      beforeEach(() => {
        user1 = {
          name: 'Jerry',
          age: 23,
          toObject: jest.fn().mockReturnValue({ name: 'Jerry', age: 23 })
        };

        user2 = {
          name: 'Mary',
          age: 32,
          toObject: jest.fn().mockReturnValue({ name: 'Mary', age: 32 })
        };

        users = [user1, user2];
      });

      it('converts paginated arrays of mongoose models', () => {
        const hook = {
          result: { data: users }
        };

        hooks.toObject()(hook);
        
        expect(users[0].toObject).toHaveBeenCalledTimes(1);
        expect(users[1].toObject).toHaveBeenCalledTimes(1);
        expect(hook.result.data[0]).toEqual({ name: 'Jerry', age: 23 });
        expect(hook.result.data[1]).toEqual({ name: 'Mary', age: 32 });
      });

      it('converts a single mongoose model', () => {
        const hook = {
          result: users[0]
        };

        hooks.toObject()(hook);
        expect(users[0].toObject).toHaveBeenCalledTimes(1);
        expect(hook.result).toEqual({ name: 'Jerry', age: 23 });
      });

      it('converts non-paginated arrays of mongoose models', () => {
        const hook = {
          result: users
        };

        hooks.toObject()(hook);
        expect(users[0].toObject).toHaveBeenCalledTimes(1);
        expect(users[1].toObject).toHaveBeenCalledTimes(1);
        expect(hook.result[0]).toEqual({ name: 'Jerry', age: 23 });
        expect(hook.result[1]).toEqual({ name: 'Mary', age: 32 });
      });
    });

    describe('when results are plain object(s)', () => {
      let user1, user2, users;

      beforeEach(() => {
        user1 = {
          name: 'Jerry',
          age: 23
        };

        user2 = {
          name: 'Mary',
          age: 32
        };

        users = [user1, user2];
      });

      it('does not convert paginated arrays of objects', () => {
        const hook = {
          result: { data: users }
        };

        hooks.toObject()(hook);
        expect(hook.result.data[0]).toEqual(user1);
        expect(hook.result.data[1]).toEqual(user2);
      });

      it('does not convert non-paginated arrays of objects', () => {
        const hook = {
          result: users
        };

        hooks.toObject({}, null)(hook);
        expect(hook.result[0]).toEqual(user1);
        expect(hook.result[1]).toEqual(user2);
      });

      it('does not convert a single object', () => {
        const hook = {
          result: user1
        };

        hooks.toObject()(hook);
        expect(hook.result).toEqual(user1);
      });
    });
  });
});
