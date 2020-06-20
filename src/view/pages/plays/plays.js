
import Caissa     from '../../caissa';
import DB         from '../../services/database';
import Forms      from '../../components/forms';
import Tools      from '../../tools/tools';
import Config     from '../../data/config';
import Factory    from '../../components/factory';

import {
    Nothing,
    Spacer,
    PageTitle,
    FlexListShrink,
    FixedList,
    FlexListEntry,
    FlexListPlayEntry,
    HeaderLeft} from '../../components/misc';

const DEBUG = true;

const forms = {};

Config.templates.plays.forEach( template =>  {

    const group = 'play-' + template.mode;
    const form = {
        group,
        autosubmit: false,
        ...DB.Options.first[group],
        submit: (form) => {
            let play = Tools.createPlayTemplate(template, form);
            play = DB.Plays.create(play);
            DEBUG && console.log('plays.form.submitted', play.uuid, play.mode, play.white, play.black);
            Caissa.route('/play/:uuid/', { uuid: play.uuid });
        },
    };

    forms[template.mode] = form;

});

const Plays = Factory.create('Plays', {

    view ( vnode ) {

        const { className, style } = vnode.attrs;
        const { mode } = vnode.attrs.params;

        return m('div.page.plays', { className, style }, [

            m(PageTitle,  'Start a new Game'),
            m(HeaderLeft, 'Play with Machines'),
            m(FixedList, Config.templates.plays.map( play => {

                const formdata = forms[play.mode];
                const style = mode === play.mode
                    ? { marginBottom: '0px', backgroundColor: '#0e62993b', color: 'white' }
                    : {}
                ;
                const onclick  = mode === play.mode
                    // just toggles
                    ? (e) => {e.redraw = false; Caissa.route('/plays/',       {},                {replace: true});}
                    : (e) => {e.redraw = false; Caissa.route('/plays/:mode/', {mode: play.mode}, {replace: true});}
                ;

                return m('[', [

                    m(FlexListEntry, { onclick,  style }, [
                        m('div.fiom.f4', play.white + ' vs. ' + play.black),
                        m('div.fior.f5', play.subline),
                    ]),

                    play.mode === mode
                        ? m(Forms, {formdata, noheader: true, className: 'play-options'})
                        : m(Nothing),

                ]);

            })),

            m(HeaderLeft, 'Resume a Game (' + DB.Plays.length + ')'),
            m(FlexListShrink, DB.Plays.list.map (play => {
                const onclick = (e) => {e.redraw = false; Caissa.route('/play/:uuid/', {uuid: play.uuid});};
                return m(FlexListPlayEntry, { onclick, play });
            })),

            m(Spacer),
            m('button.pv1.mh3.mv1', {onclick: () => DB.Plays.clear() }, 'DB.Plays.clear()'),
            m('button.pv1.mh3.mv1', {onclick: () => DB.reset()       }, 'DB.reset()'),

        ]);

    },

});

export default Plays;
