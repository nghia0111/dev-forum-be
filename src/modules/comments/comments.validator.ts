import * as Joi from 'joi';
import { ValidationErrorMessages } from 'src/common/constants';

export const CommentValidator = Joi.object({
  description: Joi.string().required().messages({
    'any.required': ValidationErrorMessages.COMMENT_NOT_EMPTY,
    'string.empty': ValidationErrorMessages.COMMENT_NOT_EMPTY,
  }),
});
