/* eslint-disable comma-dangle */
const LikesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, { likeService, albumService }) => {
    const albumsHandler = new LikesHandler(likeService, albumService);
    server.route(routes(albumsHandler));
  },
};
