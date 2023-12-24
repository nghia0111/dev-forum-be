import * as Joi from 'joi';
import { ValidationErrorMessages } from 'src/common/constants';

export const DepositValidator = Joi.object({
  amount: Joi.number().min(1).messages({
    'number.min': ValidationErrorMessages.AMOUNT_MIN,
  }),
});

export const WithdrawValidator = Joi.object({
  paypalEmail: Joi.string()
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
  amount: Joi.number().min(1).messages({
    'number.min': ValidationErrorMessages.AMOUNT_MIN,
  }),
});
