const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldCarousel = `const MostPopularCarousel: React.FC<MostPopularCarouselProps> = ({ onBook }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      if (scrollRef.current) {
        const container = scrollRef.current;
        const firstChild = container.firstElementChild as HTMLElement;
        const gap = window.innerWidth < 640 ? 16 : 24;
        const scrollAmount = firstChild ? firstChild.offsetWidth + gap : container.clientWidth / 3;
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        if (container.scrollLeft >= maxScroll - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }, 3500); // slightly different interval to avoid syncing exactly with spotlight
    return () => clearInterval(timer);
  }, []);

  return (`;

const newCarousel = `const MostPopularCarousel: React.FC<MostPopularCarouselProps> = ({ onBook }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (`;

if (content.includes(oldCarousel)) {
  content = content.replace(oldCarousel, newCarousel);
  fs.writeFileSync('pages/CustomerPanel.tsx', content);
  console.log("Auto-scroll removed successfully.");
} else {
  console.log("Could not find auto-scroll code.");
}
