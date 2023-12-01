import * as Joi from 'joi';
import { TopicTypes, ValidationErrorMessages } from 'src/common/constants';

export const PostValidator = Joi.object({
  title: Joi.string().required().messages({
    'any.required': ValidationErrorMessages.TITLE_REQUIRE,
    'string.empty': ValidationErrorMessages.TITLE_REQUIRE,
  }),
  description: Joi.string().required().messages({
    'any.required': ValidationErrorMessages.DESCRIPTION_REQUIRE,
    'string.empty': ValidationErrorMessages.DESCRIPTION_REQUIRE,
  }),
  topic: Joi.string()
    .valid(TopicTypes.BUG, TopicTypes.DISCUSS, TopicTypes.NEWS)
    .required()
    .messages({
      'any.only': ValidationErrorMessages.TOPIC_INVALID,
      'any.required': ValidationErrorMessages.DESCRIPTION_REQUIRE,
      'string.empty': ValidationErrorMessages.DESCRIPTION_REQUIRE,
    }),
  bounty: Joi.when('topic', {
    is: TopicTypes.BUG,
    then: Joi.number().integer().min(10000).optional().messages({
      'number.integer': ValidationErrorMessages.BOUNTY_INVALID,
      'number.min': ValidationErrorMessages.BOUNTY_MIN,
    }),
    otherwise: Joi.forbidden(),
  }),
  tags: Joi.array().min(1).required().messages({
    'array.min': ValidationErrorMessages.TAG_REQUIRE,
    'any.required': ValidationErrorMessages.TAG_REQUIRE,
  }),
}).error((errors) => {
  const forbiddenError = errors.find(
    (err) => err.code === 'any.unknown',
  );
  if (forbiddenError) {
    forbiddenError.message = ValidationErrorMessages.BOUNTY_NOT_ACCEPTABLE;
  }
  return errors;
});
