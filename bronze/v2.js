/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/
const isDebug = true;
const recupereInput = false;
let fichier;
//fichier = require('fs').readFileSync('resources/bronze--2594522886311000100').toString().split('\n');
const readLine = () => {
    const line = fichier ? fichier.shift() : readline();
    if (!isDebug && recupereInput) console.error(line);
    return line;
};
const debug = (message, objet) => {
    if (isDebug) console.error(message, objet);
};
const faitQuelqueChose = (monInventaire, sorts) => {
    const sortToDoArray = sorts.map(s => s.valeurDelta = s.delta.reduce((a, c) => a + c, 0));
    //Si fonctionComparaison(a, b) est inférieur à 0, on trie a avec un indice inférieur à b
    sortToDoArray.sort((a, b) => b.valeurDelta - a.valeurDelta);
    for (let sort in sortToDoArray) {
        const inventaire = sort.delta ? appliqueSort(monInventaire, sort) : [...monInventaire];
        if (estRealisable(inventaire)) {
            debug('sort', sort);
            return sort;
        }
    }
    return {type: 'REST', invoquable: !sorts.every(c => c.invoquable), id: ''};
};
let h = [0.5, 1.5, 2.5, 3.5];
const calculeVecteurHeuristique = sorts => {
    const localH = [];
    // pour chaque type d'ingrédient
    for (let ingIdx = 0; ingIdx < 4; ingIdx++) {
        // pour chaque sort, on calcule la participation du sort à la création de l'ingrédient
        let valeurIngredient = 0;
        for (let s of sorts) {
            const valeurInteressante = s.delta[ingIdx];
            if (valeurInteressante > 0) {
                valeurIngredient = valeurIngredient +
                    s.delta.map((c, i) => {
                        if (ingIdx === i) {
                            return c / valeurInteressante;
                        } else {
                            return Math.max(0, -c / valeurInteressante);
                        }
                    }).reduce((c, p) => c + p);
                valeurIngredient = valeurIngredient / valeurInteressante;
            }
        }
        localH.push(valeurIngredient);
    }
    return localH;
};
const monHeuristique = (depart, arrivee) =>
    arrivee.map((c, i) => (c - Math.min(depart[i], c)) * h[i])
        .reduce((p, c) => p + c, 0);
const calculeCout = (inventaire, potion) => monHeuristique(inventaire, potion.delta.map(c => Math.abs(c)));
const reconstruitChemin = noeud => {
    let courant = noeud;
    while (courant.precedent) {
        courant.precedent.suivant = courant;
        courant = courant.precedent;
    }
    return courant.suivant;
};
const appliqueSort = (inventaire, sort) => inventaire.map((c, i) => c + sort.delta[i]);

const calculeNoeudVoisin = (noeud, sort) => {
    const inventaire = sort.delta ? appliqueSort(noeud.inventaire, sort) : [...noeud.inventaire];
    if (!estRealisable(inventaire)) return null;
    const voisin = {};
    voisin.inventaire = inventaire;
    voisin.sorts = JSON.parse(JSON.stringify(noeud.sorts));
    if (sort.type === 'REST') {
        voisin.sorts.forEach(s => s.invoquable = true);
        voisin.sorts.find(s => s.type === 'REST').invoquable = false;
    } else {
        voisin.sorts.find(s => s.id === sort.id).invoquable = false;
        voisin.sorts.find(s => s.type === 'REST').invoquable = true;
    }

    voisin.sort = sort;
    voisin.key = calculeCle(voisin);
    return voisin;
};
const estRealisable = inventaire => inventaire.every(c => c >= 0) && inventaire.reduce((a, c) => a + c, 0) <= 10;
const calculeCle = noeud => `${noeud.inventaire.reduce((p, c) => p + (c).toString(16), '')}-${noeud.sort ? noeud.sort.type : ''}`;

