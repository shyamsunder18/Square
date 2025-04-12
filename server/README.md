
# Square App Backend

This is the backend server for the Square e-commerce application.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a .env file with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

3. Start the server:
   ```
   npm start
   ```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user

### Products
- GET /api/products - Get all products
- GET /api/products?category=goods - Get products by category
- GET /api/products/:id - Get product by ID
- POST /api/products - Add a new product
- PUT /api/products/:id - Update a product
- DELETE /api/products/:id - Delete a product
- GET /api/products/seller/:sellerId - Get products by seller ID

### Cart
- GET /api/cart - Get user's cart
- POST /api/cart/add - Add item to cart
- PUT /api/cart/update/:itemId - Update item quantity
- DELETE /api/cart/remove/:itemId - Remove item from cart
- DELETE /api/cart/clear - Clear cart

### Orders
- GET /api/orders - Get user's orders
- GET /api/orders/:id - Get order by ID
- POST /api/orders - Create a new order
- GET /api/orders/sales/seller - Get seller's sales
- PUT /api/orders/:id/status - Update order status

### Reviews
- POST /api/reviews/:productId - Add a review to a product
- GET /api/reviews/product/:productId - Get reviews for a product

## Models

- User - User information and authentication
- Product - Product information including reviews
- Cart - User shopping cart
- Order - User orders
- Review (embedded in Product) - Product reviews
