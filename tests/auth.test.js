const supertest = require('supertest');

const registerPayload = {
  email: 'user@example.com',
  password: 'password123',
};

describe('Auth integration', () => {
  let app;
  let request;

  beforeEach(() => {
    jest.resetModules();
    app = require('../src/app');

    if (typeof app.resetUserStore === 'function') {
      app.resetUserStore();
    }

    request = supertest(app);
  });

  test('POST /auth/register returns 201 and JSON { id, email, role } (role defaults to submitter)', async () => {
    const response = await request
      .post('/auth/register')
      .set('Content-Type', 'application/json')
      .send(registerPayload)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        email: registerPayload.email,
        role: 'submitter',
      }),
    );
  });

  test('Duplicate email register returns 409', async () => {
    await request
      .post('/auth/register')
      .set('Content-Type', 'application/json')
      .send(registerPayload)
      .expect('Content-Type', /json/)
      .expect(201);

    await request
      .post('/auth/register')
      .set('Content-Type', 'application/json')
      .send(registerPayload)
      .expect('Content-Type', /json/)
      .expect(409);
  });

  test('POST /auth/login returns 200 and JSON { token }', async () => {
    await request
      .post('/auth/register')
      .set('Content-Type', 'application/json')
      .send(registerPayload)
      .expect('Content-Type', /json/)
      .expect(201);

    const response = await request
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send({
        email: registerPayload.email,
        password: registerPayload.password,
      })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        token: expect.any(String),
      }),
    );
  });

  test('Wrong password returns 401', async () => {
    await request
      .post('/auth/register')
      .set('Content-Type', 'application/json')
      .send(registerPayload)
      .expect('Content-Type', /json/)
      .expect(201);

    await request
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send({
        email: registerPayload.email,
        password: 'wrong-password',
      })
      .expect('Content-Type', /json/)
      .expect(401);
  });
});
