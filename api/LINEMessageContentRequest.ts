import { OptionsWithUri, RequestPromiseOptions } from 'request-promise-native'
import APIRequest from './APIRequest'

export default class LINEMessageContentRequest extends APIRequest<string> {
  protected baseOptions: RequestPromiseOptions = {
    auth: {
      bearer: process.env.lineBearer
    },
    // データをバイナリで取得する
    encoding: null
  }

  private messageId: string

  constructor(messageId: string) {
    super()
    this.messageId = messageId
  }

  protected prepareOptions(): OptionsWithUri {
    return {
      ...this.baseOptions,
      uri: `https://api.line.me/v2/bot/message/${this.messageId}/content`
    }
  }

  protected processResponse(res: any): string {
    return res.toString('base64')
  }
}
