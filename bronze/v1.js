/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/
const isDebug = false;
const isPerf = false;
if (isPerf) console.error('date;label 1;etat;label 2;label3');
let fichier;
//fichier = require('fs').readFileSync('resources/bois1--1851969838489761790').toString().split('\n');
const readLine = () => {
    const line = fichier ? fichier.shift() : readline();
    if (!isDebug) console.error(line);
    return line;
};
const debug = (message, objet) => {
    if (isDebug) console.error(message, objet);
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
                            return Math.max(0, c / valeurInteressante);
                        } else {
                            return Math.max(0, -c / valeurInteressante);
                            // if (c > 0) {
                            //     return 0;
                            // } else {
                            //     return -c / valeurInteressante;
                            // }
                        }
                    }).reduce((c,p) => c+p);
            }
        }
        localH.push(valeurIngredient);
    }
    return localH;
};
const monHeuristique = (depart, arrivee) =>
    arrivee.map((c, i) => (c - Math.min(depart[i], c)) * h[i])
        .reduce((p, c) => p + c, 0);
const reconstruitChemin = noeud => {
    let courant = noeud;
    while (courant.precedent) {
        courant.precedent.suivant = courant;
        courant = courant.precedent;
    }
    return courant.suivant;
};
const appliqueSort = (noeud, sort) => noeud.inventaire.map((c, i) => c + sort.delta[i]);

const calculeNoeudVoisin = (noeud, sort) => {
    const inventaire = sort.delta ? appliqueSort(noeud, sort) : [...noeud.inventaire];
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
const estRealisable = inventaire => inventaire.every(c => c >= 0);
const calculeCle = noeud => `${noeud.inventaire.reduce((p, c) => p + (c).toString(16), '')}-${noeud.sort ? noeud.sort.type : ''}`;

const aEtoile = (inventaireDepart, potion, sorts, heuristique) => {
    const inventaireMinArrivee = potion.delta.map(c => Math.abs(c));
    const depart = {
        inventaire: [...inventaireDepart],
        // g[n] est le coût du chemin le moins cher du début jusqu'à n qui est connu
        g: 0,
        sorts: [...sorts, {type: 'REST', invoquable: !sorts.every(c => c.invoquable), id: ''}],
        recette: []
    };
    depart.h = heuristique(depart.inventaire, inventaireMinArrivee);
    depart.f = depart.g + depart.h;
    depart.key = calculeCle(depart);
    const arrives = {
        inventaire: [...inventaireMinArrivee]
    };
    let listeOuverte = [depart];
    const listeFermee = [];

    while (listeOuverte.length > 0) {

        // cherche le f le plus bas pour aller à la suite
        let courant = listeOuverte.reduce((p, c) => p.f <= c.f ? p : c);
        // si on est arrivé, c'est fini
        if (courant.inventaire.every((a, i) => a >= arrives.inventaire[i])) {
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
                voisin.h = heuristique(voisin.inventaire, inventaireMinArrivee);
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

if (isPerf) console.error(`${new Date().getTime()};global;debut;;`);
// game loop
let tour = 0;
let tourPrecedent = {};
while (true) {
    if (isPerf) console.error(`${new Date().getTime()};parsing;debut;;`);
    const actionCount = parseInt(readLine()); // the number of spells and recipes in play
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
        const inventory = {
            inv: [inv0, inv1, inv2, inv3],
            score: score
        };
        inventoryArray.push(inventory);
    }
    const monInventaire = inventoryArray[0];

    if (isPerf) console.error(`${new Date().getTime()};parsing;fin;;`);

    tour++;
    const sorts = actionArray.filter(c => c.type === 'CAST');
    if(tour < 6) {
        tourPrecedent.action = `LEARN ${actionArray.filter(c => c.type === 'LEARN')[0].id}`;
        h = calculeVecteurHeuristique(sorts);
        console.log(tourPrecedent.action);
        continue;
    }

    const potions = actionArray.filter(c => c.type === 'BREW');
    const recettes = [];
    for (let potion of potions) {
        if (isPerf) console.error(`${new Date().getTime()};A*;debut;${potion.id};`);
        const etapeSuivante = aEtoile(monInventaire.inv, potion, sorts, monHeuristique);
        etapeSuivante.gain = potion.prix;
        etapeSuivante.rentabilite = etapeSuivante.gain / potion.cout;
        recettes.push(etapeSuivante);
        if (isPerf) console.error(`${new Date().getTime()};A*;fin;${potion.id};${etapeSuivante.cout}`);
    }
    const recetteToDo = recettes.reduce((p, c) => !p ? c : (p.rentabilite < c.rentabilite ? c : p));
    if (isPerf) console.error(`${new Date().getTime()};tour;fin;;`);
    debug(recetteToDo);
    // in the first league: BREW <id> | WAIT; later: BREW <id> | CAST <id> [<times>] | LEARN <id> | REST | WAIT

    tourPrecedent.action = `${recetteToDo.suite.sort.type} ${recetteToDo.suite.sort.id}`;
    tourPrecedent.potionEnObjectif = recetteToDo;
    tourPrecedent.aEtoile = null;
    console.log(tourPrecedent.action);
}


