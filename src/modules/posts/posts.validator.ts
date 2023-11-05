import * as Joi from 'joi';
import { ValidationErrorMessages } from 'src/common/constants';

export const PostValidator = Joi.object({
  title: Joi.string().required().messages({
    'any.required': ValidationErrorMessages.TITLE_REQUIRE,
    'string.empty': ValidationErrorMessages.TITLE_REQUIRE,
  }),
  description: Joi.string().required().messages({
    'any.required': ValidationErrorMessages.DESCRIPTION_REQUIRE,
    'string.empty': ValidationErrorMessages.DESCRIPTION_REQUIRE,
  }),
  bounty: Joi.number().integer().min(10000).optional().messages({
    'number.integer': ValidationErrorMessages.BOUNTY_INVALID,
    'number.min': ValidationErrorMessages.BOUNTY_MIN,
  }),
  topic: Joi.string().required().messages({
    'any.required': ValidationErrorMessages.DESCRIPTION_REQUIRE,
    'string.empty': ValidationErrorMessages.DESCRIPTION_REQUIRE,
  }),
  tags: Joi.array().min(1).required().messages({
    'array.min': ValidationErrorMessages.TAG_REQUIRE,
    'any.required': ValidationErrorMessages.TAG_REQUIRE,
  }),
});
