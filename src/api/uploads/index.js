/* eslint-disable comma-dangle */
const UploadsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'uploads',
  version: '1.0.0',
  register: async (server, { uploadsService, albumService, validator }) => {
    const uploadsHandler = new UploadsHandler(
      uploadsService,
      albumService,
      validator
    );
    server.route(routes(uploadsHandler));
  },
};
