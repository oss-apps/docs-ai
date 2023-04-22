import { buffer } from "micro";
import { IndexStatus } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "~/env.mjs";
import Stripe from 'stripe'
import { updateStripeSubscription } from "~/server/stripe";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripeHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const stripe = new Stripe(env.STRIPE_API_KEY, { apiVersion: '2022-11-15' })

  if (env.STRIPE_SECRET) {
    const signature = req.headers['stripe-signature']?.toString() ?? ''

    console.log(req.headers['stripe-signature']?.toString(), env.STRIPE_SECRET)

    try {
      const event = stripe.webhooks.constructEvent(
        await buffer(req),
        signature,
        env.STRIPE_SECRET
      );

      console.log('Got event', event.type)
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object as Stripe.Checkout.Session
          if (session.mode === 'subscription') {
            const subscriptionId = session.subscription as string;
            await updateStripeSubscription(subscriptionId, session.customer as string)
          }
          break
        case 'invoice.payment_failed':
        case 'invoice.paid':
          console.log('Going in 2')
          const invoice = event.data.object as Stripe.Invoice
          await updateStripeSubscription(invoice.subscription as string, invoice.customer as string)
          break
        default:
          console.log(`event type ${event.type} unhandled`)
      }
    } catch (e) {
      console.log(`⚠️  Webhook signature verification failed.`, e);
      return res.status(400);
    }
  }

  res.status(200).send({ message: 'success' })
};

export default stripeHandler;
