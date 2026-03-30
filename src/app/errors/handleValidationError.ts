import mongoose from 'mongoose'
import { TErrorSources, TGenericErrorResponse } from '../interface/error'

const handleValidationError = (
  err: mongoose.Error.ValidationError,
): TGenericErrorResponse => {
  const errorSources: TErrorSources = Object.values(err?.errors)?.map(
    (v: mongoose.Error.ValidatorError | mongoose.Error.CastError) => {
      return {
        path: v?.path,
        message: v?.message,
      }
    },
  )

  const statusCode = 400

  return {
    statusCode,
    message: 'Validation Error',
    errorSources,
  }
}

export default handleValidationError
