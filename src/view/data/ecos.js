
import pgnECO from '../../../assets/eco.pgn';

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

const codes = [];
const t0 = Date.now();

function parseEco(eco) {

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
                codes.push(code);
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
        code.search = code.eco + ' ' + code.opening + ' '+ code.variation;
        codes.push(code);
    }

}

parseEco(pgnECO);
console.log('Info   : Openings:', codes.length, 'in', Date.now() - t0, 'msecs');

export default codes;
