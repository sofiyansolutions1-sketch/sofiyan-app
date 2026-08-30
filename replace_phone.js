const fs = require('fs');
const files = [
    './public/ac-repair-lucknow.html',
    './public/components.html',
    './public/washing-machine-repair-lucknow.html',
    './public/ac-repair-hazratganj.html',
    './public/ac-repair-aashiyana.html',
    './public/ac-repair-gomti-nagar.html',
    './public/fridge-repair-lucknow.html',
    './public/ro-repair-lucknow.html',
    './public/ac-repair-indira-nagar.html',
    './public/ac-repair-alambagh.html',
    './public/ac-repair-bangalore.html',
    './components/Layout.tsx',
    './components/FollowUpManager.tsx',
    './pages/AdminPanel.tsx',
    './pages/CustomerPanel.tsx',
    './insert_varanasi_waterpurifier_index.cjs',
    './.env.example',
    './patch_customer_success.cjs',
    './insert_gorakhpur_waterpurifier_index.cjs',
    './constants.tsx',
    './insert_varanasi_geyser.cjs',
    './index.html'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        const replaced = content.replace(/7625046788/g, '9196029763');
        if (content !== replaced) {
            fs.writeFileSync(file, replaced, 'utf8');
            console.log(`Replaced in ${file}`);
        }
    }
});
