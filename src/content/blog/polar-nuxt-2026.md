---
title: 'How to Integrate Polar with Nuxt in 2026: The Complete Guide'
excerpt: 'I built a full subscription SaaS with Polar and Nuxt 4. Here is exactly how the checkout flow, webhooks, customer portal, and dashboard work together — with the gotchas nobody tells you about.'
publishDate: 'Apr 24 2026'
tags:
  - Tutorial
  - Nuxt
  - Payments
  - SaaS
seo:
  description: "The complete 2026 guide to integrating Polar payments with Nuxt. Setup webhooks, products, and checkout for your solo founder project."
  image:
    src: '/media/blog/polar-nuxt-2026/images/cover.png'
    alt: 'Polar payment integration with Nuxt 2026 tutorial'
  pageType: article
isFeatured: false
---

![Polar Nuxt integration tutorial](/media/blog/polar-nuxt-2026/images/cover.png)

_Image: punzandjokes.com_

I built a full subscription SaaS with Nuxt and Polar.

It has a pricing page, checkout flow, success page, customer portal, live dashboard, and webhook handlers that keep everything in sync.

This guide walks through exactly how I wired it up.

Not the theory. The actual code.

## Why Polar instead of Stripe or Paddle

Stripe is great. But if you are outside the US or EU, you hit walls fast.

Paddle acts as a Merchant of Record, which solves that. But their approval process can be rough. I went through it. Got rejected with no explanation. [I wrote about that here](https://alwaisy.dev/blog/paddle-to-polar).

Polar is newer. It is also a Merchant of Record. And the approval is fast.

For developers building SaaS products, digital goods, or subscriptions, it is by far the smoothest option I have used.

## What we are building

This is not a toy example.

- Pricing page that pulls products live from Polar
- Checkout that redirects to Polar and back
- Success page that verifies the payment
- Webhooks that sync subscription state
- Dashboard that shows live subscription status
- Customer portal for managing billing

I call my implementation **PolarSquid**.

You can call yours whatever you want.

## Prerequisites

You do not need much.

- A Polar account (free, sandbox included)
- Node.js 20+ or Bun
- A Nuxt project, existing or fresh
- ngrok if you want to test webhooks locally

I would suggest using the Polar sandbox for this entire tutorial.

Test products. Fake checkouts. No real money.

Once it works, switching to production is basically a config change.

## Step 1 — Create your Polar products

This part happens in the Polar dashboard.

1. Log into [polar.sh](https://polar.sh) and create an organization
2. Go to Products and click "New Product"
3. Create a subscription product with a monthly price
4. Note the Product ID. You will need it soon

I set up three tiers: Starter at $9, Pro at $29, Team at $79.

You do you.

## Step 2 — Install dependencies

Inside your Nuxt project:

```bash
# pnpm (what I use)
pnpm add @polar-sh/nuxt @polar-sh/sdk zod

# or npm
npm install @polar-sh/nuxt @polar-sh/sdk zod
```

Two packages matter here.

`@polar-sh/nuxt` is the Nuxt module. It gives you helpers like `Checkout()`, `CustomerPortal()`, and `Webhooks()`.

`@polar-sh/sdk` is the raw SDK. You use it for direct API calls like fetching products or looking up subscriptions.

Zod gets pulled in automatically because the module uses it for validation. I list it explicitly so I know what is in my dependency tree.

## Step 3 — Configure Nuxt

Add the module in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxt/scripts', '@nuxt/eslint', '@polar-sh/nuxt'],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    polarAccessToken: '',
    polarWebhookSecret: '',
    polarServer: '',
    polarSuccessUrl: ''
  }
});
```

The `runtimeConfig` fields are server-side only by default. This is exactly what you want. Your access token and webhook secret should never touch the browser.

I am using `@nuxt/ui` for styling, but that is optional. Use whatever you prefer. The Polar integration has no UI opinions.

## Step 4 — Environment variables

Create a `.env` file:

```bash
NUXT_POLAR_ACCESS_TOKEN=polar_oat_...
NUXT_POLAR_WEBHOOK_SECRET=polar_whs_...
NUXT_POLAR_SERVER=sandbox
NUXT_POLAR_SUCCESS_URL=http://localhost:3000/success?checkout_id={CHECKOUT_ID}
```

Where to get each value:

- **Access Token**: Organization settings in Polar, then "Access Tokens"
- **Webhook Secret**: We will generate this in Step 7
- **Server**: `sandbox` for local dev, `production` when you deploy
- **Success URL**: Where Polar sends users after checkout. The `{CHECKOUT_ID}` placeholder gets replaced automatically

One warning. Polar validates redirect URLs strictly.

`http://localhost:3000/success` is different from `http://127.0.0.1:3000/success`.

