
import Logger from '../../../services/logger';

let search   = '';

export default {

    view: (/*vnode*/) => m('div.w-100', [

        m('div.w-100.bg-eee', [
            m('input[type=text].w-100', {
                style: 'background-color: #fff',
                oninput: e => search = e.target.value + '',
                value: search,
                placeholder: 'type to filter',
            }),
        ]),

        m('pre.w-100.bg-eee.pl3.viewport-xy.f7', [
            m.trust(Logger.search(search).slice(0, 1000).join('<br/>')),
        ]),

    ]),

};

