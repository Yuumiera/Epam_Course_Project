const supertest = require('supertest');

describe('Evaluation integration', () => {
  let app;
  let request;
  let userStore;
  let ideaStore;

  async function registerAndLoginSubmitter() {
    const email = `submitter_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
    const password = 'password123';

    await request
      .post('/auth/register')
      .set('Content-Type', 'application/json')
      .send({ email, password })
      .expect('Content-Type', /json/)
      .expect(201);

    const loginResponse = await request
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email, password })
      .expect('Content-Type', /json/)
      .expect(200);

    return loginResponse.body.token;
  }

  async function registerAndLoginAdmin() {
    const email = `admin_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
    const password = 'password123';

    await request
      .post('/auth/register')
      .set('Content-Type', 'application/json')
      .send({ email, password, role: 'admin' })
      .expect('Content-Type', /json/)
      .expect(201);

    const loginResponse = await request
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email, password })
      .expect('Content-Type', /json/)
      .expect(200);

    return loginResponse.body.token;
  }

  async function createIdeaAsSubmitter(submitterToken) {
    const response = await request
      .post('/ideas')
      .set('Authorization', `Bearer ${submitterToken}`)
      .set('Content-Type', 'application/json')
      .send({
        title: 'Initial idea',
        description: 'Initial description for evaluation testing',
        category: 'Process',
      })
      .expect('Content-Type', /json/)
      .expect(201);

    return response.body;
  }

  async function createTokensAndIdea() {
    const submitterToken = await registerAndLoginSubmitter();
    const adminToken = await registerAndLoginAdmin();
    const idea = await createIdeaAsSubmitter(submitterToken);

    return { submitterToken, adminToken, idea };
  }

  beforeEach(async () => {
    jest.resetModules();
    app = require('../src/app');
    userStore = require('../src/store/userStore');
    ideaStore = require('../src/store/ideaStore');

    await ideaStore.reset();
    await userStore.reset();

    request = supertest(app);
  });

  test('PATCH /ideas/:id/status without token returns 401 JSON', async () => {
    const { idea } = await createTokensAndIdea();

    await request
      .patch(`/ideas/${idea.id}/status`)
      .set('Content-Type', 'application/json')
      .send({ status: 'accepted', comment: 'Looks good' })
      .expect('Content-Type', /json/)
      .expect(401);
  });

  test('submitter token PATCH /ideas/:id/status returns 403 JSON', async () => {
    const { submitterToken, idea } = await createTokensAndIdea();

    await request
      .patch(`/ideas/${idea.id}/status`)
      .set('Authorization', `Bearer ${submitterToken}`)
      .set('Content-Type', 'application/json')
      .send({ status: 'accepted', comment: 'Looks good' })
      .expect('Content-Type', /json/)
      .expect(403);
  });

  test('admin token PATCH /ideas/:id/status with accepted and comment returns 200 JSON containing id, status, comment', async () => {
    const { adminToken, idea } = await createTokensAndIdea();

    const response = await request
      .patch(`/ideas/${idea.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Content-Type', 'application/json')
      .send({ status: 'accepted', comment: 'Looks good' })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: idea.id,
        status: 'accepted',
        comment: 'Looks good',
      }),
    );
  });

  test('invalid status value returns 400 JSON', async () => {
    const { adminToken, idea } = await createTokensAndIdea();

    await request
      .patch(`/ideas/${idea.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Content-Type', 'application/json')
      .send({ status: 'invalid_status' })
      .expect('Content-Type', /json/)
      .expect(400);
  });

  test('unknown idea id returns 404 JSON', async () => {
    const { adminToken } = await createTokensAndIdea();

    await request
      .patch('/ideas/unknown-id/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Content-Type', 'application/json')
      .send({ status: 'accepted', comment: 'Looks good' })
      .expect('Content-Type', /json/)
      .expect(404);
  });
});
