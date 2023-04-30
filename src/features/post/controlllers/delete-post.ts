import { postQueue } from '@service/queues/post.queue';
import { PostCache } from '@service/redis/post.cache';
import { socketIOPostHandler } from '@socket/post';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

const postCache = new PostCache();

export class Delete {
  public async post(req: Request, res: Response): Promise<void> {
    socketIOPostHandler.emit('deletePost', req.params.postId);
    await postCache.deletePostFromCache(req.params.postId, `${req.currentUser?.userId}`);
    postQueue.addPostJob('deletePostFromDB', { keyOne: req.params.postId, keyTwo: req.currentUser?.userId });
    res.status(HTTP_STATUS.OK).json({ message: 'Post deleted successfully' });
  }
}
