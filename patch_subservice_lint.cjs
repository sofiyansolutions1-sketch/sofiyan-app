const fs = require('fs');
let content = fs.readFileSync('pages/SubServicePage.tsx', 'utf8');

content = content.replace("import { SERVICES, CITY_DATA } from '../constants';", "import { SERVICES } from '../constants';");
content = content.replace("import { Modal } from '../components/Modal';", "");
content = content.replace("const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);", "");
content = content.replace("const cart = useStore(state => state.cart);", "");

fs.writeFileSync('pages/SubServicePage.tsx', content);
console.log("Lint fixed");
