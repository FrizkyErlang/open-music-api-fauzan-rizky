/* eslint-disable comma-dangle */
const AlbumHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, { albumService, songService, validator }) => {
    const albumsHandler = new AlbumHandler(
      albumService,
      songService,
      validator
    );
    server.route(routes(albumsHandler));
  },
};
