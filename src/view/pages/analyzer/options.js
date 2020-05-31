
import DB         from '../../services/database';   
import Forms      from '../../components/forms';
import { Spacer } from '../../components/misc';

const categories = ['User', 'Illustrations', 'Evaluator'];

let form = DB.Options;

export default {
    oncreate: function( /* vnode */ ) {
        form = DB.Options;
    },
    view ( /* vnode */ ) {
        // TODO: think about auto save, with monkeypatching onchanges/oninput
        return m('[', [
            m(Spacer),
            m('button.mh3', {onclick: () => {
                DB.saveOptions(form);
            } }, 'save options'),
            m('button.mh3', {onclick: () => DB.reset()   }, 'DB.reset()'),
            m(Spacer),
            m(Forms, {form, categories, class: 'default-options'}),
        ]);
    },

};

/*

                              Config/File      Database    Options     Config      State
data                                X
    flagTitles
    flagColors
    fontPieces
Navigation                          X
    menu
gameTemplate                        X
    json
playsDifficulties                   X
    depth : rooky
playTemplates/available             X
    json
Engines                             X
    stockfish|leela
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
User                                            X
    name                    
defaultEngine                                   X
    select
evaluator                                       X
    depth,maxpv,time,maxmate
board
    fen                                                                             X
    orientation                                 X                                   X
    illustrations                               X
        pinning
        bestmove,ponder
        lastmove
        availmoves
        attack
        valid
    config                                      X








*/
