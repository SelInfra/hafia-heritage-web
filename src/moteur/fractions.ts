// Utilitaires pour les fractions

export function pgcd(a: number, b: number): number {
  return b === 0 ? a : pgcd(b, a % b);
}

export function ppcm(a: number, b: number): number {
  return (a * b) / pgcd(a, b);
}

export function simplifierFraction(num: number, den: number): [number, number] {
  if (num === 0) return [0, 1];
  const g = pgcd(Math.abs(num), Math.abs(den));
  return [num / g, den / g];
}

export function fractionEnTexte(num: number, den: number): string {
  if (den === 1) return `${num}`;
  if (num === 0) return '0';
  return `${num}/${den}`;
}

export function fractionEnPourcentage(num: number, den: number): number {
  return Math.round((num / den) * 10000) / 100;
}

// Trouver le PPCM de plusieurs dénominateurs
export function aslMasala(denominateurs: number[]): number {
  return denominateurs.reduce((acc, d) => ppcm(acc, d), 1);
}
