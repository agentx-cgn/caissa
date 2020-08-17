
// import Tree      from '../data/eco-tree.json';
import Volumes   from '../data/eco-volumes.json';
import Openings  from '../data/eco-openings.json';
import Tree      from '../data/eco.tree.json';

import { H }     from '../services/helper';

const pad = H.padZero;

const ECO = {
    Tree,
    get volumes () {
        return {
            'A' : 'Flank openings',
            'B' : 'Semi-Open Games except French Defense',
            'C' : 'Open Games and the French Defense',
            'D' : 'Closed Games and Semi-Closed Games',
            'E' : 'Indian Defenses',
        };
    },
    volumesMoves (volume) {
        return {
            'A' : [
                '*, except d4 or e4',
                'd4, except ...d5 or ...Cf6',
                'd4 Cf6, except 2 c4',
                'd4 Cf6 2 c4, except 2... e6 or 2... g6',
            ],
            'B' : [
                'e4, except ...c5 or ...e5 or ...e6',
                'e4 c5',
            ],
            'C' : [
                'e4 e5',
                'e4 e6',
            ],
            'D' : [
                'd4 d5',
                'd4 Cf6 2 c4 g6 with 3... d5',
            ],
            'E' : [
                'd4 Cf6 2 c4, e6',
                'd4 Cf6 2 c4, g6, except 3... d5',
            ],
        }[volume];
    },
    volumeGroups (volume) {
        return Volumes[volume];
    },
    groupHeader (volume, group) {
        return Volumes[volume][group];
    },
    groupOpeningsList (group) {
        if (group.includes('-')){
            const [first, last] = group.split('-');
            const start  = ~~first.slice(1);
            const end    = ~~last.slice(1) +1;
            const volume = first[0];
            return H.range(start, end).map( num => volume + pad(num));
        } else {
            return [group];
        }
    },
    groupOpenings (group) {
        const list = ECO.groupOpeningsList(group);
        const openings = {};
        list.forEach( opening => {
            openings[opening] = Openings[opening];
        });
        return openings;

    },

    openingMoves(opening) {
        return Openings[opening][1];
    },

    walkTree (moves) {

        let i, move, lost = {}, branch = Tree;

        for (i=0; i<moves.length; i++) {
            move   = moves[i];
            branch = branch[move.san] ? branch[move.san] : lost;
        }

        return branch;

    },
    // sortContinuations (a, b) {
    //     return a.slice(-2, -1) > b.slice(-2, -1);
    // },
    findContinuations (moves) {

        const branch = ECO.walkTree(moves);
        const sorter = (a, b) => {
            console.log(a, b, a.slice(-2, -1), b.slice(-2, -1));
            return a.slice(-2, -1) > b.slice(-2, -1);
        };

        return Object.keys(branch)
            .filter( key => key !== '__' )
            .sort( sorter )
            .map( move => {
                const continuation = ECO.getContinuation(move, branch);
                return continuation;
            })
        ;
    },

    getContinuation (move, branch, newkey=undefined, moves=[]) {

        const curkey   = newkey || move;
        const curlabel = branch[curkey]['__'];

        if (curlabel) {
            return [ move, moves, curlabel.split(' | ') ];

        } else {
            newkey = Object.keys(branch[curkey])[0];
            return ECO.getContinuation(move, branch[curkey], newkey, [...moves, newkey]);

        }

    },
    describeMoves (moves) {

        let branch, tree = Tree;

        return moves
            .map( move => {
                if (tree[move.san]) {
                    branch  = tree[move.san];
                    tree = branch;
                    if (branch['__']){
                        return [move.san, branch['__']];
                    } else {
                        return [move.san, null];
                    }
                } else {
                    // done
                    tree = {};
                    // return [move.san, undefined];
                    return undefined;
                }

            })
            .filter( move => move !== undefined)
        ;

    },

    // describeOptions (moves) {

    //     const branch = ECO.walkTree(moves);

    //     return Object.keys(branch)
    //         .filter( key => key !== '__' )
    //         .map( key => {
    //             const res = ECO.findVariation(branch, key);
    //             return res;
    //         })
    //     ;

    // },

};

export default ECO;
