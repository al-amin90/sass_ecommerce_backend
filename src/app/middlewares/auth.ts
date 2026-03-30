import { NextFunction, Request, Response } from 'express'
import catchAsync from '../utils/catchAsync'
import AppError from '../errors/AppError'
import status from 'http-status'
import config from '../config'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { TUserRole } from '../modules/user/user.interface'
import { UserModel } from '../modules/user/user.model'

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization

    if (!token) {
      throw new AppError(status.FORBIDDEN, 'You are not authorized!')
    }

    const decoded = jwt.verify(token, config.jwt_access_token as string)
    const { role, id, iat } = decoded as JwtPayload

    const user = await UserModel.isUserExistByCustomId(id)

    if (!user) {
      throw new AppError(status.NOT_FOUND, "The User Does't exists")
    }

    const isDeleted = user.isDeleted
    if (isDeleted) {
      throw new AppError(status.FORBIDDEN, 'The User is Deleted')
    }

    if (user.status === 'blocked') {
      throw new AppError(status.FORBIDDEN, 'The User is Blocked')
    }

    if (
      user.passwordChangeAt &&
      (await UserModel.isJWTIssuedBeforePassword(
        user.passwordChangeAt,
        iat as number,
      ))
    ) {
      throw new AppError(status.UNAUTHORIZED, 'You are not authorized. by!')
    }

    if (requiredRoles && !requiredRoles.includes(role)) {
      throw new AppError(status.UNAUTHORIZED, 'You are not authorized. hi!')
    }

    req.user = decoded as JwtPayload
    next()
  })
}

export default auth
