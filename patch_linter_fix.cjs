const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldPromoComponent = `const PromotionalCarousel: React.FC<{onApplianceClick?: () => void}> = ({ onApplianceClick }) => {`;
const newPromoComponent = `const PromotionalCarousel: React.FC<{onApplianceClick?: () => void}> = () => {`;

content = content.replace(oldPromoComponent, newPromoComponent);

fs.writeFileSync('pages/CustomerPanel.tsx', content);
console.log("Linter error patched.");
