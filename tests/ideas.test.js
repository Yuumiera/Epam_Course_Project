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

  beforeEach(async () => {
    jest.resetModules();
    process.env.MAX_ATTACHMENT_SIZE_MB = '1';
    app = require('../src/app');
    userStore = require('../src/store/userStore');
    ideaStore = require('../src/store/ideaStore');

    await ideaStore.reset();
    await userStore.reset();

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

  test('With valid token, POST /ideas returns 400 and fieldErrors.title for blank title', async () => {
    const token = await registerAndLogin();

    const response = await request
      .post('/ideas')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send({
        title: '   ',
        description: 'This description is long enough to pass minimum validation.',
        category: 'HR',
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toEqual(
      expect.objectContaining({
        error: 'Validation failed',
        fieldErrors: expect.objectContaining({
          title: expect.any(String),
        }),
      }),
    );
  });

  test('With valid token, POST /ideas returns 400 and fieldErrors.description for short description', async () => {
    const token = await registerAndLogin();

    const response = await request
      .post('/ideas')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send({
        title: 'Valid title for test',
        description: 'short text',
        category: 'HR',
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toEqual(
      expect.objectContaining({
        error: 'Validation failed',
        fieldErrors: expect.objectContaining({
          description: expect.any(String),
        }),
      }),
    );
  });

  test('With valid token, POST /ideas returns 400 and fieldErrors.category for invalid category', async () => {
    const token = await registerAndLogin();

    const response = await request
      .post('/ideas')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send({
        title: 'Valid title for category check',
        description: 'This description is long enough to pass minimum validation.',
        category: 'InvalidCategory',
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toEqual(
      expect.objectContaining({
        error: 'Validation failed',
        fieldErrors: expect.objectContaining({
          category: expect.any(String),
        }),
      }),
    );
  });

  test('With valid token, POST /ideas returns 400 with multiple fieldErrors for multi-field invalid payload', async () => {
    const token = await registerAndLogin();

    const response = await request
      .post('/ideas')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send({
        title: '  ',
        description: 'short',
        category: 'WrongCategory',
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toEqual(
      expect.objectContaining({
        error: 'Validation failed',
        fieldErrors: expect.objectContaining({
          title: expect.any(String),
          description: expect.any(String),
          category: expect.any(String),
        }),
      }),
    );
  });

  test('With token, GET /ideas returns 200 and includes created idea', async () => {
    const token = await registerAndLogin();

    const createResponse = await request
      .post('/ideas')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send({
        title: 'Cross-team knowledge base',
        description: 'Single portal for project playbooks and runbooks',
        category: 'Process',
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
        category: 'Culture',
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

  test('With token, POST /ideas supports single file attachment and detail returns attachment metadata', async () => {
    const token = await registerAndLogin();

    const createResponse = await request
      .post('/ideas')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Attachment idea')
      .field('description', 'Idea with one attachment for review flow')
      .field('category', 'Technology')
      .attach('attachment', Buffer.from('hello attachment'), 'note.png')
      .expect('Content-Type', /json/)
      .expect(201);

    const detailResponse = await request
      .get(`/ideas/${createResponse.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(detailResponse.body).toEqual(
      expect.objectContaining({
        id: createResponse.body.id,
        attachment: expect.objectContaining({
          filename: 'note.png',
          mimeType: 'image/png',
          sizeBytes: expect.any(Number),
          storagePath: expect.any(String),
        }),
      }),
    );
  });

  test('With token, POST /ideas rejects multiple attachments', async () => {
    const token = await registerAndLogin();

    await request
      .post('/ideas')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Too many files')
      .field('description', 'This should fail because there are two files')
      .field('category', 'Other')
      .attach('attachment', Buffer.from('file-1'), 'one.png')
      .attach('attachment', Buffer.from('file-2'), 'two.png')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  test('With token, POST /ideas rejects invalid attachment type', async () => {
    const token = await registerAndLogin();

    await request
      .post('/ideas')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Invalid type')
      .field('description', 'Should reject mime type')
      .field('category', 'Quality')
      .attach('attachment', Buffer.from('plain-text-content'), 'notes.txt')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  test('With token, POST /ideas rejects oversized attachment', async () => {
    const token = await registerAndLogin();
    const oversizedBuffer = Buffer.alloc(1024 * 1024 + 10, 'a');

    await request
      .post('/ideas')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Large file')
      .field('description', 'Should reject oversized file')
      .field('category', 'HR')
      .attach('attachment', oversizedBuffer, 'large.jpg')
      .expect('Content-Type', /json/)
      .expect(400);
  });

  test('With token, GET /ideas/:id/attachment returns downloadable file', async () => {
    const token = await registerAndLogin();

    const createResponse = await request
      .post('/ideas')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Attachment download idea')
      .field('description', 'Idea with downloadable attachment')
      .field('category', 'Technology')
      .attach('attachment', Buffer.from('%PDF-1.4\nmock-content'), 'download.pdf')
      .expect('Content-Type', /json/)
      .expect(201);

    const downloadResponse = await request
      .get(`/ideas/${createResponse.body.id}/attachment`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(downloadResponse.headers['content-type']).toContain('application/pdf');
    expect(downloadResponse.headers['content-disposition']).toContain('attachment');
    expect(downloadResponse.headers['content-disposition']).toContain('download.pdf');
  });
});
