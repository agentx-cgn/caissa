
import DB         from '../../services/database';
import Forms      from '../../components/forms';
import { TitleLeft } from '../../components/misc';

let formgroups = Object.keys(DB.Options);

export default {
    oncreate: function( /* vnode */ ) {
        formgroups = Object.keys(DB.Options);
    },
    view ( /* vnode */ ) {
        // TODO: think about auto save, with monkeypatching onchanges/oninput
        return m('div.flexlist.viewport-y', [

            m(TitleLeft, 'Options'),
            m('div.mv1.ph3.w-100',
                m('button.w-100.pv1', {onclick: () => DB.reset()   },        'Defaults'),
            ),
            ...formgroups.map( formgroup => {
                const formdata = {
                    group: formgroup,
                    autosubmit: true,
                    ...DB.Options[formgroup],
                    submit: () => {
                        DB.Forms.save(formgroup, formdata);
                    },
                };
                return m(Forms, {formdata, class: 'default-options'});
            }),

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
