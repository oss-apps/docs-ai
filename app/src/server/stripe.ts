import { type Org, Plan } from '@prisma/client'
import Stripe from 'stripe'
import { env } from '~/env.mjs'
import { prisma } from './db'

export const stripe = new Stripe(env.STRIPE_API_KEY, { apiVersion: '2022-11-15' })

export const getPrices = () => {
  if (env.NODE_ENV === 'development') {
    return {
      'month': {
        'price_1MwgHOK27QgSmXIJd009pZTU': 'BASIC',
        'price_1MwueYK27QgSmXIJSWRlNNSV': 'PROFESSIONAL',
        'price_1MwujRK27QgSmXIJYcsOg0ab': 'ENTERPRISE',
      },
      'year': {
        'price_1MwukdK27QgSmXIJ53VVEUXJ': 'BASIC',
        'price_1MwulPK27QgSmXIJztYhAKDP': 'PROFESSIONAL',
        'price_1MwuliK27QgSmXIJ3P8zUhoG': 'ENTERPRISE',
      }
    }
  } else {
    return {
      'month': {
        'price_1Mzf08K27QgSmXIJyKzOIHsP': 'BASIC',
        'price_1Mzf1bK27QgSmXIJUH10AFY0': 'PROFESSIONAL',
        'price_1Mzf37K27QgSmXIJPIvcpyn1': 'ENTERPRISE',
      },
      'year': {
        'price_1Mzf08K27QgSmXIJ7wnTVPpv': 'BASIC',
        'price_1Mzf1bK27QgSmXIJWdoCmueH': 'PROFESSIONAL',
        'price_1Mzf37K27QgSmXIJzw2370qR': 'ENTERPRISE',
      }
    }
  }
}


export const createCustomer = async (id: string) => {
  const customer = await stripe.customers.create({ metadata: { orgId: id } })

  return await prisma.org.update({
    where: { id },
    data: { stripeCustomerId: customer.id }
  })
}

export const checkAndUpdateFreeAccount = async (org: Org) => {
  if (org.paymentsUpdatedAt && org.paymentsUpdatedAt.getMonth() < new Date().getMonth()) {
    await prisma.org.update({
      where: { id: org.id },
      data: {
        chatCredits: {
          increment: 25,
        }
      }
    })

    await prisma.project.updateMany({
      where: { orgId: org.id },
      data: {
        chatUsed: 0
      }
    })
  }
}


export const updateStripeSubscription = async (subscriptionId: string, customerId: string) => {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const org = await prisma.org.findUnique({ where: { stripeCustomerId: customerId } })

  if (org && subscription.items.data[0]?.price.id) {
    await prisma.subscription.upsert({
      where: { id: subscriptionId },
      create: {
        id: subscriptionId,
        orgId: org.id,
        status: subscription.status,
        priceId: subscription.items.data[0].price.id,
        currentStart: new Date(subscription.current_period_start * 1000),
        currentEnd: new Date(subscription.current_period_end * 1000),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        amount: (subscription as any).plan.amount as number,
      },
      update: {
        status: subscription.status,
        currentStart: new Date(subscription.current_period_start * 1000),
        currentEnd: new Date(subscription.current_period_end * 1000),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        amount: (subscription as any).plan.amount as number,
      }
    })

    let plan: Plan = Plan.BASIC

    if (subscription.items.data[0]?.price.recurring?.interval === 'year') {
      const prices = getPrices().year as unknown as Record<string, string>
      if (prices[subscription.items.data[0].price.id]) {
        plan = prices[subscription.items.data[0].price.id] as Plan
      }
    } else {
      const prices = getPrices().month as unknown as Record<string, string>
      if (prices[subscription.items.data[0].price.id]) {
        plan = prices[subscription.items.data[0].price.id] as Plan
      }
    }

    const credits = subscription.status === 'active' ?
      (plan === Plan.BASIC ? 1000 : plan === Plan.PROFESSIONAL ? 5000 : 12000) : 0

    await prisma.org.update({
      where: { id: org.id },
      data: {
        isActive: subscription.status === 'active',
        plan,
        chatCredits: {
          increment: credits
        },
        paymentsUpdatedAt: new Date(),
      }
    })

    await prisma.project.updateMany({
      where: { orgId: org.id },
      data: {
        chatUsed: 0
      }
    })
  }
}