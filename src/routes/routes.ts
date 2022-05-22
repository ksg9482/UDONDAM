import { Router } from "express";

import * as authRouter from './auth.routes';
import * as usersRouter from './users.routes';
import * as commentsRouter from './comments.routes';
import * as likesRouter from './likes.routes';
import * as postsRouter from './posts.routes';
import * as recentsRouter from './recents.routes';

export const router = Router();
export const path = '';

router.use(usersRouter.path, usersRouter.router);
router.use(authRouter.path, authRouter.router);
router.use(commentsRouter.path, commentsRouter.router);
router.use(likesRouter.path, likesRouter.router);
router.use(postsRouter.path, postsRouter.router);
router.use(recentsRouter.path, recentsRouter.router);