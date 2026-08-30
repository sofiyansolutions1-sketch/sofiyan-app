const fs = require('fs');
let content = fs.readFileSync('pages/TrackBooking.tsx', 'utf8');

content = content.replace(
  `  }, [location.state]);`,
  `  // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, [location.state]);`
);

fs.writeFileSync('pages/TrackBooking.tsx', content);
