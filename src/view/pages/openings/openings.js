
// import './menu.scss';

// import Caissa       from '../../caissa';
import Factory      from '../../components/factory';
// import Config       from '../../data/config';
import Ecos         from '../../services/ecos';
import { H }        from '../../services/helper';

import { PageTitle, Spacer, FlexList } from '../../components/misc';
// import Tree from '../../components/tree';


const Openings = Factory.create('Openings', {
    // oninit () {
    //     Ecos.init();
    // },
    view ( vnode ) {

        const { className, style } = vnode.attrs;

        const onclick = e => {
            e.redraw = false;
            H.downloadJson(Ecos.tree);
        };

        //TODO: only show 'Game', if at least one exists in DB

        return m('div.page.openings', { className, style },
            m(PageTitle, {onclick}, 'Openings'),
            m(Spacer),
            m(FlexList, { class: 'games-list' },
                Ecos.codes.map( eco => {
                    return m('div', eco);
                }),
                // m('div.viewport-y', {},
                //     m(Tree, { tree: Ecos.tree}),
                // ),
            ),
        );

    },
});

export default Openings;