const aEtoile = (inventaireDepart, potion, sorts, heuristique, tourPrecedent, heureDepart) => {
    const arrivee = potion.delta.map(c => Math.abs(c));
    let listeOuverte;
    let listeFermee;
    if (!tourPrecedent.aEtoile) {
        const depart = {
            inventaire: [...inventaireDepart],
            // g[n] est le coût du chemin le moins cher du début jusqu'à n qui est connu
            g: 0,
            sorts: [...sorts, {type: 'REST', invoquable: !sorts.every(c => c.invoquable), id: ''}],
            recette: []
        };
        depart.h = heuristique(depart.inventaire, arrivee);
        depart.f = depart.g + depart.h;
        depart.key = calculeCle(depart);
        listeOuverte = [depart];
        listeFermee = [];
    } else {
        listeOuverte = tourPrecedent.aEtoile.listeOuverte;
        listeFermee = tourPrecedent.aEtoile.listeFermee;
        tourPrecedent.aEtoile = null;
    }
    while (listeOuverte.length > 0) {
        if (new Date().getTime() - heureDepart > 40) {
            tourPrecedent.aEtoile = {
                listeOuverte: listeOuverte,
                listeFermee: listeFermee,
                nbTimeout: tourPrecedent && tourPrecedent.aEtoile ? tourPrecedent.aEtoile.nbTimeout + 1 : 1
            };
            return null;
        }

        // cherche le f le plus bas pour aller à la suite
        let courant = listeOuverte.reduce((p, c) => p.f <= c.f ? p : c);
        // si on est arrivé, c'est fini
        if (courant.inventaire.every((a, i) => a >= arrivee[i])) {
            courant.suivant = {sort: potion, cout: courant.g + 1};
            let suite = reconstruitChemin(courant);
            return {
                suite: suite,
                cout: courant.g + 1
            };
        }

        // sinon, on cherche parmis les plus proches
        listeOuverte = listeOuverte.filter(v => v.key !== courant.key);
        listeFermee.push(courant);
        for (let sort of courant.sorts.filter(c => c.invoquable)) {
            const voisin = calculeNoeudVoisin(courant, sort);
            if (voisin) {
                if (listeFermee.find(c => c.key === voisin.key)) continue;

                voisin.g = courant.g + 1;
                voisin.h = heuristique(voisin.inventaire, arrivee);
                voisin.f = voisin.g + voisin.h;

                const existant = listeOuverte.find(c => c.key === voisin.key);
                if (!existant || voisin.f < existant.h) {
                    listeOuverte.push(voisin);
                    voisin.precedent = courant;
                }
            }
        }

    }
    throw 'Erreur A star';

};

let tour = 0;
let tourPrecedent = {};

const evalueAction = sort => `${sort.type} ${sort.id}`;

const scores = [{
    nbPotions: 0,
    score: 0
}, {
    nbPotions: 0,
    score: 0
}];

