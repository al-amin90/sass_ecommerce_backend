import { ZodError, ZodIssue } from 'zod'
import { TErrorSources } from '../interface/error'

const handleZodHandler = (err: ZodError) => {
  const errorSources: TErrorSources = err.issues?.map((issue: ZodIssue) => {
    return {
      path: issue?.path[issue.path.length - 1],
      message: issue?.message,
    }
  })

  const statusCode = 500

  return {
    statusCode,
    message: 'Validation Error',
    errorSources,
  }
}

export default handleZodHandler
