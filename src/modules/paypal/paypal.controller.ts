import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req
} from '@nestjs/common';
import { Request } from 'express';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { PaypalService } from './paypal.service';
import { DepositValidator, WithdrawValidator } from './paypal.validator';

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

  @Get('withdraws')
  getWithdrawRequests(@Req() req: Request) {
    return this.paypalService.getWithdrawRequests(req.user);
  }

  @Get('transactions')
  getTransactions(@Req() req: Request) {
    return this.paypalService.getTransactions(req.user);
  }

  @Put('withdraws/:withdrawId/accept')
  acceptWithdraw(@Param('withdrawId') withdrawId: string, @Req() req: Request) {
    return this.paypalService.acceptWithdrawRequest(withdrawId, req.user);
  }

  @Put('withdraws/:withdrawId/cancel')
  cancelWithdraw(@Param('withdrawId') withdrawId: string, @Req() req: Request) {
    return this.paypalService.cancelWithdrawRequest(withdrawId, req.user);
  }

  @Post('request-withdraw')
  createWithdraw(@Body() withdrawDto: WithdrawDto, @Req() req: Request) {
    const schema = WithdrawValidator;
    const validateResult = schema.validate(withdrawDto);
    if (validateResult.error)
      throw new BadRequestException(validateResult.error.message);
    return this.paypalService.createWithdraw(withdrawDto, req.user);
  }
}
