const fs = require('fs');

let content = fs.readFileSync('constants.tsx', 'utf8');

const oldCityData = `export const CITY_DATA = [
  { name: 'Bangalore', img: 'https://i.postimg.cc/Xq9y6ZC0/Chat-GPT-Image-Apr-19-2026-12-21-24-AM.png', areasCount: 27 },
  { name: 'Delhi', img: 'https://i.postimg.cc/RVDqpQ8c/Chat-GPT-Image-Apr-19-2026-12-41-30-AM.png', areasCount: 32 },
  { name: 'Mumbai', img: 'https://i.postimg.cc/QdYgbTg5/Chat-GPT-Image-Apr-19-2026-12-27-58-AM.png', areasCount: 36 },
  { name: 'Hyderabad', img: 'https://i.postimg.cc/59Zc2sXS/Chat-GPT-Image-Apr-19-2026-02-27-49-AM.png', areasCount: 24 },
  { name: 'Pune', img: 'https://i.postimg.cc/C5H7qsFb/Chat-GPT-Image-Apr-19-2026-02-32-39-AM.png', areasCount: 18 },
  { name: 'Chennai', img: 'https://i.postimg.cc/ryPw62cN/Chat-GPT-Image-Apr-19-2026-02-34-24-AM.png', areasCount: 22 },
  { name: 'Kolkata', img: 'https://i.postimg.cc/4NdKXNh2/Chat-GPT-Image-Apr-19-2026-02-36-38-AM.png', areasCount: 20 },
  { name: 'Lucknow', img: 'https://images.unsplash.com/photo-1622194993926-14b533db571d?q=80&w=600&auto=format&fit=crop', areasCount: 15 },
  { name: 'Gurgaon', img: 'https://i.postimg.cc/sxXxYVzh/Chat-GPT-Image-Apr-19-2026-02-42-24-AM.png', areasCount: 23 },
  { name: 'Noida', img: 'https://i.postimg.cc/ZKnv3LK4/Chat-GPT-Image-Apr-19-2026-02-43-16-AM.png', areasCount: 16 },
  { name: 'Varanasi', img: 'https://i.postimg.cc/DfPYmLBD/Chat-GPT-Image-Apr-19-2026-01-17-09-PM.png', areasCount: 12 },
  { name: 'Mau', img: 'https://iili.io/nHw7qrJ.png', areasCount: 12 }
];`;

const newCityData = `export const CITY_DATA = [
  { name: 'Bangalore', img: 'https://i.postimg.cc/Xq9y6ZC0/Chat-GPT-Image-Apr-19-2026-12-21-24-AM.png', areasCount: 27 },
  { name: 'Lucknow', img: 'https://iili.io/n3XqGPj.jpg', areasCount: 15 },
  { name: 'Delhi', img: 'https://i.postimg.cc/RVDqpQ8c/Chat-GPT-Image-Apr-19-2026-12-41-30-AM.png', areasCount: 32 },
  { name: 'Mumbai', img: 'https://i.postimg.cc/QdYgbTg5/Chat-GPT-Image-Apr-19-2026-12-27-58-AM.png', areasCount: 36 },
  { name: 'Hyderabad', img: 'https://i.postimg.cc/59Zc2sXS/Chat-GPT-Image-Apr-19-2026-02-27-49-AM.png', areasCount: 24 },
  { name: 'Pune', img: 'https://i.postimg.cc/C5H7qsFb/Chat-GPT-Image-Apr-19-2026-02-32-39-AM.png', areasCount: 18 },
  { name: 'Chennai', img: 'https://i.postimg.cc/ryPw62cN/Chat-GPT-Image-Apr-19-2026-02-34-24-AM.png', areasCount: 22 },
  { name: 'Kolkata', img: 'https://i.postimg.cc/4NdKXNh2/Chat-GPT-Image-Apr-19-2026-02-36-38-AM.png', areasCount: 20 },
  { name: 'Gurgaon', img: 'https://i.postimg.cc/sxXxYVzh/Chat-GPT-Image-Apr-19-2026-02-42-24-AM.png', areasCount: 23 },
  { name: 'Noida', img: 'https://i.postimg.cc/ZKnv3LK4/Chat-GPT-Image-Apr-19-2026-02-43-16-AM.png', areasCount: 16 },
  { name: 'Varanasi', img: 'https://i.postimg.cc/DfPYmLBD/Chat-GPT-Image-Apr-19-2026-01-17-09-PM.png', areasCount: 12 },
  { name: 'Mau', img: 'https://iili.io/nHw7qrJ.png', areasCount: 12 }
];`;

content = content.replace(oldCityData, newCityData);

// also just in case it doesn't match perfectly, let's try a regex replace
if (!content.includes("https://iili.io/n3XqGPj.jpg")) {
  const match = content.match(/export const CITY_DATA = \[([\s\S]*?)\];/);
  if (match) {
    let items = match[1].split('},').map(s => s.trim() + '}').filter(s => s.length > 2);
    // remove the extra } from the last item
    items[items.length-1] = items[items.length-1].replace('}}', '}');
    
    let lucknowIndex = items.findIndex(s => s.includes("'Lucknow'"));
    if (lucknowIndex !== -1) {
      let lucknowItem = items.splice(lucknowIndex, 1)[0];
      lucknowItem = lucknowItem.replace(/img: '[^']+'/, "img: 'https://iili.io/n3XqGPj.jpg'");
      items.splice(1, 0, lucknowItem);
      
      const newArrayStr = `export const CITY_DATA = [\n  ${items.join(',\n  ').replace(/\\}\\}/g, '}')}\n];`;
      content = content.replace(match[0], newArrayStr);
    }
  }
}

fs.writeFileSync('constants.tsx', content);
console.log("Success");
