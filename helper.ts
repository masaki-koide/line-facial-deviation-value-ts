import * as crypto from 'crypto'

export const isValidSignature = (signature: string, body: any) => {
  return (
    signature ===
    crypto
      .createHmac('SHA256', process.env.lineChannelSecret)
      .update(Buffer.from(JSON.stringify(body)))
      .digest('base64')
  )
}
