const InvariantError = require('../../exceptions/InvariantError');
const { SongsPayloadSchema } = require('./schema');

const SongsValidator = {
  validateSongPayload: (payload) => {
    console.log(payload);
    const validationResult = SongsPayloadSchema.validate(payload);
    console.log(validationResult);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = SongsValidator;
