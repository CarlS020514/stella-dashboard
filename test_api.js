const jwt = require('jsonwebtoken');
const token = jwt.sign({ username: 'scroppy', id: '1536520554448683050' }, 'super_secret_jwt_key_12345');

fetch('http://localhost:3000/api/admin/stella-rank', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': `auth_token=${token}`
  },
  body: JSON.stringify({ embed: { color: 123 } })
}).then(res => res.text()).then(console.log).catch(console.error);
