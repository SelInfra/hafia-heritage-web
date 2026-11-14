import React, { useState } from 'react';
import { calculerHeritage } from '../moteur/moteur';
import { HERITIERS_INFO } from '../moteur/heritiers';
import { Heritier, HeritierType, ResultatCalcul } from '../moteur/types';

interface Props {
  onResultats: (r: ResultatCalcul) => void;
}

const HERITIERS_ORDRE: HeritierType[] = [
  'mari', 'femme',
  'fils', 'fille',
  'pere', 'mere',
  'grand_pere_paternel', 'grand_mere_paternelle', 'grand_mere_maternelle',
  'fils_du_fils', 'fille_du_fils',
  'frere_germain', 'soeur_germaine',
  'frere_paternel', 'soeur_paternelle',
  'frere_maternel', 'soeur_maternelle',
  'oncle_paternel', 'fils_oncle_paternel',
];

const CATEGORIES = [
  { label: 'Conjoint(e)', types: ['mari', 'femme'] },
  { label: 'Enfants', types: ['fils', 'fille', 'fils_du_fils', 'fille_du_fils'] },
  { label: 'Parents', types: ['pere', 'mere', 'grand_pere_paternel', 'grand_mere_paternelle', 'grand_mere_maternelle'] },
  { label: 'Frères et Sœurs', types: ['frere_germain', 'soeur_germaine', 'frere_paternel', 'soeur_paternelle', 'frere_maternel', 'soeur_maternelle'] },
  { label: 'Autres', types: ['oncle_paternel', 'fils_oncle_paternel'] },
];

const DEVISES = ['FCFA', 'EUR', 'USD', 'MAD', 'DZD', 'TND'];

export default function Calculateur({ onResultats }: Props) {
  const [montant, setMontant] = useState<string>('');
  const [devise, setDevise] = useState('FCFA');
  const [heritiers, setHeritiers] = useState<Record<HeritierType, number>>(() => {
    const init = {} as Record<HeritierType, number>;
    HERITIERS_ORDRE.forEach(t => { init[t] = 0; });
    return init;
  });

  function setNombre(type: HeritierType, val: number) {
    setHeritiers(prev => ({ ...prev, [type]: Math.max(0, val) }));
  }

  function handleCalculer() {
    const total = parseFloat(montant.replace(/\s/g, '').replace(',', '.'));
    if (!total || total <= 0) {
      alert('Veuillez entrer un montant valide');
      return;
    }

    const listeHeritiers: Heritier[] = HERITIERS_ORDRE.map(type => ({
      type,
      nombre: heritiers[type],
      actif: heritiers[type] > 0,
    }));

    const resultats = calculerHeritage(listeHeritiers, total, devise);
    onResultats(resultats);

    // Scroll vers les résultats
    setTimeout(() => {
      document.getElementById('resultats')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  const totalSelectionnes = Object.values(heritiers).reduce((s, n) => s + n, 0);

  return (
    <div className="calculateur">
      {/* Hero */}
      <div className="hero">
        <div className="hero-ar">علم الفرائض</div>
        <h1 className="hero-title">Calculateur d'héritage islamique</h1>
        <p className="hero-subtitle">
          Calculez les parts d'héritage selon le droit islamique (Fiqh al-Mawârîth).
          Saisissez le montant de la succession et sélectionnez les héritiers.
        </p>
      </div>

      {/* Montant */}
      <div className="card">
        <div className="card-title">💰 Montant de la succession</div>
        <div className="montant-row">
          <div className="montant-input-wrap">
            <label className="form-label">Montant total à distribuer</label>
            <input
              className="montant-input"
              type="number"
              placeholder="Ex: 5 000 000"
              value={montant}
              onChange={e => setMontant(e.target.value)}
              min="0"
            />
          </div>
          <div>
            <label className="form-label">Devise</label>
            <select
              className="devise-select"
              value={devise}
              onChange={e => setDevise(e.target.value)}
            >
              {DEVISES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Héritiers */}
      {CATEGORIES.map(cat => (
        <div key={cat.label} className="card">
          <div className="card-title">👥 {cat.label}</div>
          <div className="heritiers-grid">
            {cat.types.map(type => {
              const info = HERITIERS_INFO[type as HeritierType];
              const nb = heritiers[type as HeritierType];
              const actif = nb > 0;
              // Certains héritiers ne peuvent être qu'un seul (mari, père, mère...)
              const max = ['mari', 'pere', 'mere', 'grand_pere_paternel', 'grand_mere_paternelle', 'grand_mere_maternelle'].includes(type) ? 1 : 10;

              return (
                <div
                  key={type}
                  className={`heritier-card ${actif ? 'active' : ''}`}
                  onClick={() => !actif && setNombre(type as HeritierType, 1)}
                >
                  <span className="heritier-icon">{info.icone}</span>
                  <div className="heritier-info">
                    <div className="heritier-nom">{info.nomFr}</div>
                    <div className="heritier-ar">{info.nomAr}</div>
                  </div>
                  <div className="heritier-nombre" onClick={e => e.stopPropagation()}>
                    <button
                      className="nb-btn"
                      onClick={() => setNombre(type as HeritierType, nb - 1)}
                      disabled={nb === 0}
                    >−</button>
                    <span className="nb-value">{nb}</span>
                    <button
                      className="nb-btn"
                      onClick={() => setNombre(type as HeritierType, nb + 1)}
                      disabled={nb >= max}
                    >+</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Bouton calculer */}
      <button
        className="btn-calculer"
        onClick={handleCalculer}
        disabled={!montant || totalSelectionnes === 0}
      >
        📊 Calculer la répartition
      </button>
    </div>
  );
}
