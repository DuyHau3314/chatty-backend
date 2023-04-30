import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { IPostDocument } from '@post/interfaces/post.interface';
import { postSchema, postWithImageSchema } from '@post/shemes/post.schemes';
import { postQueue } from '@service/queues/post.queue';
import { PostCache } from '@service/redis/post.cache';
import { socketIOPostHandler } from '@socket/post';
import { Request, Response } from 'express';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from '@global/helpers/cloudinary-upload';
import { BadRequestError } from '@global/helpers/error-handler';

const postCache: PostCache = new PostCache();

export class Update {
  @joiValidation(postSchema)
  public async post(req: Request, res: Response): Promise<void> {
    const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId, profilePicture } = req.body;
    const { postId } = req.params;

    const updatedPost: IPostDocument = {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      imgVersion,
      imgId,
      profilePicture
    } as IPostDocument;

    const postUpdated = await postCache.updatePostInCache(postId, updatedPost);
    socketIOPostHandler.emit('updatePost', postUpdated, 'posts');
    postQueue.addPostJob('updatePostInDB', {
      key: postId,
      value: updatedPost
    });

    postQueue.addPostJob('updatePostInDB', {
      key: postId,
      value: updatedPost
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully' });
  }

  @joiValidation(postWithImageSchema)
  public async postWithImage(req: Request, res: Response): Promise<void> {
    const { imgId, imgVersion } = req.body;
    if (imgId && imgVersion) {
      Update.prototype.updatePostWithImage(req);
    } else {
      const result: UploadApiResponse = await Update.prototype.addImageToExistingPost(req);
      if (!result.public_id) {
        throw new BadRequestError(result.message || 'Image upload failed');
      }
    }
    res.status(HTTP_STATUS.OK).json({ message: 'Post with image updated successfully' });
  }

  private async updatePostWithImage(req: Request): Promise<void> {
    const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId, profilePicture } = req.body;
    const { postId } = req.params;

    const updatedPost: IPostDocument = {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      imgVersion,
      imgId,
      profilePicture
    } as IPostDocument;

    const postUpdated = await postCache.updatePostInCache(postId, updatedPost);
    socketIOPostHandler.emit('updatePost', postUpdated, 'posts');
    postQueue.addPostJob('updatePostInDB', {
      key: postId,
      value: updatedPost
    });
  }

  private async addImageToExistingPost(req: Request): Promise<UploadApiResponse> {
    const { post, bgColor, feelings, privacy, gifUrl, image, profilePicture } = req.body;
    const { postId } = req.params;

    const result: UploadApiResponse = (await uploads(image)) as UploadApiResponse;
    if (!result?.public_id) {
      return result;
    }

    const updatedPost: IPostDocument = {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      imgId: result.public_id,
      imgVersion: result.version.toString(),
      profilePicture
    } as IPostDocument;

    const postUpdated = await postCache.updatePostInCache(postId, updatedPost);
    socketIOPostHandler.emit('updatePost', postUpdated, 'posts');
    postQueue.addPostJob('updatePostInDB', {
      key: postId,
      value: updatedPost
    });
    // call image queue to add image to mongodb database

    return result;
  }
}
