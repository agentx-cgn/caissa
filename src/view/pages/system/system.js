
import './system.scss';

import Caissa    from '../../caissa';
import System    from '../../data/system';
import Config    from '../../data/config';
import State     from '../../data/state';
import DB        from '../../services/database';

import LogsViewer from './renderer/renderLogs';
import JsonViewer from './renderer/renderJson';

const Json =  {
    name: 'Json',
    view ( {attrs : { tree } } ) {
        // const tree = vnode.attrs.tree;
        return m('div.w-100.bg-eee.overflow-y-scroll.h-100', [
            m('div.f5.fior', { class: 'json-tree'}, [
                m(JsonViewer, { tree, options: { collapseAfter: 1 } }),
            ]),
        ]);
    },
};

export default {
    name: 'System',
    view ( {attrs : { module } } ) {

        // const { module } = vnode.attrs;

        // reroute, if no module
        if (module === ':module' || module === undefined) {
            Caissa.route('/system/:module/', {module: 'logs'}, {replace: true});
            return;
        }

        const Component = (
            module === 'config' ? m(Json, {tree: Config}) :
            module === 'system' ? m(Json, {tree: System}) :
            module === 'state'  ? m(Json, {tree: State})  :
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
            Component,
        ]);

    },

};
