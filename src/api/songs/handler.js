/* eslint-disable operator-linebreak */
/* eslint-disable no-underscore-dangle */
const autoBind = require('auto-bind');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this); // mem-bind nilai this untuk seluruh method sekaligus
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const { title, year, genre, performer, duration, albumID } =
      request.payload;

    const albumId = await this._service.addSong({
      title,
      year,
      genre,
      performer,
      duration,
      albumID,
    });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getSongsHandler() {
    const albums = await this._service.getSongs();
    return {
      status: 'success',
      data: {
        albums,
      },
    };
  }

  async getSongByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getSongById(id);
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putSongByIdHandler(request) {
    this._validator.validateSongPayload(request.payload);
    const { title, year, genre, performer, duration, albumID } =
      request.payload;
    const { id } = request.params;

    await this._service.editSongById(id, {
      title,
      year,
      genre,
      performer,
      duration,
      albumID,
    });

    return {
      status: 'success',
      message: 'Lagu berhasil diperbarui',
    };
  }

  async deleteSongByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteSongById(id);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };
  }
}

module.exports = SongsHandler;
