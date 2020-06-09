
import './system.scss';

import Caissa        from '../../caissa';
import jsonSystem    from '../../data/system';
import jsonConfig    from '../../data/config';
import jsonState     from '../../data/state';
import DB            from '../../services/database';
import Component     from '../../components/component';
import LogsViewer    from './renderer/renderLogs';
import JsonViewer    from './renderer/renderJson';

const Json =  {
    name: 'Json',
    view ( {attrs : { tree } } ) {
        return m('div.w-100.bg-eee.overflow-y-scroll.h-100', [
            m('div.f5.fior', { class: 'json-tree'}, [
                m(JsonViewer, { tree, options: { collapseAfter: 1 } }),
            ]),
        ]);
    },
};

const System = Component.create('System', {
    view ( vnode ) {

        const { module } = vnode.attrs;

        // reroute, if no module
        if (module === ':module' || module === undefined) {
            console.warn('system.nomodule', vnode.attrs, module);
            return;
        }

        const Module = (
            module === 'config' ? m(Json, {tree: jsonConfig}) :
            module === 'system' ? m(Json, {tree: jsonSystem}) :
            module === 'state'  ? m(Json, {tree: jsonState})  :
            module === 'db'     ? m(Json, {tree: DB.all()})  :
            m(LogsViewer)
        );

        const clicker = module => (e) => {
            e.redraw = false;
            Caissa.route('/system/:module/', { module }, {replace: true});
        };

        return m('div.page.system.bg-eee', [
            m('div.systemmenu.bg-ddd.w-100', [
                m('ul.flex.flex-row.ml2',
                    'System Config State DB Logs'.split(' ').map( mod => {
                        return m('li.ph2.pv1.f4.list.pointer', {onclick: clicker(mod.toLowerCase()) }, mod);
                    }),
                ),
            ]),
            Module,
        ]);

    },

});

export default System;
