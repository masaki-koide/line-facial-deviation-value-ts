import { OptionsWithUri, RequestPromiseOptions } from 'request-promise-native'
import { IMessage } from '../handler'
import APIRequest from './APIRequest'

export default class LINEReplyRequest extends APIRequest<any> {
  protected baseOptions: RequestPromiseOptions = {
    method: 'POST',
    auth: {
      bearer: process.env.lineBearer
    },
    json: true
  }

  private replyToken: string
  private messages: IMessage[]

  constructor(replyToken: string, messages: IMessage[]) {
    super()
    this.replyToken = replyToken
    this.messages = messages
  }

  protected prepareOptions(): OptionsWithUri {
    return {
      ...this.baseOptions,
      uri: `https://api.line.me/v2/bot/message/reply`,
      body: {
        replyToken: this.replyToken,
        messages: this.messages
      }
    }
  }

  protected processResponse(res: any): any {
    return res
  }
}
