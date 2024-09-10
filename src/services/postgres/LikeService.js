/* eslint-disable no-underscore-dangle */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class LikesService {
  constructor() {
    this._pool = new Pool();
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

  async countLike(albumId) {
    const queryAlbum = {
      text: `SELECT count(*) as likes
      FROM user_album_likes 
      WHERE album_id = $2`,
      values: [albumId],
    };

    const result = await this._pool.query(queryAlbum);

    return result.rows[0];
  }

  async deleteLike({ userId, albumId }) {
    const query = {
      text: 'DELETE FROM albums WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = LikesService;
