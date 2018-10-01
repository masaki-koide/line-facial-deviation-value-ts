import * as request from 'request-promise-native'

export default abstract class APIRequest<O> {
  public abstract baseOptions: request.RequestPromiseOptions
  public abstract prepareOptions(addtionalOptions: O): request.OptionsWithUri
  public abstract processResponse(res: any): any

  public request(addtionalOptions: O): Promise<any> {
    const resultOptions = this.prepareOptions(addtionalOptions)
    return request(resultOptions)
      .then(res => {
        return this.processResponse(res)
      })
      .catch(err => {
        console.log(err)
        return Promise.reject(new Error(err))
      })
  }
}
