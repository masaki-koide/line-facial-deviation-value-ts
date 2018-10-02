import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda'
import FaceDetectionRequest from './api/FaceDetectionRequest'
import LINEMessageContentRequest from './api/LINEMessageContentRequest'
import LINEReplyRequest from './api/LINEReplyRequest'
import {
  createErrorMessage,
  createMessagesFromFaces,
  IMessage,
  isValidSignature
  // updateFirebaseUser
} from './helper'

export const webhook: Handler = (
  event: APIGatewayEvent,
  context: Context,
  cb: Callback
) => {
  const body = JSON.parse(event.body)

  context.callbackWaitsForEmptyEventLoop = false

  // 署名が有効なものか検証する
  if (isValidSignature(event.headers['X-Line-Signature'], body)) {
    reply(body.events, cb)
  }
}

function reply(events: any[], callback: Callback) {
  events.forEach(async event => {
    if (event.type === 'message' && event.message.type === 'image') {
      let messages: IMessage[]

      try {
        // 送信された画像をbase64形式で取得
        const imageBase64 = await new LINEMessageContentRequest(
          event.message.id
        ).request()

        const faces = await new FaceDetectionRequest(imageBase64).request()

        messages = createMessagesFromFaces(faces)
      } catch (err) {
        console.log(err)
        messages = createErrorMessage(
          'エラーが発生しました。しばらく待ってもう一度やり直してください。'
        )
      } finally {
        await new LINEReplyRequest(event.replyToken, messages).request()
      }
    } else if (event.type === 'follow' || event.type === 'unfollow') {
      // const userId = event.source.userId
      // const isFollowEvent = event.type === 'follow'

      try {
        // await updateFirebaseUser(userId, isFollowEvent)
      } catch (err) {
        console.log(err)
      } finally {
        // イベントループを終了させる
        callback(null, {
          statusCode: 200,
          body: JSON.stringify({})
        })
      }
      // その他のイベントはエラーメッセージで返す
    } else {
      const messages = createErrorMessage('診断したい写真を送ってね！')
      await new LINEReplyRequest(event.replyToken, messages).request()
    }
  })
}
