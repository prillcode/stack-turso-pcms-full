import jwt from 'jsonwebtoken';
import fs from 'fs';

// Read the private key
const privateKey = fs.readFileSync('./config/jwt-private-key.pem', 'utf8');

// Generate a JWT token (expires in 1 year for development)
const token = jwt.sign(
  {
    // You can add custom claims here
    sub: 'dev-user',
    iat: Math.floor(Date.now() / 1000)
  },
  privateKey,
  {
    algorithm: 'EdDSA',
    expiresIn: '365d'
  }
);

console.log('Generated JWT Token:');
console.log(token);
console.log('');
console.log('This token is valid for 1 year.');
