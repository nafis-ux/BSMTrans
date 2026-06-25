const jwt = require('jsonwebtoken');
const token = jwt.sign({ id: 'USR-ADMIN', role: 'ADMIN' }, process.env.JWT_SECRET || "rahasia", { expiresIn: '1h' });
console.log(token);
