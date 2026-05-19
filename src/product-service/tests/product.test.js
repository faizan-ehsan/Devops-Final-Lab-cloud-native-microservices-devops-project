const request = require('supertest');
const { app, server } = require('../server');

afterAll((done) => {
  server.close(done);
});

describe('Product Service API Integration Tests', () => {

  test('GET /health/liveness - should return 200 UP status', async () => {
    const res = await request(app).get('/health/liveness');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('UP');
  });

  test('GET /api/products - should return the list of seeded products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(4);
  });

  test('POST /api/products - should successfully add a new product', async () => {
    const newProduct = {
      name: 'Super Mech Gaming Keyboard',
      description: 'Ultra fast cherry mechanical switches.',
      price: 150,
      category: 'Accessories',
      imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef',
      stock: 50
    };

    const res = await request(app)
      .post('/api/products')
      .send(newProduct);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('product');
    expect(res.body.product.name).toEqual(newProduct.name);
  });

  test('GET /api/products/:id - should return single product for seeded prod_1', async () => {
    const res = await request(app).get('/api/products/prod_1');
    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toEqual('Quantum Gaming Laptop v9');
  });

  test('DELETE /api/products/:id - should delete or return 404 for invalid ID', async () => {
    // Delete prod_4 from catalog
    const res = await request(app).delete('/api/products/prod_4');
    expect(res.statusCode).toEqual(200);

    // Verify it is deleted
    const verifyRes = await request(app).get('/api/products/prod_4');
    expect(verifyRes.statusCode).toEqual(404);
  });
});
