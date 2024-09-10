/* eslint-disable comma-dangle */
/* eslint-disable no-underscore-dangle */
const autoBind = require('auto-bind');

class LikesHandler {
  constructor(likeService, albumService) {
    this._serviceLike = likeService;
    this._serviceAlbum = albumService;

    autoBind(this); // mem-bind nilai this untuk seluruh method sekaligus
  }

  async postLikeHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._serviceAlbum.getAlbumById(albumId);
    await this._serviceLike.checkLike({ userId, albumId });
    await this._serviceLike.addLike({ userId, albumId });

    const response = h.response({
      status: 'success',
      message: 'Album berhasil disukai',
    });
    response.code(201);
    return response;
  }

  async deleteLikeHandler(request) {
    const { id: userId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._serviceLike.deleteLike({ userId, albumId });

    return {
      status: 'success',
      message: 'Album berhasil batal disukai',
    };
  }

  async getLikesCount(request, h) {
    const { id: albumId } = request.params;

    const { result: likes, isCache } = await this._serviceLike.countLikes(
      albumId
    );
    const response = h.response({
      status: 'success',
      data: {
        // eslint-disable-next-line radix
        likes: parseInt(likes),
      },
    });
    if (isCache) {
      response.header('X-Data-Source', 'cache');
    }

    return response;
  }
}

module.exports = LikesHandler;
