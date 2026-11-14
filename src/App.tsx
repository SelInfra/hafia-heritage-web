import React, { useState } from 'react';
import Header from './components/Header';
import Calculateur from './components/Calculateur';
import Resultats from './components/Resultats';
import Educatif from './components/Educatif';
import Footer from './components/Footer';
import { ResultatCalcul } from './moteur/types';
import './App.css';

type Page = 'calculateur' | 'educatif' | 'glossaire';

export default function App() {
  const [page, setPage] = useState<Page>('calculateur');
  const [resultats, setResultats] = useState<ResultatCalcul | null>(null);

  return (
    <div className="app">
      <Header page={page} setPage={setPage} />
      <main className="main">
        {page === 'calculateur' && (
          <>
            <Calculateur onResultats={setResultats} />
            {resultats && <Resultats resultats={resultats} />}
          </>
        )}
        {page === 'educatif' && <Educatif />}
      </main>
      <Footer />
    </div>
  );
}