Register both if you switch between them. Otherwise the checkout fails on redirect with no helpful error.

## Step 5 — Create the Polar client

The module handles a lot, but for direct API calls you need a Polar client.

I would suggest a server utility so you are not instantiating it fresh in every route.

Create `server/utils/polar.ts`:

```typescript
import { Polar } from '@polar-sh/sdk';

export const usePolar = () => {
  const config = useRuntimeConfig();

  if (!config.polarAccessToken) {
    throw new Error('Missing POLAR_ACCESS_TOKEN in runtime config');
  }

  return new Polar({
    accessToken: config.polarAccessToken,
    server: config.polarServer as 'sandbox' | 'production'
  });
};
```

Now any server route can call `usePolar()` and get a configured client.

At this point you can start hitting the Polar API from your server. Pretty straightforward.

## Step 6 — Fetch and display products

Here is where it gets fun.

Create `server/api/products.get.ts`:

```typescript
export default defineEventHandler(async () => {
  const polar = usePolar();

  try {
    const products = await polar.products.list({
      isArchived: false
    });

    // Only return subscription products
    return (products.result.items ?? []).filter((p) => {
      const isRecurring = p.isRecurring === true || p.prices.some((pr: any) => pr.recurringInterval !== null);
      return isRecurring;
    });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
});
```

This fetches all non-archived products, then filters for subscriptions.

If you also sell one-time digital products through the same organization, this keeps them off your SaaS pricing page.

On the frontend, call it from your pricing page at `app/pages/index.vue`:

```vue
<script setup lang="ts">
const { data: products, pending } = useFetch('/api/products');
</script>

<template>
  <div>
    <div v-if="pending">Loading plans...</div>
    <div v-else class="grid gap-8 md:grid-cols-3">
      <div v-for="product in products" :key="product.id">
        <h3>{{ product.name }}</h3>
        <p>{{ product.description }}</p>
        <p>
          {{ product.prices[0].priceAmount / 100 }}
          {{ product.prices[0].priceCurrency }}
        </p>
        <button @click="purchase(product.id)">Subscribe</button>
      </div>
    </div>
  </div>
</template>
```

That is stripped down of course.

In my actual project I added skeleton loaders, styled cards with Tailwind, and an email capture modal before checkout.

But the core is the same. Fetch products. Render them. Let the user pick one.

## Step 7 — Create checkout sessions

This is where `@polar-sh/nuxt` earns its keep.

Instead of manually creating checkout sessions through the SDK, you use the built-in `Checkout()` helper.

Create `server/api/checkout.post.ts`:

```typescript
export default defineEventHandler((event) => {
  const config = useRuntimeConfig();

  const handler = Checkout({
    accessToken: config.polarAccessToken,
    successUrl: config.polarSuccessUrl,
    returnUrl: 'http://localhost:3000/cancel',
    server: config.polarServer as 'sandbox' | 'production'
  });

  return handler(event);
});
```

That is the entire route. Four lines of actual logic.

The `Checkout()` helper reads query parameters from the incoming request. You pass the product ID like this:

```
POST /api/checkout?products=PRODUCT_ID&customerEmail=user@example.com
```

