const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');

const groq = `{
  "cars": *[_type == "car"] | order(_createdAt desc){
    _id,
    id,
    "slug": coalesce(id, slug.current),
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
    videoUrl,
    youtubeUrl,
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

const url = 'https://bjo8yvrn.apicdn.sanity.io/v2024-01-01/data/query/production?query=' + encodeURIComponent(groq);

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const outDir = path.join(__dirname, '..', 'public', 'data');
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const outFile = path.join(outDir, 'sanity_cache.json');
      fs.writeFileSync(outFile, JSON.stringify(json.result, null, 2), 'utf-8');
      console.log(`[Sanity Sync] Saved fallback snapshot (${json.result?.cars?.length || 0} cars, ${json.result?.imports?.length || 0} imports) -> ${outFile}`);
    } catch (err) {
      console.error('[Sanity Sync] JSON parse error:', err.message);
      process.exitCode = 1;
    }
  });
}).on('error', (err) => {
  console.error('[Sanity Sync] Network error:', err.message);
  process.exitCode = 1;
});

