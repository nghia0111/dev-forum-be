// paypal.config.ts
import * as paypal from 'paypal-rest-sdk';

paypal.configure({
  mode: 'sandbox', // or 'live' for production
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET_KEY,
});

export default paypal;
