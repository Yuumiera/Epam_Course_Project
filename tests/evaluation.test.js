const supertest = require('supertest');

describe('Evaluation integration', () => {
  let app;
  let request;
  let userStore;
  let ideaStore;

  function parseJwtPayload(jwt) {
    const payload = jwt.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
  }

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
      .send({ status: 'under_review', comment: 'Looks good' })
      .expect('Content-Type', /json/)
      .expect(403);
  });

    test('admin token can move idea through valid multi-stage workflow', async () => {
    const { adminToken, idea } = await createTokensAndIdea();

      const first = await request
      .patch(`/ideas/${idea.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Content-Type', 'application/json')
        .send({ status: 'under_review', comment: 'Initial triage' })
      .expect('Content-Type', /json/)
      .expect(200);

      expect(first.body).toEqual(
      expect.objectContaining({
        id: idea.id,
          status: 'under_review',
          comment: 'Initial triage',
      }),
    );

      const second = await request
        .patch(`/ideas/${idea.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'application/json')
        .send({ status: 'approved_for_final', comment: 'Ready for final decision' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(second.body).toEqual(
        expect.objectContaining({
          id: idea.id,
          status: 'approved_for_final',
        }),
      );

      const third = await request
        .patch(`/ideas/${idea.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'application/json')
        .send({ status: 'accepted', comment: 'Approved' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(third.body).toEqual(
        expect.objectContaining({
          id: idea.id,
          status: 'accepted',
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

  test('skipped transition submitted -> accepted returns 400 JSON', async () => {
    const { adminToken, idea } = await createTokensAndIdea();

    await request
      .patch(`/ideas/${idea.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Content-Type', 'application/json')
      .send({ status: 'accepted', comment: 'Trying to skip review stages' })
      .expect('Content-Type', /json/)
      .expect(400);
  });

  test('status update response includes historyEntry fields', async () => {
    const { adminToken, idea } = await createTokensAndIdea();
    const payload = parseJwtPayload(adminToken);

    const response = await request
      .patch(`/ideas/${idea.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Content-Type', 'application/json')
      .send({ status: 'under_review', comment: 'History check' })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.historyEntry).toEqual(
      expect.objectContaining({
        status: 'under_review',
        comment: 'History check',
        reviewerId: payload.sub,
        timestamp: expect.any(String),
      }),
    );
    expect(response.body).not.toHaveProperty('createdByUserId');
  });

  test('idea detail returns chronological evaluationHistory timeline payload', async () => {
    const { adminToken, submitterToken, idea } = await createTokensAndIdea();

    await request
      .patch(`/ideas/${idea.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Content-Type', 'application/json')
      .send({ status: 'under_review', comment: 'Step 1' })
      .expect(200);

    await request
      .patch(`/ideas/${idea.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Content-Type', 'application/json')
      .send({ status: 'approved_for_final', comment: 'Step 2' })
      .expect(200);

    const detail = await request
      .get(`/ideas/${idea.id}`)
      .set('Authorization', `Bearer ${submitterToken}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(detail.body.evaluationHistory)).toBe(true);
    expect(detail.body.evaluationHistory).toHaveLength(2);
    expect(detail.body.evaluationHistory[0]).toEqual(
      expect.objectContaining({
        status: 'under_review',
        comment: 'Step 1',
      }),
    );
    expect(detail.body.evaluationHistory[1]).toEqual(
      expect.objectContaining({
        status: 'approved_for_final',
        comment: 'Step 2',
      }),
    );
  });

  test('unknown idea id returns 404 JSON', async () => {
    const { adminToken } = await createTokensAndIdea();

    await request
      .patch('/ideas/unknown-id/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Content-Type', 'application/json')
      .send({ status: 'under_review', comment: 'Looks good' })
      .expect('Content-Type', /json/)
      .expect(404);
  });
});
