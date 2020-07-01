import './header.scss';

import screenfull  from 'screenfull';
import System      from '../../data/system';
import History     from '../../services/history';
import Factory     from '../factory';
import Navigation  from './navigation';

const Header = Factory.create('Header', {
    view( {attrs: {route, params}} ) {

        const toggle  = (e) => {e.redraw = false; System.fullscreen && screenfull.toggle();};
        const reload  = (e) => {e.redraw = false; window.location.reload();};

        // debug
        // const swipeFore = () => Events.onswipefore();
        // const swipeBack = () => Events.onswipeback();

        return m('header.w-100',
            m('div.controls.flex', { style: 'width: 360px' }, [
                m(Navigation, {route, params}),
                History.canBack
                    ? m('i.navi.fa.fa-angle-left', {onclick: History.onback})
                    : m('i.navi.fa.fa-angle-left.ctrans'),
                History.canFore
                    ? m('i.navi.fa.fa-angle-right', {onclick: History.onfore})
                    : m('i.navi.fa.fa-angle-right.ctrans'),

                m('i.navi.fa.fa-retweet',           {onclick: reload}),
                m('i.navi.fa.fa-expand-arrows-alt', {onclick: toggle}),
            ]),
        );
    },
});

export default Header;
