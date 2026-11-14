// Types principaux pour le calcul d'héritage islamique

export type Madhab = 'maliki' | 'hanafi' | 'shafii' | 'hanbali';

export type HeritierType =
  | 'mari'
  | 'femme'
  | 'fils'
  | 'fille'
  | 'pere'
  | 'mere'
  | 'grand_pere_paternel'
  | 'grand_mere_paternelle'
  | 'grand_mere_maternelle'
  | 'frere_germain'
  | 'soeur_germaine'
  | 'frere_paternel'
  | 'soeur_paternelle'
  | 'frere_maternel'
  | 'soeur_maternelle'
  | 'fils_du_fils'
  | 'fille_du_fils'
  | 'oncle_paternel'
  | 'fils_oncle_paternel';

export interface Heritier {
  type: HeritierType;
  nombre: number; // Nombre de personnes de ce type
  actif: boolean; // Présent dans la succession
}

export interface ResultatHeritier {
  type: HeritierType;
  nombre: number;
  fraction: string;       // Ex: "1/4"
  numerateur: number;
  denominateur: number;
  pourcentage: number;    // Ex: 25
  montant: number;        // Montant en FCFA/devise
  regle: string;          // Explication de la règle appliquée
  raisonExclusion?: string; // Si exclu
  exclu: boolean;
}

export interface ResultatCalcul {
  totalSuccession: number;
  devises: string;
  madhab: Madhab;
  aslMasala: number;         // Dénominateur de base
  awl: boolean;              // Y a-t-il eu augmentation (عول) ?
  radd: boolean;             // Y a-t-il eu retour (رد) ?
  heritiers: ResultatHeritier[];
  totalDistribue: number;
  resume: string;            // Résumé en français
  resumeAr: string;          // Résumé en arabe
  avertissements: string[];  // Cas particuliers à signaler
}

export interface HeritierInfo {
  type: HeritierType;
  nomFr: string;
  nomAr: string;
  nomEn: string;
  description: string;
  icone: string;
  genre: 'homme' | 'femme' | 'mixte';
}
