import { UserPublic } from './index';

declare global {
  namespace Express {
    interface Request {
      user?: UserPublic;
    }
  }
}

export {};