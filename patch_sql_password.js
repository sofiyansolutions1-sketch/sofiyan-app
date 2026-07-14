const fs = require('fs');
const file = 'full_supabase_schema.sql';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /phone TEXT UNIQUE NOT NULL,/,
    `phone TEXT UNIQUE NOT NULL,
    password TEXT,`
);

fs.writeFileSync(file, content);
console.log("Added password to primary_partners in SQL schema");
