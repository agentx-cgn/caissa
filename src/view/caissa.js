
import { H, $$ }   from './services/helper';
import History     from './services/history';
import Pages       from './data/pages';
import DB          from './services/database';
import { Nothing } from './components/misc';
import Tools       from './tools/tools';
import Factory     from './components/factory';

const DEBUG = true;

let redraws = 0;

const Caissa = {

    onload () {
        const t = Date.now() - window.t0;
        t > 2000
            ? console.warn('Warn   :', '... done after', 0, t, 'msecs')
            : console.log ('Info   :', '... done after', 0, t, 'msecs')
        ;
        if (DB.Options['ui'].waitscreen) {
            $$('.loader button.onstart').style.display = 'inline-block';
            $$('.loader button.reload').style.display  = 'inline-block';
        } else {
            //TODO: delete nodes
            $$('.loader').style.display   = 'none';
            $$('body .backdrop').style.display = 'none';
        }
        console.log(' ');
    },

    route ( route, params={}, options={replace:false} ) {

        console.log(' ');
        DEBUG && console.log('%cCaissa.route.in %s %s %s', 'color:darkred; font-weight: 800', route, H.shrink(params), H.shrink(options) );

        const page = Pages[route];

        if (page) {
            History.prepare(route, params, options);
            m.route.set(route, params, {title: page.title, ...options});

        } else {
            console.warn('caissa.route.error', route, params, options);

        }
    },

    resolver (route, pageentry) {
        return {
            onmatch ( params ) {

                try {
                    redraws && console.log(' ');
                    const target  = Tools.interpolate(route, params);
                    const current = History.isCurrent(target) ? 'current' : 'new';
                    DEBUG && console.log('%cCaissa.onmatch.in %s %s ', 'color:darkblue; font-weight: 800', target, current);
                    History.prepare(route, params);

                } catch (e) {console.log(JSON.stringify(e), e);}

            },
            render ( vnode ) {

                const content = pageentry[1];
                const target  = Tools.interpolate(route, vnode.attrs);
                const current = History.isCurrent(target) ? 'current' : 'new';
                DEBUG && console.log('%cCaissa.render.in %s %s', 'color:darkorange; font-weight: 800', target, current);

                History.finalize(route, vnode.attrs, content);

                return m(Caissa.comp, { route, params: vnode.attrs });
            },
        };
    },

    comp : Factory.create('Caissa', {
        view ( vnode ) {

            const { route, params } = vnode.attrs;
            const [ layout, content, section, pagedata ] = Pages[route];

            const target   = Tools.interpolate(route, params);
            const animflag = History.canAnimate ? 'animate' : 'still' ;

            DEBUG && console.log('%cCaissa.view.in %s %s', 'color:darkgreen; font-weight: 800', target, animflag);

            document.title = pagedata.title;

            // slider + board
            if (pagedata.flags.includes(' sb ')) {

                const [ slides, log ] = History.slides();
                const [ left, center, right, anim] = slides;
                const sliderContent = [
                    m(left.content,   left.params),
                    m(center.content, center.params),
                    m(right.content,  right.params),
                ];

                History.log();
                console.log('VIEW', log);
                // console.log('VIEW', slides);

                return m(layout, { pagedata, anim }, [ sliderContent, m(Nothing) ]);

            } else {
                return m(layout, { route, params }, [ content, section ]);

            }

        },

    }),

};

const DefaultRoute = '/sources/';
const Routes = H.transform(Pages, Caissa.resolver);

export { Caissa as default, Routes, DefaultRoute };
