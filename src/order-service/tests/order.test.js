const request = require('supertest');
const { app, server } = require('../server');

afterAll((done) => {
  server.close(done);
});

describe('Order Service API Integration Tests', () => {

  test('GET /health/liveness - should return 200 UP status', async () => {
    const res = await request(app).get('/health/liveness');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('UP');
  });

  test('POST /api/orders - should successfully place a customer order', async () => {
    const newOrder = {
      userId: 'test_user_99',
      items: [
        {
          productId: 'prod_1',
          name: 'Quantum Gaming Laptop v9',
          quantity: 1,
          price: 2499
        }
      ],
      totalAmount: 2499
    };

    const res = await request(app)
      .post('/api/orders')
      .send(newOrder);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('order');
    expect(res.body.order.userId).toEqual(newOrder.userId);
  });

  test('GET /api/orders - should fetch orders filtered by user ID', async () => {
    const res = await request(app)
      .get('/api/orders')
      .query({ userId: 'test_user_99' });

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test('POST /api/orders - should fail with 400 Bad Request on missing fields', async () => {
    const invalidOrder = {
      userId: 'test_user_99'
      // missing items and totalAmount
    };

    const res = await request(app)
      .post('/api/orders')
      .send(invalidOrder);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });
});