while (true) {
    const actionCount = parseInt(readLine()); // the number of spells and recipes in play
    let heureDepart = new Date().getTime();
    const actionArray = [];
    for (let i = 0; i < actionCount; i++) {
        const inputs = readLine().split(' ');
        const actionId = parseInt(inputs[0]); // the unique ID of this spell or recipe
        const actionType = inputs[1]; // in the first league: BREW; later: CAST, OPPONENT_CAST, LEARN, BREW
        const delta0 = parseInt(inputs[2]); // tier-0 ingredient change
        const delta1 = parseInt(inputs[3]); // tier-1 ingredient change
        const delta2 = parseInt(inputs[4]); // tier-2 ingredient change
        const delta3 = parseInt(inputs[5]); // tier-3 ingredient change
        const price = parseInt(inputs[6]); // the price in rupees if this is a potion
        const tomeIndex = parseInt(inputs[7]); // the index in the tome if this is a tome spell, equal to the read-ahead tax
        const taxCount = parseInt(inputs[8]); // later: the amount of taxed tier-0 ingredients you gain from learning this spell
        const castable = inputs[9] !== '0'; // 1 if this is a castable player spell
        const repeatable = inputs[10] !== '0';
        const action = {
            id: actionId,
            type: actionType,
            delta: [delta0, delta1, delta2, delta3],
            prix: price,
            invoquable: castable,
            indexTome: tomeIndex,
            taxe: taxCount,
            repetable: repeatable
        };
        actionArray.push(action); // for the first two leagues: always 0; later: 1 if this is a repeatable player spell
    }
    const inventoryArray = [];
    for (let i = 0; i < 2; i++) {
        const inputs = readLine().split(' ');
        const inv0 = parseInt(inputs[0]); // tier-0 ingredients in inventory
        const inv1 = parseInt(inputs[1]);
        const inv2 = parseInt(inputs[2]);
        const inv3 = parseInt(inputs[3]);
        const score = parseInt(inputs[4]); // amount of rupees
        if (score > scores[i].score) scores[i].nbPotions++
        scores[i].score = score
        inventoryArray.push([inv0, inv1, inv2, inv3]);
    }
    const monInventaire = inventoryArray[0];

    tour++;
    const sorts = actionArray.filter(c => c.type === 'CAST');
    if (tour < 6) {
        tourPrecedent.action = `LEARN ${actionArray.filter(c => c.type === 'LEARN')[0].id}`;
        h = calculeVecteurHeuristique(sorts);
        console.log(tourPrecedent.action);
        continue;
    }

    const potions = actionArray.filter(c => c.type === 'BREW');
    // calculer les heuristiques globales pour toutes les potions et ne faire que la plus rentable
    let potion;
    let isRush = false;
    if (scores[0].nbPotions > 4 && scores[0].nbPotions > scores[1].nbPotions && scores[0].score < scores[1].score) {
        // quoi, il ne me reste que 2 potions, j'en ai fait plus que mon adversaire et j'ai un score inférieur ? on fait la plus chère !
        debug('cher', scores);
        potion = potions.reduce((a, c) => !!a && (a.prix + a.taxe) > (c.prix + c.taxe) ? a : c, {});
        //debug('if', 1);
    } else if (scores[0].nbPotions + 2 <= scores[1].nbPotions) {
        // quoi ? l'adversaire a 2 potions d'avances ? faut rusher !
        debug('rush', scores);
        potion = potions.reduce((a, c) => a && c.prix + c.taxe < a.prix + a.taxe ? c : a, {});
        debug('rush new potion : ', potion);
        isRush = true;
    } else {
        potion = potions.reduce((a, c) => {
            c.cout = calculeCout(monInventaire, c);
            c.rentabilite = (c.prix + c.taxe) / c.cout;
            if (!a) return c;
            return a.rentabilite > c.rentabilite ? a : c;
        }, undefined);
    }

    // si la potion a déjà été analysée par A* au tour précédent, pas besoin de recommencer
    const etapeSuivante = {};
    if (tourPrecedent && tourPrecedent.recette && tourPrecedent.recette.potionIdObjectif === potion.id) {
        debug("quoi faire ? ", 1);
        debug("tourPrecedent", tourPrecedent);
        debug("tourPrecedent.recette.suite.suivant", tourPrecedent.recette.suite.suivant);
        debug("potion", potion);
        etapeSuivante.potionIdObjectif = potion.id;
        etapeSuivante.recette = {suite: tourPrecedent.recette.suite.suivant};
    } else if (tourPrecedent.aEtoile && tourPrecedent.aEtoile.nbTimeout >= 2) {
        debug("quoi faire ?", 2);
        etapeSuivante.recette = {suite: {sort: faitQuelqueChose(monInventaire, sorts)}};
    } else {
        debug("quoi faire ?", 3);
        etapeSuivante.recette = aEtoile(monInventaire, potion, sorts, monHeuristique, tourPrecedent, heureDepart);
        if (!etapeSuivante.recette) {
            console.log('WAIT');
            continue;
        }
    }
    if (!etapeSuivante.recette.suite) {
        debug('tourPrecedent', tourPrecedent);
        debug('etapeSuivante.recette', etapeSuivante.recette);
    }
    etapeSuivante.action = evalueAction(etapeSuivante.recette.suite.sort);

    console.log(etapeSuivante.action);
    tourPrecedent = etapeSuivante;
}


