import jwt from 'jsonwebtoken';

// Mock environment variable
process.env.JWT_SECRET = 'test-secret-key';

describe('JWT Token Utilities', () => {
  describe('Token Generation', () => {
    it('should generate a valid JWT token', () => {
      const payload = {
        username: 'admin',
        role: 'admin'
      };
      
      const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '24h' });
      
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include payload data in token', () => {
      const payload = {
        username: 'testuser',
        role: 'cashier',
        id: '123'
      };
      
      const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '24h' });
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      expect(decoded.username).toBe('testuser');
      expect(decoded.role).toBe('cashier');
      expect(decoded.id).toBe('123');
    });

    it('should set expiration time', () => {
      const payload = { username: 'admin' };
      const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      expect(decoded.exp).toBeTruthy();
      expect(typeof decoded.exp).toBe('number');
    });
  });

  describe('Token Verification', () => {
    it('should verify a valid token', () => {
      const payload = { username: 'admin', role: 'admin' };
      const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '24h' });
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      expect(decoded.username).toBe('admin');
      expect(decoded.role).toBe('admin');
    });

    it('should reject expired token', () => {
      const payload = { username: 'admin', role: 'admin' };
      const expiredToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '-1h' });
      
      expect(() => {
        jwt.verify(expiredToken, process.env.JWT_SECRET!);
      }).toThrow();
    });

    it('should reject token with wrong secret', () => {
      const payload = { username: 'admin', role: 'admin' };
      const token = jwt.sign(payload, 'wrong-secret', { expiresIn: '24h' });
      
      expect(() => {
        jwt.verify(token, process.env.JWT_SECRET!);
      }).toThrow();
    });

    it('should reject malformed token', () => {
      const malformedToken = 'not.a.valid.jwt.token';
      
      expect(() => {
        jwt.verify(malformedToken, process.env.JWT_SECRET!);
      }).toThrow();
    });

    it('should reject empty token', () => {
      expect(() => {
        jwt.verify('', process.env.JWT_SECRET!);
      }).toThrow();
    });
  });

  describe('Token Payload', () => {
    it('should handle different payload types', () => {
      const payloads = [
        { username: 'user1', role: 'admin' },
        { username: 'user2', role: 'cashier', store: 'main' },
        { username: 'user3', permissions: ['read', 'write'] }
      ];
      
      payloads.forEach(payload => {
        const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '24h' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        Object.keys(payload).forEach(key => {
          expect(decoded[key]).toEqual(payload[key as keyof typeof payload]);
        });
      });
    });

    it('should preserve data types in payload', () => {
      const payload = {
        username: 'admin',
        age: 30,
        isActive: true,
        roles: ['admin', 'user'],
        metadata: { department: 'IT' }
      };
      
      const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '24h' });
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      expect(decoded.username).toBe('admin');
      expect(decoded.age).toBe(30);
      expect(decoded.isActive).toBe(true);
      expect(decoded.roles).toEqual(['admin', 'user']);
      expect(decoded.metadata).toEqual({ department: 'IT' });
    });
  });

  describe('Token Expiration', () => {
    it('should create tokens with different expiration times', () => {
      const payload = { username: 'admin' };
      
      const token1h = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });
      const token24h = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '24h' });
      
      const decoded1h = jwt.verify(token1h, process.env.JWT_SECRET!) as any;
      const decoded24h = jwt.verify(token24h, process.env.JWT_SECRET!) as any;
      
      expect(decoded24h.exp).toBeGreaterThan(decoded1h.exp);
    });

    it('should include iat (issued at) timestamp', () => {
      const payload = { username: 'admin' };
      const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '24h' });
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      expect(decoded.iat).toBeTruthy();
      expect(typeof decoded.iat).toBe('number');
      expect(decoded.iat).toBeLessThanOrEqual(Math.floor(Date.now() / 1000));
    });
  });
});
