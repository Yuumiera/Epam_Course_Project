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

  test('With token, POST /ideas allows creating a draft status idea', async () => {
    const token = await registerAndLogin();

    const response = await request
      .post('/ideas')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send({
        title: 'Drafted onboarding proposal',
        description: 'This draft idea stays private until explicitly submitted later.',
        category: 'HR',
        status: 'draft',
      })
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        status: 'draft',
      }),
    );
  });

  test('Drafts are not visible to other submitters in GET /ideas', async () => {
    const ownerEmail = `owner_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
    const otherEmail = `other_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;

    await registerUser(ownerEmail);
    await registerUser(otherEmail);

    const ownerToken = await loginUser(ownerEmail);
    const otherToken = await loginUser(otherEmail);

    const createdDraft = await request
      .post('/ideas')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('Content-Type', 'application/json')
      .send({
        title: 'Owner private draft',
        description: 'Owner can see this draft and edit it before final submission.',
        category: 'Process',
        status: 'draft',
      })
      .expect(201);

    const ownerList = await request
      .get('/ideas')
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    expect(ownerList.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createdDraft.body.id,
          status: 'draft',
        }),
      ]),
    );

    const otherList = await request
      .get('/ideas')
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(200);

    expect(otherList.body).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({
          id: createdDraft.body.id,
        }),
      ]),
    );
  });

  test('Non-owner cannot read another submitter draft detail', async () => {
    const ownerEmail = `detail_owner_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
    const otherEmail = `detail_other_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;

    await registerUser(ownerEmail);
    await registerUser(otherEmail);

    const ownerToken = await loginUser(ownerEmail);
    const otherToken = await loginUser(otherEmail);

    const createdDraft = await request
      .post('/ideas')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('Content-Type', 'application/json')
      .send({
        title: 'Private draft detail',
        description: 'Hidden from non-owner detail requests to avoid draft leakage.',
        category: 'Technology',
        status: 'draft',
      })
      .expect(201);

    await request
      .get(`/ideas/${createdDraft.body.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect('Content-Type', /json/)
      .expect(404);
  });

  test('Owner can update draft via PATCH /ideas/:id', async () => {
    const ownerToken = await registerAndLogin();

    const createdDraft = await request
      .post('/ideas')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('Content-Type', 'application/json')
      .send({
        title: 'Patchable draft',
        description: 'Initial draft description long enough for validation checks.',
        category: 'Quality',
        status: 'draft',
      })
      .expect(201);

    const updated = await request
      .patch(`/ideas/${createdDraft.body.id}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('Content-Type', 'application/json')
      .send({
        title: 'Patchable draft updated',
        description: 'Updated draft description still satisfies all validation requirements.',
        category: 'Culture',
      })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(updated.body).toEqual(
      expect.objectContaining({
        id: createdDraft.body.id,
        title: 'Patchable draft updated',
        category: 'Culture',
        status: 'draft',
      }),
    );
  });

  test('Owner can update draft via PUT /ideas/:id', async () => {
    const ownerToken = await registerAndLogin();

    const createdDraft = await request
      .post('/ideas')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('Content-Type', 'application/json')
      .send({
        title: 'Puttable draft',
        description: 'Initial content for put draft endpoint behavior validation.',
        category: 'Other',
        status: 'draft',
      })
      .expect(201);

    const updated = await request
      .put(`/ideas/${createdDraft.body.id}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('Content-Type', 'application/json')
      .send({
        title: 'Puttable draft replaced',
        description: 'Replaced content should be persisted while the idea remains draft.',
        category: 'Process',
      })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(updated.body).toEqual(
      expect.objectContaining({
        id: createdDraft.body.id,
        title: 'Puttable draft replaced',
        category: 'Process',
        status: 'draft',
      }),
    );
  });

  test('Non-owner cannot update another submitter draft', async () => {
    const ownerEmail = `patch_owner_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
    const otherEmail = `patch_other_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;

    await registerUser(ownerEmail);
    await registerUser(otherEmail);

    const ownerToken = await loginUser(ownerEmail);
    const otherToken = await loginUser(otherEmail);

    const createdDraft = await request
      .post('/ideas')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('Content-Type', 'application/json')
      .send({
        title: 'Locked draft',
        description: 'Only creator can update this draft while it remains in draft state.',
        category: 'HR',
        status: 'draft',
      })
      .expect(201);

    await request
      .patch(`/ideas/${createdDraft.body.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .set('Content-Type', 'application/json')
      .send({
        title: 'Unauthorized update',
        description: 'Another user should not be able to update this draft at all.',
        category: 'HR',
      })
      .expect('Content-Type', /json/)
      .expect(404);
  });

  test('Owner can submit draft via PATCH /ideas/:id/submit', async () => {
    const ownerToken = await registerAndLogin();

    const createdDraft = await request
      .post('/ideas')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('Content-Type', 'application/json')
      .send({
        title: 'Submittable draft',
        description: 'Draft content that will be transitioned to submitted status now.',
        category: 'Technology',
        status: 'draft',
      })
      .expect(201);

    const submitResponse = await request
      .patch(`/ideas/${createdDraft.body.id}/submit`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(submitResponse.body).toEqual(
      expect.objectContaining({
        id: createdDraft.body.id,
        status: 'submitted',
      }),
    );
  });

  test('Non-owner cannot submit another submitter draft', async () => {
    const ownerEmail = `submit_owner_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
    const otherEmail = `submit_other_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;

    await registerUser(ownerEmail);
    await registerUser(otherEmail);

    const ownerToken = await loginUser(ownerEmail);
    const otherToken = await loginUser(otherEmail);

    const createdDraft = await request
      .post('/ideas')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('Content-Type', 'application/json')
      .send({
        title: 'Owner only submit draft',
        description: 'Non-owner submit attempt should fail and hide draft existence.',
        category: 'Culture',
        status: 'draft',
      })
      .expect(201);

    await request
      .patch(`/ideas/${createdDraft.body.id}/submit`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect('Content-Type', /json/)
      .expect(404);
  });

  test('Submitting already submitted idea returns 400', async () => {
    const token = await registerAndLogin();

    const createdIdea = await request
      .post('/ideas')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send({
        title: 'Already submitted idea',
        description: 'Created directly as submitted and should fail draft submit endpoint.',
        category: 'Quality',
      })
      .expect(201);

    await request
      .patch(`/ideas/${createdIdea.body.id}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(400);
  });
});
