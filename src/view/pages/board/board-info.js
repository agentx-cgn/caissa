
import Factory      from '../../components/factory';
import ChessClock   from '../../components/chessclock';
import Config       from '../../data/config';

const DEBUG = false;

const evalsum = (acc, piece) => acc + Config.pieces.value[piece];

const removeDups = function (a1, a2) {

    a2.forEach(piece => {
        const pos = a1.indexOf(piece);
        if (pos !== -1){
            a1.splice(pos, 1);
        }
    });

    return a1;

};

const CapturedPieces = Factory.create('CapturedPieces', {
    view (vnode) {

        const threshold = 6;

        const { board, player } = vnode.attrs;
        const style = 'letter-spacing: -8px; font-size: 1.5rem;';

        let whitePieces = board.captured.white.map( piece => Config.pieces.font[piece] ).join('');
        let blackPieces = board.captured.black.map( piece => Config.pieces.font[piece] ).join('');
        const whiteValue  = board.captured.white.reduce(evalsum, 0);
        const blackValue  = board.captured.black.reduce(evalsum, 0);
        const whiteDiffValue = whiteValue > blackValue ? '+' + (whiteValue - blackValue) : '';
        const blackDiffValue = blackValue > whiteValue ? '+' + (blackValue - whiteValue) : '';

        if (whitePieces.length > threshold || blackPieces.length > threshold){
            const whitecopy = whitePieces.split('');
            whitePieces   = removeDups(whitePieces.split(''), blackPieces.split('')).join('');
            blackPieces   = removeDups(blackPieces.split(''), whitecopy).join('');
        }

        return player === 'w'
            ? m('div.captured.tr', m('span.chess.c000', { style }, blackPieces), m('span.ml1', blackDiffValue ))
            : m('div.captured.tr', m('span.chess.cfff', { style }, whitePieces), m('span.ml1', whiteDiffValue ))
        ;

    },
});

const BoardInfo = Factory.create('BoardInfo', {
    view (vnode) {

        const { game, board, pos, player } = vnode.attrs;

        DEBUG && console.log('BoardInfo', { player, orientation: board.orientation});

        if (player === 'w') {

            return m('div.flex.flex-row.board-bar-' + pos, [
                m(ChessClock, { player }),
                m('div.flex-auto.mh2.saim.f4.cfff.ellipsis',  game.header.White),
                m(CapturedPieces, { player, board }),
            ]);

        } else {

            return m('div.flex.flex-row.board-bar-' + pos, [
                m(ChessClock, { player }),
                m('div.flex-auto.mh2.saim.f4.c000.ellipsis', game.header.Black),
                m(CapturedPieces, { player, board }),
            ]);

        }

    },
});

export default BoardInfo;
