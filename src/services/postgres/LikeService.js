/* eslint-disable comma-dangle */
/* eslint-disable no-underscore-dangle */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class LikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addLike({ userId, albumId }) {
    const id = `like-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal disukai');
    }

    await this._cacheService.delete(`likes:${albumId}`);
  }

  async checkLike({ userId, albumId }) {
    const queryAlbum = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };
    const result = await this._pool.query(queryAlbum);

    if (result.rows.length > 0) {
      throw new InvariantError('Album sudah disukai');
    }
  }

  async countLikes(albumId) {
    try {
      // mendapatkan catatan dari cache
      const result = await this._cacheService.get(`likes:${albumId}`);
      return {
        isCache: true,
        result: JSON.parse(result).likes,
      };
    } catch (error) {
      const queryAlbum = {
        text: `SELECT count(*) as likes
        FROM user_album_likes 
        WHERE album_id = $1`,
        values: [albumId],
      };

      const result = await this._pool.query(queryAlbum);

      // catatan akan disimpan pada cache sebelum fungsi countLike dikembalikan
      await this._cacheService.set(
        `likes:${albumId}`,
        JSON.stringify(result.rows[0])
      );

      return {
        isCache: false,
        result: result.rows[0].likes,
      };
    }
  }

  async deleteLike({ userId, albumId }) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }

    await this._cacheService.delete(`likes:${albumId}`);
  }
}

module.exports = LikesService;