The helper creates a checkout session in Polar, gets the redirect URL, and sends the user there automatically.

No manual session creation. No URL building. It just works.

On the frontend, trigger it with a form post:

```typescript
const purchase = (productId: string) => {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = `/api/checkout?products=${productId}&customerEmail=${email.value}`;
  document.body.appendChild(form);
  form.submit();
};
```

I use a form submission instead of `fetch` because the checkout endpoint returns a redirect.

You want the browser to follow that redirect, not your JavaScript.

## Step 8 — Handle the success page

After checkout, Polar redirects to your success URL with a checkout ID.

You use that ID to verify the payment and show a receipt.

Create `app/pages/success.vue`:

```vue
<script setup lang="ts">
const route = useRoute();
const checkoutId = route.query.checkout_id as string;

const { data: checkout, pending, error } = useFetch(`/api/checkout-details?id=${checkoutId}`, { immediate: !!checkoutId });
</script>

<template>
  <div v-if="pending">Verifying your purchase...</div>
  <div v-else-if="error">Something went wrong. Please contact support.</div>
  <div v-else>
    <h1>Welcome aboard!</h1>
    <p>Plan: {{ checkout?.productName }}</p>
    <p>Total: {{ checkout?.amount / 100 }} {{ checkout?.currency }}</p>
    <NuxtLink to="/dashboard">Go to Dashboard</NuxtLink>
  </div>
</template>
```

On the backend, fetch checkout details from Polar:

```typescript
// server/api/checkout-details.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const checkoutId = query.id as string;

  if (!checkoutId) {
    throw createError({ statusCode: 400, message: 'Checkout ID required' });
  }

  const polar = usePolar();
  const checkout = await polar.checkouts.get({ id: checkoutId });

  return {
    id: checkout.id,
    status: checkout.status,
    amount: checkout.totalAmount,
    currency: checkout.currency,
    customerEmail: checkout.customerEmail,
    productId: checkout.productId
  };
});
```

One thing to understand here.

The checkout status on the success page is `confirmed`, not `succeeded`.

The actual payment confirmation happens asynchronously through webhooks.

Do not unlock premium features the moment the user lands on the success page.

Wait for the webhook.

I mean, you can show them a welcome message. But the real access grant should happen through the webhook handler.

## Step 9 — Set up webhooks (this is the important part)

Webhooks are how Polar tells your app that something actually happened.

A subscription started. A payment went through. A user canceled.

Without webhooks, you are just guessing.

First, you need a public URL that Polar can reach. On localhost, use ngrok:

```bash
ngrok http 3000
```

Copy the HTTPS URL and add it to your Polar dashboard under Webhooks.

Point it to `/api/webhook/polar`.

Also update your `nuxt.config.ts` so Vite allows the ngrok host:

```typescript
vite: {
  server: {
    allowedHosts: ['abc123.ngrok-free.app'];
  }
}
```

Generate a webhook secret in the Polar dashboard and add it to your `.env`.

Now create the webhook handler at `server/api/webhook/polar.post.ts`:

```typescript
export default defineEventHandler((event) => {
  const config = useRuntimeConfig();

  return Webhooks({
    webhookSecret: config.polarWebhookSecret,

    onPayload: async (payload) => {
      const { data, type } = payload as any;
      console.log(`[Polar Webhook] Signal: ${type}`);

      switch (type) {
        case 'subscription.active':
          console.log(`ACCESS GRANTED: ${data.customer?.email}`);
          // TODO: Activate user in your database
          break;

        case 'subscription.updated':
          console.log(`PLAN UPDATED: ${data.customer?.email}`);
          // TODO: Handle upgrades and downgrades
          break;

        case 'subscription.revoked':
          console.log(`ACCESS REMOVED: ${data.customer?.email}`);
          // TODO: Deactivate user
          break;

        case 'customer.state_changed':
          const hasActiveSub = (data.activeSubscriptions?.length || 0) > 0;
          console.log(`STATE SYNC: ${data.customer?.email} | Active: ${hasActiveSub}`);
          // This is the master event. Fires whenever anything changes.
          break;

        default:
          console.log(`[EVENT] ${type}`);
      }
    }
  })(event);
});
```

