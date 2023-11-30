import { Injectable } from '@nestjs/common';
import * as SendGrid from '@sendgrid/mail';

@Injectable()
export class SendgridService {
  constructor() {
    SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async send(mail: SendGrid.MailDataRequired) {
    await SendGrid.send(mail);
  }
}
