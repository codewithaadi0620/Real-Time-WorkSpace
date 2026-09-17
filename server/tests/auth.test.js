const test = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcryptjs');
const { generateToken, verifyToken } = require('../src/utils/jwt');

test('Password Hashing with bcrypt', async () => {
  const plainPassword = 'password123';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(plainPassword, salt);

  const match = await bcrypt.compare(plainPassword, hash);
  assert.strictEqual(match, true);

  const wrongMatch = await bcrypt.compare('wrongpass', hash);
  assert.strictEqual(wrongMatch, false);
});

test('JWT Token Generation and Verification', () => {
  const payload = { id: 'user-123', email: 'test@example.com', name: 'Test User' };
  const token = generateToken(payload);
  assert.ok(token);

  const decoded = verifyToken(token);
  assert.strictEqual(decoded.id, payload.id);
  assert.strictEqual(decoded.email, payload.email);
});
