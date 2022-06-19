import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(private readonly config: ConfigService) {}

  /**
   * 发送邮件
   */
  async send(to: string, subject: string, html: string) {
    const transporter = createTransport({
      host: this.config.get<string>('MAIL_HOST'),
      port: this.config.get<number>('MAIL_PORT'),
      secure: true,
      auth: {
        user: this.config.get<string>('MAIL_USER'),
        pass: this.config.get<string>('MAIL_PASS'),
      },
    });

    // 发送者
    const from = this.config.get<string>('MAIL_FROM');

    const mailOptions = { from, to, subject, html };

    const res = await transporter.sendMail(mailOptions).catch((err) => {
      throw new Error(err);
    });

    return !!res;
  }
}
