const fs = require('fs');
let content = fs.readFileSync('pages/AdminPanel.tsx', 'utf8');

content = content.replace(
  /const assignedJobs = bookings\.filter\(b => b\.status === 'Forwarded' \|\| b\.status === 'accepted'\)\.length;/,
  "const assignedJobs = bookings.filter(b => b.status === 'Forwarded' || b.status === 'accepted' || b.status === 'in_progress').length;"
);

content = content.replace(
  /const acceptedJobs = bookings\.filter\(b => b\.status === 'accepted'\)\.length;/,
  "const acceptedJobs = bookings.filter(b => b.status === 'accepted' || b.status === 'in_progress').length;"
);

content = content.replace(
  /if \(currentAdminTab === 'Accepted'\) return b\.status === 'accepted';/,
  "if (currentAdminTab === 'Accepted') return b.status === 'accepted' || b.status === 'in_progress';"
);

content = content.replace(
  /\{\(booking\.assignedPartnerName \|\| booking\.status === 'Forwarded' \|\| booking\.status === 'accepted'\) && \(\(\) => \{/g,
  "{(booking.assignedPartnerName || booking.status === 'Forwarded' || booking.status === 'accepted' || booking.status === 'in_progress') && (() => {"
);

content = content.replace(
  /\{\(booking\.status === 'Forwarded' \|\| booking\.status === 'accepted' \|\| booking\.status === 'admin_review'\) && \(/g,
  "{(booking.status === 'Forwarded' || booking.status === 'accepted' || booking.status === 'in_progress' || booking.status === 'admin_review') && ("
);

fs.writeFileSync('pages/AdminPanel.tsx', content);
