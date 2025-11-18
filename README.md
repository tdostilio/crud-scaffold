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
│   └── itemController.js    # Example CRUD controller
├── models/
│   └── Item.js              # Example Mongoose model
├── routes/
│   └── itemRoutes.js        # Example Express routes
├── server.js                 # Main server file
├── package.json
└── README.md
```

## API Endpoints

The scaffold includes example CRUD endpoints for an "Item" resource:

- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get single item
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Example Requests

**Create an item:**
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Item", "description": "This is a test"}'
```

**Get all items:**
```bash
curl http://localhost:3000/api/items
```

**Get single item:**
```bash
curl http://localhost:3000/api/items/<item-id>
```

**Update an item:**
```bash
curl -X PUT http://localhost:3000/api/items/<item-id> \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Item", "description": "Updated description"}'
```

**Delete an item:**
```bash
curl -X DELETE http://localhost:3000/api/items/<item-id>
```

## Creating New Resources

To create a new CRUD resource, follow this pattern:

1. **Create a model** in `models/YourModel.js`
2. **Create a controller** in `controllers/yourController.js`
3. **Create routes** in `routes/yourRoutes.js`
4. **Import and use routes** in `server.js`

## Development

- The project uses `nodemon` for automatic server restarts during development
- MongoDB connection is handled automatically on server start
- Error handling middleware is included for consistent error responses

