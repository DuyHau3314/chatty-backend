import { NextFunction, Request, Response } from 'express';
import { NotAuthorizedError } from './error-handler';
import JWT from 'jsonwebtoken';
import { AuthPayload } from '@auth/interfaces/auth.interface';
import { config } from '@root/config';

export class AuthMiddleware {
  public verifyUser(req: Request, _res: Response, next: NextFunction): void {
    if (!req.session || !req.session.jwt) {
      throw new NotAuthorizedError('Token is not available. Please login again');
    }

    try {
      const payload: AuthPayload = JWT.verify(req.session.jwt, config.JWT_TOKEN!) as AuthPayload;
      req.currentUser = payload;
    } catch (error) {
      throw new NotAuthorizedError('Invalid token. Please login again');
    }
    next();
  }

  public checkAuthentication(req: Request, _res: Response, next: NextFunction): void {
    if (!req.currentUser) {
      throw new NotAuthorizedError('You are not authenticated. Please login again');
    }
    next();
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
