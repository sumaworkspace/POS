# Manual Testing Guide - POS System

**Date**: October 19, 2025  
**Tester**: _____________  
**Version**: 1.0.0

## Prerequisites

✅ Backend server running on `http://localhost:4000`  
✅ Frontend server running on `http://localhost:5173`  
✅ Database seeded with sample data

---

## Test Flow 1: Login & Authentication

### Test Case 1.1: Successful Login
**Objective**: Verify user can login with valid credentials

**Steps**:
1. Navigate to `http://localhost:5173/`
2. You should see the Login page
3. Enter username: `admin`
4. Enter password: `admin123`
5. Click "Login" button

**Expected Results**:
- ✅ Success toast message appears
- ✅ Redirected to Home page
- ✅ Welcome message displays
- ✅ Navigation menu appears (Home, Catalog, Cart, Orders)

**Status**: ⬜ Pass ⬜ Fail  
**Notes**: _______________________________________________

---

### Test Case 1.2: Invalid Login
**Objective**: Verify error handling for invalid credentials

**Steps**:
1. Navigate to login page
2. Enter username: `wronguser`
3. Enter password: `wrongpass`
4. Click "Login" button

**Expected Results**:
- ✅ Error toast message appears: "Invalid credentials"
- ✅ User remains on login page
- ✅ Form is still accessible

**Status**: ⬜ Pass ⬜ Fail  
**Notes**: _______________________________________________

---

### Test Case 1.3: Empty Credentials
**Objective**: Verify validation for empty fields

**Steps**:
1. Navigate to login page
2. Leave username and password empty
3. Click "Login" button

**Expected Results**:
- ✅ Error message appears
- ✅ Form validation prevents submission

**Status**: ⬜ Pass ⬜ Fail  
**Notes**: _______________________________________________

---

## Test Flow 2: Product Catalog

### Test Case 2.1: View Catalog
**Objective**: Verify product catalog displays correctly

**Steps**:
1. Login successfully
2. Click "Catalog" in navigation
3. Observe the product grid

**Expected Results**:
- ✅ All products display with images
- ✅ Product names are visible
- ✅ Prices display in correct format (₹X,XXX.XX)
- ✅ Category labels appear
- ✅ "Add to Cart" buttons are visible
- ✅ Stock information displays

**Status**: ⬜ Pass ⬜ Fail  
**Notes**: _______________________________________________

---

### Test Case 2.2: Filter by Category
**Objective**: Verify category filtering works

**Steps**:
1. On Catalog page, select a category from dropdown
2. Observe filtered results

**Expected Results**:
- ✅ Only products from selected category display
- ✅ Product count updates
- ✅ Can switch between categories smoothly

**Status**: ⬜ Pass ⬜ Fail  
**Notes**: _______________________________________________

---

### Test Case 2.3: Search Products
**Objective**: Verify product search functionality

**Steps**:
1. On Catalog page, type "Laptop" in search box
2. Observe search results

**Expected Results**:
- ✅ Only matching products display
- ✅ Search is case-insensitive
- ✅ Can clear search

**Status**: ⬜ Pass ⬜ Fail  
**Notes**: _______________________________________________

---

## Test Flow 3: Shopping Cart

### Test Case 3.1: Add to Cart
**Objective**: Verify adding products to cart

**Steps**:
1. On Catalog page, click "Add to Cart" on a product
2. Check cart badge in navigation

**Expected Results**:
- ✅ Success toast appears: "Added to cart"
- ✅ Cart badge shows count (1, 2, 3...)
- ✅ Cart badge shows "9+" when count > 9

**Status**: ⬜ Pass ⬜ Fail  
**Notes**: _______________________________________________

---

### Test Case 3.2: View Cart
**Objective**: Verify cart displays correctly

**Steps**:
1. Add 2-3 products to cart
2. Click "Cart" in navigation

