import {
    BadRequestException,
    Body,
    Controller,
    Post,
    Req
} from '@nestjs/common';
import { Request } from 'express';
import { DepositDto } from './dto/deposit.dto';
import { PaypalService } from './paypal.service';
import { DepositValidator, WithdrawValidator } from './paypal.validator';
import { WithdrawDto } from './dto/withdraw.dto';

@Controller('paypal')
export class PaypalController {
  constructor(private readonly paypalService: PaypalService) {}

  @Post('deposit')
  deposit(@Body() depositDto: DepositDto, @Req() req: Request) {
    const schema = DepositValidator;
    const validateResult = schema.validate(depositDto);
    if (validateResult.error)
      throw new BadRequestException(validateResult.error.message);
    return this.paypalService.deposit(depositDto, req.user);
  }

  @Post('withdraw')
  withdraw(@Body() withdrawDto: WithdrawDto, @Req() req: Request) {
    const schema = WithdrawValidator;
    const validateResult = schema.validate(withdrawDto);
    if (validateResult.error)
      throw new BadRequestException(validateResult.error.message);
    return this.paypalService.acceptWithdrawRequest(withdrawDto, req.user);
  }
}
