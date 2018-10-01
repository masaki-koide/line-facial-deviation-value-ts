import * as request from 'request-promise-native'
import APIRequest from './APIRequest'

// FIXME:requestの引数は考えたい
interface IImageData {
  image_base64: string
}

export default class FacePPRequest extends APIRequest<IImageData> {
  public baseOptions: request.RequestPromiseOptions = {
    method: 'POST',
    form: {
      api_key: process.env.faceApiKey,
      api_secret: process.env.faceApiSecret,
      return_attributes: 'gender,age,beauty'
    },
    json: true
  }

  public prepareOptions(image: IImageData): request.OptionsWithUri {
    return {
      ...this.baseOptions,
      uri: 'https://api-us.faceplusplus.com/facepp/v3/detect',
      form: {
        // FIXME:キャストはあまりやりたくないのでもっとイケてる方法
        ...(this.baseOptions.form as object),
        image_base64: image.image_base64
      }
    }
  }

  public processResponse(res: any): any {
    if (res.error_message) {
      return Promise.reject(res.error_message)
    }
    return res.faces
  }
}
