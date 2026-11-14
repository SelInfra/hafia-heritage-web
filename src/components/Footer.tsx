import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-title">Hafia Héritage</div>
      <div className="footer-ar">حافيا للمواريث</div>
      <div className="footer-disclaimer">
        Ces calculs sont fournis à titre indicatif uniquement.
        Pour toute succession importante, consultez un savant qualifié ou un notaire.
        الحسابات المقدمة للاسترشاد فقط، استشر عالماً متخصصاً في الفرائض.
      </div>
      <div style={{ marginTop: 16, fontSize: 12 }}>
        © {new Date().getFullYear()} Hafia Services SARL — Tous droits réservés
      </div>
    </footer>
  );
}
