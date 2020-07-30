

import Caissa     from '../../caissa';
import DB         from '../../services/database';
import Factory    from '../../components/factory';
import FormIllus  from '../../components/forms/form-illus';
import { Panel }  from '../../components/misc';
import GameEcos   from './game-ecos';

const PanelIllus = Factory.create('PanelIllus', {

    view () {

        const group   = 'game-panel-toggles';
        const show    = DB.Options.first[group].illus === 'show';
        const onclick = function (e) {
            const value = show ? 'hide' : 'show';
            DB.Options.update('0', { [group]: { illus: value } }, true);
            Caissa.redraw(e);
        };

        return m(Panel, { onclick, show, className: 'illustrations'}, 'Illustrations',  m(FormIllus));
    },
});

const PanelEcos = Factory.create('PanelEcos', {

    view () {

        const group   = 'game-panel-toggles';
        const show    = DB.Options.first[group].ecos === 'show';
        const onclick = function (e) {
            const value = show ? 'hide' : 'show';
            DB.Options.update('0', { [group]: { ecos: value } }, true);
            Caissa.redraw(e);
        };

        return m(Panel, { onclick, show, className: 'ecos'}, 'ECOS',  m(GameEcos));
    },
});

export {
    PanelIllus,
    PanelEcos,
};
