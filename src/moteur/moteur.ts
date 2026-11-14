/**
 * Moteur de calcul d'héritage islamique
 * Basé sur le Coran, la Sunna et le consensus des 4 écoles
 * 
 * Règles principales :
 * - Parts fixes (فروض) : 1/2, 1/4, 1/8, 2/3, 1/3, 1/6
 * - Résidaires (عصبة) : prennent le reste
 * - Hajb (حجب) : exclusion
 * - 'Awl (عول) : augmentation si parts > 1
 * - Radd (رد) : retour du surplus aux héritiers à parts fixes
 */

import { Heritier, HeritierType, ResultatCalcul, ResultatHeritier, Madhab } from './types';
import { aslMasala, fractionEnTexte, fractionEnPourcentage, simplifierFraction } from './fractions';

interface PartHeritier {
  type: HeritierType;
  nombre: number;
  numerateur: number;
  denominateur: number;
  estAsaba: boolean; // Héritier résidaire
  exclu: boolean;
  raisonExclusion: string;
  regle: string;
}

export function calculerHeritage(
  heritiers: Heritier[],
  totalSuccession: number,
  devise: string = 'FCFA',
  madhab: Madhab = 'maliki'
): ResultatCalcul {
  const actifs = heritiers.filter(h => h.actif && h.nombre > 0);
  const avertissements: string[] = [];

  // Vérifier la présence de chaque type d'héritier
  const a = (type: HeritierType) => actifs.find(h => h.type === type);
  const n = (type: HeritierType) => a(type)?.nombre || 0;

  const hasMari = !!a('mari');
  const hasFemme = !!a('femme');
  const hasFils = n('fils') > 0;
  const hasFille = n('fille') > 0;
  const hasPere = !!a('pere');
  const hasMere = !!a('mere');
  const hasGrandPere = !!a('grand_pere_paternel');
  const hasGrandMerePat = !!a('grand_mere_paternelle');
  const hasGrandMereMat = !!a('grand_mere_maternelle');
  const hasFrereGermain = n('frere_germain') > 0;
  const hasSoeurGermaine = n('soeur_germaine') > 0;
  const hasFrerePaternel = n('frere_paternel') > 0;
  const hasSoeurPaternelle = n('soeur_paternelle') > 0;
  const hasFrereMaternel = n('frere_maternel') > 0;
  const hasSoeurMaternelle = n('soeur_maternelle') > 0;
  const hasFilsDuFils = n('fils_du_fils') > 0;
  const hasFillesDuFils = n('fille_du_fils') > 0;

  const parts: PartHeritier[] = [];

  // =====================================================
  // ÉPOUX / ÉPOUSE
  // =====================================================
  if (hasMari) {
    // Mari : 1/4 avec enfants ou petits-enfants, 1/2 sinon
    const avecEnfants = hasFils || hasFille || hasFilsDuFils || hasFillesDuFils;
    parts.push({
      type: 'mari',
      nombre: 1,
      numerateur: avecEnfants ? 1 : 1,
      denominateur: avecEnfants ? 4 : 2,
      estAsaba: false,
      exclu: false,
      raisonExclusion: '',
      regle: avecEnfants
        ? 'Le mari reçoit 1/4 en présence d\'enfants (Coran 4:12)'
        : 'Le mari reçoit 1/2 en l\'absence d\'enfants (Coran 4:12)',
    });
  }

  if (hasFemme) {
    // Épouse(s) : 1/8 avec enfants, 1/4 sinon — partagé entre elles
    const avecEnfants = hasFils || hasFille || hasFilsDuFils || hasFillesDuFils;
    parts.push({
      type: 'femme',
      nombre: n('femme'),
      numerateur: avecEnfants ? 1 : 1,
      denominateur: avecEnfants ? 8 : 4,
      estAsaba: false,
      exclu: false,
      raisonExclusion: '',
      regle: avecEnfants
        ? `${n('femme') > 1 ? 'Les épouses reçoivent' : 'L\'épouse reçoit'} 1/8 en présence d\'enfants, partagé entre elles (Coran 4:12)`
        : `${n('femme') > 1 ? 'Les épouses reçoivent' : 'L\'épouse reçoit'} 1/4 en l\'absence d\'enfants, partagé entre elles (Coran 4:12)`,
    });
  }

  // =====================================================
  // PÈRE
  // =====================================================
  if (hasPere) {
    if (hasFils || hasFilsDuFils) {
      // Père avec fils : 1/6 fixe
      parts.push({
        type: 'pere',
        nombre: 1,
        numerateur: 1,
        denominateur: 6,
        estAsaba: false,
        exclu: false,
        raisonExclusion: '',
        regle: 'Le père reçoit 1/6 en présence d\'un fils (Coran 4:11)',
      });
    } else if (hasFille || hasFillesDuFils) {
      // Père avec fille uniquement : 1/6 + résidaire
      parts.push({
        type: 'pere',
        nombre: 1,
        numerateur: 1,
        denominateur: 6,
        estAsaba: true, // Prend aussi le résidu
        exclu: false,
        raisonExclusion: '',
        regle: 'Le père reçoit 1/6 + le résidu en présence de fille(s) seulement (Coran 4:11)',
      });
    } else {
      // Père sans enfants : résidaire
      parts.push({
        type: 'pere',
        nombre: 1,
        numerateur: 0,
        denominateur: 1,
        estAsaba: true,
        exclu: false,
        raisonExclusion: '',
        regle: 'Le père prend tout le résidu en l\'absence d\'enfants',
      });
    }
  }

  // =====================================================
  // MÈRE
  // =====================================================
  if (hasMere) {
    const pluraliteFreres = (
      n('frere_germain') + n('soeur_germaine') +
      n('frere_paternel') + n('soeur_paternelle') +
      n('frere_maternel') + n('soeur_maternelle')
    ) >= 2;

    const avecEnfants = hasFils || hasFille || hasFilsDuFils || hasFillesDuFils;

    if (avecEnfants || pluraliteFreres) {
      parts.push({
        type: 'mere',
        nombre: 1,
        numerateur: 1,
        denominateur: 6,
        estAsaba: false,
        exclu: false,
        raisonExclusion: '',
        regle: avecEnfants
          ? 'La mère reçoit 1/6 en présence d\'enfants (Coran 4:11)'
          : 'La mère reçoit 1/6 en présence de 2 frères ou plus (Coran 4:11)',
      });
    } else {
      parts.push({
        type: 'mere',
        nombre: 1,
        numerateur: 1,
        denominateur: 3,
        estAsaba: false,
        exclu: false,
        raisonExclusion: '',
        regle: 'La mère reçoit 1/3 en l\'absence d\'enfants et de pluralité de frères (Coran 4:11)',
      });
    }
  }

  // =====================================================
  // FILS
  // =====================================================
  if (hasFils) {
    parts.push({
      type: 'fils',
      nombre: n('fils'),
      numerateur: 0,
      denominateur: 1,
      estAsaba: true,
      exclu: false,
      raisonExclusion: '',
      regle: 'Le(s) fils prend(nent) le résidu, chaque fils = 2 × part d\'une fille (Coran 4:11)',
    });
  }

  // =====================================================
  // FILLE(S)
  // =====================================================
  if (hasFille) {
    if (!hasFils && !hasFilsDuFils) {
      // Filles sans fils
      if (n('fille') === 1) {
        parts.push({
          type: 'fille',
          nombre: 1,
          numerateur: 1,
          denominateur: 2,
          estAsaba: false,
          exclu: false,
          raisonExclusion: '',
          regle: 'Une seule fille reçoit 1/2 (Coran 4:11)',
        });
      } else {
        parts.push({
          type: 'fille',
          nombre: n('fille'),
          numerateur: 2,
          denominateur: 3,
          estAsaba: false,
          exclu: false,
          raisonExclusion: '',
          regle: `${n('fille')} filles reçoivent 2/3 à partager entre elles (Coran 4:11)`,
        });
      }
    } else {
      // Filles avec fils : résidaires avec le fils (fils = 2 × fille)
      parts.push({
        type: 'fille',
        nombre: n('fille'),
        numerateur: 0,
        denominateur: 1,
        estAsaba: true,
        exclu: false,
        raisonExclusion: '',
        regle: 'La fille prend le résidu avec le fils, selon la règle : 1 fils = 2 filles (Coran 4:11)',
      });
    }
  }

  // =====================================================
  // FILS DU FILS (petit-fils paternel)
  // =====================================================
  if (hasFilsDuFils) {
    const excluParFils = hasFils;
    parts.push({
      type: 'fils_du_fils',
      nombre: n('fils_du_fils'),
      numerateur: 0,
      denominateur: 1,
      estAsaba: !excluParFils,
      exclu: excluParFils,
      raisonExclusion: excluParFils ? 'Exclu par la présence du fils' : '',
      regle: excluParFils
        ? 'Le fils du fils est exclu par la présence du fils direct'
        : 'Le fils du fils prend le résidu en l\'absence du fils',
    });
  }

  // =====================================================
  // FILLE DU FILS
  // =====================================================
  if (hasFillesDuFils) {
    const excluParFils = hasFils;
    const excluParFillesPlusFilsDuFils = !excluParFils && hasFille && n('fille') >= 2 && !hasFilsDuFils;

    if (excluParFils) {
      parts.push({
        type: 'fille_du_fils',
        nombre: n('fille_du_fils'),
        numerateur: 0,
        denominateur: 1,
        estAsaba: false,
        exclu: true,
        raisonExclusion: 'Exclue par la présence du fils',
        regle: 'La fille du fils est exclue par le fils direct',
      });
    } else if (excluParFillesPlusFilsDuFils) {
      parts.push({
        type: 'fille_du_fils',
        nombre: n('fille_du_fils'),
        numerateur: 0,
        denominateur: 1,
        estAsaba: false,
        exclu: true,
        raisonExclusion: 'Exclue par 2 filles directes sans fils du fils',
        regle: 'La fille du fils est exclue par 2 filles en l\'absence de fils du fils',
      });
    } else if (!hasFille && !hasFilsDuFils) {
      // Seule fille du fils : 1/2
      if (n('fille_du_fils') === 1) {
        parts.push({
          type: 'fille_du_fils',
          nombre: 1,
          numerateur: 1,
          denominateur: 2,
          estAsaba: false,
          exclu: false,
          raisonExclusion: '',
          regle: 'Une seule fille du fils reçoit 1/2',
        });
      } else {
        parts.push({
          type: 'fille_du_fils',
          nombre: n('fille_du_fils'),
          numerateur: 2,
          denominateur: 3,
          estAsaba: false,
          exclu: false,
          raisonExclusion: '',
          regle: 'Plusieurs filles du fils reçoivent 2/3',
        });
      }
    } else if (n('fille') === 1 && !hasFilsDuFils) {
      // Complète jusqu'à 2/3
      parts.push({
        type: 'fille_du_fils',
        nombre: n('fille_du_fils'),
        numerateur: 1,
        denominateur: 6,
        estAsaba: false,
        exclu: false,
        raisonExclusion: '',
        regle: 'La fille du fils reçoit 1/6 pour compléter les 2/3 avec la fille directe',
      });
    } else {
      // Avec fils du fils : résidaire
      parts.push({
        type: 'fille_du_fils',
        nombre: n('fille_du_fils'),
        numerateur: 0,
        denominateur: 1,
        estAsaba: true,
        exclu: false,
        raisonExclusion: '',
        regle: 'La fille du fils prend le résidu avec le fils du fils',
      });
    }
  }

  // =====================================================
  // GRAND-PÈRE PATERNEL
  // =====================================================
  if (hasGrandPere) {
    const excluParPere = hasPere;
    if (excluParPere) {
      parts.push({
        type: 'grand_pere_paternel',
        nombre: 1,
        numerateur: 0,
        denominateur: 1,
        estAsaba: false,
        exclu: true,
        raisonExclusion: 'Exclu par le père',
        regle: 'Le grand-père est exclu par la présence du père',
      });
    } else if (hasFils || hasFilsDuFils) {
      parts.push({
        type: 'grand_pere_paternel',
        nombre: 1,
        numerateur: 1,
        denominateur: 6,
        estAsaba: false,
        exclu: false,
        raisonExclusion: '',
        regle: 'Le grand-père reçoit 1/6 en présence d\'un fils (comme le père)',
      });
    } else {
      parts.push({
        type: 'grand_pere_paternel',
        nombre: 1,
        numerateur: 0,
        denominateur: 1,
        estAsaba: true,
        exclu: false,
        raisonExclusion: '',
        regle: 'Le grand-père prend le résidu en l\'absence du père et des fils',
      });
    }
  }

  // =====================================================
  // GRAND-MÈRES
  // =====================================================
  if (hasGrandMerePat || hasGrandMereMat) {
    // Grand-mère paternelle exclue par le père (selon la plupart des écoles)
    if (hasGrandMerePat) {
      const excluParMere = hasMere;
      const excluParPere = hasPere; // Selon Maliki/Hanbali
      parts.push({
        type: 'grand_mere_paternelle',
        nombre: 1,
        numerateur: excluParMere || excluParPere ? 0 : 1,
        denominateur: excluParMere || excluParPere ? 1 : 6,
        estAsaba: false,
        exclu: excluParMere || excluParPere,
        raisonExclusion: excluParMere
          ? 'Exclue par la mère'
          : excluParPere
          ? 'Exclue par le père (école malékite)'
          : '',
        regle: excluParMere || excluParPere
          ? 'La grand-mère paternelle est exclue'
          : 'La grand-mère reçoit 1/6',
      });
    }

    if (hasGrandMereMat) {
      const excluParMere = hasMere;
      parts.push({
        type: 'grand_mere_maternelle',
        nombre: 1,
        numerateur: excluParMere ? 0 : 1,
        denominateur: excluParMere ? 1 : 6,
        estAsaba: false,
        exclu: excluParMere,
        raisonExclusion: excluParMere ? 'Exclue par la mère' : '',
        regle: excluParMere
          ? 'La grand-mère maternelle est exclue par la mère'
          : 'La grand-mère maternelle reçoit 1/6',
      });
    }
  }

  // =====================================================
  // FRÈRES ET SŒURS GERMAINS
  // =====================================================
  const exclusParFilsOuPere = hasFils || hasFilsDuFils || hasPere;

  if (hasFrereGermain || hasSoeurGermaine) {
    if (exclusParFilsOuPere) {
      if (hasFrereGermain) {
        parts.push({
          type: 'frere_germain',
          nombre: n('frere_germain'),
          numerateur: 0,
          denominateur: 1,
          estAsaba: false,
          exclu: true,
          raisonExclusion: hasFils ? 'Exclu par le fils' : 'Exclu par le père',
          regle: 'Le frère germain est exclu par le fils ou le père',
        });
      }
      if (hasSoeurGermaine) {
        parts.push({
          type: 'soeur_germaine',
          nombre: n('soeur_germaine'),
          numerateur: 0,
          denominateur: 1,
          estAsaba: false,
          exclu: true,
          raisonExclusion: hasFils ? 'Exclue par le fils' : 'Exclue par le père',
          regle: 'La sœur germaine est exclue par le fils ou le père',
        });
      }
    } else {
      // Frères et sœurs germains héritent
      const nbFG = n('frere_germain');
      const nbSG = n('soeur_germaine');

      if (nbFG > 0) {
        // Frère(s) germain(s) : résidaires
        // Si avec sœur(s) : frère = 2 × sœur
        parts.push({
          type: 'frere_germain',
          nombre: nbFG,
          numerateur: 0,
          denominateur: 1,
          estAsaba: true,
          exclu: false,
          raisonExclusion: '',
          regle: 'Le(s) frère(s) germain(s) prend(nent) le résidu, 1 frère = 2 sœurs',
        });
      }

      if (nbSG > 0 && nbFG === 0) {
        // Sœur(s) germaine(s) sans frère
        if (!hasFille && !hasFillesDuFils) {
          if (nbSG === 1) {
            parts.push({
              type: 'soeur_germaine',
              nombre: 1,
              numerateur: 1,
              denominateur: 2,
              estAsaba: false,
              exclu: false,
              raisonExclusion: '',
              regle: 'Une seule sœur germaine reçoit 1/2 (Coran 4:176)',
            });
          } else {
            parts.push({
              type: 'soeur_germaine',
              nombre: nbSG,
              numerateur: 2,
              denominateur: 3,
              estAsaba: false,
              exclu: false,
              raisonExclusion: '',
              regle: 'Plusieurs sœurs germaines reçoivent 2/3 (Coran 4:176)',
            });
          }
        } else {
          // Avec fille(s) : sœur devient résidaire (عصبة مع الغير)
          parts.push({
            type: 'soeur_germaine',
            nombre: nbSG,
            numerateur: 0,
            denominateur: 1,
            estAsaba: true,
            exclu: false,
            raisonExclusion: '',
            regle: 'La sœur germaine prend le résidu en présence de fille(s) (عصبة مع الغير)',
          });
        }
      } else if (nbSG > 0 && nbFG > 0) {
        // Avec frère : résidaire partagé (frère = 2 × sœur)
        parts.push({
          type: 'soeur_germaine',
          nombre: nbSG,
          numerateur: 0,
          denominateur: 1,
          estAsaba: true,
          exclu: false,
          raisonExclusion: '',
          regle: 'La sœur germaine partage le résidu avec le frère (1 frère = 2 sœurs)',
        });
      }
    }
  }

  // =====================================================
  // FRÈRES ET SŒURS CONSANGUINS (paternels)
  // =====================================================
  const exclusParFG = hasFrereGermain || (hasSoeurGermaine && !hasFille);
  if ((hasFrerePaternel || hasSoeurPaternelle) && !exclusParFilsOuPere) {
    if (exclusParFG) {
      if (hasFrerePaternel) {
        parts.push({
          type: 'frere_paternel',
          nombre: n('frere_paternel'),
          numerateur: 0, denominateur: 1,
          estAsaba: false, exclu: true,
          raisonExclusion: 'Exclu par le frère germain',
          regle: 'Le frère consanguin est exclu par le frère germain',
        });
      }
      if (hasSoeurPaternelle) {
        parts.push({
          type: 'soeur_paternelle',
          nombre: n('soeur_paternelle'),
          numerateur: 0, denominateur: 1,
          estAsaba: false, exclu: true,
          raisonExclusion: 'Exclue par le frère germain',
          regle: 'La sœur consanguine est exclue par le frère germain',
        });
      }
    } else {
      // Mêmes règles que frères germains mais rang inférieur
      if (n('frere_paternel') > 0) {
        parts.push({
          type: 'frere_paternel',
          nombre: n('frere_paternel'),
          numerateur: 0, denominateur: 1,
          estAsaba: true, exclu: false,
          raisonExclusion: '',
          regle: 'Le(s) frère(s) consanguin(s) prend(nent) le résidu',
        });
      }
      if (n('soeur_paternelle') > 0 && n('frere_paternel') === 0) {
        const nbSP = n('soeur_paternelle');
        if (!hasFille && !hasFillesDuFils) {
          parts.push({
            type: 'soeur_paternelle',
            nombre: nbSP,
            numerateur: nbSP === 1 ? 1 : 2,
            denominateur: nbSP === 1 ? 2 : 3,
            estAsaba: false, exclu: false,
            raisonExclusion: '',
            regle: nbSP === 1 ? 'La sœur consanguine reçoit 1/2' : 'Les sœurs consanguines reçoivent 2/3',
          });
        } else {
          parts.push({
            type: 'soeur_paternelle',
            nombre: nbSP,
            numerateur: 0, denominateur: 1,
            estAsaba: true, exclu: false,
            raisonExclusion: '',
            regle: 'La sœur consanguine prend le résidu en présence de fille(s)',
          });
        }
      } else if (n('soeur_paternelle') > 0) {
        parts.push({
          type: 'soeur_paternelle',
          nombre: n('soeur_paternelle'),
          numerateur: 0, denominateur: 1,
          estAsaba: true, exclu: false,
          raisonExclusion: '',
          regle: 'La sœur consanguine partage le résidu avec le frère consanguin',
        });
      }
    }
  }

  // =====================================================
  // FRÈRES ET SŒURS UTÉRINS (maternels)
  // =====================================================
  if (hasFrereMaternel || hasSoeurMaternelle) {
    if (hasFils || hasFilsDuFils || hasPere || hasGrandPere) {
      // Exclus par fils, père ou grand-père
      [a('frere_maternel'), a('soeur_maternelle')].filter(Boolean).forEach(h => {
        parts.push({
          type: h!.type,
          nombre: h!.nombre,
          numerateur: 0, denominateur: 1,
          estAsaba: false, exclu: true,
          raisonExclusion: hasFils ? 'Exclu(e) par le fils' : hasPere ? 'Exclu(e) par le père' : 'Exclu(e) par le grand-père',
          regle: 'Les frères/sœurs utérin(e)s sont exclu(e)s par le fils, le père ou le grand-père',
        });
      });
    } else {
      const nbFrMat = n('frere_maternel');
      const nbSrMat = n('soeur_maternelle');
      const total = nbFrMat + nbSrMat;

      if (total === 1) {
        parts.push({
          type: nbFrMat > 0 ? 'frere_maternel' : 'soeur_maternelle',
          nombre: 1,
          numerateur: 1, denominateur: 6,
          estAsaba: false, exclu: false,
          raisonExclusion: '',
          regle: 'Un(e) seul(e) frère/sœur utérin(e) reçoit 1/6 (Coran 4:12)',
        });
      } else {
        // Plusieurs : partagent 1/3 également (homme = femme ici !)
        if (nbFrMat > 0) {
          parts.push({
            type: 'frere_maternel',
            nombre: nbFrMat,
            numerateur: 1, denominateur: 3,
            estAsaba: false, exclu: false,
            raisonExclusion: '',
            regle: `${total} frères/sœurs utérin(e)s partagent 1/3 à parts égales (Coran 4:12)`,
          });
        }
        if (nbSrMat > 0) {
          parts.push({
            type: 'soeur_maternelle',
            nombre: nbSrMat,
            numerateur: nbFrMat > 0 ? 0 : 1,
            denominateur: nbFrMat > 0 ? 1 : 3,
            estAsaba: false, exclu: false,
            raisonExclusion: '',
            regle: nbFrMat > 0
              ? 'Partage 1/3 avec le frère utérin à parts égales'
              : `${nbSrMat} sœurs utérines partagent 1/3`,
          });
        }
      }
    }
  }

  // =====================================================
  // ONCLE PATERNEL & FILS ONCLE
  // =====================================================
  if (a('oncle_paternel') && !exclusParFilsOuPere && !hasFrereGermain && !hasFrerePaternel) {
    parts.push({
      type: 'oncle_paternel',
      nombre: n('oncle_paternel'),
      numerateur: 0, denominateur: 1,
      estAsaba: true, exclu: false,
      raisonExclusion: '',
      regle: 'L\'oncle paternel prend le résidu en l\'absence des héritiers plus proches',
    });
  } else if (a('oncle_paternel')) {
    parts.push({
      type: 'oncle_paternel',
      nombre: n('oncle_paternel'),
      numerateur: 0, denominateur: 1,
      estAsaba: false, exclu: true,
      raisonExclusion: 'Exclu par un héritier plus proche',
      regle: 'L\'oncle paternel est exclu',
    });
  }

  if (a('fils_oncle_paternel') && !exclusParFilsOuPere && !hasFrereGermain && !hasFrerePaternel && !a('oncle_paternel')) {
    parts.push({
      type: 'fils_oncle_paternel',
      nombre: n('fils_oncle_paternel'),
      numerateur: 0, denominateur: 1,
      estAsaba: true, exclu: false,
      raisonExclusion: '',
      regle: 'Le fils de l\'oncle paternel prend le résidu en dernier recours',
    });
  } else if (a('fils_oncle_paternel')) {
    parts.push({
      type: 'fils_oncle_paternel',
      nombre: n('fils_oncle_paternel'),
      numerateur: 0, denominateur: 1,
      estAsaba: false, exclu: true,
      raisonExclusion: 'Exclu par un héritier plus proche',
      regle: 'Le fils de l\'oncle paternel est exclu',
    });
  }

  // =====================================================
  // CALCUL FINAL
  // =====================================================

  // Trouver les dénominateurs des parts fixes
  const partsNonExclues = parts.filter(p => !p.exclu);
  const partsFixees = partsNonExclues.filter(p => !p.estAsaba && p.denominateur > 1);
  const partsAsaba = partsNonExclues.filter(p => p.estAsaba);

  // Calculer l'asl al-mas'ala (dénominateur commun)
  let asl = partsFixees.length > 0
    ? aslMasala(partsFixees.map(p => p.denominateur))
    : 1;

  // Calculer le total des parts fixes
  let totalPartsFixees = partsFixees.reduce((sum, p) => {
    return sum + (p.numerateur / p.denominateur);
  }, 0);

  // Vérifier 'Awl (augmentation) : si parts fixes > 1
  let awl = false;
  if (totalPartsFixees > 1 + 1e-10) {
    awl = true;
    avertissements.push('Cas de \'Awl (عول) : les parts dépassent la succession. Les parts seront réduites proportionnellement.');
  }

  // Calculer le résidu pour les 'asaba
  const residuFraction = Math.max(0, 1 - totalPartsFixees);

  // Calculer les parts finales en fraction
  const resultats: ResultatHeritier[] = parts.map(part => {
    if (part.exclu) {
      return {
        type: part.type,
        nombre: part.nombre,
        fraction: '0',
        numerateur: 0,
        denominateur: 1,
        pourcentage: 0,
        montant: 0,
        regle: part.regle,
        raisonExclusion: part.raisonExclusion,
        exclu: true,
      };
    }

    let num: number;
    let den: number;

    if (part.estAsaba) {
      // Calculer la part du résidu pour chaque type d'asaba
      const partsAsabaActives = partsAsaba.filter(p => !p.exclu);

      if (residuFraction <= 0) {
        // Pas de résidu
        return {
          type: part.type,
          nombre: part.nombre,
          fraction: '0',
          numerateur: 0,
          denominateur: 1,
          pourcentage: 0,
          montant: 0,
          regle: part.regle + ' (aucun résidu disponible)',
          raisonExclusion: '',
          exclu: false,
        };
      }

      // Calculer les unités totales (fils = 2×fille dans le résidu)
      let unitesTotales = 0;
      let unitesType = 0;

      // Fils + filles
      if (hasFils || (hasFille && hasFils)) {
        const nbFils = n('fils');
        const nbFilles = hasFille ? n('fille') : 0;
        unitesTotales = nbFils * 2 + nbFilles;
        if (part.type === 'fils') unitesType = part.nombre * 2;
        if (part.type === 'fille') unitesType = part.nombre;
      }
      // Fils du fils + fille du fils
      else if (hasFilsDuFils || (hasFillesDuFils && hasFilsDuFils)) {
        const nbFdF = n('fils_du_fils');
        const nbFdFille = hasFillesDuFils ? n('fille_du_fils') : 0;
        unitesTotales = nbFdF * 2 + nbFdFille;
        if (part.type === 'fils_du_fils') unitesType = part.nombre * 2;
        if (part.type === 'fille_du_fils') unitesType = part.nombre;
      }
      // Père seul résidaire
      else if (part.type === 'pere' && partsAsabaActives.length === 1) {
        unitesTotales = 1;
        unitesType = 1;
      }
      // Frères germains + sœurs germaines
      else if (part.type === 'frere_germain' || part.type === 'soeur_germaine') {
        const nbFG2 = n('frere_germain');
        const nbSG2 = n('soeur_germaine');
        unitesTotales = nbFG2 * 2 + nbSG2;
        if (part.type === 'frere_germain') unitesType = part.nombre * 2;
        if (part.type === 'soeur_germaine') unitesType = part.nombre;
      }
      // Autres résidaires (tous égaux)
      else {
        unitesTotales = partsAsabaActives.reduce((sum, p) => sum + p.nombre, 0);
        unitesType = part.nombre;
      }

      if (unitesTotales === 0) unitesTotales = 1;

      num = unitesType;
      den = unitesTotales;

      // La part réelle = résidu × (unitesType / unitesTotales)
      const partReelle = residuFraction * (unitesType / unitesTotales);
      const [sNum, sDen] = simplifierFraction(
        Math.round(partReelle * 1000),
        1000
      );
      num = sNum;
      den = sDen;

      // Si père avec 1/6 fixe + résidu
      if (part.type === 'pere' && hasFille && !hasFils) {
        const residuPere = residuFraction;
        const partPere = (1 / 6) + residuPere;
        const [pNum, pDen] = simplifierFraction(Math.round(partPere * 600), 600);
        num = pNum;
        den = pDen;
      }
    } else {
      // Part fixe
      if (awl) {
        // 'Awl : réduire proportionnellement
        const partReelle = (part.numerateur / part.denominateur) / totalPartsFixees;
        const [sNum, sDen] = simplifierFraction(Math.round(partReelle * 1200), 1200);
        num = sNum;
        den = sDen;
      } else {
        [num, den] = simplifierFraction(part.numerateur, part.denominateur);
      }
    }

    const pourcentage = fractionEnPourcentage(num, den);
    const montantParPersonne = (totalSuccession * num) / (den * part.nombre);
    const montantTotal = (totalSuccession * num) / den;

    return {
      type: part.type,
      nombre: part.nombre,
      fraction: fractionEnTexte(num, den),
      numerateur: num,
      denominateur: den,
      pourcentage,
      montant: Math.round(montantTotal),
      regle: part.regle,
      raisonExclusion: '',
      exclu: false,
    };
  });

  // Vérifier Radd (رد)
  const totalDistribue = resultats
    .filter(r => !r.exclu)
    .reduce((sum, r) => sum + r.montant, 0);

  const radd = !awl && partsAsaba.filter(p => !p.exclu).length === 0 && totalDistribue < totalSuccession;

  if (radd) {
    avertissements.push('Cas de Radd (رد) : le surplus est redistribué aux héritiers à parts fixes proportionnellement.');
  }

  // Vérifier s'il n'y a aucun héritier
  if (resultats.filter(r => !r.exclu).length === 0) {
    avertissements.push('Aucun héritier trouvé. La succession revient au Trésor public (بيت المال).');
  }

  return {
    totalSuccession,
    devises: devise,
    madhab,
    aslMasala: asl,
    awl,
    radd,
    heritiers: resultats,
    totalDistribue,
    resume: genererResume(resultats, totalSuccession, devise),
    resumeAr: genererResumeArabe(resultats),
    avertissements,
  };
}

function genererResume(resultats: ResultatHeritier[], total: number, devise: string): string {
  const heritiers = resultats.filter(r => !r.exclu && r.montant > 0);
  if (heritiers.length === 0) return 'Aucun héritier qualifié trouvé.';

  const lignes = heritiers.map(h => {
    const info = require('./heritiers').HERITIERS_INFO[h.type];
    return `${info.nomFr} (×${h.nombre}) : ${h.fraction} = ${h.montant.toLocaleString()} ${devise}`;
  });

  return `Répartition de ${total.toLocaleString()} ${devise} :\n${lignes.join('\n')}`;
}

function genererResumeArabe(resultats: ResultatHeritier[]): string {
  const heritiers = resultats.filter(r => !r.exclu && r.montant > 0);
  if (heritiers.length === 0) return 'لا يوجد وارث';

  const lignes = heritiers.map(h => {
    const info = require('./heritiers').HERITIERS_INFO[h.type];
    return `${info.nomAr}: ${h.fraction}`;
  });

  return lignes.join(' | ');
}
