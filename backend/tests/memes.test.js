const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const memeRoutes = require('../routes/memes');

// Mock Authentication Middleware
jest.mock('../middleware/auth', () => ({
  verifyToken: (req, res, next) => {
    // Default to a regular user
    req.user = { 
       uid: 'testuser123', 
       name: 'Test User', 
       email: 'test@example.com',
       // Add 'admin: true' here to test admin actions in specific tests
       ...req.testUserClaims 
    };
    next();
  },
  isAdmin: (req, res, next) => {
    if (req.user && req.user.admin === true) {
        next();
    } else {
        res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
  }
}));

const app = express();
app.use(express.json());
app.use(cors());

// Inject a way to dynamically change user claims for testing
app.use((req, res, next) => {
    // Only for testing purposes
    const claims = req.headers['x-test-claims'];
    if (claims) {
        req.testUserClaims = JSON.parse(claims);
    }
    next();
});

app.use('/api/memes', memeRoutes);

// Mock Mongoose Models
// We will use a mock database or mock the model methods directly?
// Using separate mongo memory server is best, but for speed let's mock the Model methods.
// Actually, let's use a real connection to a test DB if MONGODB_URI is provided, 
// or mock if we want to be pure unit tests.
// Given the complexity of mocking Mongoose aggregation/finding, let's skip DB connection 
// and mock `Meme` model methods. But `routes/memes.js` imports `models/Meme`.
// We need to mock that import.

jest.mock('../models/Meme', () => {
    const mockMeme = {
        _id: 'meme123',
        name: 'Test Meme',
        authorUID: 'testuser123',
        upvotes: [],
        downvotes: [],
        save: jest.fn().mockResolvedValue(true)
    };
    
    return {
        find: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
                skip: jest.fn().mockReturnValue({
                    limit: jest.fn().mockResolvedValue([mockMeme])
                })
            })
        }),
        findById: jest.fn().mockImplementation((id) => {
            if (id === 'meme123') return Promise.resolve(mockMeme);
            if (id === 'notfound') return Promise.resolve(null);
            return Promise.resolve(null);
        }),
        findByIdAndDelete: jest.fn().mockResolvedValue(mockMeme),
        create: jest.fn().mockResolvedValue(mockMeme),
        countDocuments: jest.fn().mockResolvedValue(1),
        // Add constructor mock
        prototype: {
            save: jest.fn().mockResolvedValue(mockMeme)
        }
    };
});

const Meme = require('../models/Meme');

describe('Meme API Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET /api/memes should return memes', async () => {
        const res = await request(app).get('/api/memes');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0].name).toBe('Test Meme');
    });

    test('POST /api/memes should create a meme and attach author', async () => {
        Meme.prototype.save.mockResolvedValue({
             _id: 'newmeme',
             name: 'New Meme',
             authorUID: 'testuser123',
             authorName: 'Test User'
        });

        const res = await request(app)
            .post('/api/memes')
            .send({ name: 'New Meme', imageData: 'data:image...', template: 'temp' });

        expect(res.statusCode).toBe(201);
        expect(res.body.authorUID).toBe('testuser123');
    });

    test('DELETE /api/memes/:id should allow author to delete', async () => {
        Meme.findById.mockResolvedValue({
            _id: 'meme123',
            authorUID: 'testuser123'
        });

        const res = await request(app).delete('/api/memes/meme123');
        expect(res.statusCode).toBe(200);
    });

    test('DELETE /api/memes/:id should FORBID non-author', async () => {
         Meme.findById.mockResolvedValue({
            _id: 'meme123',
            authorUID: 'otheruser'
        });

        const res = await request(app).delete('/api/memes/meme123');
        expect(res.statusCode).toBe(403);
    });

    test('DELETE /api/memes/:id should ALLOW admin even if not author', async () => {
         Meme.findById.mockResolvedValue({
            _id: 'meme123',
            authorUID: 'otheruser'
        });

        const res = await request(app)
            .delete('/api/memes/meme123')
            .set('x-test-claims', JSON.stringify({ admin: true }));

        expect(res.statusCode).toBe(200);
    });

    test('POST /api/memes/:id/vote should handle upvotes', async () => {
        const mockSave = jest.fn();
        const memeObj = {
            _id: 'meme123',
            upvotes: [],
            downvotes: [],
            save: mockSave
        };
        Meme.findById.mockResolvedValue(memeObj);

        const res = await request(app)
            .post('/api/memes/meme123/vote')
            .send({ type: 'upvote' });

        expect(res.statusCode).toBe(200);
        expect(memeObj.upvotes).toContain('testuser123');
        expect(mockSave).toHaveBeenCalled();
    });
});
