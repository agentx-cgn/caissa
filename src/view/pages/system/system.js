
import './system.scss';

import Caissa        from '../../caissa';
import jsonSystem    from '../../data/system';
import jsonConfig    from '../../data/config';
// import ecos          from '../../data/eco-build';
import DB            from '../../services/database';
import Logger        from '../../services/logger';
import Factory       from '../../components/factory';
import { FlexList }  from '../../components/misc';
import JsonViewer    from './renderer/renderJson';

let search   = '';
// const jsonEcos = ecos.tree;

const Json =  {
    name: 'Json',
    view ( {attrs : { tree } } ) {
        return m('div.w-100.viewport-y.h-100.bg-ccc', [
            m('div.f5.fior.pt2', { class: 'json-tree'}, [
                m(JsonViewer, { tree, options: { collapseAfter: 1 } }),
            ]),
        ]);
    },
};


const Logs = {
    view (/*vnode*/) {
        return m(FlexList, {style: 'height: 100%'}, [
            m('system-filter',
                m('input[type=text].w-100.bg-eee.ph2.pv1', {
                    style: 'border: 0',
                    oninput: e => search = e.target.value + '',
                    value: search,
                    placeholder: 'type to filter',
                }),
            ),
            m('pre.pl3.viewport-xy.f7.bg-ccc.h-100.pt2', [
                m.trust(Logger.search(search).slice(0, 1000).join('<br/>')),
            ]),
        ]);
    },
};

const System = Factory.create('System', {
    view ( vnode ) {

        const { params: { module }, className, style } = vnode.attrs;

        const Module = (
            module === 'config' ? m(Json, {tree: jsonConfig}) :
            module === 'system' ? m(Json, {tree: jsonSystem}) :
            // module === 'ecos'   ? m(Json, {tree: jsonEcos})   :
            module === 'db'     ? m(Json, {tree: DB.all()})   :
            m(Logs)
        );

        const clicker = module => (e) => {
            e.redraw = false;
            // replace here, bc can't animate between same page
            Caissa.route('/system/:module/', { module }, {replace: true});
        };

        return m('div.page.system', { className, style }, [
            m('div.systemmenu.w-100.btb20', [
                m('ul.flex.flex-row.ml2.white',
                    'System Config DB Logs'.split(' ').map( mod => {
                        return m('li.ph2.pv1.f4.list.pointer', {onclick: clicker(mod.toLowerCase()) }, mod);
                    }),
                ),
            ]),
            Module,
        ]);

    },

});

export default System;
