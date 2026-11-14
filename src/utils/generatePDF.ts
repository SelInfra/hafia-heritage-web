import { ResultatCalcul } from '../moteur/types';
import { HERITIERS_INFO } from '../moteur/heritiers';

/**
 * Génère et ouvre une fenêtre d'impression avec un PDF formaté
 */
export function genererPDF(resultats: ResultatCalcul): void {
  const { heritiers, totalSuccession, devises, avertissements, awl, radd, madhab } = resultats;
  const heritiersPart = heritiers.filter(h => !h.exclu && h.montant > 0);
  const heritiersExclus = heritiers.filter(h => h.exclu);
  const date = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const lignesHeritiers = heritiersPart.map(h => {
    const info = HERITIERS_INFO[h.type];
    return `
      <tr>
        <td>${info.nomFr} (${info.nomAr})</td>
        <td style="text-align:center">${h.nombre}</td>
        <td style="text-align:center;color:#1a6b3c;font-weight:bold">${h.fraction}</td>
        <td style="text-align:center">${h.pourcentage.toFixed(2)}%</td>
        <td style="text-align:right;font-weight:bold">${h.montant.toLocaleString('fr-FR')} ${devises}</td>
        ${h.nombre > 1 ? `<td style="text-align:right;color:#666">${Math.round(h.montant / h.nombre).toLocaleString('fr-FR')}/pers.</td>` : '<td></td>'}
      </tr>
    `;
  }).join('');

  const lignesExclus = heritiersExclus.map(h => {
    const info = HERITIERS_INFO[h.type];
    return `
      <tr style="color:#999">
        <td>${info.nomFr} (${info.nomAr})</td>
        <td style="text-align:center">${h.nombre}</td>
        <td colspan="4" style="color:#e53935;font-style:italic">Exclu : ${h.raisonExclusion}</td>
      </tr>
    `;
  }).join('');

  const avertissementsHTML = avertissements.map(a =>
    `<div style="background:#fff8e1;border:1px solid #ffe082;border-radius:6px;padding:10px;margin-bottom:8px;font-size:12px;color:#f57f17">⚠️ ${a}</div>`
  ).join('');

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Hafia Héritage - Répartition</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Times New Roman', Georgia, serif; font-size: 13px; color: #1a1a2e; padding: 20px; }
    
    .document-header {
      display: flex; justify-content: space-between; align-items: center;
      border-bottom: 3px solid #1a6b3c; padding-bottom: 16px; margin-bottom: 20px;
    }
    .logo-section { display: flex; align-items: center; gap: 12px; }
    .logo-name { font-size: 22px; font-weight: bold; color: #1a6b3c; }
    .logo-ar { font-size: 18px; color: #c9a84c; }
    .doc-info { text-align: right; font-size: 11px; color: #666; }
    
    .section-title {
      font-size: 15px; font-weight: bold; color: #1a6b3c;
      border-left: 4px solid #1a6b3c; padding-left: 10px;
      margin: 20px 0 12px 0;
    }
    
    .info-grid {
      display: grid; grid-template-columns: 1fr 1fr 1fr;
      gap: 12px; margin-bottom: 20px;
    }
    .info-box {
      background: #f8f9fa; border-radius: 8px; padding: 12px;
      border: 1px solid #e0e0e0; text-align: center;
    }
    .info-box-label { font-size: 11px; color: #666; margin-bottom: 4px; }
    .info-box-value { font-size: 16px; font-weight: bold; color: #1a6b3c; }
    
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th {
      background: #1a6b3c; color: white; padding: 10px 8px;
      font-size: 12px; text-align: left;
    }
    td { padding: 10px 8px; border-bottom: 1px solid #f0f0f0; font-size: 12px; }
    tr:nth-child(even) td { background: #f9fdf9; }
    
    .total-row td {
      background: #1a6b3c !important; color: white;
      font-weight: bold; border-bottom: none;
    }
    
    .ar-section {
      text-align: center; padding: 16px;
      background: #e8f5ee; border-radius: 8px;
      border: 1px solid rgba(26,107,60,0.2); margin: 16px 0;
    }
    .ar-text { font-size: 20px; color: #1a6b3c; direction: rtl; line-height: 1.8; margin-bottom: 8px; }
    
    .verset {
      text-align: center; padding: 16px; background: #fff9e6;
      border-radius: 8px; border: 1px solid #ffe082; margin-bottom: 16px;
    }
    .verset-ar { font-size: 18px; color: #1a6b3c; direction: rtl; line-height: 1.8; }
    .verset-ref { font-size: 11px; color: #999; font-style: italic; margin-top: 6px; }
    
    .footer-doc {
      border-top: 2px solid #e0e0e0; margin-top: 20px; padding-top: 12px;
      font-size: 11px; color: #999; text-align: center;
    }
    
    .badge {
      display: inline-block; padding: 2px 8px; border-radius: 10px;
      font-size: 11px; font-weight: bold;
    }
    .badge-awl { background: #e3f2fd; color: #1565c0; }
    .badge-radd { background: #f3e5f5; color: #6a1b9a; }

    @media print {
      body { padding: 0; }
      button { display: none; }
      @page { margin: 15mm 20mm; size: A4; }
    }
  </style>
</head>
<body>

  <!-- En-tête -->
  <div class="document-header">
    <div class="logo-section">
      <span style="font-size:36px">☪️</span>
      <div>
        <div class="logo-name">Hafia Héritage</div>
        <div class="logo-ar">حافيا للمواريث</div>
      </div>
    </div>
    <div class="doc-info">
      <div><strong>Document :</strong> Répartition successorale islamique</div>
      <div><strong>Date :</strong> ${date}</div>
      <div><strong>École :</strong> ${madhab.charAt(0).toUpperCase() + madhab.slice(1)}</div>
    </div>
  </div>

  <!-- Résumé -->
  <div class="info-grid">
    <div class="info-box">
      <div class="info-box-label">Succession totale</div>
      <div class="info-box-value">${totalSuccession.toLocaleString('fr-FR')} ${devises}</div>
    </div>
    <div class="info-box">
      <div class="info-box-label">Héritiers qualifiés</div>
      <div class="info-box-value">${heritiersPart.length}</div>
    </div>
    <div class="info-box">
      <div class="info-box-label">Cas particuliers</div>
      <div class="info-box-value" style="font-size:13px">
        ${awl ? '<span class="badge badge-awl">عول \'Awl</span> ' : ''}
        ${radd ? '<span class="badge badge-radd">رد Radd</span>' : ''}
        ${!awl && !radd ? 'Aucun' : ''}
      </div>
    </div>
  </div>

  <!-- Avertissements -->
  ${avertissementsHTML}

  <!-- Tableau des héritiers -->
  <div class="section-title">Répartition des parts</div>
  <table>
    <thead>
      <tr>
        <th>Héritier</th>
        <th style="text-align:center">Nbre</th>
        <th style="text-align:center">Part</th>
        <th style="text-align:center">%</th>
        <th style="text-align:right">Montant total</th>
        <th style="text-align:right">Par personne</th>
      </tr>
    </thead>
    <tbody>
      ${lignesHeritiers}
      <tr class="total-row">
        <td colspan="4">Total distribué</td>
        <td style="text-align:right">${resultats.totalDistribue.toLocaleString('fr-FR')} ${devises}</td>
        <td></td>
      </tr>
    </tbody>
  </table>

  <!-- Héritiers exclus -->
  ${heritiersExclus.length > 0 ? `
  <div class="section-title">Héritiers exclus (محجوبون)</div>
  <table>
    <thead>
      <tr><th>Héritier</th><th>Nbre</th><th colspan="4">Raison de l'exclusion</th></tr>
    </thead>
    <tbody>${lignesExclus}</tbody>
  </table>
  ` : ''}

  <!-- Résumé arabe -->
  <div class="ar-section">
    <div class="ar-text">${resultats.resumeAr}</div>
  </div>

  <!-- Verset coranique -->
  <div class="verset">
    <div class="verset-ar">يُوصِيكُمُ اللَّهُ فِي أَوْلَادِكُمْ ۖ لِلذَّكَرِ مِثْلُ حَظِّ الْأُنثَيَيْنِ</div>
    <div class="verset-ref">Coran, Sourate An-Nisâ (4:11)</div>
  </div>

  <!-- Pied de page -->
  <div class="footer-doc">
    <strong>Hafia Héritage</strong> — حافيا للمواريث<br>
    Document généré le ${date}<br>
    ⚠️ Ces calculs sont fournis à titre indicatif. Consultez un savant qualifié ou un notaire pour toute décision définitive.<br>
    الحسابات المقدمة للاسترشاد فقط، استشر عالماً متخصصاً في الفرائض
  </div>

  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>
  `;

  const fenetre = window.open('', '_blank', 'width=900,height=700');
  if (fenetre) {
    fenetre.document.write(html);
    fenetre.document.close();
  }
}
