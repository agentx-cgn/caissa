

import Caissa     from '../../caissa';
import DB         from '../../services/database';
import Factory    from '../../components/factory';
import FormIllus  from '../../components/forms/form-illus';
import Panel      from '../../components/panels';
import Moves      from './moves';

import GameEcos   from './game-ecos';

const PanelMoves = Factory.create('PanelMoves', {
    view (vnode) {

        //TODO: exchange onclick with group
        const group   = 'game-panel-toggles';
        const show    = DB.Options.first[group].moves === 'show';

        const onclick = function (e) {
            const value = show ? 'hide' : 'show';
            DB.Options.update('0', { [group]: { moves: value } }, true);
            Caissa.redraw(e);
        };

        return m(Panel, { onclick, show, className: 'moves'},
            'Moves',
            m(Moves, { game: vnode.attrs.game }),
        );

    },
});

const PanelIllus = Factory.create('PanelIllus', {
    view () {

        //TODO: exchange onclick with group
        const group   = 'game-panel-toggles';
        const show    = DB.Options.first[group].illus === 'show';

        const onclick = function (e) {
            const value = show ? 'hide' : 'show';
            DB.Options.update('0', { [group]: { illus: value } }, true);
            Caissa.redraw(e);
        };

        return m(Panel, { onclick, show, className: 'illustrations'},
            'Illustrations',
            m(FormIllus),
        );

    },
});

const PanelEcos = Factory.create('PanelEcos', {
    view ( vnode ) {

        const group   = 'game-panel-toggles';
        const show    = DB.Options.first[group].ecos === 'show';

        const onclick = function (e) {
            const value = show ? 'hide' : 'show';
            DB.Options.update('0', { [group]: { ecos: value } }, true);
            Caissa.redraw(e);
        };

        return m(Panel, { onclick, show, className: 'ecos'},
            'ECO Browser',
            m(GameEcos, { game: vnode.attrs.game }),
        );

    },
});

export {
    PanelMoves,
    PanelIllus,
    PanelEcos,
};
