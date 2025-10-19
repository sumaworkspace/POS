# API Endpoints Testing Guide

Base URL: `http://localhost:4000`

## Authentication

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "username": "admin",
    "role": "salesperson"
  }
}
```

## Categories & Products

### Get All Categories
```bash
curl http://localhost:4000/api/categories
```

### Get All Products
```bash
curl http://localhost:4000/api/products
```

### Get Products by Category
```bash
curl "http://localhost:4000/api/products?categoryId=CATEGORY_ID"
```

### Get Single Product
```bash
curl http://localhost:4000/api/products/PRODUCT_ID
```

## Customers

### Search Customer by Phone
```bash
curl "http://localhost:4000/api/customers?phone=9876543210"
```

**Response (Existing Customer):**
```json
{
  "success": true,
  "customer": {
    "id": "...",
    "firstName": "Anita",
    "lastName": "Kumar",
    "phone": "9876543210",
    "email": "anita.kumar@example.com",
    "isMember": true
  },
  "isExisting": true
}
```

**Response (New Customer):**
```json
{
  "success": true,
  "customer": null,
  "isExisting": false
}
```

### Create New Customer
```bash
curl -X POST http://localhost:4000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "phone": "9999999999",
    "email": "john@example.com",
    "isMember": false
  }'
```

## Orders

### Create Order
```bash
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUSTOMER_ID",
    "items": [
      {
        "productId": "PRODUCT_ID",
        "quantity": 1,
        "price": 499
      }
    ],
    "paymentMethod": "card",
    "customerEmail": "customer@example.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "...",
    "subtotal": 499,
    "discount": 24.95,
    "tax": 23.70,
    "total": 497.75,
    "paymentMethod": "card",
    "status": "completed"
  },
  "transactionId": "TXN-..."
}
```

### Get All Orders
```bash
curl http://localhost:4000/api/orders
```

### Get Single Order
```bash
curl http://localhost:4000/api/orders/ORDER_ID
```

## Business Logic

### Discounts
- **Existing Customer**: 5% discount on subtotal
- **New Member**: 10% membership discount
- **New Non-Member**: No discount

### Tax Calculation (Indian GST)
- Products have individual tax rates (5%, 12%, etc.)
- Tax is calculated on discounted amount
- Tax amount displayed separately

### Payment Methods
- `cash` - Cash payment
- `card` - Credit/Debit card
- `upi` - UPI payment
- `netbanking` - Net banking

### Payment Gateway (Mock)
- 90% success rate (simulated)
- Returns transaction ID on success
- May return "Payment declined" error

### Email Notifications
- Sent to console (development mode)
- Requires customer email
- Includes order ID, total, items count

## Sample Test Credentials

**User:**
- Username: `admin`
- Password: `password`

**Sample Customers:**
- Phone: `9876543210` (Anita Kumar, existing member)
- Phone: `9876543211` (Rajesh Sharma, existing member)
- Phone: `9876543212` (Priya Patel, non-member)

## Testing Flow

1. **Login** to get authentication token
2. **Get Categories** to see product categories
3. **Get Products** to browse catalog
4. **Search Customer** by phone (or create new)
5. **Create Order** with customer, items, payment method
6. **Get Orders** to see order history

## Error Responses

All endpoints return errors in this format:
```json
{
  "success": false,
  "error": "Error message here"
}
```

Common status codes:
- `400` - Bad request (missing required fields)
- `401` - Unauthorized (invalid credentials)
- `402` - Payment required (payment failed)
- `404` - Not found
- `409` - Conflict (duplicate customer)
- `500` - Server error
