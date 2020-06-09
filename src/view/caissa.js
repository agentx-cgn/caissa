
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

        const [layout, [content, section], page] = pageentry;

        return {
            onmatch ( params ) {

                try {
                    redraws && console.log(' ');
                    const target = Tools.interpolate(route, params);
                    const current = History.isCurrent(target) ? 'current' : 'new';
                    DEBUG && console.log('%cCaissa.onmatch.in %s %s ', 'color:darkblue; font-weight: 800', target, current);
                    History.prepare(route, params, {replace: false});

                } catch (e) {console.log(JSON.stringify(e), e);}

            },
            render ( vnode ) {

                const target = Tools.interpolate(route, vnode.attrs);
                const current = History.isCurrent(target) ? 'current' : 'new';
                DEBUG && console.log('%cCaissa.render.in %s %s', 'color:darkorange; font-weight: 800', target, current);

                History.finalize(route, {params: vnode.attrs, page, content});
                const animate = History.canAnimate;

                return m(Caissa.comp, { animate, url: target, page, attrs: vnode.attrs}, [layout, content, section]);
            },
        };

    },

    comp : Factory.create('Caissa', {
        name: 'Caissa',
        view ( vnode ) {

            const { animate, url, page, attrs} = vnode.attrs;
            const [ layout ] = vnode.children;

            const animflag = animate ? 'animate' : 'still' ;
            DEBUG && console.log('%cCaissa.view.in %s %s', 'color:darkgreen; font-weight: 800', url, animflag);

            document.title = page.title;

            if (page.flags.includes(' sb ')) {

                const [ contents, log ] = History.contents();
                const [ left, center, right, anim] = contents;
                const sliderContent = [
                    m(left.content,   left.params),
                    m(center.content, center.params),
                    m(right.content,  right.params),
                ];

                History.log();
                console.log('VIEW', log);
                // console.log('VIEW', contents);

                return m(layout, {page, anim}, [ sliderContent, m(Nothing) ]);

            } else {
                const [ layout, content, section ] = vnode.children;
                return m(layout, { attrs }, [ content, section ]);

            }

        },

    }),

};

const DefaultRoute = '/sources/';
const Routes = H.transform(Pages, Caissa.resolver);

export { Caissa as default, Routes, DefaultRoute };
