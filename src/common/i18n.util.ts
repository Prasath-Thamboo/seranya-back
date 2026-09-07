// Résolution de langue + localisation des entités bilingues (FR/EN).
//
// Principe : les colonnes `*En` de la BDD ne quittent jamais l'API publique.
// Quand un endpoint public reçoit `?lang=en`, on remplace chaque champ FR par
// sa version EN (ou on garde le FR si la traduction est absente / vide), puis
// on retire les clés `*En` de la réponse. `?lang=fr` renvoie le FR nettoyé de
// ses clés `*En`. Sans paramètre `lang`, la ligne brute est renvoyée telle
// quelle (cas de l'admin qui a besoin des deux langues pour l'édition).

export type Lang = 'fr' | 'en';

export function resolveLang(raw?: string | null): Lang {
  return typeof raw === 'string' && raw.trim().toLowerCase().startsWith('en')
    ? 'en'
    : 'fr';
}

// [champ FR, champ EN]
type FieldPair = [string, string];

function localizeRow<T extends Record<string, any>>(
  row: T,
  pairs: FieldPair[],
  lang: Lang,
): T {
  if (!row) return row;
  const out: Record<string, any> = { ...row };

  for (const [base, en] of pairs) {
    if (lang === 'en') {
      const translated = out[en];
      if (translated !== null && translated !== undefined && translated !== '') {
        out[base] = translated;
      }
    }
    delete out[en];
  }

  return out as T;
}

const POST_FIELDS: FieldPair[] = [
  ['title', 'titleEn'],
  ['intro', 'introEn'],
  ['subtitle', 'subtitleEn'],
  ['content', 'contentEn'],
];

const TUTORIAL_FIELDS: FieldPair[] = [
  ['title', 'titleEn'],
  ['description', 'descriptionEn'],
];

// `category` n'est PAS localisé : c'est une clé de taxonomie sur laquelle le
// filtre de l'encyclopédie fait un `===` avec des libellés FR fixes côté front.
// `categoryEn` reste stocké/éditable pour un usage futur mais n'est pas résolu.
const DEFINITION_FIELDS: FieldPair[] = [
  ['term', 'termEn'],
  ['definition', 'definitionEn'],
];

export const localizePost = <T extends Record<string, any>>(row: T, lang: Lang) =>
  localizeRow(row, POST_FIELDS, lang);

export const localizeTutorial = <T extends Record<string, any>>(
  row: T,
  lang: Lang,
) => localizeRow(row, TUTORIAL_FIELDS, lang);

export const localizeDefinition = <T extends Record<string, any>>(
  row: T,
  lang: Lang,
) => {
  const out = localizeRow(row, DEFINITION_FIELDS, lang);
  // `categoryEn` n'est pas résolu (cf. DEFINITION_FIELDS) mais ne doit pas
  // fuiter dans la réponse publique.
  delete (out as Record<string, unknown>).categoryEn;
  return out;
};
