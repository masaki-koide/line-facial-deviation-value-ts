import * as request from 'request-promise-native'
import APIRequest from './APIRequest'

// FIXME:requestの引数は考えたい
export interface IMessageData {
  messageId: string
}

export default class LINEMessageContentRequest extends APIRequest<
  IMessageData
> {
  public baseOptions: request.RequestPromiseOptions = {
    auth: {
      bearer: process.env.lineBearer
    },
    // データをバイナリで取得する
    encoding: null
  }

  public prepareOptions(message: IMessageData): request.OptionsWithUri {
    return {
      ...this.baseOptions,
      uri: `https://api.line.me/v2/bot/message/${message.messageId}/content`
    }
  }

  public processResponse(res: any): any {
    return res.toString('base64')
  }
}
