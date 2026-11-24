// Generates placeholder monogram SVG icons + src/data/manifest.json.
// Replaced later by scripts/extract-assets.mjs <url> output (same shape).
import { writeFileSync, mkdirSync } from 'node:fs';

const concepts = [
  ['GraphQL', 'A query language for APIs where clients ask for exactly the fields they need in a single request.', '#e535ab'],
  ['Microservices', 'Splitting an application into small, independently deployable services that talk over the network.', '#326ce5'],
  ['Real-time Architecture', 'Event streaming (e.g. Kafka) that moves data between systems as it happens instead of in batches.', '#231f20'],
  ['Search', 'Inverted-index engines (e.g. Elasticsearch) for fast full-text and faceted queries.', '#00bfb3'],
  ['Serverless', 'Run functions on demand without managing servers; you pay per invocation.', '#ff9900'],
  ['Object Storage', 'Flat, massively scalable blob storage (e.g. S3) addressed by key.', '#569a31'],
  ['Caching', 'Keep hot data in fast memory (e.g. Redis) to cut latency and database load.', '#dc382d'],
  ['Load Balancer', 'Spreads incoming traffic across many servers for scale and availability.', '#009639'],
  ['CDN', 'Edge servers worldwide that cache static content close to users.', '#f38020'],
  ['Message Queue', 'Decouples producers and consumers with durable, asynchronous messages.', '#ff6600'],
  ['SQL Database', 'Relational storage with schemas, joins and ACID transactions.', '#336791'],
  ['NoSQL Database', 'Schema-flexible stores (document, key-value, wide-column) built to scale out.', '#47a248'],
  ['Sharding', 'Partitioning data across many database nodes by a shard key.', '#6f42c1'],
  ['Rate Limiting', 'Caps how many requests a client can make in a time window.', '#e36209'],
  ['API Gateway', 'Single entry point that routes, authenticates and throttles API calls.', '#0e7c86'],
  ['Kubernetes', 'Orchestrates containers: scheduling, scaling, healing and rollout.', '#326ce5'],
  ['Observability', 'Logs, metrics and traces that let you understand a running system.', '#f46800'],
  ['Consistent Hashing', 'Maps keys to nodes so adding/removing nodes moves minimal data.', '#5a32a3'],
];

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const initials = (s) => s.split(/[\s-]+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

mkdirSync('public/concepts', { recursive: true });
const manifest = concepts.map(([name, description, color]) => {
  const id = slug(name);
  const file = `${id}.svg`;
  writeFileSync(
    `public/concepts/${file}`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="${color}"/><text x="32" y="40" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="22" font-weight="700" fill="#fff">${initials(name)}</text></svg>\n`,
  );
  return { id, name, file, sourceUrl: null, description };
});
writeFileSync('src/data/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`Wrote ${manifest.length} placeholder icons`);
