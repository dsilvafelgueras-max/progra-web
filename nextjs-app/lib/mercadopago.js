import { MercadoPagoConfig } from 'mercadopago';

export function getMpClient() {
  return new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });
}
