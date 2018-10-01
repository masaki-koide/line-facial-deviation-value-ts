import * as request from 'request-promise-native'

export default abstract class APIRequest {
  protected abstract baseOptions: request.RequestPromiseOptions

  public request(): Promise<any> {
    const resultOptions = this.prepareOptions()
    return request(resultOptions)
      .then(res => {
        return this.processResponse(res)
      })
      .catch(err => {
        console.log(err)
        return Promise.reject(new Error(err))
      })
  }

  protected abstract prepareOptions(): request.OptionsWithUri
  protected abstract processResponse(res: any): any
}
