import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda'
import FaceDetectRequest from './api/FaceDetectRequest'
import LINEMessageContentRequest from './api/LINEMessageContentRequest'
import LINEReplyRequest from './api/LINEReplyRequest'
import { isValidSignature } from './helper'

const faceDetectRequest = new FaceDetectRequest()
const lineMessageContentRequest = new LINEMessageContentRequest()
const lineReplyRequest = new LINEReplyRequest()

export interface IMessage {
  type: string
  text: string
}

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
    // 画像が送信されてきた場合
    if (event.type === 'message' && event.message.type === 'image') {
      let messages
      try {
        // 送信された画像をbase64形式で取得
        const content = await lineMessageContentRequest.request({
          messageId: event.message.id
        })
        // 画像から顔を検出する
        const faces = await faceDetectRequest.request({
          image_base64: content
        })

        // 画像から顔を検出できなかった場合
        if (faces.length === 0) {
          messages = createErrorMessage('写真から顔を検出できませんでした。')
          // 返信できるメッセージが5つまでのため
        } else if (faces.length > 5) {
          messages = createErrorMessage(
            '写真から6人以上の顔を検出しました。診断できるのは5人までです。'
          )
        } else {
          // 顔の検出結果をメッセージオブジェクトに変換
          messages = createFacesAnalysisResultMessages(faces)
        }
      } catch (err) {
        console.log(err)
        messages = createErrorMessage(
          'エラーが発生しました。しばらく待ってもう一度やり直してください。'
        )
      } finally {
        await lineReplyRequest.request({
          replyToken: event.replyToken,
          messages
        })
      }
      // フォローもしくはフォロー解除された場合
    } else if (event.type === 'follow' || event.type === 'unfollow') {
      // TODO:Firebaseの型定義
      // const userId = event.source.userId
      // const isFollowEvent = event.type === 'follow'
      const response = {
        statusCode: 200,
        body: JSON.stringify({})
      }
      // try {
      //   await updateUser(userId, isFollowEvent)
      // } catch (err) {
      //   console.log(err)
      // } finally {
      //   // イベントループを終了させる
      callback(null, response)
      // }
      // // その他のイベントはエラーメッセージで返す
    } else {
      const messages = createErrorMessage('診断したい写真を送ってね！')
      await lineReplyRequest.request({
        replyToken: event.replyToken,
        messages
      })
    }
  })
}

function createErrorMessage(message: string): IMessage[] {
  return [
    {
      type: 'text',
      text: message
    }
  ]
}

function createFacesAnalysisResultMessages(faces: any[]): IMessage[] {
  const sortedFaces = faces.sort((a: any, b: any) => {
    if (a.face_rectangle.left === b.face_rectangle.left) {
      return 0
    } else if (a.face_rectangle.left < b.face_rectangle.left) {
      return -1
    }
    return 1
  })

  return sortedFaces.map((face: any, index: number) => {
    const attr = face.attributes
    const age = attr.age.value
    const gender = attr.gender.value === 'Male' ? '男性' : '女性'
    const beauty =
      gender === '男性' ? attr.beauty.male_score : attr.beauty.female_score
    const order = faces.length > 1 ? `左から${index + 1}人目\n` : ''
    const text = `${order}年齢: ${age}歳
性別: ${gender}
顔面偏差値: ${Math.round(beauty)}点(100点満点)`

    return {
      type: 'text',
      text
    }
  })
}
