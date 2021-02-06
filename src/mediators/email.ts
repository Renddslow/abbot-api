import got from 'got';
import catchify from 'catchify';

const email = async (to: string, subject: string, message: string) =>
  catchify(
    got('https://api.mailgun.net/v3/flatland.church/messages', {
      method: 'POST',
      form: {
        from: 'Flatland Church <noreply@flatland.church>',
        to,
        subject,
        html: message,
      },
      username: 'api',
      password: process.env.MAILGUN_KEY,
    }),
  );

export default email;
