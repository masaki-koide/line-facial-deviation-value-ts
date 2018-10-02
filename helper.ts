import * as crypto from 'crypto'

export interface IMessage {
  type: string
  text: string
}

export const isValidSignature = (signature: string, body: any): boolean => {
  return (
    signature ===
    crypto
      .createHmac('SHA256', process.env.lineChannelSecret)
      .update(Buffer.from(JSON.stringify(body)))
      .digest('base64')
  )
}

export const createErrorMessage = (message: string): IMessage[] => {
  return [
    {
      type: 'text',
      text: message
    }
  ]
}

export const createMessagesFromFaces = (faces: any): IMessage[] => {
  if (faces.length === 0) {
    return createErrorMessage('写真から顔を検出できませんでした。')
    // 一度にリプライできるメッセージが5つまでのため
  } else if (faces.length > 5) {
    return createErrorMessage(
      '写真から6人以上の顔を検出しました。診断できるのは5人までです。'
    )
  }

  return createFacesAnalysisMessages(faces)
}

function createFacesAnalysisMessages(faces: any[]): IMessage[] {
  const sortedFaces = faces.sort((a: any, b: any) => {
    if (a.face_rectangle.left === b.face_rectangle.left) {
      return 0
    } else if (a.face_rectangle.left < b.face_rectangle.left) {
      return -1
    }
    return 1
  })

  return sortedFaces.map(
    (face: any, index: number): IMessage => {
      const attr = face.attributes
      const age = attr.age.value
      const [gender, beauty] =
        attr.gender.value === 'Male'
          ? ['男性', attr.beauty.male_score]
          : ['女性', attr.beauty.female_score]
      const order = faces.length > 1 ? `左から${index + 1}人目\n` : ''
      const text = `${order}年齢: ${age}歳
性別: ${gender}
顔面偏差値: ${Math.round(beauty)}点(100点満点)`

      return {
        type: 'text',
        text
      }
    }
  )
}
