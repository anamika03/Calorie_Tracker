import manifest from './manifest.json';

export type Concept = {
  id: string;
  name: string;
  icon: string;
  description: string;
};

export const concepts: Concept[] = manifest.map((m) => ({
  id: m.id,
  name: m.name,
  icon: `${import.meta.env.BASE_URL}concepts/${m.file}`,
  description: m.description,
}));

export const conceptById = new Map(concepts.map((c) => [c.id, c]));
