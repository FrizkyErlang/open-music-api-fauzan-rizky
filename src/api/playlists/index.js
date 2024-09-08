/* eslint-disable comma-dangle */
const PlaylistsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, { playlistService, songService, validator }) => {
    const playlistsHandler = new PlaylistsHandler(
      playlistService,
      songService,
      validator
    );
    server.route(routes(playlistsHandler));
  },
};
