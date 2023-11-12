import * as Joi from 'joi';
import { ValidationErrorMessages } from 'src/common/constants';

export const CommentValidator = Joi.object({
  description: Joi.string().required().messages({
    'any.required': ValidationErrorMessages.DESCRIPTION_REQUIRE,
    'string.empty': ValidationErrorMessages.DESCRIPTION_REQUIRE,
  }),
});
