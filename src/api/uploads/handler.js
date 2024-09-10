/* eslint-disable no-underscore-dangle */
const autoBind = require('auto-bind');

class UploadsHandler {
  constructor(uploadsService, albumService, validator) {
    this._serviceUploads = uploadsService;
    this._serviceAlbum = albumService;
    this._validator = validator;

    autoBind(this);
  }

  async postUploadImageHandler(request, h) {
    const { id } = request.params;
    const { data } = request.payload;
    this._validator.validateImageHeaders(data.hapi.headers);

    const filename = await this._serviceUploads.writeFile(data, data.hapi);
    const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/covers/${filename}`;
    await this._serviceAlbum.editAlbumCoverById(id, coverUrl);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
