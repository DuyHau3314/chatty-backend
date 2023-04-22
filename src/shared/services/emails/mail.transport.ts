import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import Logger from 'bunyan';
import sendGridMail from '@sendgrid/mail';
import { config } from '@root/config';
import { BadRequestError } from '@global/helpers/error-handler';

interface IMailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

const log: Logger = config.createLogger('mailOptions');

sendGridMail.setApiKey(`${config.SENDGRID_API_KEY}`);

class MailTransport {
  public async sendEmail(receiverEmail: string, subject: string, body: string): Promise<void> {
    if (config.NODE_ENV === 'development' || config.NODE_ENV === 'test') {
      await this.developmentEmailSender(receiverEmail, subject, body);
    } else {
      await this.productionEmailSender(receiverEmail, subject, body);
    }
  }

  private async developmentEmailSender(receiveEmail: string, subject: string, body: string): Promise<void> {
    // create reusable transporter object using the default SMTP transport
    const transporter: Mail = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: `${config.SENDER_EMAIL}`, // generated ethereal user
        pass: `${config.SENDER_EMAIL_PASSWORD}` // generated ethereal password
      }
    });

    const mailOption: IMailOptions = {
      from: `Chatty App <${config.SENDER_EMAIL}>`, // sender address
      to: receiveEmail,
      subject,
      html: body
    };

    try {
      await transporter.sendMail(mailOption);
      log.info('Development email sent successfully');
    } catch (error) {
      log.error('Error sending email', error);
      throw new BadRequestError('Error sending email');
    }
  }

  private async productionEmailSender(receiveEmail: string, subject: string, body: string): Promise<void> {
    const mailOption: IMailOptions = {
      from: `Chatty App <${config.SENDER_EMAIL}>`, // sender address
      to: receiveEmail,
      subject,
      html: body
    };

    try {
      await sendGridMail.send(mailOption);
      log.info('Production email sent successfully');
    } catch (error) {
      log.error('Error sending email', error);
      throw new BadRequestError('Error sending email');
    }
  }
}

export const mailTransport: MailTransport = new MailTransport();
