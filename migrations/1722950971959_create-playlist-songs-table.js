/* eslint-disable comma-dangle */
/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('playlist_songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    song_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  pgm.createIndex('playlist_songs', 'song_id');

  pgm.createIndex('playlist_songs', 'playlist_id');

  pgm.addConstraint(
    'playlist_songs',
    'fk_playlist_songs.song_id_albums.id',
    'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE'
  );

  pgm.addConstraint(
    'playlist_songs',
    'fk_playlist_songs.playlist_id_albums.id',
    'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE'
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropConstraint(
    'playlist_songs',
    'fk_playlist_songs.playlist_id_albums.id'
  );

  pgm.dropConstraint('playlist_songs', 'fk_playlist_songs.song_id_albums.id');

  pgm.dropIndex('playlist_songs', 'playlist_id');

  pgm.dropIndex('playlist_songs', 'song_id');

  pgm.dropTable('playlist_songs');
};
