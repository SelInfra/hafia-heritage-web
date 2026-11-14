import React, { useState } from 'react';
import { HERITIERS_INFO } from '../moteur/heritiers';
import { HeritierType } from '../moteur/types';

const REGLES = [
  {
    titre: 'Les parts fixes (الفروض)',
    ar: 'الفروض المقدرة',
    contenu: 'Le Coran définit 6 parts fixes : 1/2, 1/4, 1/8, 2/3, 1/3 et 1/6. Ces parts sont attribuées en priorité aux héritiers à parts fixes (أصحاب الفروض).',
    icone: '📐',
    couleur: '#1a6b3c',
  },
  {
    titre: 'Les résidaires (العصبة)',
    ar: 'العصبة بالنفس',
    contenu: 'Les héritiers résidaires (asaba) reçoivent ce qui reste après distribution des parts fixes. Le fils en est l\'exemple principal. Un fils reçoit le double d\'une fille.',
    icone: '⚖️',
    couleur: '#c9a84c',
  },
  {
    titre: 'L\'exclusion (الحجب)',
    ar: 'الحجب',
    contenu: 'Certains héritiers sont exclus par d\'autres plus proches. Ex: le frère est exclu par le fils et le père. Le grand-père est exclu par le père.',
    icone: '🚫',
    couleur: '#e53935',
  },
  {
    titre: 'L\'augmentation (العول)',
    ar: 'العول',
    contenu: 'Quand la somme des parts fixes dépasse la succession, on augmente le dénominateur et les parts sont réduites proportionnellement.',
    icone: '📈',
    couleur: '#1565c0',
  },
  {
    titre: 'Le retour (الرد)',
    ar: 'الرد',
    contenu: 'Quand il n\'y a pas d\'héritier résidaire et qu\'il reste un surplus, celui-ci est redistribué aux héritiers à parts fixes proportionnellement à leurs parts.',
    icone: '↩️',
    couleur: '#6a1b9a',
  },
  {
    titre: 'Règle homme/femme',
    ar: 'للذكر مثل حظ الأنثيين',
    contenu: 'Dans les successions, l\'homme reçoit le double de la femme de même rang (fils/fille, frère/sœur). C\'est une règle coranique (Coran 4:11).',
    icone: '⚖️',
    couleur: '#2e7d32',
  },
];

const PARTS_TABLEAU = [
  { heritier: 'Mari', ar: 'الزوج', avecEnfants: '1/4', sansEnfants: '1/2', source: 'Coran 4:12' },
  { heritier: 'Épouse(s)', ar: 'الزوجة', avecEnfants: '1/8', sansEnfants: '1/4', source: 'Coran 4:12' },
  { heritier: 'Fille unique', ar: 'البنت الواحدة', avecEnfants: '1/2', sansEnfants: '1/2', source: 'Coran 4:11' },
  { heritier: '2 filles+', ar: 'بنتان فأكثر', avecEnfants: '2/3', sansEnfants: '2/3', source: 'Coran 4:11' },
  { heritier: 'Père', ar: 'الأب', avecEnfants: '1/6', sansEnfants: 'Résidu', source: 'Coran 4:11' },
  { heritier: 'Mère', ar: 'الأم', avecEnfants: '1/6', sansEnfants: '1/3', source: 'Coran 4:11' },
  { heritier: 'Frère/Sœur utérin(e)', ar: 'الأخ/الأخت لأم', avecEnfants: 'Exclu(e)', sansEnfants: '1/6 (un) ou 1/3', source: 'Coran 4:12' },
];

export default function Educatif() {
  const [onglet, setOnglet] = useState<'regles' | 'tableau' | 'glossaire'>('regles');

  return (
    <div className="educatif">
      <div className="hero">
        <div className="hero-ar">تعلّم الفرائض</div>
        <h1 className="hero-title">Apprendre les règles de l'héritage</h1>
        <p className="hero-subtitle">
          Comprendre les principes de base du Fiqh al-Mawârîth pour calculer et vérifier vos successions.
        </p>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        {[
          { id: 'regles', label: '📖 Règles de base' },
          { id: 'tableau', label: '📊 Tableau des parts' },
          { id: 'glossaire', label: '📝 Glossaire' },
        ].map(o => (
          <button
            key={o.id}
            onClick={() => setOnglet(o.id as any)}
            style={{
              padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: onglet === o.id ? '#1a6b3c' : 'white',
              color: onglet === o.id ? 'white' : '#333',
              fontWeight: onglet === o.id ? 600 : 400, fontSize: 14,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Règles de base */}
      {onglet === 'regles' && (
        <div className="educatif-grid">
          {REGLES.map((r, i) => (
            <div key={i} className="educatif-card" style={{ borderTopColor: r.couleur }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{r.icone}</div>
              <div className="ar" style={{ color: r.couleur }}>{r.ar}</div>
              <h3 style={{ color: r.couleur }}>{r.titre}</h3>
              <p>{r.contenu}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tableau des parts */}
      {onglet === 'tableau' && (
        <div className="card">
          <div className="card-title">📊 Parts des héritiers selon le Coran</div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table-heritiers">
              <thead>
                <tr>
                  <th>Héritier</th>
                  <th>Arabe</th>
                  <th>Avec enfants</th>
                  <th>Sans enfants</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {PARTS_TABLEAU.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{r.heritier}</td>
                    <td className="ar-cell">{r.ar}</td>
                    <td style={{ color: '#1a6b3c', fontWeight: 600 }}>{r.avecEnfants}</td>
                    <td style={{ color: '#c9a84c', fontWeight: 600 }}>{r.sansEnfants}</td>
                    <td style={{ fontSize: 12, color: '#666', fontStyle: 'italic' }}>{r.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 16, padding: 16, background: '#fff8e1', borderRadius: 8, fontSize: 13, color: '#f57f17' }}>
            ⚠️ Ce tableau présente les cas généraux. Les règles varient selon la combinaison des héritiers présents.
          </div>
        </div>
      )}

      {/* Glossaire */}
      {onglet === 'glossaire' && (
        <div className="card">
          <div className="card-title">📝 Glossaire arabe-français</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {Object.values(HERITIERS_INFO).map(info => (
              <div key={info.type} style={{
                border: '1px solid #e0e0e0', borderRadius: 10, padding: 14,
                display: 'flex', gap: 12, alignItems: 'center'
              }}>
                <span style={{ fontSize: 28 }}>{info.icone}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{info.nomFr}</div>
                  <div style={{ fontFamily: 'Amiri, serif', fontSize: 18, color: '#1a6b3c', direction: 'rtl' }}>{info.nomAr}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{info.nomEn}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verset coranique */}
      <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #e8f5ee 0%, #f0f9f4 100%)' }}>
        <div style={{ fontFamily: 'Amiri, serif', fontSize: 22, direction: 'rtl', color: '#1a6b3c', lineHeight: 2, marginBottom: 12 }}>
          يُوصِيكُمُ اللَّهُ فِي أَوْلَادِكُمْ ۖ لِلذَّكَرِ مِثْلُ حَظِّ الْأُنثَيَيْنِ
        </div>
        <div style={{ fontSize: 14, color: '#666', fontStyle: 'italic' }}>
          "Allah vous enjoint au sujet de vos enfants : au fils, une part équivalant à celle de deux filles."
          <br />— Coran, Sourate An-Nisâ (4:11)
        </div>
      </div>
    </div>
  );
}
