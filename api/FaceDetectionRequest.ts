import * as request from 'request-promise-native'
import APIRequest from './APIRequest'

export default class FaceDetectionRequest extends APIRequest {
  protected baseOptions: request.RequestPromiseOptions = {
    method: 'POST',
    form: {
      api_key: process.env.faceApiKey,
      api_secret: process.env.faceApiSecret,
      return_attributes: 'gender,age,beauty'
    },
    json: true
  }

  private imageBase64: string

  constructor(imageBase64: string) {
    super()
    this.imageBase64 = imageBase64
  }

  protected prepareOptions(): request.OptionsWithUri {
    return {
      ...this.baseOptions,
      uri: 'https://api-us.faceplusplus.com/facepp/v3/detect',
      form: {
        // FIXME:キャストはあまりやりたくないのでもっとイケてる方法
        ...(this.baseOptions.form as object),
        image_base64: this.imageBase64
      }
    }
  }

  protected processResponse(res: any): any {
    if (res.error_message) {
      return Promise.reject(res.error_message)
    }
    return res.faces
  }
}
