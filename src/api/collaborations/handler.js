/* eslint-disable comma-dangle */
/* eslint-disable no-underscore-dangle */
const autoBind = require('auto-bind');

class CollaborationsHandler {
  constructor(collaborationsService, playlistService, validator) {
    this._serviceCollaborations = collaborationsService;
    this._servicePlaylist = playlistService;
    this._validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this._servicePlaylist.verifyPlaylistOwner(playlistId, credentialId);
    const collaborationId = await this._serviceCollaborations.addCollaboration(
      playlistId,
      userId
    );

    const response = h.response({
      status: 'success',
      message: 'Kolaborasi berhasil ditambahkan',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request) {
    this._validator.validateCollaborationPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this._servicePlaylist.verifyPlaylistOwner(playlistId, credentialId);
    await this._serviceCollaborations.deleteCollaboration(playlistId, userId);

    return {
      status: 'success',
      message: 'Kolaborasi berhasil dihapus',
    };
  }
}

module.exports = CollaborationsHandler;
