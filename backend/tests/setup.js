process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:8080';
process.env.NODE_ENV = 'test';

afterEach(() => {
    jest.clearAllMocks();
});
