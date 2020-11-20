/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/
const isDebug = true;
const isLocal = true;
const fichier = require('fs').readFileSync('resources/bois1--1851969838489761790').toString().split('\n');
const readLine = () => {
    const line = isLocal ? fichier.shift() : readline();
    if(!isDebug) console.error(line);
    return line;
};
const debug = stringArray => {
    if(isDebug) console.error(stringArray);
};
//const h = [0.5, 1.5, 2.5, 3.5];
const monHeuristique = (depart, arrivee, h = [0.5, 1.5, 2.5, 3.5]) =>
    arrivee.map((c, i) => (c - Math.min(depart[i], c)) * h[i])
        .reduce((p, c) => p + c, 0);
const reconstruitChemin = noeud => {
    const recette = [noeud.suivant];
    let courant = noeud;
    while (courant.precedent) {
        recette.push(courant);
        courant = courant.precedent;
    }
    return recette.reverse();
};
const calculeNoeudVoisin = (noeud, sort, inventaireMinArrivee, heuristique) => {
    const voisin = {};
    voisin.inventaire = sort.delta ? noeud.inventaire.map((c, i) => c + sort.delta[i]) : [...noeud.inventaire];
    voisin.f = heuristique(voisin.inventaire, inventaireMinArrivee);
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
const estRealisable = noeud => noeud.inventaire.every(c => c >= 0);
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
    depart.f = heuristique(depart.inventaire, inventaireMinArrivee);
    depart.key = calculeCle(depart);
    const arrives = {
        inventaire: [...inventaireMinArrivee]
    };
    let listeOuverte = [depart];
    const listeFermee = [];
    while(listeOuverte.length > 0){

        // cherche le f le plus bas pour aller à la suite
        let courant = listeOuverte.reduce((p, c) => p.f <= c.f ? p : c);
        // si on est arrivé, c'est fini
        if (courant.inventaire.every((a, i) => a >= arrives.inventaire[i])) {
            courant.suivant = {sort: potion};
            return reconstruitChemin(courant);
        }

        // sinon, on cherche parmis les plus proches
        listeOuverte = listeOuverte.filter(v => v.key !== courant.key);
        listeFermee.push(courant);
        for (let sort of courant.sorts.filter(c => c.invoquable)) {
            const voisin = calculeNoeudVoisin(courant, sort, inventaireMinArrivee, heuristique);

            if (estRealisable(voisin)) {
                if (listeFermee.find(c => c.key === voisin.key)) continue;

                const tentativeScoreG = courant.g + heuristique(courant.inventaire, voisin.inventaire);

                const existantListeFermee = listeOuverte.find(c => c.key === voisin.key);
                if (!existantListeFermee || tentativeScoreG < existantListeFermee.g) {
                    listeOuverte.push(voisin);
                    voisin.precedent = courant;
                    voisin.g = tentativeScoreG;
                    voisin.f = voisin.g + heuristique(voisin.inventaire, inventaireMinArrivee);
                }
            }
        }

    }
    throw 'Erreur A star';

};

// game loop
while (true) {
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
        const tomeIndex = parseInt(inputs[7]); // in the first two leagues: always 0; later: the index in the tome if this is a tome spell, equal to the read-ahead tax
        const taxCount = parseInt(inputs[8]); // in the first two leagues: always 0; later: the amount of taxed tier-0 ingredients you gain from learning this spell
        const castable = inputs[9] !== '0'; // in the first league: always 0; later: 1 if this is a castable player spell
        const repeatable = inputs[10] !== '0';
        const action = {
            id: actionId,
            type: actionType,
            delta: [delta0, delta1, delta2, delta3],
            prix: price,
            invoquable: castable
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

    // si l'objectif n'existe plus ou n'existe pas, on cherche quoi faire
    const monInventaire = inventoryArray[0];

    const sorts = actionArray.filter(c => c.type === 'CAST');
    const potions = actionArray.filter(c => c.type === 'BREW');
    const recettes = [];
    for (let potion of potions) {
        const recette = aEtoile(monInventaire.inv, potion, sorts, monHeuristique);
        recettes.push({
            chemin: recette,
            cout: recette.length,
            gain: potion.prix,
            rentabilite: potion.prix / recette.length
        });
    }
    const recetteToDo = recettes.reduce((p, c) => !p ? c : (p.rentabilite < c.rentabilite ? c : p));

    // in the first league: BREW <id> | WAIT; later: BREW <id> | CAST <id> [<times>] | LEARN <id> | REST | WAIT
    console.log(`${recetteToDo.chemin[0].sort.type} ${recetteToDo.chemin[0].sort.id}`);
}


