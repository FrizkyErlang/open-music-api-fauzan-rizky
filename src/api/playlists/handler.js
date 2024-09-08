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

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlist = await this._servicePlaylist.getPlaylists(credentialId);
    return {
      status: 'success',
      data: {
        playlist,
      },
    };
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
      id,
    });
    await this._servicePlaylist.addPlaylistActivity({
      songId,
      id,
      credentialId,
      action,
    });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._servicePlaylist.verifyPlaylistAccess(id, credentialId);
    const playlists = await this._servicePlaylist.getPlaylistById(id);
    const songs = await this._servicePlaylist.getPlaylistSongById(id);
    playlists.songs = songs;

    return {
      status: 'success',
      data: {
        playlists,
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
      id,
      credentialId,
      action,
    });

    return {
      status: 'success',
      message: 'Lagu berhasil berhasil dihapus dari playlist',
    };
  }
}

module.exports = PlaylistsHandler;
