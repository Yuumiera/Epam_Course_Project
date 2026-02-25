const supertest = require('supertest');

describe('Ideas integration', () => {
  let app;
  let request;
  let userStore;
  let ideaStore;

  async function registerUser(email, password = 'password123', role = 'submitter') {
    return request
      .post('/auth/register')
      .set('Content-Type', 'application/json')
      .send({ email, password, role })
      .expect('Content-Type', /json/)
      .expect(201);
  }

  async function loginUser(email, password = 'password123') {
    const response = await request
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email, password })
      .expect('Content-Type', /json/)
      .expect(200);

    return response.body.token;
  }

  async function registerAndLogin() {
    const email = `ideas_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
    const password = 'password123';

    await registerUser(email, password);
    const token = await loginUser(email, password);
    return token;
  }

  beforeEach(() => {
    jest.resetModules();
    app = require('../src/app');
    userStore = require('../src/store/userStore');
    ideaStore = require('../src/store/ideaStore');

    userStore.reset();
    ideaStore.reset();

    request = supertest(app);
  });

  test('POST /ideas without token returns 401 JSON', async () => {
    await request
      .post('/ideas')
      .set('Content-Type', 'application/json')
      .send({
        title: 'Idea without auth',
        description: 'Should be rejected',
        category: 'General',
      })
      .expect('Content-Type', /json/)
      .expect(401);
  });

  test('With valid token, POST /ideas returns 201 JSON and defaults status to submitted', async () => {
    const token = await registerAndLogin();

    const payload = {
      title: 'Smart onboarding checklist',
      description: 'Guide newcomers through first-week setup',
      category: 'HR',
    };

    const response = await request
      .post('/ideas')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(String),
      title: payload.title,
      description: payload.description,
      category: payload.category,
      status: 'submitted',
    });
  });

  test('With token, GET /ideas returns 200 and includes created idea', async () => {
    const token = await registerAndLogin();

    const createResponse = await request
      .post('/ideas')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send({
        title: 'Cross-team knowledge base',
        description: 'Single portal for project playbooks',
        category: 'Knowledge',
      })
      .expect('Content-Type', /json/)
      .expect(201);

    const listResponse = await request
      .get('/ideas')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(listResponse.body)).toBe(true);
    expect(listResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createResponse.body.id,
          title: createResponse.body.title,
          description: createResponse.body.description,
          category: createResponse.body.category,
          status: 'submitted',
        }),
      ]),
    );
  });

  test('With token, GET /ideas/:id returns 200 and the correct idea', async () => {
    const token = await registerAndLogin();

    const createResponse = await request
      .post('/ideas')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send({
        title: 'Mentorship matching',
        description: 'Auto-match mentors with mentees by domain',
        category: 'People',
      })
      .expect('Content-Type', /json/)
      .expect(201);

    const response = await request
      .get(`/ideas/${createResponse.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: createResponse.body.id,
        title: createResponse.body.title,
        description: createResponse.body.description,
        category: createResponse.body.category,
        status: 'submitted',
      }),
    );
  });

  test('With token, GET /ideas/:id for unknown id returns 404 JSON', async () => {
    const token = await registerAndLogin();

    await request
      .get('/ideas/unknown-id')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(404);
  });
});
