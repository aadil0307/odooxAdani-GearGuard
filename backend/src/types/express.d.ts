import { Request } from 'express';
import { JwtPayload } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}