A few critical notes.

The `customer.state_changed` event is the one you actually care about in most cases. It fires whenever a customer's subscription state changes for any reason. Upgrade, downgrade, cancel, revoke, whatever.

Instead of handling five different events, you can watch this one and sync your database.

Second, the webhook handler must return a 200 response quickly. Polar will retry webhooks that fail or time out.

If your handler takes too long doing database writes, you might get duplicate events.

I would suggest doing lightweight updates in the handler itself. If you need heavy processing, queue a background job and return immediately.

Third, and this is the gotcha that cost me an hour:

`subscription.canceled` does NOT mean the user lost access immediately.

It means they clicked cancel and their access expires at the end of the billing period.

The actual removal happens through `subscription.revoked`.

Your access control logic needs three states: active, canceled-but-still-active, and fully revoked.

## Step 10 — Build the customer portal

Users need to manage their own subscription.

Update payment method. Cancel. Upgrade.

Polar provides a hosted customer portal that you redirect users to.

Create `server/api/portal.get.ts`:

```typescript
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);
  const polar = usePolar();

  let customerId = query.customerId as string;

  // If you only have the email, look up the customer first
  if (!customerId && query.customerEmail) {
    const customers = await polar.customers.list({
      email: query.customerEmail as string
    });
    if (customers.result.items.length > 0) {
      customerId = customers.result.items[0].id;
    }
  }

  if (!customerId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Customer ID or Email required'
    });
  }

  const customerPortalHandler = CustomerPortal({
    accessToken: config.polarAccessToken,
    server: config.polarServer as 'sandbox' | 'production',
    getCustomerId: () => Promise.resolve(customerId)
  });

  return customerPortalHandler(event);
});
```

The `CustomerPortal()` helper works like `Checkout()`. It generates a signed portal URL and redirects the user.

The portal is hosted by Polar but branded to your organization.

On the frontend:

```typescript
const manageBilling = () => {
  window.location.href = `/api/portal?customerEmail=${userEmail.value}`;
};
```

In a real app with authentication, you would pass a session token and look up the user's Polar customer ID from your database.

For testing, passing the email works fine.

## Step 11 — Build the subscription dashboard

The final piece is a dashboard that shows the user's current subscription status.

This requires looking up their subscription by email.

Create `server/api/subscription.get.ts`:

```typescript
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const email = query.email as string;

  if (!email) {
    throw createError({ statusCode: 400, message: 'Email required' });
  }

  const polar = usePolar();

  const customers = await polar.customers.list({ email });
  if (customers.result.items.length === 0) {
    return { active: false };
  }

  const customerId = customers.result.items[0].id;
  const subscriptions = await polar.subscriptions.list({ customerId });
  const sub = subscriptions.result.items[0];

  if (!sub || (sub.status !== 'active' && sub.status !== 'canceled')) {
    return { active: false };
  }

  // CRITICAL: Polar keeps status 'active' even when scheduled for cancellation
  const isToBeCancelled = sub.cancelAtPeriodEnd === true;

  return {
    active: true,
    name: sub.product?.name,
    currentPeriodEnd: sub.currentPeriodEnd,
    status: isToBeCancelled ? 'canceled' : sub.status,
    isToBeCancelled
  };
});
```

This is where that gotcha becomes visible.

When a user cancels, Polar sets `cancelAtPeriodEnd` to `true` but keeps the status as `active`.

Your dashboard needs to check both fields to show an accurate state.

On the frontend, render different UI based on the status:

