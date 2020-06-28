
// import Caissa        from '../../caissa';
import Providers     from '../../data/provider';
import { H }         from '../../services/helper';
import Factory       from '../../components/factory';
import GamesList     from '../../components/gameslist';

import { ListFilter, FlexListEntry, PageTitle } from '../../components/misc';

const DEBUG = true;

const read  = H.interprete;
let filter  = '';

const Games = Factory.create('Games', {

    oninit ( vnode ) {

        const { params: { idx=0 } } = vnode.attrs;
        const provider = Providers.find( p => p.idx === ~~idx );

        DEBUG && console.log('Games.oninit', idx, provider.caption);

        //TODO: handle deeplinks
        if ( !provider.games.length ) {
            provider.fetch()
                .then( () => {
                    DEBUG && console.log('Games.oninit.loaded', ~~idx, provider.games.length);
                    provider.progress = 0;
                })
            ;
        } else {
            DEBUG && console.log('Games.oninit.cachehit', ~~idx, provider.caption);
        }

    },

    view ( vnode ) {

        const { params: { idx=0 }, className, style } = vnode.attrs;
        const provider = Providers.find( p => p.idx === ~~idx );

        if (!provider.games.length) {

            provider
                .fetch()
                .then( () => {
                    provider.progress = 0;
                })
            ;

            return m('div.page.games', { className, style }, m(FlexListEntry, [

                m('img.source-icon',         { src: provider.icon } ),
                m('div.source-caption.f4',          provider.caption),
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

            ]));

        // From here there is a provider + games to filter
        } else {

            const games = provider.games.filter( g => {
                return filter.length
                    ?  g.searchtext.includes(filter)
                    :  true;
            });

            return m('div.page.games', { className, style }, [

                m(PageTitle, filter.length
                    ? read(provider.header) + `[${games.length}/${provider.games.length}]`
                    : read(provider.header) + `[${provider.games.length}]`,
                ),

                m(ListFilter, { oninput : (e) => {
                    filter = e.target.value.toLowerCase();},
                }),

                m(GamesList, { games }),

            ]);

        }

    },

});

export default Games;
