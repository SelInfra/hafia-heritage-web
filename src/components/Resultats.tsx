import React from 'react';
import { ResultatCalcul } from '../moteur/types';
import { HERITIERS_INFO } from '../moteur/heritiers';
import { genererPDF } from '../utils/generatePDF';

interface Props {
  resultats: ResultatCalcul;
}

export default function Resultats({ resultats }: Props) {
  const { heritiers, totalSuccession, devises, avertissements, awl, radd } = resultats;
  const heritiersPart = heritiers.filter(h => !h.exclu && h.montant > 0);
  const heritiersExclus = heritiers.filter(h => h.exclu);

  function handleExportPDF() {
    genererPDF(resultats);
  }

  async function handlePartager() {
    const lignes = heritiersPart.map(h => {
      const info = HERITIERS_INFO[h.type];
      return `• ${info.nomFr} (×${h.nombre}): ${h.fraction} = ${h.montant.toLocaleString('fr-FR')} ${devises}`;
    }).join('\n');
    const texte = `🕌 Hafia Héritage - Répartition\n\nSuccession : ${totalSuccession.toLocaleString('fr-FR')} ${devises}\n\n${lignes}\n\n${resultats.resumeAr}`;

    if (navigator.share) {
      await navigator.share({ title: 'Répartition héritage', text: texte });
    } else {
      await navigator.clipboard.writeText(texte);
      alert('Résultats copiés dans le presse-papiers !');
    }
  }

  return (
    <div className="resultats" id="resultats">
      {/* En-tête résultats */}
      <div className="resultats-header">
        <div>
          <div className="resultats-title">📊 Résultats de la répartition</div>
          <div className="resultats-subtitle">
            {heritiersPart.length} héritier(s) qualifié(s)
            {awl && ' • Cas de \'Awl (عول)'}
            {radd && ' • Cas de Radd (رد)'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>Succession totale</div>
          <div className="resultats-total">
            {totalSuccession.toLocaleString('fr-FR')} {devises}
          </div>
        </div>
      </div>

      {/* Avertissements */}
      {avertissements.map((a, i) => (
        <div key={i} className="avertissement">
          <span>⚠️</span>
          <span>{a}</span>
        </div>
      ))}

      {/* Liste des héritiers */}
      <div className="card">
        <div className="card-title">✅ Héritiers qualifiés</div>
        <div className="heritiers-resultats">
          {heritiersPart.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', padding: 20 }}>
              Aucun héritier qualifié
            </p>
          ) : (
            heritiersPart.map(h => {
              const info = HERITIERS_INFO[h.type];
              return (
                <div key={h.type} className="heritier-resultat">
                  <div className="hr-icon-nom">
                    <span className="hr-icon">{info.icone}</span>
                    <div>
                      <div className="hr-nom">{info.nomFr}</div>
                      <div className="hr-ar">{info.nomAr}</div>
                      {h.nombre > 1 && (
                        <div className="hr-nombre">× {h.nombre} personnes</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="hr-regle">{h.regle}</div>
                    <div className="hr-bar-wrap" style={{ marginTop: 8 }}>
                      <div className="hr-bar-bg">
                        <div
                          className="hr-bar"
                          style={{ width: `${Math.min(h.pourcentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="hr-part">
                    <div className="hr-fraction">{h.fraction}</div>
                    <div className="hr-pct">{h.pourcentage.toFixed(1)}%</div>
                    <div className="hr-montant">
                      {h.montant.toLocaleString('fr-FR')} {devises}
                    </div>
                    {h.nombre > 1 && (
                      <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                        {Math.round(h.montant / h.nombre).toLocaleString('fr-FR')} {devises}/pers.
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Héritiers exclus */}
      {heritiersExclus.length > 0 && (
        <div className="card">
          <div className="card-title">❌ Héritiers exclus (محجوبون)</div>
          <div className="heritiers-resultats">
            {heritiersExclus.map(h => {
              const info = HERITIERS_INFO[h.type];
              return (
                <div key={h.type} className="heritier-resultat exclu">
                  <div className="hr-icon-nom">
                    <span className="hr-icon">{info.icone}</span>
                    <div>
                      <div className="hr-nom">{info.nomFr}</div>
                      <div className="hr-ar">{info.nomAr}</div>
                    </div>
                  </div>
                  <div className="hr-exclusion">🚫 {h.raisonExclusion}</div>
                  <div className="hr-part">
                    <div className="hr-fraction" style={{ color: '#ccc' }}>0</div>
                    <div className="hr-montant" style={{ color: '#999' }}>0 {devises}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Résumé arabe */}
      <div className="card" style={{ textAlign: 'center' }}>
        <div className="card-title" style={{ justifyContent: 'center' }}>📜 Résumé</div>
        <div style={{
          fontFamily: 'Amiri, serif', fontSize: 22, direction: 'rtl',
          color: '#1a6b3c', lineHeight: 2, marginBottom: 16
        }}>
          {resultats.resumeAr}
        </div>
        <div style={{ fontSize: 13, color: '#666', fontStyle: 'italic', marginBottom: 20 }}>
          Note : Ces calculs sont fournis à titre indicatif. Consultez un savant qualifié pour toute décision définitive.
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportPDF}
            style={{
              padding: '12px 24px', background: '#1a6b3c', color: 'white',
              border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            📄 Exporter en PDF
          </button>
          <button
            onClick={handlePartager}
            style={{
              padding: '12px 24px', background: 'white', color: '#1a6b3c',
              border: '2px solid #1a6b3c', borderRadius: 8, cursor: 'pointer',
              fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            📤 Partager
          </button>
        </div>
      </div>
    </div>
  );
}
