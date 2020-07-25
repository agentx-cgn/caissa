
import pgnECO from '../../assets/openings/eco.pgn';

// {
//     A PGN file of ECO classifications distributed with the PGN extraction
//     program, extract. I believe that the original file from which I
//     generated this was put together by Ewart Shaw, Franz Hemmer and others,
//     to whom appropriate thanks and acknowledgement is due.  Permission has
//     been granted for its inclusion with the extract program, which is
//     available from caissa.onenet.net and ftp.pitt.edu.

//     David Barnes (D.J.Barnes@ukc.ac.uk)
// }
// [ECO "A00"]
// [Opening "Polish"]
// [Variation "Outflank variation"]
//
// 1. b4 c6 *
//

const tree = {};
const ecos = [];
const t0 = Date.now();

function parseEcos(eco) {

    const lines = eco.split('\n');
    let counter = 0;
    let code = {idx: 0, eco: '', variation: '', opening:'', pgn: '', search: ''};

    lines.forEach(newline => {

        const line = newline.trim();
        const rxp  = line.match(/^\[(\w+)\s+"(.*)"\]$/);

        if ( rxp !== null && rxp[1] === 'ECO' ){
            // if first dont push without eco
            if (code.eco) {
                code.search = code.eco + ' ' + code.opening + ' '+ code.variation;
                ecos.push(code);
                counter += 1;
            }
            code = {idx: counter, eco: rxp[2], variation: '', opening:'', pgn: ''};

        } else if (rxp !== null) {
            if ( rxp[2] !== ''){
                code[rxp[1].toLowerCase()] = rxp[2];
            }

        } else if ( line.length ) {
            code.pgn += ' ' + line;

        }

    });

    // last
    if (code.eco){
        code.search = code.eco + ' ' + code.opening + ' ' + code.variation;
        ecos.push(code);
    }

}

function buildTree () {

    // letter -> codes -> openings -> variations -> moves

    letters.forEach( letter => {
        tree[letter] = { label: letter, childs: {} };
        const codes = ecos.filter( eco => eco.eco[0] === letter);
        codes.forEach( code => {
            tree[letter].childs[code.eco] = { label: code.eco, childs: {}};
            const openings = codes.filter( eco => eco.eco === code.eco);
            openings.forEach( opening => {
                tree[letter].childs[code.eco].childs[opening.opening] = { label: opening.opening, childs: {}};
                const variations = openings.filter(eco => eco.opening = opening.opening);
                variations.forEach( variation => {
                    tree[letter].childs[code.eco].childs[opening.opening].childs[variation.variation] = { label: variation.variation, childs: {}};
                });
            });
        });
    });

}

parseEcos(pgnECO);
const letters  = 'A B C D E'.split(' ');
const openings = Array.from(new Set(ecos.map(eco => eco.opening))).sort();
const codes    = Array.from(new Set(ecos.map(eco => eco.eco))).sort();
console.log('Info   : Build tree of', ecos.length, 'openings in', Date.now() - t0, 'msecs');
buildTree();

export default {
    letters,
    codes,
    openings,
    tree,
    list: ecos,
};
