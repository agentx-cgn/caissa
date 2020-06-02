
import Caissa        from '../../../caissa';
import State         from '../../../data/state';
import Providers     from '../../../data/provider';
import { H }         from '../../../services/helper';

import {ListFilter, FlexListEntry, TitleLeft } from '../../../components/misc';
import GamesList from '../../../components/gameslist';

const state = State.games;
const read  = H.interprete;

let filter = '';

export default {

    oninit ( vnode ) {

        const idx      = ~~vnode.attrs.idx;
        const provider = Providers.list.find( p => p.idx === idx );
        false && console.log('games.oninit', idx, provider.caption);

        if ( !provider.games.length ) {
            provider.fetch()
                .then( () => {
                    false && console.log('games.oninit.loaded', idx, provider.games.length);
                    provider.progress = 0;
                    m.redraw();
                })
            ;
        } else {
            false && console.log('games.oninit.cachehit', idx, provider.caption);
        }

    },

    view ( vnode ) {

        const  idx = (
            vnode.attrs.idx === ':idx' && state.idx === undefined ? undefined :
            vnode.attrs.idx === ':idx' && state.idx !== undefined ? state.idx :
            ~~vnode.attrs.idx
        );

        const provider = idx !== undefined ? Providers.list.find( p => p.idx === idx ) : undefined;

        // remember
        state.idx = idx;

        // There is nothing, reroute to idx = 0
        if (provider === undefined && idx === undefined) {
            Caissa.route('/games/:idx/', {idx: 0}, {replace: true});

        // There is a provider, but no games cached (F5), so fetch them w/ progress and error
        } else if (!provider.games.length) {

            provider.fetch()
                .then( () => {
                    provider.progress = 0;
                    // NEEDED ???
                    // m.redraw();
                })
            ;

            return m(FlexListEntry, [

                m('img.source-icon', {src: provider.icon}),
                m('div.source-caption.f4',      provider.caption),
                m('div.source-subline.f5.ellipsis', provider.subline),

                provider.games.length
                    ? m('div.source-loaded', provider.games.length + ' games loaded')
                    : '',
                provider.error
                    ? m('div.source-error.f5.mv1', provider.error)
                    : '',
                provider.progress
                    ? m('div.source-progress-on',  {style: `width: ${provider.progress}%;`})
                    : m('div.source-progress-off'),

            ]);

        // From here there is a provider + games to filter
        } else {

            const games = provider.games.filter( g => {
                return filter.length
                    ?  g.searchtext.includes(filter)
                    :  true;
            });

            return m('[', [

                m(TitleLeft, filter.length
                    ? read(provider.header)
                    : read(provider.header) + `[${games.length}/${provider.games.length}]`,
                ),

                m(ListFilter, { oninput : (e) => {
                    filter = e.target.value.toLowerCase();}, // && m.redraw(),
                }),

                m(GamesList, { games }),

            ]);

        }

    },

};
