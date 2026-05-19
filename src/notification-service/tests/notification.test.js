const request = require('supertest');
const { app, server } = require('../server');

afterAll((done) => {
  server.close(done);
});

describe('Notification Service API Integration Tests', () => {

  test('GET /health/liveness - should return 200 UP status', async () => {
    const res = await request(app).get('/health/liveness');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('UP');
  });

  test('POST /api/notifications - should successfully create direct notification', async () => {
    const payload = {
      orderId: 'ord_test_88',
      totalAmount: 189,
      userId: 'customer_1'
    };

    const res = await request(app)
      .post('/api/notifications')
      .send(payload);

    expect(res.statusCode).toEqual(201);
    expect(res.body.status).toEqual('Sent');
    expect(res.body.notification.orderId).toEqual(payload.orderId);
  });

  test('GET /api/notifications/history - should retrieve notifications log for frontend rendering', async () => {
    const res = await request(app).get('/api/notifications/history');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});
