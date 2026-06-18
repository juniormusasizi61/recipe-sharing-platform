const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');
const Recipe = require('../models/Recipe');

let mongoServer;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-jwt-secret';
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Recipe.deleteMany({});
});

describe('Recipe Sharing API', () => {
  test('registers, logs in, creates, retrieves, updates, and deletes a recipe', async () => {
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(201);

    expect(registerResponse.body.token).toBeDefined();
    expect(registerResponse.body.user).toMatchObject({
      name: 'Test User',
      email: 'test@example.com',
    });

    const token = registerResponse.body.token;

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(200);

    expect(loginResponse.body.token).toBeDefined();
    expect(loginResponse.body.user.email).toBe('test@example.com');

    const createResponse = await request(app)
      .post('/api/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Pancakes',
        ingredients: ['Flour', 'Milk', 'Eggs'],
        instructions: 'Mix ingredients and cook.',
      })
      .expect(201);

    expect(createResponse.body).toMatchObject({
      title: 'Test Pancakes',
      instructions: 'Mix ingredients and cook.',
    });

    const recipeId = createResponse.body._id;

    const listResponse = await request(app)
      .get('/api/recipes')
      .expect(200);

    expect(listResponse.body.recipes).toBeInstanceOf(Array);
    expect(listResponse.body.recipes.length).toBe(1);
    expect(listResponse.body.total).toBe(1);
    expect(listResponse.body.page).toBe(1);

    const mineResponse = await request(app)
      .get('/api/recipes/mine')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(mineResponse.body).toHaveLength(1);
    expect(mineResponse.body[0]._id).toBe(recipeId);

    const getResponse = await request(app)
      .get(`/api/recipes/${recipeId}`)
      .expect(200);

    expect(getResponse.body.title).toBe('Test Pancakes');

    const updateResponse = await request(app)
      .put(`/api/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Pancakes' })
      .expect(200);

    expect(updateResponse.body.title).toBe('Updated Pancakes');

    await request(app)
      .delete(`/api/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app)
      .get(`/api/recipes/${recipeId}`)
      .expect(404);
  });
});