**Expected Results**:
- ✅ All cart items display
- ✅ Product images, names, prices show
- ✅ Quantity controls (+ / -) appear
- ✅ Remove button available
- ✅ Subtotal displays correctly
- ✅ Tax (GST 12%) calculates correctly
- ✅ Total amount is accurate

**Status**: ⬜ Pass ⬜ Fail  
**Notes**: _______________________________________________

---

### Test Case 3.3: Update Quantity
**Objective**: Verify quantity controls work

**Steps**:
1. In cart, click "+" button to increase quantity
2. Click "-" button to decrease quantity
3. Try decreasing to 0

**Expected Results**:
- ✅ Quantity increases/decreases
- ✅ Subtotal updates automatically
- ✅ Tax updates automatically
- ✅ Total updates automatically
- ✅ When quantity reaches 0, item is removed
- ✅ Toast confirms removal

**Status**: ⬜ Pass ⬜ Fail  
**Notes**: _______________________________________________

---

### Test Case 3.4: Remove Item
**Objective**: Verify remove button works

**Steps**:
1. In cart, click "Remove" button on an item

**Expected Results**:
- ✅ Item disappears immediately
- ✅ Cart totals update
- ✅ Cart badge count decreases
- ✅ If cart becomes empty, shows "Your cart is empty"

**Status**: ⬜ Pass ⬜ Fail  
**Notes**: _______________________________________________

---

### Test Case 3.5: Clear Cart
**Objective**: Verify clear cart functionality

**Steps**:
1. Add multiple items to cart
2. Click "Clear Cart" button
3. Confirm in modal

**Expected Results**:
- ✅ Confirmation modal appears
- ✅ Modal shows "Are you sure?" message
- ✅ After confirming, cart is empty
- ✅ Toast confirms: "Cart cleared"
- ✅ Can cancel without clearing

**Status**: ⬜ Pass ⬜ Fail  
**Notes**: _______________________________________________

---

## Test Flow 4: Customer Management

### Test Case 4.1: Search Existing Customer
**Objective**: Verify customer lookup works

**Steps**:
1. Add items to cart
2. In cart, enter phone: `9876543210` (sample customer)
3. Click "Search" button

**Expected Results**:
- ✅ Customer details appear
- ✅ Shows name: "John Doe"
- ✅ Shows membership status
- ✅ Success toast: "Customer found!"
- ✅ If member, discount applies automatically
- ✅ Discount shows in cart summary

**Status**: ⬜ Pass ⬜ Fail  
**Notes**: _______________________________________________

---

### Test Case 4.2: Customer Not Found
**Objective**: Verify handling when customer doesn't exist

**Steps**:
1. In cart, enter phone: `1234567890` (non-existent)
2. Click "Search" button

**Expected Results**:
- ✅ Info toast: "Customer not found. Please register."
- ✅ Registration form appears
- ✅ Phone number pre-filled
- ✅ Can enter first name, last name, email
- ✅ Can select membership checkbox

**Status**: ⬜ Pass ⬜ Fail  
**Notes**: _______________________________________________

---

### Test Case 4.3: Register New Customer
**Objective**: Verify customer registration

**Steps**:
1. Search for non-existent phone number
2. Fill registration form:
   - First Name: "Test"
   - Last Name: "User"
   - Email: "test@example.com"
   - Check "Member" checkbox
3. Click "Register" button

**Expected Results**:
- ✅ Success toast: "Customer registered successfully!"
- ✅ Customer details appear
- ✅ Member discount (10%) applies
- ✅ Discount shows in cart summary
- ✅ Can proceed to checkout

**Status**: ⬜ Pass ⬜ Fail  
**Notes**: _______________________________________________

---

### Test Case 4.4: Phone Number Validation
**Objective**: Verify phone validation

**Steps**:
1. Try searching with invalid phone numbers:
   - `123` (too short)
   - `abcdefghij` (letters)
   - `12345678901` (too long)

