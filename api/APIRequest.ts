import * as request from 'request-promise-native'

export default abstract class APIRequest<P> {
  protected abstract baseOptions: request.RequestPromiseOptions

  public request(): Promise<P | never> {
    const resultOptions = this.prepareOptions()
    return request(resultOptions)
      .then(res => {
        return this.processResponse(res)
      })
      .catch(err => {
        return Promise.reject(new Error(err))
      })
  }

  protected abstract prepareOptions(): request.OptionsWithUri
  protected abstract processResponse(res: any): P
}
