
import './system.scss';

import Caissa        from '../../caissa';
import jsonSystem    from '../../data/system';
import jsonConfig    from '../../data/config';
import DB            from '../../services/database';
import Factory       from '../../components/factory';
import LogsViewer    from './renderer/renderLogs';
import JsonViewer    from './renderer/renderJson';

const Json =  {
    name: 'Json',
    view ( {attrs : { tree } } ) {
        return m('div.w-100.viewport-y.h-100.bg-ccc', [
            m('div.f5.fior', { class: 'json-tree'}, [
                m(JsonViewer, { tree, options: { collapseAfter: 1 } }),
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
            module === 'db'     ? m(Json, {tree: DB.all()})   :
            // default
            m(LogsViewer)
        );

        const clicker = module => (e) => {
            e.redraw = false;
            // replace here, bc can't animate between same page
            Caissa.route('/system/:module/', { module }, {replace: true});
        };

        return m('div.page.system', { className, style }, [
            m('div.systemmenu.w-100.btb20', [
                m('ul.flex.flex-row.ml2',
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
