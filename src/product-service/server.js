const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const client = require('prom-client');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecom_product';

// Middleware
app.use(cors());
app.use(express.json());

// Prometheus Metrics setup
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

const httpRequestsCounter = new client.Counter({
  name: 'product_service_http_requests_total',
  help: 'Total HTTP requests received in Product Service',
  labelNames: ['method', 'route', 'status']
});

app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestsCounter.inc({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status: res.statusCode
    });
  });
  next();
});

// Seed data for instant dashboard demonstration
const initialProducts = [
  {
    id: 'prod_1',
    name: 'Quantum Gaming Laptop v9',
    description: 'Next-gen gaming rig with NVIDIA RTX 5090, 64GB RAM, and 2TB NVMe SSD. Unleash extreme performance.',
    price: 2499,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=400&q=80',
    stock: 12
  },
  {
    id: 'prod_2',
    name: 'Nebula Wireless Headphones',
    description: 'Active Noise Cancelling, audiophile-grade audio drivers, and 60-hour long-lasting battery life.',
    price: 299,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
    stock: 25
  },
  {
    id: 'prod_3',
    name: 'Apex Mechanical Keyboard',
    description: 'Ultra-responsive optical switches, hot-swappable keys, and custom premium per-key RGB backlighting.',
    price: 189,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=400&q=80',
    stock: 40
  },
  {
    id: 'prod_4',
    name: 'Odin 34" Curved Monitor',
    description: 'Ultrawide DQHD 144Hz panel with HDR1000 and G-Sync. Ideal for immersive gaming and heavy multitasking.',
    price: 899,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=400&q=80',
    stock: 8
  }
];

let inMemoryProducts = [...initialProducts];
let isUsingMongo = false;

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Product Service successfully connected to MongoDB');
    isUsingMongo = true;
    
    // Seed products in MongoDB if catalog is empty
    const count = await ProductModel.countDocuments();
    if (count === 0) {
      await ProductModel.insertMany(initialProducts.map(p => {
        const { id, ...mongoProduct } = p;
        return mongoProduct;
      }));
      console.log('Product Service: MongoDB database seeded with default premium products');
    }
  })
  .catch(err => {
    console.warn('Product Service: MongoDB connection failed. Falling back to robust In-Memory Database mode for evaluation/demo.', err.message);
  });

// Schema definition
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

let ProductModel;
try {
  ProductModel = mongoose.model('Product', ProductSchema);
} catch (e) {
  ProductModel = mongoose.model('Product');
}

// Health Probes for Kubernetes
app.get('/health/liveness', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'product-service', timestamp: new Date() });
});

app.get('/health/readiness', (req, res) => {
  if (isUsingMongo && mongoose.connection.readyState !== 1) {
    return res.status(500).json({ status: 'DOWN', reason: 'MongoDB is disconnected' });
  }
  res.status(200).json({ status: 'READY', database: isUsingMongo ? 'MongoDB' : 'In-Memory Mock' });
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// REST Endpoints

// Get All Products (Allows searching & filtering)
app.get('/api/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    if (isUsingMongo) {
      let query = {};
      if (category) {
        query.category = category;
      }
      if (search) {
        query.name = { $regex: search, $options: 'i' };
      }
      const products = await ProductModel.find(query);
      res.status(200).json(products);
    } else {
      let products = [...inMemoryProducts];
      if (category) {
        products = products.filter(p => p.category === category);
      }
      if (search) {
        const term = search.toLowerCase();
        products = products.filter(p => p.name.toLowerCase().includes(term));
      }
      res.status(200).json(products);
    }
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Server error fetching products' });
  }
});

// Get Single Product
app.get('/api/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (isUsingMongo) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid Product ID format' });
      }
      const product = await ProductModel.findById(id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.status(200).json(product);
    } else {
      const product = inMemoryProducts.find(p => p.id === id || p._id === id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.status(200).json(product);
    }
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Server error fetching product' });
  }
});

// Create Product
app.post('/api/products', async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, stock } = req.body;
    if (!name || !description || !price || !category || !imageUrl || stock === undefined) {
      return res.status(400).json({ error: 'All product fields are required' });
    }

    if (isUsingMongo) {
      const product = new ProductModel({ name, description, price, category, imageUrl, stock });
      await product.save();
      res.status(201).json({ message: 'Product created successfully', product });
    } else {
      const newProduct = {
        id: 'prod_' + Date.now(),
        name,
        description,
        price: Number(price),
        category,
        imageUrl,
        stock: Number(stock)
      };
      inMemoryProducts.push(newProduct);
      res.status(201).json({ message: 'Product created successfully (In-Memory)', product: newProduct });
    }
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Server error creating product' });
  }
});

// Update Product (Used for General Details or Stock Decrements on Orders)
app.put('/api/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    if (isUsingMongo) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid Product ID format' });
      }
      const product = await ProductModel.findByIdAndUpdate(id, updates, { new: true });
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.status(200).json({ message: 'Product updated successfully', product });
    } else {
      const index = inMemoryProducts.findIndex(p => p.id === id || p._id === id);
      if (index === -1) return res.status(404).json({ error: 'Product not found' });
      
      inMemoryProducts[index] = { ...inMemoryProducts[index], ...updates };
      res.status(200).json({ message: 'Product updated successfully (In-Memory)', product: inMemoryProducts[index] });
    }
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Server error updating product' });
  }
});

// Delete Product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (isUsingMongo) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid Product ID format' });
      }
      const product = await ProductModel.findByIdAndDelete(id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.status(200).json({ message: 'Product deleted successfully' });
    } else {
      const index = inMemoryProducts.findIndex(p => p.id === id || p._id === id);
      if (index === -1) return res.status(404).json({ error: 'Product not found' });
      
      inMemoryProducts.splice(index, 1);
      res.status(200).json({ message: 'Product deleted successfully' });
    }
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Server error deleting product' });
  }
});

// Server listener
const server = app.listen(PORT, () => {
  console.log(`Product Service running on port ${PORT}`);
});

module.exports = { app, server };
