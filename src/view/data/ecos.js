
import pgnECO  from '../../assets/openings/eco.pgn';
import volumes from './volumes';

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

    // letter -> codes     -> openings -> variations -> moves
    // A - E  -> A01 - E99 -> 'English'
    // {idx: 0, eco: '', variation: '', opening:'', pgn: '', search: ''};

    let branch;

    letters.forEach( volume => {

        branch = volume;

        const codes = ecos.filter( eco => eco.eco[0] === branch);
        tree[branch] = {  childs: {}, length: codes.length };

        codes.forEach( code => {

            branch = code.eco;
            let root  = tree[volume].childs;

            const openings = codes.filter( eco => eco.eco === branch);
            if (openings.length){
                root[branch] = { childs: {}, length: openings.length };
            } else {
                root[branch] = { moves: code.pgn };
                console.log('Tree', 'no opening for', branch);
            }

            openings.forEach( opening => {

                branch = opening.opening;
                let root  = tree[volume].childs[code.eco].childs;

                const variations = openings.filter(eco => eco.opening = branch);
                if (variations.length){
                    root[branch] = { childs: {}, length: variations.length };
                } else {
                    root[branch] = { idx: opening.idx, moves: opening.pgn };
                    console.log('Tree', 'no variation for', branch);
                }

                variations.forEach( variation => {

                    branch = variation.variation || variation.pgn;
                    let root = tree[volume].childs[code.eco].childs[opening.opening].childs;
                    root[branch] = { idx: variation.idx, moves: variation.pgn, length: variation.pgn.split('.').length -1};

                });

            });
        });
    });

}

parseEcos(pgnECO);
const letters  = 'A B C D E'.split(' ');
const openings = Array.from(new Set(ecos.map(eco => eco.opening))).sort();
const codes    = Array.from(new Set(ecos.map(eco => eco.eco))).sort();
false && buildTree();

// view-source:https://web.archive.org/web/20091028033349/http://www.geocities.com/siliconvalley/lab/7378/eco.htm

// tree['A'].label = 'Flank openings';
// tree['B'].label = 'Semi-Open Games other than the French Defense';
// tree['C'].label = 'Open Games and the French Defense';
// tree['D'].label = 'Closed Games and Semi-Closed Games';
// tree['E'].label = 'Indian Defenses';

console.log('Info   : Build tree of', ecos.length, 'openings in', Date.now() - t0, 'msecs');

export default {
    volumes,
    letters,
    codes,
    openings,
    tree,
    list: ecos,
};
