import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a salesperson user
  const hashedPassword = await bcrypt.hash('password', 10);
  const user = await prisma.user.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      role: 'salesperson',
    },
  });
  console.log('✅ Created user:', user.username);

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Women' } }),
    prisma.category.create({ data: { name: 'Men' } }),
    prisma.category.create({ data: { name: 'Summer Wear' } }),
    prisma.category.create({ data: { name: 'Winter Wear' } }),
  ]);
  console.log('✅ Created categories:', categories.map(c => c.name).join(', '));

  // Create products
  const products = await Promise.all([
    // Women's products
    prisma.product.create({
      data: {
        name: 'Silk Scarf',
        description: 'Elegant silk scarf in various colors',
        price: 499,
        taxRate: 5,
        sku: 'SCARF-001',
        categoryId: categories[0].id,
        image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Designer Dress',
        description: 'Beautiful floral summer dress',
        price: 2999,
        taxRate: 12,
        sku: 'DRESS-001',
        categoryId: categories[0].id,
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Women\'s Blazer',
        description: 'Professional blazer for office wear',
        price: 3999,
        taxRate: 12,
        sku: 'BLAZER-W-001',
        categoryId: categories[0].id,
        image: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400',
      },
    }),

    // Men's products
    prisma.product.create({
      data: {
        name: 'Cotton Shirt',
        description: 'Comfortable cotton shirt',
        price: 1299,
        taxRate: 5,
        sku: 'SHIRT-M-001',
        categoryId: categories[1].id,
        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Denim Jeans',
        description: 'Classic blue denim jeans',
        price: 1999,
        taxRate: 12,
        sku: 'JEANS-M-001',
        categoryId: categories[1].id,
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Men\'s Blazer',
        description: 'Formal blazer for special occasions',
        price: 4999,
        taxRate: 12,
        sku: 'BLAZER-M-001',
        categoryId: categories[1].id,
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400',
      },
    }),

    // Summer Wear
    prisma.product.create({
      data: {
        name: 'Summer T-Shirt',
        description: 'Lightweight cotton t-shirt',
        price: 599,
        taxRate: 5,
        sku: 'TSHIRT-SUM-001',
        categoryId: categories[2].id,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Beach Shorts',
        description: 'Comfortable shorts for beach',
        price: 899,
        taxRate: 5,
        sku: 'SHORTS-001',
        categoryId: categories[2].id,
        image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Sun Hat',
        description: 'Wide-brim sun protection hat',
        price: 699,
        taxRate: 5,
        sku: 'HAT-001',
        categoryId: categories[2].id,
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400',
      },
    }),

    // Winter Wear
    prisma.product.create({
      data: {
        name: 'Wool Sweater',
        description: 'Warm wool sweater',
        price: 2499,
        taxRate: 12,
        sku: 'SWEATER-001',
        categoryId: categories[3].id,
        image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Winter Jacket',
        description: 'Heavy winter jacket with hood',
        price: 4999,
        taxRate: 12,
        sku: 'JACKET-001',
        categoryId: categories[3].id,
        image: 'https://images.unsplash.com/photo-1548126032-79d6f8a8567e?w=400',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Woolen Scarf',
        description: 'Cozy woolen scarf',
        price: 799,
        taxRate: 5,
        sku: 'SCARF-W-001',
        categoryId: categories[3].id,
        image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=400',
      },
    }),
  ]);
  console.log('✅ Created products:', products.length);

  // Create sample customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        firstName: 'Anita',
        lastName: 'Kumar',
        phone: '9876543210',
        email: 'anita.kumar@example.com',
        isMember: true,
      },
    }),
    prisma.customer.create({
      data: {
        firstName: 'Rajesh',
        lastName: 'Sharma',
        phone: '9876543211',
        email: 'rajesh.sharma@example.com',
        isMember: true,
      },
    }),
    prisma.customer.create({
      data: {
        firstName: 'Priya',
        lastName: 'Patel',
        phone: '9876543212',
        email: 'priya.patel@example.com',
        isMember: false,
      },
    }),
  ]);
  console.log('✅ Created customers:', customers.length);

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

