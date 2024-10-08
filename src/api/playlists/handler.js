/* eslint-disable operator-linebreak */
/* eslint-disable no-underscore-dangle */
const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(playlistService, songService, validator) {
    this._servicePlaylist = playlistService;
    this._serviceSong = songService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistsPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._servicePlaylist.addPlaylist({
      name,
      owner: credentialId,
    });

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { result: playlists, isCache } =
      await this._servicePlaylist.getPlaylists(credentialId);

    const response = h.response({
      status: 'success',
      data: {
        playlists,
      },
    });
    if (isCache) {
      response.header('X-Data-Source', 'cache');
    }

    return response;
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._servicePlaylist.verifyPlaylistOwner(id, credentialId);
    await this._servicePlaylist.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postPlaylistSongHandler(request, h) {
    const { id } = request.params;
    this._validator.validatePostPlaylistSongsPayload(request.payload);
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    const action = 'add';

    await this._servicePlaylist.verifyPlaylistAccess(id, credentialId);
    await this._serviceSong.getSongById(songId);
    await this._servicePlaylist.addPlaylistSong({
      songId,
      playlistId: id,
    });
    await this._servicePlaylist.addPlaylistActivity({
      songId,
      playlistId: id,
      userId: credentialId,
      action,
    });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._servicePlaylist.verifyPlaylistAccess(id, credentialId);
    const playlist = await this._servicePlaylist.getPlaylistById(id);
    const songs = await this._servicePlaylist.getPlaylistSongById(id);
    playlist.songs = songs;

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deletePlaylistSongByIdAndSongIdHandler(request) {
    const { id } = request.params;
    this._validator.validatePostPlaylistSongsPayload(request.payload);
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    const action = 'delete';

    await this._servicePlaylist.verifyPlaylistAccess(id, credentialId);
    await this._serviceSong.getSongById(songId);
    await this._servicePlaylist.deletePlaylistSongByIdAndSongId({ id, songId });
    await this._servicePlaylist.addPlaylistActivity({
      songId,
      playlistId: id,
      userId: credentialId,
      action,
    });

    return {
      status: 'success',
      message: 'Lagu berhasil berhasil dihapus dari playlist',
    };
  }

  async getPlaylistActivitiesByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._servicePlaylist.verifyPlaylistAccess(id, credentialId);
    await this._servicePlaylist.getPlaylistById(id);
    const activities = await this._servicePlaylist.getPlaylistActivities(id);

    return {
      status: 'success',
      data: {
        playlistId: id,
        activities,
      },
    };
  }
}

module.exports = PlaylistsHandler;
