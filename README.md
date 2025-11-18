# CRUD Scaffold - Node.js + Express + MongoDB

A ready-to-use API scaffold for building CRUD applications with Node.js, Express, and MongoDB.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or connection string)

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/crud-scaffold
   NODE_ENV=development
   ```

3. **Start MongoDB:**
   Make sure MongoDB is running locally. If using Homebrew on macOS:
   ```bash
   brew services start mongodb-community
   ```
   
   Or if MongoDB is installed differently:
   ```bash
   mongod
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   Or for production:
   ```bash
   npm start
   ```

The server will start on `http://localhost:3000` (or the PORT specified in your `.env` file).

## Project Structure

```
crud-scaffold/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   └── itemController.js    # Item CRUD controller
├── models/
│   └── Item.js              # Item Mongoose model with custom static methods
├── routes/
│   └── itemRoutes.js        # Item Express routes
├── server.js                 # Main server file with middleware setup
├── nodemon.json              # Nodemon configuration for development
├── package.json
└── README.md
```

## API Endpoints

The scaffold includes CRUD endpoints for an "Item" resource:

- `GET /api/items` - Get all active items
- `GET /api/items/:id` - Get single item by ID
- `POST /api/items` - Create new item
- `PATCH /api/items/:id` - Update item (partial update)
- `DELETE /api/items/:id` - Soft delete item (sets status to "deleted")

### Response Format

All responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "count": 1,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error message"
}
```

### Item Model Schema

```javascript
{
  name: String (required),
  description: String (optional),
  status: String (enum: "active", "inactive", "deleted", default: "active"),
  deletedAt: Date (default: null),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

### Example Requests

**Create an item:**
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Item", "description": "This is a test"}'
```

**Get all items (only active items are returned):**
```bash
curl http://localhost:3000/api/items
```

**Get single item:**
```bash
curl http://localhost:3000/api/items/<item-id>
```

**Update an item (partial update with PATCH):**
```bash
curl -X PATCH http://localhost:3000/api/items/<item-id> \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Item", "description": "Updated description"}'
```

**Delete an item (soft delete):**
```bash
curl -X DELETE http://localhost:3000/api/items/<item-id>
```

**Root endpoint:**
```bash
curl http://localhost:3000/
```

## Features

- **Soft Deletes**: Items are not permanently deleted, but marked with `status: "deleted"` and a `deletedAt` timestamp
- **Custom Model Methods**: The Item model includes static methods (`createItem`, `updateItem`, `deleteItem`) for business logic encapsulation
- **Automatic Filtering**: `getAllItems` automatically excludes deleted items
- **Error Handling**: Comprehensive error handling middleware with consistent error responses
- **CORS Enabled**: Cross-origin requests are enabled for API access
- **Request Logging**: Morgan middleware logs all HTTP requests in development mode

## Creating New Resources

To create a new CRUD resource, follow this pattern:

1. **Create a model** in `models/YourModel.js` with schema and static methods
2. **Create a controller** in `controllers/yourController.js` with CRUD functions
3. **Create routes** in `routes/yourRoutes.js` mapping HTTP methods to controller functions
4. **Import and use routes** in `server.js`:
   ```javascript
   const yourRoutes = require('./routes/yourRoutes');
   app.use('/api/your-resource', yourRoutes);
   ```

## Development

- The project uses `nodemon` for automatic server restarts during development
- Nodemon watches: `server.js`, `config/`, `controllers/`, `models/`, `routes/`, and `middleware/` directories
- MongoDB connection is handled automatically on server start
- Error handling middleware is included for consistent error responses
- Development mode shows detailed error stack traces in responses

