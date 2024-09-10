/* eslint-disable comma-dangle */
/* eslint-disable no-underscore-dangle */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationService, cacheService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
    this._cacheService = cacheService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    await this._cacheService.delete(`playlists:${owner}`);

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    try {
      // mendapatkan playlist dari cache
      const result = await this._cacheService.get(`playlists:${owner}`);
      return {
        isCache: true,
        result: JSON.parse(result),
      };
    } catch (error) {
      const query = {
        text: `SELECT playlists.id, playlists.name, users.username 
        FROM playlists
        LEFT JOIN users ON users.id = playlists.owner
        LEFT JOIN colaborations ON playlists.id = colaborations.playlist_id
        WHERE playlists.owner = $1 OR colaborations.user_id = $1
        GROUP BY playlists.id, playlists.name, users.username`,
        values: [owner],
      };
      const result = await this._pool.query(query);
      // jumlah like akan disimpan pada cache sebelum fungsi countLike dikembalikan
      await this._cacheService.set(
        `playlists:${owner}`,
        JSON.stringify(result.rows)
      );
      return {
        isCache: false,
        result: result.rows,
      };
    }
  }

  async getPlaylistById(id) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username
      FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      WHERE playlists.id = $1`,
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return result.rows[0];
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id, owner',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }

    const { owner } = result.rows[0];
    await this._cacheService.delete(`playlists:${owner}`);
  }

  async addPlaylistSong({ songId, playlistId }) {
    const id = `playlist-song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, songId, playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }

    return result.rows[0].id;
  }

  async getPlaylistSongById(id) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer
      FROM playlist_songs
      LEFT JOIN songs on playlist_songs.song_id = songs.id
      WHERE playlist_id = $1`,
      values: [id],
    };
    const result = await this._pool.query(query);

    return result.rows;
  }

  async deletePlaylistSongByIdAndSongId({ id, songId }) {
    const query = {
      text: `DELETE FROM playlist_songs 
      WHERE playlist_id = $1 and song_id = $2 
      RETURNING id`,
      values: [id, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus dari Playlist');
    }
  }

  async addPlaylistActivity({ songId, playlistId, userId, action }) {
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
  }

  async getPlaylistActivities(playlistId) {
    const query = {
      text: `SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time
      FROM playlist_song_activities
      LEFT JOIN songs ON playlist_song_activities.song_id = songs.id
      LEFT JOIN users ON playlist_song_activities.user_id = users.id
      WHERE playlist_id = $1
      ORDER BY playlist_song_activities.time`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist Activity tidak ditemukan');
    }

    return result.rows;
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;
