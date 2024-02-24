import sgMail from '@sendgrid/mail';
import { env } from '~/env.mjs';

sgMail.setApiKey(env.SENDGRID_API_KEY);

export const sendSignInEmail = async (email: string, url: string) => {
  const { host } = new URL(url);
  console.log('Sending sign in email', email)

  const msg = {
    to: email,
    from: { email: 'no-reply@docsai.app', name: 'DocsAI' },
    subject: 'Sign in to DocsAI',
    text: `Hey hey,\n\n You can sign in to DocsAI by clicking the below URL: ${url}\n\n If you did not make this request, please ignore. \n\n\nThanks,\nKoushik KM\nDocsAI`,
    html: `<html lang="en">

  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign In to DocsAI with Magic Link</title>
    <style>
      /* Base styles */
      body {
        font-family: sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f8f9fa;
        /* Light background */
      }

      /* Container styling */
      .container {
        max-width: 600px;
        /* Adjust width as needed */
        margin: 0 auto;
        padding: 20px;
        background-color: #fff;
        /* White background */
        border-radius: 14px;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      /* Header styling */
      .header {
        display: flex;
        align-items: center;
        padding: 0 20px;
      }

      .logo {
        height: 50px;
        /* Adjust logo height as needed */
      }

      .title {
        font-size: 20px;
        font-weight: bold;
        margin-left: 20px;
      }

      /* Body content styling */
      .body {
        padding: 20px;
      }

      .message {
        line-height: 1.5;
      }

      /* Button styling */
      .signin-button {
        display: block;
        width: 100%;
        font-weight: bold;
        color: #fff;
        background-color: black;
        /* Green button color */
        border: none;
        padding: 14px;
        border-radius: 16px;
        cursor: pointer;
        text-align: center;
        margin-top: 20px;
      }

      .signin-button:hover {
        background-color: #0f172a;

      }

      .link {
        text-decoration: none;
      }

      /* Footer styling */
      .footer {
        text-align: center;
        font-size: 12px;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <div class="header">
        <h1 class="title">DocsAI : AI chat that works for you, your users, and your budget</h1>
      </div>
      <hr>
      <div class="body">
        <p class="message">Hey, Sign in to DocsAI by clicking the button below. If you did not make this request, please
          ignore, contact us <b> hey@docsai.app </b>
        </p>
        <a href="${url}" class="link">
          <button class="signin-button">Sign in to DocsAI</button>
        </a>
        <p class="message">
        </p>
      </div>
      <hr>
      <div>
        <p>Thanks & Cheers, DocsAI</p>
      </div>
    </div>
  </body>

</html>`,
  };

  const resp = await sgMail.send(msg);
  console.log('Sent sign in email', resp[0].statusCode, resp[0].body);
};


export const sendFollowUpEmail = async (email: string, url: string) => {
  const { host } = new URL(url);

  const msg = {
    to: email,
    from: { email: 'hey@docsai.app', name: 'DocsAI' },
    subject: 'Quick Check-In: Your Experience with DocsAI So Far',
    text: `Hi,\n\nThanks for signing up with ${url}!\n\nJust wanted to drop a line to see if everything is working good.`,
    html: `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In to DocsAI with Magic Link</title>
  <style>
    /* Base styles */
    body {
      font-family: sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f8f9fa;
      /* Light background */
    }

    /* Container styling */
    .container {
      max-width: 650px;
      /* Adjust width as needed */
      margin: 0 auto;
      padding: 20px;
      background-color: #fff;
      /* White background */
      border-radius: 12px;
      border: 1px solid black;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    /* Header styling */
    .header {
      display: flex;
      align-items: center;
      padding: 0 10px;
      margin-bottom: 20px;
    }

    .logo {
      height: 50px;
      /* Adjust logo height as needed */
    }

    .title {
      font-size: 20px;
      font-weight: bold;
      margin-left: 20px;
    }

    /* Body content styling */
    .body {
      padding: 20px;
    }

    .message {
      line-height: 1.5;
    }

    /* Button styling */
    .signin-button {
      display: block;
      width: 100%;
      font-weight: bold;
      color: #fff;
      background-color: black;
      border: none;
      padding: 14px;
      border-radius: 16px;
      cursor: pointer;
      text-align: center;
    }

    .white-btn {
      display: block;
      width: 100%;
      font-weight: bold;
      color: black;
      background-color: white;
      border: 1px solid black;
      padding: 14px;
      border-radius: 16px;
      cursor: pointer;
      text-align: center;

    }

    .signin-button:hover {
      background-color: #0f172a;
    }

    .link {
      text-decoration: none;
      min-width: 130px;
    }

    .footer {
      text-align: center;
      font-size: 12px;
    }

    .bullet {
      margin-bottom: 8px;
      line-height: 24px;
    }

    .text-center {
      text-align: center;
      display: block;
      color: #475569;
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="header">
      <h1 class="title">DocsAI : AI chat that works for you, your users and your budget </h1>
    </div>
    <hr>
    <div class="body">
      <p> Hey, </p>
      <p class="message">Just wanted to check in and see how things are going with DocsAI! Do you have any questions or
        feedback you'd like to
        share? We're always looking for ways to improve the user experience, so any insights from you would be greatly
        appreciated.
      </p>
      <div class="center-items">
        <a href="https://docsai.app" class="link" style="margin-right:20px;max-width:140px">
          <button class="signin-button">Get Started</button>
        </a>
        <a href="https://docsai.app/pricing" class="link" style="max-width:140px">
          <button class=" white-btn">Pricing *</button>
        </a>
      </div>
    </div>
    <small class="message text-center"> * Custom pricing is available on all plans, Reply to this email to know more
      about custom
      pricing.</small>
    <hr>
    <h4>Why DocsAI ? </h4>
    <ul>
      <li class="message">Boost Efficiency and Save Time by turning documents into a personalized knowledge base for
        your and your customers.</li>

      <li class="message">DocsAI seamlessly integrates with various data sources like websites, files, Notion, and
        Confluence</li>
    </ul>

    <h4>How DocsAI works ? </h4>
    <ul>
      <li class="message">
        Data Preparation & Training, By adding your websites, or other data sources to DocsAI.
      </li>
      <li class="message">
        You can directly talk to your docs like ChatGPT or create a chatbot for your consumers using our UI .
      </li>
    </ul>

    <h4>What is DocsAI?</h4>
    <p class="message">
      DocsAI transforms your documents into a powerful AI assistant, ready to answer your questions, summarize key
      points, and provide insights. DocsAI chatbots that answer your specific needs by training them on your documents,
      websites, or other data sources. DocsAI lets you gain valuable insights from chatbot conversations, including user
      sentiment,
      common questions, and lead identification
    </p>
    <hr>
    <div>
      <p>Thanks & Cheers, DocsAI</p>
    </div>
  </div>
</body>

    </html>`,
  };

  await sgMail.send({ ...msg, sendAt: Math.floor(Date.now() / 1000) + 60 * 60 * 2 });
};