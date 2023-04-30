import { authMiddleware } from '@global/helpers/auth-middleware';
import { Create } from '@post/controlllers/create-post';
import { Delete } from '@post/controlllers/delete-post';
import { Get } from '@post/controlllers/get-post';
import { Update } from '@post/controlllers/update-post';
import { Router } from 'express';

class PostRoutes {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.get('/post/all/:page', authMiddleware.checkAuthentication, Get.prototype.posts);
    this.router.get('/post/images/:page', authMiddleware.checkAuthentication, Get.prototype.postsWithImages);
    this.router.post('/post', authMiddleware.checkAuthentication, Create.prototype.post);
    this.router.post('/post/image/post', authMiddleware.checkAuthentication, Create.prototype.postWithImage);
    this.router.put('/post/:postId', authMiddleware.checkAuthentication, Update.prototype.post);
    this.router.put('/post/image/:postId', authMiddleware.checkAuthentication, Update.prototype.postWithImage);
    this.router.delete('/post/:postId', authMiddleware.checkAuthentication, Delete.prototype.post);

    return this.router;
  }
}

export const postRoutes: PostRoutes = new PostRoutes();
