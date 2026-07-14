const fs = require('fs');
const file = 'full_supabase_schema.sql';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('password TEXT,')) {
    content = content.replace(
        /phone TEXT UNIQUE NOT NULL,/,
        `phone TEXT UNIQUE NOT NULL,\n    password TEXT,`
    );
    fs.writeFileSync(file, content);
    console.log("Added password to primary_partners in SQL schema");
} else {
    console.log("Already added");
}
