import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Search customer by phone
router.get('/', async (req: Request, res: Response) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required',
      });
    }

    const customer = await prisma.customer.findUnique({
      where: { phone: phone as string },
    });

    res.json({
      success: true,
      customer: customer || null,
      isExisting: !!customer,
    });
  } catch (error) {
    console.error('Search customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search customer',
    });
  }
});

// Create new customer
router.post('/', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, phone, email, isMember } = req.body;

    if (!firstName || !phone) {
      return res.status(400).json({
        success: false,
        error: 'First name and phone are required',
      });
    }

    // Check if customer already exists
    const existing = await prisma.customer.findUnique({
      where: { phone },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Customer with this phone already exists',
      });
    }

    const customer = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        phone,
        email,
        isMember: isMember || false,
      },
    });

    res.json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create customer',
    });
  }
});

export default router;
