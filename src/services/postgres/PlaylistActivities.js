/* eslint-disable no-underscore-dangle */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylistActivity(songId, playlistId, userId, action) {
    const id = `activity-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, songId, playlistId, userId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Activities gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getPlaylistActivities(playlistId) {
    const query = {
      text: 'SELECT * FROM playlist_song_activities WHERE playlist_id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist Activity tidak ditemukan');
    }

    return result.rows;
  }
}

module.exports = PlaylistActivitiesService;
