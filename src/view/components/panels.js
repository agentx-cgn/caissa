
import './panels.scss';

import Factory from '../components/factory';

const Panel = Factory.create('Panel', {
    view ( vnode ) {
        const { show, className, onclick } = vnode.attrs;
        const [ caption, panel ] = vnode.children;
        return m('div.panel', { className }, [
            m(PanelHeader, { onclick, show, className}, caption),
            show && m('div.panel-content', panel),
        ]);
    },
});

const PanelHeader = {
    view ( vnode ) {
        const { onclick, show, className } = vnode.attrs;
        return m('div.panel-header.flex.flex-row', { className, onclick }, [
            m('div.caption.ellipsis.flex-grow', vnode.children),
            m('div.toggle', show ? 'O' : 'X'),
        ]);
    },
};

export default Panel;
