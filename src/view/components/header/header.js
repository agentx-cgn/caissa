import './header.scss';

import Navigation from './navigation';
import screenfull from 'screenfull';
import System     from '../../data/system';
import History    from '../../services/history';
// import Events     from '../../services/events';

export default {
    name: 'Header',
    view( vnode ) {

        const navi    = vnode.attrs.navi;
        const toggle  = (e) => {e.redraw = false; System.fullscreen && screenfull.toggle();};
        const reload  = (e) => {e.redraw = false; window.location.reload();};
        const canBack = !isNaN(History.pointer) && History.pointer  > 0;
        const canFore = !isNaN(History.pointer) && History.pointer  < History.stack.length -1;

        // debug
        // const swipeFore = () => Events.onswipefore();
        // const swipeBack = () => Events.onswipeback();

        return m('header', [
            m(Navigation, { navi }),
            // m('i.navi.f3.fa.fa-angle-left',            {onclick: swipeFore}),
            // m('i.navi.f3.fa.fa-angle-right',           {onclick: swipeBack}),
            canBack
                ? m('i.navi.fa.fa-angle-left',      {onclick: History.onback})
                : m('i.navi.fa'),
            canFore
                ? m('i.navi.fa.fa-angle-right',     {onclick: History.onfore})
                : m('i.navi.fa'),

            m('i.navi.fa.fa-retweet',               {onclick: reload}),
            m('i.navi.fa.fa-expand-arrows-alt',     {onclick: toggle}),
        ]);
    },
};