```vue
<script setup lang="ts">
const email = ref('');
const { data: subscription } = useFetch(() => `/api/subscription?email=${email.value}`);
</script>

<template>
  <div v-if="subscription?.active">
    <p v-if="subscription.isToBeCancelled">Your plan ends on {{ formatDate(subscription.currentPeriodEnd) }}</p>
    <p v-else>Renewing on {{ formatDate(subscription.currentPeriodEnd) }}</p>
  </div>
  <div v-else>
    <p>No active plan</p>
    <NuxtLink to="/">View Plans</NuxtLink>
  </div>
</template>
```

This gives users clarity.

They can see if they are active, if they canceled but still have time left, or if they need to subscribe.

No confusion. No support tickets asking "did my cancel go through?"

## Step 12 — Testing your integration

All right, so you have the code written. Now verify it actually works.

1. Start your dev server: `bun run dev` or `npm run dev`
2. Start ngrok: `ngrok http 3000`
3. Update your webhook URL in the Polar dashboard to your ngrok URL
4. Add the ngrok host to `allowedHosts` in your Nuxt config
5. Visit your pricing page, pick a plan, and complete a test checkout
6. Check your terminal for webhook logs
7. Visit the dashboard and confirm the subscription shows as active

If webhooks are not firing, check three things:

- Is the webhook URL reachable from the public internet? ngrok must be running
- Does the webhook secret in your `.env` match exactly what is in the Polar dashboard?
- Is your handler returning a 200 response? Polar retries failed webhooks

I would suggest triggering a test event from the Polar dashboard first.

It is in the webhook settings page. That lets you verify your endpoint works without doing a full checkout flow.

## Production checklist

Before you flip the switch to production, run through this list:

- Switch `NUXT_POLAR_SERVER` from `sandbox` to `production`
- Generate new production access tokens and webhook secrets
- Update your success URL to your real domain
- Remove ngrok from `allowedHosts` in your Nuxt config
- Set up proper error tracking for webhook failures
- Add database persistence instead of console logging

One more thing.

Polar's webhook events can occasionally fire twice.

Make your webhook handlers idempotent.

Check if you have already processed a subscription ID or order ID before updating your database.

A simple lookup before an update prevents duplicate records.

## Common issues and fixes

Here are the three problems I hit while building this.

**Webhook verification fails silently**

Make sure your `NUXT_POLAR_WEBHOOK_SECRET` matches the one in the Polar dashboard exactly.

No extra spaces. No newline characters.

Copy-paste can be tricky here.

**Checkout redirect fails with "invalid redirect URL"**

Polar validates redirect URLs strictly.

The domain, protocol, and path must all match what you registered.

`http://localhost:3000/success` is different from `http://127.0.0.1:3000/success`.

Register both if you switch between them.

**Subscription shows active after user canceled**

This is by design.

Polar keeps subscriptions active until the period ends.

Check `cancelAtPeriodEnd` to determine the real state.

I covered this in Step 11, but it is worth repeating.

It is the most confusing part of the whole integration.

## Wrapping up

At this point, you should have a working Nuxt application that:

- Pulls products live from Polar
- Handles checkout redirects
- Verifies payments on a success page
- Receives and processes webhook events
- Shows subscription status in a dashboard
- Links to a hosted customer portal

That is a solid foundation for any SaaS.

You can add authentication, database persistence, team plans, usage-based billing, or whatever else your product needs.

But the core payment loop, product display, and subscription management are all wired up.

Now, Polar is by far the easiest payment processor I have integrated with Nuxt.

The `@polar-sh/nuxt` module removes a ton of boilerplate.

And the fact that they give you a sandbox environment with zero approval process means you can build the entire billing flow before you even have a business entity registered.

If you want to see the full project code, everything I covered here comes from a [working implementation on GitHub](https://github.com/alwaisy/nuxt-polar-2026).

The patterns are production-ready, though you would obviously add proper auth and a real database before shipping.

Got questions?

The [Polar Discord](https://dub.sh/polar-discord) is pretty active.

Or just drop a comment below and I will do my best to help you out.

Happy building.
