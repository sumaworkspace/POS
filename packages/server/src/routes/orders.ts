import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Helper function to calculate discount
function calculateDiscount(subtotal: number, isExisting: boolean, isMember: boolean): number {
  if (isExisting) {
    // 5% discount for existing customers
    return subtotal * 0.05;
  } else if (isMember) {
    // 10% membership discount for new members
    return subtotal * 0.10;
  }
  return 0;
}

// Helper function to calculate tax (Indian GST)
function calculateTax(items: any[], products: any[]): number {
  let totalTax = 0;
  
  items.forEach((item) => {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      const itemTotal = item.price * item.quantity;
      const taxAmount = (itemTotal * product.taxRate) / 100;
      totalTax += taxAmount;
    }
  });
  
  return totalTax;
}

// Mock email function
function sendOrderEmail(customerEmail: string | undefined, order: any) {
  if (!customerEmail) {
    console.log('📧 No customer email provided, skipping email notification');
    return;
  }
  
  console.log('📧 Sending order confirmation email to:', customerEmail);
  console.log('📧 Order ID:', order.id);
  console.log('📧 Total:', `₹${order.total.toFixed(2)}`);
  console.log('📧 Payment Method:', order.paymentMethod);
  console.log('📧 Items:', JSON.parse(order.items).length);
}

// Mock payment gateway
function processPayment(paymentMethod: string, amount: number): { success: boolean; transactionId?: string; error?: string } {
  // Simulate payment processing
  const success = Math.random() > 0.1; // 90% success rate
  
  if (success) {
    return {
      success: true,
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    };
  } else {
    return {
      success: false,
      error: 'Payment declined by gateway',
    };
  }
}

// Create order
router.post('/', async (req: Request, res: Response) => {
  try {
    const { customerId, items, paymentMethod, customerEmail } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Items are required',
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Payment method is required',
      });
    }

    // Get customer info if customerId provided
    let customer = null;
    let isExisting = false;
    let isMember = false;

    if (customerId) {
      customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (customer) {
        isExisting = true;
        isMember = customer.isMember;
      }
    }

    // Get products to calculate totals
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    // Calculate subtotal
    const subtotal = items.reduce((total: number, item: any) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Calculate discount
    const discount = calculateDiscount(subtotal, isExisting, isMember);

    // Calculate tax on discounted amount
    const discountedSubtotal = subtotal - discount;
    const tax = calculateTax(items, products);

    // Calculate total
    const total = discountedSubtotal + tax;

    // Process payment
    const paymentResult = processPayment(paymentMethod, total);

    if (!paymentResult.success) {
      return res.status(402).json({
        success: false,
        error: paymentResult.error || 'Payment failed',
      });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        customerId: customerId || null,
        items: JSON.stringify(items),
        subtotal,
        tax,
        discount,
        total,
        paymentMethod,
        status: 'completed',
      },
      include: {
        customer: true,
      },
    });

    // Send email notification
    sendOrderEmail(customerEmail || customer?.email, order);

    res.json({
      success: true,
      order,
      transactionId: paymentResult.transactionId,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order',
    });
  }
});

// Get all orders
router.get('/', async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
    });
  }
});

// Get single order
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order',
    });
  }
});

export default router;
