/* eslint-disable comma-dangle */
/* eslint-disable camelcase */
/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable('colaborations', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  pgm.createIndex('colaborations', 'user_id');

  pgm.createIndex('colaborations', 'playlist_id');

  pgm.addConstraint(
    'colaborations',
    'fk_colaborations.user_id_users.id',
    'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE'
  );

  pgm.addConstraint(
    'colaborations',
    'fk_colaborations.playlist_id_albums.id',
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
    'colaborations',
    'fk_colaborations.playlist_id_playlists.id'
  );

  pgm.dropConstraint('colaborations', 'fk_colaborations.user_id_users.id');

  pgm.dropIndex('colaborations', 'playlist_id');

  pgm.dropIndex('colaborations', 'user_id');

  pgm.dropTable('colaborations');
};
