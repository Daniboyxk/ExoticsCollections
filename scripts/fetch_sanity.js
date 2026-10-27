const https = require('https');
const fs = require('fs');
const path = require('path');

const groq = `{
  "cars": *[_type == "car"] | order(_createdAt desc){
    _id,
    name,
    brand_model,
    price,
    availability,
    km,
    year,
    description,
    fuel,
    engine,
    seats,
    transmission,
    exterior_color,
    interior_color,
    regime,
    type,
    "images": images[].asset._ref
  },
  "imports": *[_type in ["importacion", "contactGalleryItem"]] | order(_createdAt desc){
    _id,
    _type,
    name,
    title,
    shortDescription,
    "imageRef": coalesce(image.asset._ref, images[0].asset._ref)
  },
  "youtube": *[_type == "youtubeVideo"] | order(order asc, _createdAt desc){
    _id,
    youtubeUrl,
    order
  }
}`;

const url = 'https://bjo8yvrn.api.sanity.io/v2024-01-01/data/query/production?query=' + encodeURIComponent(groq);

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Cars count:', json.result?.cars?.length);
      console.log('Imports count:', json.result?.imports?.length);
      console.log('YouTube count:', json.result?.youtube?.length);

      const outDir = path.join(__dirname, '..', 'data');
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, 'sanity_cache.json'), JSON.stringify(json.result, null, 2), 'utf-8');
      console.log('Successfully written to data/sanity_cache.json');

      if (json.result?.cars) {
        json.result.cars.forEach((c, idx) => {
          console.log(`[${idx}] ${c.name || c.brand_model} | ${c.price} | ${c.year} | ${c.km} | images: ${c.images?.length} | firstImg: ${c.images?.[0]}`);
        });
      }
    } catch (e) {
      console.error('Parse error:', e, data.slice(0, 500));
    }
  });
}).on('error', (err) => {
  console.error('Fetch error:', err);
});
