const A_origin = [[2,-1,0], [-1, 2, -1], [0, -1, 2]];
const U = [[1,10,100], [2, 20, 200], [3, 30, 300]];
console.log('U', U);
console.log('U[1,3]', U[2][1]);
console.log('U[2,1]', U[0][1]);
console.log('U[ligne, colonne] = U[colonne -1][ligne-1]');
let A = A_origin.map(c => [...c]);

console.log('A_origin', A_origin);
console.log('A', A);

let r = 0; // r est l'indice de ligne du dernier pivot trouvé
const m = 2;
const n = 2;
for(let j = 0; j < m; j++){ //j décrit tous les indices de colonnes
    let max;
    let k; // Noter k l'indice de ligne du maximum
    // Rechercher max(|A[i,j]|, r+1 ≤ i ≤ n)
    for(let i = r; i < n; i++) {
        if(!max){
            max = A[j][i];
            k = i;
        } else {
            max = Math.max(A[j][i], max);
            k = max === A[j][i] ? i : k;
        }
    }
    // A[k,j] est le pivot - A[k,j] désigne la valeur de la ligne k et de la colonne j
    if(max !== 0) {
        r++; // r désigne l'indice de la future ligne servant de pivot
        // On normalise la ligne de pivot de façon que le pivot prenne la valeur 1 : Diviser la ligne k par A[k,j]
        A.forEach(c => c[k] = c[k] / max);
        if(k !== r) {
            // Échanger les lignes k et r  (On place la ligne du pivot en position r)
            const ligneK = A.map(c => c[k]);
            const ligneR = A.map(c => c[r]);
            A.forEach((c, i) => c[k] = ligneR[i]);
            A.forEach((c, i) => c[r] = ligneK[i]);
            // On simplifie les autres lignes
            for(let i = 0; i < n; i++){
               if(i !== r) {
                   // Soustraire à la ligne i la ligne r multipliée par A[i,j] (de façon à annuler A[i,j])
                   A.forEach((c, idx) => c[i] = c[i] - ligneR[idx] * A[j][i]);
               }
            }
        }
    }
}

console.log('Gauss Jordan OK');
console.log('originale = ');
const aT = A_origin[0].map((_, colIdx) => A_origin.map(row => row[colIdx]));
aT.forEach(c => console.log(c));
console.log('résultat = ');
const bT = A[0].map((_, colIdx) => A.map(row => row[colIdx]));
bT.forEach(c => console.log(c));