**Expected Results**:
- ✅ Error toast appears
- ✅ Shows "Please enter a valid 10-digit phone number"
- ✅ Search doesn't proceed

**Status**: ⬜ Pass ⬜ Fail  
**Notes**: _______________________________________________

---

## Test Flow 5: Checkout Process

### Test Case 5.1: Checkout Validation
**Objective**: Verify checkout requires customer

**Steps**:
1. Add items to cart
2. Without searching for customer, click "Proceed to Checkout"

**Expected Results**:
- ✅ Button is disabled OR
- ✅ Warning toast: "Please search and select a customer first"
- ✅ Cannot proceed without customer

**Status**: ⬜ Pass ⬜ Fail  
**Notes**: _______________________________________________

---

### Test Case 5.2: Successful Checkout
**Objective**: Verify complete checkout flow

**Steps**:
1. Add products to cart
2. Search and select customer
3. Click "Proceed to Checkout"
4. Review order details on checkout page
5. Click "Place Order" button

**Expected Results**:
- ✅ Redirected to checkout page
- ✅ All order details display correctly
- ✅ Customer info shows
- ✅ Product list with quantities
- ✅ Price breakdown (subtotal, discount, tax, total)
- ✅ After placing order, success confirmation
- ✅ Redirected to order confirmation page
- ✅ Order ID displayed

**Status**: ⬜ Pass ⬜ Fail  
**Notes**: _______________________________________________

---

### Test Case 5.3: Tax Calculation Accuracy
**Objective**: Verify tax calculation is correct

**Test Data**:
- Product 1: ₹1,000 x 1 = ₹1,000
- Product 2: ₹500 x 2 = ₹1,000
- Subtotal: ₹2,000

**Expected Calculations**:
- Non-member:
  - Discount: ₹100 (5% existing customer)
  - After discount: ₹1,900
  - Tax (12%): ₹228
  - Total: ₹2,128

- Member:
  - Discount: ₹200 (10% member)
  - After discount: ₹1,800
  - Tax (12%): ₹216
  - Total: ₹2,016

**Status**: ⬜ Pass ⬜ Fail  
**Notes**: _______________________________________________

---

## Test Flow 6: Order History

### Test Case 6.1: View Orders
**Objective**: Verify order history displays

**Steps**:
1. After placing an order, click "Orders" in navigation
2. View order list

**Expected Results**:
- ✅ All orders display in reverse chronological order
- ✅ Each order shows: Order ID, Date, Customer, Total
- ✅ Status displays (Pending/Completed)
- ✅ Can click to view order details

**Status**: ⬜ Pass ⬜ Fail  
**Notes**: _______________________________________________

---

### Test Case 6.2: Order Details
**Objective**: Verify order details page

**Steps**:
1. On Orders page, click an order to view details

**Expected Results**:
- ✅ Full order details display
- ✅ Customer information
- ✅ Product list with quantities and prices
- ✅ Discount applied (if any)
- ✅ Tax calculation
- ✅ Total amount
- ✅ Order date and time

**Status**: ⬜ Pass ⬜ Fail  
**Notes**: _______________________________________________

---

## Test Flow 7: UI/UX & Toast Notifications

### Test Case 7.1: Toast Display
**Objective**: Verify toast notifications work

**Check all toast types**:
- ✅ Success (green): "Added to cart", "Order placed"
- ✅ Error (red): "Invalid credentials", "Customer not found"
- ✅ Info (blue): "Customer not found. Please register."
- ✅ Warning (yellow): "Please select customer"

**Toast Behavior**:
- ✅ Appears in top-right corner
- ✅ Auto-dismisses after 3 seconds
- ✅ Can manually close with X button
- ✅ Multiple toasts stack properly

**Status**: ⬜ Pass ⬜ Fail  
**Notes**: _______________________________________________

---

### Test Case 7.2: Responsive Design
**Objective**: Verify UI works on different screen sizes

**Steps**:
1. Resize browser window
2. Test on mobile viewport (375px)
3. Test on tablet viewport (768px)
4. Test on desktop viewport (1920px)

