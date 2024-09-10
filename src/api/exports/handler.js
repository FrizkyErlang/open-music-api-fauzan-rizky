/* eslint-disable comma-dangle */
/* eslint-disable no-underscore-dangle */
const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(exportsService, playlistsService, validator) {
    this._serviceExports = exportsService;
    this._servicePlaylist = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postExportPlaylistsHandler(request, h) {
    this._validator.validateExportPlaylistPayload(request.payload);
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._servicePlaylist.verifyPlaylistOwner(id, credentialId);
    await this._servicePlaylist.getPlaylistById(id);

    const message = {
      playlistId: id,
      targetEmail: request.payload.targetEmail,
    };

    await this._serviceExports.sendMessage(
      'export:playlists',
      JSON.stringify(message)
    );

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
