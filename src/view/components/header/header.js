import './header.scss';

import Navigation from './navigation';
import screenfull from 'screenfull';
import System     from '../../data/system';
import History    from '../../services/history';

export default {
    view( vnode ) {

        const navi = vnode.attrs.navi;

        const back   = () => History.back();
        const fore   = () => History.forward();
        const reload = () => window.location.reload();
        const toggle = () => System.fullscreen && screenfull.toggle();

        return m('div.header.flex.flex-row.w-100', {style:'border-bottom: 1px solid white'}, [
            m(Navigation, {navi, style:'flex-grow: 1'}),
            m('i.navi.fa.fa-angle-left',            {onclick: back}),
            m('i.navi.fa.fa-angle-right',           {onclick: fore}),
            m('i.navi.fa.fa-retweet',               {onclick: reload}),
            m('i.navi.fa.fa-expand-arrows-alt',     {onclick: toggle}),
        ]);
    },
};
