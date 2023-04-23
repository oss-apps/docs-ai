import sgMail from '@sendgrid/mail';
import { env } from '~/env.mjs';

sgMail.setApiKey(env.SENDGRID_API_KEY);

export const sendSignInEmail = async (email: string, url: string) => {
  const { host } = new URL(url);

  const msg = {
    to: email,
    from: 'no-reply@docsai.app',
    subject: 'Sign in to DocsAI',
    text: `Hey hey,\n\n You can sign in to DocsAI by clicking the below URL: ${url}\n\n If you did not make this request, please ignore. \n\n\nThanks,\nKoushik KM\nDocsAI`,
    html: `<p>Hey hey,</p> <p>You can sign in to DocsAI by clicking the below URL:</p><p><a href="${url}">Sign in to ${host}</a></p><br /><br /><br /><p>Thanks,</p><p>Koushik KM<br/>DocsAI</p>`,
  };

  await sgMail.send(msg);
};