**Expected Results**:
- ✅ Layout adapts to screen size
- ✅ Navigation is accessible
- ✅ Buttons are clickable
- ✅ Text is readable
- ✅ Images scale properly

**Status**: ⬜ Pass ⬜ Fail  
**Notes**: _______________________________________________

---

### Test Case 7.3: Loading States
**Objective**: Verify loading indicators

**Check loading states**:
- ✅ Login button shows loading during authentication
- ✅ Search button shows loading during customer search
- ✅ Place Order button shows loading during checkout
- ✅ Buttons disable during loading
- ✅ Cannot click again while loading

**Status**: ⬜ Pass ⬜ Fail  
**Notes**: _______________________________________________

---

## Test Flow 8: Data Persistence

### Test Case 8.1: Cart Persistence
**Objective**: Verify cart persists on page refresh

**Steps**:
1. Add 3 items to cart
2. Refresh the page (F5)
3. Navigate to cart

**Expected Results**:
- ✅ All cart items still present
- ✅ Quantities preserved
- ✅ Totals recalculate correctly

**Status**: ⬜ Pass ⬜ Fail  
**Notes**: _______________________________________________

---

### Test Case 8.2: Session Persistence
**Objective**: Verify login session persists

**Steps**:
1. Login successfully
2. Refresh the page
3. Close and reopen browser
4. Navigate to `http://localhost:5173/`

**Expected Results**:
- ✅ After refresh, still logged in
- ✅ After closing/reopening (if token not expired), still logged in
- ✅ Can access protected pages

**Status**: ⬜ Pass ⬜ Fail  
**Notes**: _______________________________________________

---

## Test Flow 9: Error Handling

### Test Case 9.1: Backend Offline
**Objective**: Verify handling when backend is down

**Steps**:
1. Stop the backend server
2. Try to login or search products

**Expected Results**:
- ✅ Error toast appears
- ✅ User-friendly error message
- ✅ App doesn't crash
- ✅ Can retry after backend restarts

**Status**: ⬜ Pass ⬜ Fail  
**Notes**: _______________________________________________

---

### Test Case 9.2: Network Errors
**Objective**: Verify handling of network issues

**Steps**:
1. Open browser DevTools (F12)
2. Go to Network tab → Throttling → Offline
3. Try any action

**Expected Results**:
- ✅ Error message displays
- ✅ App remains functional when back online
- ✅ No data loss

**Status**: ⬜ Pass ⬜ Fail  
**Notes**: _______________________________________________

---

## Test Summary

| Test Flow | Total Tests | Passed | Failed | Notes |
|-----------|-------------|--------|--------|-------|
| 1. Login & Auth | 3 | ___ | ___ | |
| 2. Product Catalog | 3 | ___ | ___ | |
| 3. Shopping Cart | 5 | ___ | ___ | |
| 4. Customer Mgmt | 4 | ___ | ___ | |
| 5. Checkout | 3 | ___ | ___ | |
| 6. Order History | 2 | ___ | ___ | |
| 7. UI/UX & Toasts | 3 | ___ | ___ | |
| 8. Data Persistence | 2 | ___ | ___ | |
| 9. Error Handling | 2 | ___ | ___ | |
| **TOTAL** | **27** | **___** | **___** | |

---

## Critical Issues Found

### High Priority
1. ____________________________________________
2. ____________________________________________
3. ____________________________________________

### Medium Priority
1. ____________________________________________
2. ____________________________________________

### Low Priority / Enhancements
1. ____________________________________________
2. ____________________________________________

---

## Tester Sign-off

**Name**: _______________  
**Date**: _______________  
**Signature**: _______________

**Overall Assessment**: ⬜ Ready for Production ⬜ Needs Fixes ⬜ Major Issues

**Comments**: 
_____________________________________________________________________
_____________________________________________________________________
_____________________________________________________________________
