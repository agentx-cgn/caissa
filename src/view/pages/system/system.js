
import './system.scss';

import Caissa    from '../../caissa';
import System    from '../../data/system';
import Config    from '../../data/config';
import State     from '../../data/state';
import DB        from '../../services/database';

import LogsViewer from './renderer/renderLogs';
import JsonViewer from './renderer/renderJson';

const Json =  {
    view ( vnode ) {
        const tree = vnode.attrs.tree;
        return m('div.w-100.bg-eee.overflow-y-scroll.h-100', [
            m('div.f5.fior', { class: 'json-tree'}, [
                m(JsonViewer, { tree, options: { collapseAfter: 1 } }),
            ]),
        ]);
    },
};

export default {

    view ( vnode ) {

        const { module } = vnode.attrs;

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

        function clicker (module) {
            return function () {
                Caissa.route('/system/:module/', { module });
            };
        }

        return m('div.system.flex.flex-column.w-100.bg-eee.noselect', [
            m('div.systemmenu.bg-ddd.w-100', [
                m('ul.flex.flex-row.ml2', [
                    m('li.ph2.pv1.f4.pointer', {style: 'list-style-type: none;', onclick: clicker('system') }, 'System'),
                    m('li.ph2.pv1.f4.pointer', {style: 'list-style-type: none;', onclick: clicker('config') }, 'Config'),
                    m('li.ph2.pv1.f4.pointer', {style: 'list-style-type: none;', onclick: clicker('state')  }, 'State' ),
                    m('li.ph2.pv1.f4.pointer', {style: 'list-style-type: none;', onclick: clicker('db')     }, 'DB'    ),
                    m('li.ph2.pv1.f4.pointer', {style: 'list-style-type: none;', onclick: clicker('logs')   }, 'Logs'  ),
                ]),
            ]),
            Component,
        ]);

    },

};
