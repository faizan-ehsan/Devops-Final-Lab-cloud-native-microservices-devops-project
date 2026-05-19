const request = require('supertest');
const { app, server } = require('../server');

afterAll((done) => {
  server.close(done);
});

describe('User Service API Integration Tests', () => {
  
  test('GET /health/liveness - should return 200 UP status', async () => {
    const res = await request(app).get('/health/liveness');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body.status).toEqual('UP');
  });

  test('GET /health/readiness - should return 200 READY status', async () => {
    const res = await request(app).get('/health/readiness');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body.status).toEqual('READY');
  });

  test('POST /api/auth/register - should create a new user successfully', async () => {
    const testUser = {
      name: 'John Doe',
      email: `john_${Date.now()}@example.com`,
      password: 'password123',
      role: 'customer'
    };
    
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
      
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toEqual(testUser.email);
  });

  test('POST /api/auth/login - should authenticate registered user and return a JWT', async () => {
    const uniqueEmail = `login_${Date.now()}@example.com`;
    
    // First, register the user
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Login Test',
        email: uniqueEmail,
        password: 'password123'
      });

    // Now, login
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: uniqueEmail,
        password: 'password123'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toEqual(uniqueEmail);
  });

  test('GET /api/auth/profile - should fail without authentication token', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('error');
  });
});
