import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import Stripe from 'stripe';

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Google Auth Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'mock_google_id');

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2026-03-25.dahlia',
});

// For Stripe Webhooks, we need raw body parsing
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(cors());
app.use(express.json());

// Auth: Signup
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username: name }] }
    });

    if (existing) {
      return res.status(400).json({ error: 'User with this email or username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username: name,
        email,
        password: hashedPassword,
        role: role || 'STUDENT'
      }
    });

    // Create a log entry
    await prisma.log.create({
      data: { message: `New node registered: ${name}`, level: 'SUCCESS', userId: user.id }
    });

    const { password: _, ...userWithoutPassword } = user;
    return res.json({ user: userWithoutPassword });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to complete registration' });
  }
});

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  try {
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await prisma.log.create({
      data: { message: `Node Connected: ${user.username}`, level: 'INFO', userId: user.id }
    });

    const { password: _, ...userWithoutPassword } = user;
    return res.json({ user: userWithoutPassword });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to authenticate' });
  }
});

// Logs
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await prisma.log.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    return res.json(logs.reverse()); // Send chronologically but limited to newest 20
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

app.post('/api/logs', async (req, res) => {
  const { message, level, userId } = req.body;
  try {
    const log = await prisma.log.create({
      data: { message, level: level || 'INFO', userId }
    });
    return res.json(log);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create log' });
  }
});

app.get('/api/metadata/:assetId', async (req, res) => {
  const { assetId } = req.params;

  // Mock data for Jarvis context always returned
  return res.json({
    assetId,
    layers: [
      { depthLevel: 0, partName: 'Exterior Shell', description: 'The outermost casing providing physical protection.' },
      { depthLevel: 50, partName: 'Internal Circuitry', description: 'The main motherboard with routing capabilities.' },
      { depthLevel: 100, partName: 'Core Engine', description: 'The combustion or processing core.' }
    ]
  });
});

// --------------------------------------------------------------------------
// OAUTH: GOOGLE
// --------------------------------------------------------------------------
app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'No credential provided' });

  try {
    let payload;
    // If not using real keys yet, mock verification
    if (!process.env.GOOGLE_CLIENT_ID) {
       console.log("Mocking Google Verification...");
       // Mock payload (in production, verify the token)
       const decoded = JSON.parse(Buffer.from(credential.split('.')[1], 'base64').toString());
       payload = { email: decoded.email || 'mock@gmail.com', name: decoded.name || 'Mock User' };
    } else {
       const ticket = await googleClient.verifyIdToken({
         idToken: credential,
         audience: process.env.GOOGLE_CLIENT_ID,
       });
       payload = ticket.getPayload();
    }

    if (!payload?.email) throw new Error("Invalid token payload");

    let user = await prisma.user.findFirst({ where: { email: payload.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          username: payload.name || payload.email.split('@')[0],
          email: payload.email,
          role: 'student', // default
          subscriptionStatus: 'inactive',
        }
      });
      await prisma.log.create({
        data: { message: `Google SSO registration: ${user.username}`, level: 'SUCCESS', userId: user.id }
      });
    } else {
      await prisma.log.create({
        data: { message: `Google SSO Login: ${user.username}`, level: 'INFO', userId: user.id }
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    return res.json({ user: userWithoutPassword });

  } catch (err: any) {
    console.error("Google Auth Error:", err);
    return res.status(500).json({ error: 'Google SSO Authentication failed' });
  }
});

// --------------------------------------------------------------------------
// STRIPE SUBSCRIPTIONS
// --------------------------------------------------------------------------
app.post('/api/payments/create-checkout-session', async (req, res) => {
  const { userId, email } = req.body;
  if (!userId || !email) return res.status(400).json({ error: 'Missing user context' });

  try {
    // If no real stripe key is set, simulate a successful payment locally
    if (!process.env.STRIPE_SECRET_KEY) {
        await prisma.user.update({
           where: { id: userId },
           data: { subscriptionStatus: 'active' }
        });
        return res.json({ url: '/labs?mockPaymentSuccess=true' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      client_reference_id: userId,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID || 'price_mock20', // Add your real price ID to .env
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/labs?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscription`,
    });

    res.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Checkout Error:", err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

app.post('/api/payments/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (endpointSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      // For local testing without webhooks
      event = JSON.parse(req.body.toString());
    }
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const userId = session.client_reference_id;
    const customerId = session.customer as string;

    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { subscriptionStatus: 'active', stripeCustomerId: customerId }
      });
      console.log(`User ${userId} subscription activated!`);
    }
  }

  res.json({ received: true });
});

app.listen(PORT, () => {
  console.log(`Irma Backend running on http://localhost:${PORT}`);
});
