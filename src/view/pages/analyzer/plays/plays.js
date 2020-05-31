
import Caissa     from '../../../caissa';
import DB         from '../../../services/database';
import { H }      from '../../../services/helper';
import Forms      from '../../../components/forms';
import Tools      from '../../../tools/tools';
import Config     from '../../../data/config';

import {
    Nothing,
    Spacer,
    TitleLeft,
    FlexListShrink,
    FixedList,
    FlexListEntry,
    FlexListPlayEntry } from '../../../components/misc';

const forms = {};

Config.playtemplates.forEach( template =>  {

    const form = {

        ...Tools.expandPlayTemplate(H.deepcopy(template)),

        submit: (form) => {

            let play = H.deepcopy(form);

            play.uuid  = H.shortuuid();
            DB.Plays.create(play);

            console.log('plays.form.submitted', play.uuid, play.mode, play.white, play.black);

            Caissa.route('/play/:uuid/', {uuid: play.uuid});

        },
    };

    forms[template.mode] = form;

});

export default {

    view ( vnode ) {

        const { mode } = vnode.attrs;

        return m('[', [

            m(TitleLeft, 'Start a new Play'),
            m(FixedList, Config.playtemplates.map( play => {

                const formdata = forms[play.mode];
                const onclick  = mode === play.mode
                    // just toggles
                    ? () => Caissa.route('/plays/',       {},                {replace: true})
                    : () => Caissa.route('/plays/:mode/', {mode: play.mode}, {replace: true})
                ;

                return m('[', [

                    m(FlexListEntry, { onclick }, [
                        m('div.fiom.f4', play.white + ' vs. ' + play.black),
                        m('div.fior.f5', play.subline),
                    ]),

                    play.mode === mode
                        ? m(Forms, {formdata, categories: ['play defaults ' + mode], class: 'play-options'})
                        : m(Nothing),

                ]);

            })),

            m(TitleLeft, 'Resume a Play (' + DB.Games.list.length + ')'),
            m(FlexListShrink, DB.Plays.list.map (play => {
                const onclick = () => Caissa.route('/play/:uuid/', {uuid: play.uuid});
                return m(FlexListPlayEntry, { onclick, play });
            })),

            m(Spacer),
            m('button.pv1.mh3.mv1', {onclick: () => DB.Plays.clear() }, 'DB.Plays.clear()'),
            m('button.pv1.mh3.mv1', {onclick: () => DB.reset()       }, 'DB.reset()'),

        ]);

    },

};
