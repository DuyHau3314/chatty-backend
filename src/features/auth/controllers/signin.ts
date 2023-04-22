import HTTP_STATUS from 'http-status-codes';
import JWT from 'jsonwebtoken';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { signinSchema } from '@auth/schemes/signin';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { BadRequestError } from '@global/helpers/error-handler';
import { authService } from '@service/db/auth.service';
import { Request, Response } from 'express';
import { config } from '@root/config';
import { userService } from '@service/db/user.service';
import { IResetPasswordParams, IUserDocument } from '@user/interfaces/user.interface';
import { forgotPasswordTemplate } from '@service/emails/templates/forgot-password/forgot-password-template';
import { emailQueue } from '@service/queues/email.queue';
import moment from 'moment';
import publicIP from 'ip';
import { resetPasswordTemplate } from '@service/emails/templates/reset-password/reset-password-template';

export class SignIn {
  @joiValidation(signinSchema)
  public async read(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;

    const existingUser: IAuthDocument = await authService.getAuthUserByUsername(username);

    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const passwordsMatch: boolean = await existingUser.comparePassword(password);
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid username or password');
    }

    const user: IUserDocument = await userService.getUserByAuthId(`${existingUser._id}`);

    const userJwt: string = JWT.sign(
      {
        userId: user._id,
        uId: existingUser.uId,
        username: existingUser.username,
        email: existingUser.email,
        avatarColor: existingUser.avatarColor
      },
      config.JWT_TOKEN!
    );

    const templateParams: IResetPasswordParams = {
      username: existingUser.username,
      email: existingUser.email,
      ipaddress: publicIP.address(),
      date: moment().format('DD-MM-YYYY HH:mm:ss')
    };

    // const resetLink = `${config.CLIENT_URL}/reset-password/token=1231212312`;
    const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
    emailQueue.addEmailJob('forgotPasswordEmail', {
      template,
      receiverEmail: 'virgie.kreiger@ethereal.email',
      subject: 'Password reset confirmation'
    });

    req.session = {
      jwt: userJwt
    };

    const userDocument: IUserDocument = {
      ...user,
      authId: existingUser._id,
      username: existingUser.username,
      email: existingUser.email,
      avatarColor: existingUser.avatarColor,
      uId: existingUser.uId,
      createdAt: existingUser.createdAt
    } as IUserDocument;

    res.status(HTTP_STATUS.OK).json({ message: 'User created successfully', token: userJwt, user: userDocument });
  }
}
