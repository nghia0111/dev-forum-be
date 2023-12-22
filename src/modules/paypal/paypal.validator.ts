import * as Joi from 'joi';
import { ValidationErrorMessages } from 'src/common/constants';

export const DepositValidator = Joi.object({
  amount: Joi.number().integer().min(1).messages({
    'number.integer': ValidationErrorMessages.AMOUNT_INVALID,
    'number.min': ValidationErrorMessages.AMOUNT_MIN,
  }),
});
