
import Dispatcher from '../services/dispatcher';

const fire = Dispatcher.connect({name: 'analysis-tools'});

function get (line, rex) {
    const res = line.match(rex);
    return res ? res[1] : ''; 
}

function change(what, diff){
    fire('analysis', 'option', [what, diff]);
}


const tools = {

    doShow(what, data) {
        return () => fire('board', 'show', [what, data]);
    },
    
    doMove(data) {
        return () => fire('board', 'move', [data]);
    },
    lan2move (lan) {
        return {from: lan.slice(0,2), to: lan.slice(-2) };
    },

    parseFen (fen, what) {
        const tokens = fen.split(' ');
        return what === 'turn' ? tokens[1] : console.log('WTF');
    },

    parseInfo (line) {
        const 
            info = {},
            // line = tokens.join(' '),
            pv       = get(line, /\spv (.*) bmc/),
            depth    = get(line, /depth (.*?) .*/),
            seldepth = get(line, /seldepth (.*?) .*/),
            multipv  = get(line, /multipv (.*?) .*/),
            hashfull = get(line, /hashfull (.*?) .*/),
            score    = get(line, /score (.*?) nodes/),
            nodes    = get(line, /nodes (.*?) .*/),
            cp       = get(line, /cp (.*?) .*/),
            mate     = get(line, /mate (.*?) .*/),
            nps      = get(line, /nps (.*?) .*/),
            time     = get(line, /time (.*?) .*/),
            bmc      = get(line, /bmc (.*?) .*/)
        ;

        if(pv) info.pv = pv;
        if(depth) info.depth = ~~depth;
        if(seldepth) info.seldepth = ~~seldepth;
        if(multipv) info.multipv = ~~multipv;
        if(hashfull) info.hashfull = ~~hashfull;
        if(score) info.score = score;
        if(cp) info.cp = ~~cp;
        if(mate) info.mate = ~~mate;
        if(nodes) info.nodes = ~~nodes;
        if(nps) info.nps = ~~nps;
        if(time) info.time = ~~time;
        if(bmc) info.bmc = parseFloat(bmc);

        return info;

    },

    parseOption (tokens) {
    
        const 
            line    = tokens.join(' '),
            name = get(line, /name (.*?) type/),
            option = {
                name,
                line,
                type : get(line, /type (.*?) .*/),
            },
            def = get(line, /default (.*?) .*/),
            min = get(line, /min (.*?) .*/),
            max = get(line, /max (.*?) .*/)
        ;
    
        if (def){option.default = def;}
        if (min){option.default = min;}
        if (max){option.default = max;}
    
        return [name, option];
    
    },

    processors : {

        id (tokens, state) {
            state.credits = tokens.slice(1).join(' ');
        },

        credits (tokens, state) {
            state.credits = tokens.join(' ');
        },

        bestmove (tokens, state){
            state.bestmove.move   = tokens[0] || '';
            state.bestmove.ponder = tokens[2] || '';
            state.bestmove.score  = tokens[4] || 'none';
            fire('board', 'bestmove', [{
                move:   tools.lan2move(state.bestmove.move), 
                ponder: tools.lan2move(state.bestmove.ponder), 
            }]);
        },

        info (tokens, state){

            const moveinfo = tools.parseInfo(tokens.join(' '));

            state.info.depth    = moveinfo.depth;
            state.info.multipv  = moveinfo.multipv;
            state.info.nodes    = moveinfo.nodes; 
            state.info.nps      = moveinfo.nps; 
            state.info.hashfull = moveinfo.hashfull; 
            state.info.time     = moveinfo.time; 

            if (moveinfo.cp !== undefined)   state.moves.push(moveinfo);
            if (moveinfo.mate !== undefined) state.mates.push(moveinfo);

            state.moves.sort ( (a, b) => (state.turn === 'w') ? b.cp - a.cp : a.cp - b.cp);
            state.mates.sort ( (a, b) => b.mate - a.mate);

            if (state.moves.length > state.maxpv) {
                state.moves.pop();
            }
            if (state.mates.length > state.maxmate) {
                state.mates.pop();
            }
        },    
    },
    formatters : {
        
        credits (state) {
            const s = state.credits;
            return m('div.ellipsis.eee', [
                m('span.ph1.c156.fw8', 'Credits: '),
                m('span.ph1.eee',  s),
            ]);
        },

        bestmove (state){
            const cm = state.turn === 'b' ? 'c333' : 'ceee';
            const cp = state.turn === 'b' ? 'ceee' : 'c333';

            return m('div.fw4', [
                m('span.ph1.c156.fw8',   'Best:'),
                m(`span.ph1.${cm}`,  state.bestmove.move),
                m('span.ph1.c156.fw8',   'ponder'),
                m(`span.ph1.${cp}`,  state.bestmove.ponder),
            ]);
        },

        move (state, num) {
            const info = state.moves[num];
            const col  = state.turn === 'w' ? 'ceee' : 'c333';
            return !info ? null : 
                m('div', [    
                    m('span.ph1.c156', 'cp:'),
                    m(`span.ph1.${col}`,  info.mate || info.cp),
                    m('span.ph1.c156', 'line:'),
                    m('span.ph1',  tools.formatters.pv(state, info.pv)),
                ]);
        },

        mate (state, num) {
            const info = state.mates[num];
            return !info ? null : 
                m('div', [    
                    m('span.ph1.c156', 'mate:'),
                    m('span.ph1.c333',  info.mate),
                    // m('span.ph1.c156', 'depth:'),
                    // m('span.ph1.c333',  info.depth),
                    m('span.ph1.c156', 'line:'),
                    m('span.ph1',  tools.formatters.pv(state, info.pv)),
                ]);
        },

        fen (state) {
            const col = state.turn === 'w' ? 'ceee' : 'c333';
            return m('div.ellipsis.eee', [    
                m('span.ph1.c156.fw8', 'Fen:'),
                m(`span.ph1.${col}`, state.fen),
            ]); 
        },

        pv (state, pv='') {
            const fen = state.fen;
            const turn = tools.parseFen(fen, 'turn');
            const moves = idx => pv.split(' ').slice(0, idx+1);
            return pv.split(' ').map( (move, idx) => {
                const col = (
                    (idx%2 === 0) && turn === 'w' ? 'ceee' :
                    (idx%2 === 1) && turn === 'w' ? 'c333' :
                    (idx%2 === 0) && turn === 'b' ? 'c333' :
                    (idx%2 === 1) && turn === 'b' ? 'ceee' :
                    console.log('WTF', 'turn', turn, 'idx', idx, 'fen', fen)
                );
                return m(`span.ph1.${col}.pointer`, {
                    onclick:      tools.doMove(moves(idx)),
                    onmouseover:  tools.doShow('moves', moves(idx)), 
                    onmouseleave: tools.doShow('fen', fen),
                }, move);
            });

        },

        depth (state) {
            return m('div.ellipsis.eee', [
                m('span.ph1.c156.fw8', m.trust('Depth&nbsp;&nbsp;: ')),
                m('span.ph1.cfe6.fw8.f3.lh1.pointer', {onclick: () => change('depth', -1)}, '-'),
                m('span.ph1.cfe6.fw8', state.info.depth),
                m('span.ph1.cfe6.fw8.f3.lh1.v-mid.pointer', {onclick: () => change('depth', +1)}, '+'),
            ]);
        },

        multi (state) {
            return m('div.ellipsis.eee', [
                m('span.ph1.c156.fw8', 'MultiPV: '),
                m(`span.ph1.${'cfe6'}.fw8.f3.lh1.pointer`, {onclick: () => change('multipv', -1)}, '-'),
                m(`span.ph1.${'cfe6'}.fw8`, state.info.multipv),
                m(`span.ph1.${'cfe6'}.fw8.f3.lh1.v-mid.pointer`, {onclick: () => change('multipv', +1)}, '+'),     
            ]);
        },   
        
        info (state) {
            const col = status.turn === 'w' ? 'ceee' : 'c333';
            return m('div.ellipsis.eee', [

                m(`span.ph1.${col}`, state.info.nodes || 0),
                m('span.c156', 'nodes, '),

                m(`span.ph1.${col}`, state.info.nps || 0),
                m('span.c156', 'nps, '),

                m(`span.ph1.${col}`, (state.info.hashfull || '0') + '‰'),
                m('span.c156.', 'hash, '),

                m(`span.ph1.${col}`, (Math.round(state.info.time / 100) || '0')/10),
                m('span.c156', 'secs'),

            ]);
        },

    },
    
};

export default tools;
