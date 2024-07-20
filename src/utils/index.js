/* eslint-disable camelcase */
const mapDBSongToModel = ({
  id,
  title,
  year,
  performer,
  durations,
  album_id,
}) => ({
  id,
  title,
  year,
  performer,
  durations,
  albumId: album_id,
});

module.exports = { mapDBSongToModel };
