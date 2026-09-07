/* eslint-disable no-console */
/**
 * Traduction FR -> EN one-shot du contenu éditorial (Post, Tutorial, Definition).
 *
 * Remplit les colonnes miroir `*En` restées NULL en s'appuyant sur l'API
 * Anthropic. Idempotent : une ligne déjà traduite est ignorée (relancer après
 * un échec réseau ne double rien). Ne touche jamais aux colonnes FR.
 *
 * Prérequis :
 *   - `npx prisma migrate deploy` (colonnes `*En` créées)
 *   - variable d'env `ANTHROPIC_API_KEY`
 *   - `DATABASE_URL` pointant sur la base à traduire (.env chargé automatiquement)
 *
 * Lancement :
 *   npx ts-node scripts/translate-content.ts            # tout ce qui manque
 *   npx ts-node scripts/translate-content.ts --only=post
 *   npx ts-node scripts/translate-content.ts --force    # retraduit même si déjà rempli
 *   npx ts-node scripts/translate-content.ts --dry-run  # affiche sans écrire
 *
 * Modèle : `claude-sonnet-5` par défaut (tâche de traduction en volume) ;
 * surcharge possible via TRANSLATE_MODEL.
 */
import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const anthropic = new Anthropic();
const MODEL = process.env.TRANSLATE_MODEL || 'claude-sonnet-5';

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const DRY_RUN = args.includes('--dry-run');
const ONLY = args.find((a) => a.startsWith('--only='))?.split('=')[1];

const SYSTEM_PROMPT = [
  'You are a professional FR->EN translator for Seranya, a calm editorial site',
  'about yoga, meditation and Buddhist philosophy.',
  'Translate the given French fields into natural, fluent English that keeps the',
  'same gentle, reflective tone. Rules:',
  '- Preserve any HTML markup exactly (tags, attributes, entities); translate only text nodes.',
  '- Keep proper nouns, Sanskrit terms and brand names (Seranya) unchanged.',
  '- Do not add, remove or reorder content. Do not add notes.',
  '- Reply with a single JSON object mapping each input key to its English string. No prose, no code fence.',
].join(' ');

type FieldMap = Record<string, string>;

async function translateFields(fields: FieldMap): Promise<FieldMap> {
  const entries = Object.entries(fields).filter(
    ([, v]) => typeof v === 'string' && v.trim() !== '',
  );
  if (entries.length === 0) return {};

  const payload = Object.fromEntries(entries);

  const res = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content:
          'Translate these fields to English and return the JSON object only:\n' +
          JSON.stringify(payload, null, 2),
      },
    ],
  });

  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();

  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error(`Réponse inattendue du modèle : ${text.slice(0, 200)}`);
  }

  return JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as FieldMap;
}

// Ne renvoie que les champs source non vides dont la cible EN est absente
// (ou tous si --force).
function pending(row: any, pairs: [string, string][]): FieldMap {
  const out: FieldMap = {};
  for (const [base, en] of pairs) {
    const src = row[base];
    const hasSrc = typeof src === 'string' && src.trim() !== '';
    const needs = FORCE || row[en] == null || row[en] === '';
    if (hasSrc && needs) out[base] = src;
  }
  return out;
}

// Convertit {title: "..."} (clés FR) en {titleEn: "..."} (clés BDD).
function toEnData(translated: FieldMap, pairs: [string, string][]): FieldMap {
  const map = new Map(pairs);
  const data: FieldMap = {};
  for (const [base, value] of Object.entries(translated)) {
    const en = map.get(base);
    if (en && typeof value === 'string' && value.trim() !== '') data[en] = value;
  }
  return data;
}

async function run<T extends { id: number }>(
  label: string,
  rows: T[],
  pairs: [string, string][],
  save: (id: number, data: FieldMap) => Promise<unknown>,
) {
  let done = 0;
  let skipped = 0;
  for (const row of rows) {
    const todo = pending(row, pairs);
    if (Object.keys(todo).length === 0) {
      skipped++;
      continue;
    }
    try {
      const translated = await translateFields(todo);
      const data = toEnData(translated, pairs);
      if (Object.keys(data).length === 0) {
        skipped++;
        continue;
      }
      if (DRY_RUN) {
        console.log(`\n[${label} #${row.id}]`, data);
      } else {
        await save(row.id, data);
      }
      done++;
      console.log(`✓ ${label} #${row.id} (${Object.keys(data).join(', ')})`);
    } catch (err) {
      console.error(`✗ ${label} #${row.id} :`, (err as Error).message);
    }
  }
  console.log(`${label} : ${done} traduit(s), ${skipped} ignoré(s).`);
}

async function main() {
  console.log(
    `Modèle : ${MODEL}${DRY_RUN ? ' (dry-run)' : ''}${FORCE ? ' (force)' : ''}`,
  );

  if (!ONLY || ONLY === 'post') {
    const posts = await prisma.post.findMany();
    await run(
      'Post',
      posts,
      [
        ['title', 'titleEn'],
        ['intro', 'introEn'],
        ['subtitle', 'subtitleEn'],
        ['content', 'contentEn'],
      ],
      (id, data) => prisma.post.update({ where: { id }, data }),
    );
  }

  if (!ONLY || ONLY === 'tutorial') {
    const tutorials = await prisma.tutorial.findMany();
    await run(
      'Tutorial',
      tutorials,
      [
        ['title', 'titleEn'],
        ['description', 'descriptionEn'],
      ],
      (id, data) => prisma.tutorial.update({ where: { id }, data }),
    );
  }

  if (!ONLY || ONLY === 'definition') {
    const definitions = await prisma.definition.findMany();
    await run(
      'Definition',
      definitions,
      [
        ['term', 'termEn'],
        ['definition', 'definitionEn'],
        ['category', 'categoryEn'],
      ],
      (id, data) => prisma.definition.update({ where: { id }, data }),
    );
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
