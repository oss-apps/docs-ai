import sgMail from '@sendgrid/mail';
import { env } from '~/env.mjs';

sgMail.setApiKey(env.SENDGRID_API_KEY);

export const sendSignInEmail = async (email: string, url: string) => {
  const { host } = new URL(url);

  const msg = {
    to: email,
    from: { email: 'no-reply@docsai.app', name: 'DocsAI' },
    subject: 'Sign in to DocsAI',
    text: `Hey hey,\n\n You can sign in to DocsAI by clicking the below URL: ${url}\n\n If you did not make this request, please ignore. \n\n\nThanks,\nKoushik KM\nDocsAI`,
    html: `<p>Hey hey,</p> <p>You can sign in to DocsAI by clicking the below URL:</p><p><a href="${url}">Sign in to ${host}</a></p><br /><br /><br /><p>Thanks,</p><p>Koushik KM<br/>DocsAI</p>`,
  };

  await sgMail.send(msg);
};


export const sendFollowUpEmail = async (email: string, url: string) => {
  const { host } = new URL(url);

  const msg = {
    to: email,
    from: { email: 'hey@docsai.app', name: 'DocsAI' },
    subject: 'Quick Check-In: Your Experience with DocsAI So Far',
    text: `Hi,\n\nThanks for signing up with ${url}!\n\nJust wanted to drop a line to see if everything was working ok and if you had any questions or concerns.\n\nWould love to hear about your experience with DocsAI, and if there\'s anything else we can do to make the user experience better.\n\nTake care!\n\n\nThanks,\nKoushik - Founder, DocsAI`,
    html: `<p>Hi,</p><p>Thanks for signing up with <a href="${url}">${host}</a>!</p><p>Just wanted to drop a line to see if everything was working ok and if you had any questions or concerns.</p><p>Would love to hear about your experience with DocsAI, and if there\'s anything else we can do to make the user experience better.</p><p>Take care!</p><br /><br/><p>Thanks,</p><p>Koushik - Founder, DocsAI</p>`,
  };

  await sgMail.send({ ...msg, sendAt: Math.floor(Date.now() / 1000) + 60 * 60 * 2 });
};