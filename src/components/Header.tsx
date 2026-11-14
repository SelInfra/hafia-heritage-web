import React from 'react';

interface Props {
  page: string;
  setPage: (p: any) => void;
}

export default function Header({ page, setPage }: Props) {
  return (
    <header className="header">
      <div className="header-inner">
        <a className="logo" href="/">
          <span className="logo-icon">☪️</span>
          <span className="logo-text">
            <span className="logo-name">Hafia Héritage</span>
            <span className="logo-ar">حافيا للمواريث</span>
          </span>
        </a>
        <nav className="nav">
          <button
            className={`nav-btn ${page === 'calculateur' ? 'active' : ''}`}
            onClick={() => setPage('calculateur')}
          >
            🧮 <span>Calculateur</span>
          </button>
          <button
            className={`nav-btn ${page === 'educatif' ? 'active' : ''}`}
            onClick={() => setPage('educatif')}
          >
            📚 <span>Apprendre</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
