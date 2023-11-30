import * as Joi from 'joi';
import { ValidationErrorMessages } from 'src/common/constants';

export const SignUpValidator = Joi.object({
  displayName: Joi.string().min(3).max(30).required().messages({
    'string.min': ValidationErrorMessages.DISPLAY_NAME_LENGTH,
    'string.max': ValidationErrorMessages.DISPLAY_NAME_LENGTH,
    'any.required': ValidationErrorMessages.DISPLAY_NAME_REQUIRE,
    'string.empty': ValidationErrorMessages.DISPLAY_NAME_REQUIRE,
  }),
  password: Joi.string()
    .pattern(new RegExp('^[a-zA-Z0-9]{8,32}$'))
    .required()
    .messages({
      'string.pattern.base': ValidationErrorMessages.PASSWORD_PATTERN,
      'any.required': ValidationErrorMessages.PASSWORD_REQUIRE,
      'string.empty': ValidationErrorMessages.PASSWORD_REQUIRE,
    }),
  confirmPassword: Joi.any().equal(Joi.ref('password')).required().messages({
    'any.only': ValidationErrorMessages.CONFIRMPASSWORD_INVALID,
  }),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net', 'vn'] },
    })
    .required()
    .messages({
      'string.email': ValidationErrorMessages.EMAIL_INVALID,
      'any.required': ValidationErrorMessages.EMAIL_REQUIRE,
      'string.empty': ValidationErrorMessages.EMAIL_REQUIRE,
    }),
});

export const ChangePasswordValidator = Joi.object({
  newPassword: Joi.string()
    .pattern(new RegExp('^[a-zA-Z0-9]{8,32}$'))
    .required()
    .messages({
      'string.pattern.base': ValidationErrorMessages.PASSWORD_PATTERN,
      'any.required': ValidationErrorMessages.PASSWORD_REQUIRE,
      'string.empty': ValidationErrorMessages.PASSWORD_REQUIRE,
    }),
  confirmNewPassword: Joi.any().equal(Joi.ref('newPassword')).required().messages({
    'any.only': ValidationErrorMessages.CONFIRMPASSWORD_INVALID,
  }),
});

export const UpdateProfileValidator = Joi.object({
  displayName: Joi.string().min(3).max(30).required().messages({
    'string.min': ValidationErrorMessages.DISPLAY_NAME_LENGTH,
    'string.max': ValidationErrorMessages.DISPLAY_NAME_LENGTH,
    'any.required': ValidationErrorMessages.DISPLAY_NAME_REQUIRE,
    'string.empty': ValidationErrorMessages.DISPLAY_NAME_REQUIRE,
  }),
});