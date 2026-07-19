import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Setup mongodb-memory-server before importing app
const mongod = await MongoMemoryServer.create();
process.env.MONGO_URI = mongod.getUri();
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret';

const { default: app } = await import('./server.js');

let userToken = '';
let userId = '';
let vaultId = '';

test('Integration Tests', async (t) => {
  
  await t.test('POST /api/auth/register - Register User', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      });
    
    assert.strictEqual(res.statusCode, 201);
    assert.ok(res.body.token);
    userToken = res.body.token;
    userId = res.body._id;
  });

  await t.test('POST /api/auth/login - Login User', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
      });
    
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.token);
  });

  await t.test('POST /api/vault - Create Login Vault Item', async () => {
    const res = await request(app)
      .post('/api/vault')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'My Email',
        itemType: 'login',
        username: 'test@email.com',
        password: 'secretPassword456',
        websiteURL: 'https://mail.com'
      });
    
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.title, 'My Email');
    vaultId = res.body._id;
  });

  await t.test('GET /api/vault - Retrieve Vault Items', async () => {
    const res = await request(app)
      .get('/api/vault')
      .set('Authorization', `Bearer ${userToken}`);
    
    assert.strictEqual(res.statusCode, 200);
    assert.ok(Array.isArray(res.body));
    assert.strictEqual(res.body.length, 1);
    assert.strictEqual(res.body[0].title, 'My Email');
  });

  await t.test('GET /api/vault/:id - Retrieve specific item', async () => {
    const res = await request(app)
      .get(`/api/vault/${vaultId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.password, 'secretPassword456');
  });

  await t.test('POST /api/master/create - Create Master Password', async () => {
    const res = await request(app)
      .post('/api/master/create')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ password: 'MasterPassword123' });
    
    assert.strictEqual(res.statusCode, 200);
  });

  await t.test('POST /api/master/verify - Verify Master Password', async () => {
    const res = await request(app)
      .post('/api/master/verify')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ password: 'MasterPassword123' });
    
    assert.strictEqual(res.statusCode, 200);
  });
  
  await t.test('DELETE /api/vault/:id - Delete Vault Item', async () => {
    const res = await request(app)
      .delete(`/api/vault/${vaultId}`)
      .set('Authorization', `Bearer ${userToken}`);
    
    assert.strictEqual(res.statusCode, 200);
  });

  // Cleanup
  await mongoose.disconnect();
  await mongod.stop();
});
