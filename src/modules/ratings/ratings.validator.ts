import * as Joi from 'joi';
import { ValidationErrorMessages } from 'src/common/constants';

export const RatingValidator = Joi.object({
  description: Joi.string().required().messages({
    'any.required': ValidationErrorMessages.DESCRIPTION_REQUIRE,
    'string.empty': ValidationErrorMessages.DESCRIPTION_REQUIRE,
  }),
  score: Joi.number().integer().min(1).max(5).messages({
    'number.min': ValidationErrorMessages.SCORE_INVALID,
    'number.max': ValidationErrorMessages.SCORE_INVALID,
    'number.integer': ValidationErrorMessages.SCORE_INVALID,
  }),
});
