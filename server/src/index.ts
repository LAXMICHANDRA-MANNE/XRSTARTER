import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });
const app = express();
const PORT = process.env.PORT || 4000;

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

app.listen(PORT, () => {
  console.log(`Irma Backend running on http://localhost:${PORT}`);
});
