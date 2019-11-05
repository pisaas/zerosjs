module.exports = function (zeros) {
  return {
    initialize: function (next) {
      if(typeof zeros.channel !== 'function') {
        // If no real-time functionality has been configured just return
        return next();
      }

      zeros.on('connection', connection => {
        // On a new real-time connection, add it to the anonymous channel
        zeros.channel('anonymous').join(connection);
      });

      zeros.on('login', (authResult, { connection }) => {
        // connection can be undefined if there is no
        // real-time connection, e.g. when logging in via REST
        if(connection) {
          // Obtain the logged in user from the connection
          // const user = connection.user;
          
          // The connection is no longer anonymous, remove it
          zeros.channel('anonymous').leave(connection);
    
          // Add it to the authenticated user channel
          zeros.channel('authenticated').join(connection);
    
          // Channels can be named anything and joined on any condition 
          
          // E.g. to send real-time events only to admins use
          // if(user.isAdmin) { zeros.channel('admins').join(connection); }
    
          // If the user has joined e.g. chat rooms
          // if(Array.isArray(user.rooms)) user.rooms.forEach(room => zeros.channel(`rooms/${room.id}`).join(channel));
          
          // Easily organize users by email and userid for things like messaging
          // zeros.channel(`emails/${user.email}`).join(channel);
          // zeros.channel(`userIds/$(user.id}`).join(channel);
        }
      });
    
      // eslint-disable-next-line no-unused-vars
      zeros.publish((data, hook) => {
        // Here you can add event publishers to channels set up in `channels.js`
        // To publish only for a specific event use `zeros.publish(eventname, () => {})`
    
        console.log('Publishing all events to all authenticated users. See `channels.js` and https://docs.feathersjs.com/api/channels.html for more information.'); // eslint-disable-line
    
        // e.g. to publish all service events to all authenticated users use
        return zeros.channel('authenticated');
      });
    
      // Here you can also add service specific event publishers
      // e.g. the publish the `users` service `created` event to the `admins` channel
      // zeros.service('users').publish('created', () => zeros.channel('admins'));
      
      // With the userid and email organization from above you can easily select involved users
      // zeros.service('messages').publish(() => {
      //   return [
      //     zeros.channel(`userIds/${data.createdBy}`),
      //     zeros.channel(`emails/${data.recipientEmail}`)
      //   ];
      // });

      return next();
    }
  };
};
