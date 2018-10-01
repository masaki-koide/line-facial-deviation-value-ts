import * as request from 'request-promise-native'
import { IMessage } from '../handler'
import APIRequest from './APIRequest'

// FIXME:requestの引数は考えたい
export interface IReplyData {
  replyToken: string
  messages: IMessage[]
}

export default class LINEReplyRequest extends APIRequest<IReplyData> {
  public baseOptions: request.RequestPromiseOptions = {
    method: 'POST',
    auth: {
      bearer: process.env.lineBearer
    },
    json: true
  }

  public prepareOptions(replyData: IReplyData): request.OptionsWithUri {
    return {
      ...this.baseOptions,
      uri: `https://api.line.me/v2/bot/message/reply`,
      body: {
        replyToken: replyData.replyToken,
        messages: replyData.messages
      }
    }
  }

  public processResponse(res: any): any {
    return res
  }
}
