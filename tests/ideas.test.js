const supertest = require('supertest');

describe('Ideas integration', () => {
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

  test('Admin GET /ideas response masks submitter identity fields', async () => {
    const submitterEmail = `blind_submitter_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
    const adminEmail = `blind_admin_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;

    await registerUser(submitterEmail);
    await registerUser(adminEmail, 'password123', 'admin');

    const submitterToken = await loginUser(submitterEmail);
    const adminToken = await loginUser(adminEmail);

    const created = await request
      .post('/ideas')
      .set('Authorization', `Bearer ${submitterToken}`)
      .set('Content-Type', 'application/json')
      .send({
        title: 'Blind list masking idea',
        description: 'Admin list view should not expose submitter identity fields.',
        category: 'Process',
      })
      .expect(201);

    const adminList = await request
      .get('/ideas')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const item = adminList.body.find((idea) => idea.id === created.body.id);
    expect(item).toBeDefined();
    expect(item).not.toHaveProperty('createdByUserId');
  });

  test('Admin GET /ideas/:id response masks submitter identity fields', async () => {
    const submitterEmail = `blind_detail_submitter_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
    const adminEmail = `blind_detail_admin_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;

    await registerUser(submitterEmail);
    await registerUser(adminEmail, 'password123', 'admin');

    const submitterToken = await loginUser(submitterEmail);
    const adminToken = await loginUser(adminEmail);

    const created = await request
      .post('/ideas')
      .set('Authorization', `Bearer ${submitterToken}`)
      .set('Content-Type', 'application/json')
      .send({
        title: 'Blind detail masking idea',
        description: 'Admin detail view should not expose submitter identity fields.',
        category: 'Technology',
      })
      .expect(201);

    const adminDetail = await request
      .get(`/ideas/${created.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(adminDetail.body).not.toHaveProperty('createdByUserId');
  });

  test('Submitter detail view includes own identity field', async () => {
    const token = await registerAndLogin();
    const jwtPayload = parseJwtPayload(token);

    const created = await request
      .post('/ideas')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send({
        title: 'Submitter identity detail',
        description: 'Submitter should see own identity field in personal idea detail view.',
        category: 'Culture',
      })
      .expect(201);

    const detail = await request
      .get(`/ideas/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(detail.body).toHaveProperty('createdByUserId', jwtPayload.sub);
  });

  test('Submitter list includes own identity and masks other submitter identity', async () => {
    const ownerEmail = `blind_owner_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
    const otherEmail = `blind_other_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;

    await registerUser(ownerEmail);
    await registerUser(otherEmail);

    const ownerToken = await loginUser(ownerEmail);
    const otherToken = await loginUser(otherEmail);
    const ownerPayload = parseJwtPayload(ownerToken);

    const ownerIdea = await request
      .post('/ideas')
      .set('Authorization', `Bearer ${ownerToken}`)
      .set('Content-Type', 'application/json')
      .send({
        title: 'Owner list identity',
        description: 'Owner should keep identity field for own idea in list response.',
        category: 'HR',
      })
      .expect(201);

    const otherIdea = await request
      .post('/ideas')
      .set('Authorization', `Bearer ${otherToken}`)
      .set('Content-Type', 'application/json')
      .send({
        title: 'Other submitter list identity',
        description: 'Owner should not see identity field for ideas owned by another submitter.',
        category: 'Other',
      })
      .expect(201);

    const ownerList = await request
      .get('/ideas')
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    const ownerItem = ownerList.body.find((idea) => idea.id === ownerIdea.body.id);
    const otherItem = ownerList.body.find((idea) => idea.id === otherIdea.body.id);

    expect(ownerItem).toBeDefined();
    expect(ownerItem).toHaveProperty('createdByUserId', ownerPayload.sub);
    expect(otherItem).toBeDefined();
    expect(otherItem).not.toHaveProperty('createdByUserId');
  });

  test('GET /ideas/ranked returns ideas sorted by total score with rank and breakdown', async () => {
    const submitterToken = await registerAndLogin();
    const adminEmail = `rank_admin_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
    await registerUser(adminEmail, 'password123', 'admin');
    const adminToken = await loginUser(adminEmail);

    const ideaOne = await request
      .post('/ideas')
      .set('Authorization', `Bearer ${submitterToken}`)
      .set('Content-Type', 'application/json')
      .send({
        title: 'Ranked idea one',
        description: 'First idea for ranked endpoint validation with scoring details.',
        category: 'Technology',
      })
      .expect(201);

    const ideaTwo = await request
      .post('/ideas')
      .set('Authorization', `Bearer ${submitterToken}`)
      .set('Content-Type', 'application/json')
      .send({
        title: 'Ranked idea two',
        description: 'Second idea for ranked endpoint validation with scoring details.',
        category: 'Process',
      })
      .expect(201);

    const ideaThree = await request
      .post('/ideas')
      .set('Authorization', `Bearer ${submitterToken}`)
      .set('Content-Type', 'application/json')
      .send({
        title: 'Ranked idea three',
        description: 'Third idea for ranked endpoint validation with scoring details.',
        category: 'HR',
      })
      .expect(201);

    await request
      .patch(`/ideas/${ideaOne.body.id}/score`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Content-Type', 'application/json')
      .send({ impact: 5, feasibility: 5, innovation: 5 })
      .expect(200);

    await request
      .patch(`/ideas/${ideaTwo.body.id}/score`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Content-Type', 'application/json')
      .send({ impact: 4, feasibility: 4, innovation: 4 })
      .expect(200);

    const ranked = await request
      .get('/ideas/ranked')
      .set('Authorization', `Bearer ${submitterToken}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(ranked.body[0]).toEqual(
      expect.objectContaining({
        id: ideaOne.body.id,
        impactScore: 5,
        feasibilityScore: 5,
        innovationScore: 5,
        totalScore: 5,
        rank: 1,
      }),
    );

    expect(ranked.body[1]).toEqual(
      expect.objectContaining({
        id: ideaTwo.body.id,
        totalScore: 4,
        rank: 2,
      }),
    );

    const unscored = ranked.body.find((item) => item.id === ideaThree.body.id);
    expect(unscored).toBeDefined();
    expect(unscored.totalScore).toBeNull();
  });

  test('GET /ideas/ranked uses deterministic order when totals are equal', async () => {
    const submitterToken = await registerAndLogin();
    const adminEmail = `tie_admin_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
    await registerUser(adminEmail, 'password123', 'admin');
    const adminToken = await loginUser(adminEmail);

    const firstIdea = await request
      .post('/ideas')
      .set('Authorization', `Bearer ${submitterToken}`)
      .set('Content-Type', 'application/json')
      .send({
        title: 'Tie idea first',
        description: 'First created tie idea for deterministic ranking validation.',
        category: 'Culture',
      })
      .expect(201);

    const secondIdea = await request
      .post('/ideas')
      .set('Authorization', `Bearer ${submitterToken}`)
      .set('Content-Type', 'application/json')
      .send({
        title: 'Tie idea second',
        description: 'Second created tie idea for deterministic ranking validation.',
        category: 'Quality',
      })
      .expect(201);

    const tiePayload = { impact: 4, feasibility: 3, innovation: 3 };

    await request
      .patch(`/ideas/${firstIdea.body.id}/score`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Content-Type', 'application/json')
      .send(tiePayload)
      .expect(200);

    await request
      .patch(`/ideas/${secondIdea.body.id}/score`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Content-Type', 'application/json')
      .send(tiePayload)
      .expect(200);

    const ranked = await request
      .get('/ideas/ranked')
      .set('Authorization', `Bearer ${submitterToken}`)
      .expect(200);

    const firstIndex = ranked.body.findIndex((item) => item.id === firstIdea.body.id);
    const secondIndex = ranked.body.findIndex((item) => item.id === secondIdea.body.id);
    expect(firstIndex).toBeGreaterThanOrEqual(0);
    expect(secondIndex).toBeGreaterThanOrEqual(0);
    expect(firstIndex).toBeLessThan(secondIndex);
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
