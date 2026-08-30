const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

// Import X
content = content.replace(/Info \} from 'lucide-react';/, "Info, X } from 'lucide-react';");

// Move profile code below `useStore(state => state.updateBooking)`
const profileStateLines = `  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const myBookings = bookings.filter(b => b.contactNumber === (formData.contact || localStorage.getItem('customerPhone')));

  const handleCancelBooking = async (b: any) => {
    if (confirm('Are you sure you want to cancel this booking? Cancellation charges may apply as per terms.')) {
        await updateBooking({ ...b, status: 'cancelled' } as any);
    }
  };`;

const profileRenderLines = `  const renderProfileModal = () => {`;

content = content.replace(profileStateLines, '');
content = content.replace(
  /const updateBooking = useStore\(state => state\.updateBooking\);/,
  `const updateBooking = useStore(state => state.updateBooking);\n${profileStateLines}`
);

fs.writeFileSync('pages/CustomerPanel.tsx', content);
