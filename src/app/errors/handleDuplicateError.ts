import { TErrorSources, TGenericErrorResponse } from '../interface/error'

const handleDuplicateError = (err: any): TGenericErrorResponse => {
  const match = err.message.match(/:\s*["']([^"']+)["']/)

  const extractedMessage = match ? match[1] : null

  const errorSources: TErrorSources = [
    {
      path: '',
      message: `${extractedMessage} is already exists`,
    },
  ]

  const statusCode = 500

  return {
    statusCode,
    message: `This Filed is already exists`,
    errorSources,
  }
}

export default handleDuplicateError
