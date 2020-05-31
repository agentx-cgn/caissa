
import { FormDefinitions }  from '../data/forms';
import { H }  from '../services/helper';

const read = H.interprete;

const TimeStamp = function () {
    let _dom, ticker;
    return {
        oncreate ({ dom, attrs }) {
            _dom = dom;
            ticker = setInterval( () => {
                m.render(_dom, H.date2isoLocal(new Date()));
                attrs.control.ontick();
            }, 1000);
        },
        onremove () { clearInterval(ticker); },
        view     () { return m('div.control-input-60', 'HUHU');},
    };
};

function renderCat  (cat)  {

    return m('[', [
        m('div.cat-caption', cat.title || cat.category),
        ...cat.controls
            .sort( (a, b) => a.sort - b.sort)
            .filter (control => control.active)
            .map( control => m('div.control', renderControl(control) ))
        ,
    ]);

}

function renderControl (control) {

    if (control.type === 'button') {
        if (control.title) {
            return [
                m('div.dib.tr.f5.pr3.w-50', control.title),
                m('div.dib.tl.w-50',
                    m('button', control.attributes, read(control.caption)),
                ),
            ];
        } else {
            return [
                m('div.dib.tc.w-100',
                    m('button.w-100.pv1.ph2', control.attributes, read(control.caption)),
                ),
            ];

        }

    } else if (control.type === 'none') {
        return [
            m('div.control-label-40', read(control.caption)),
            m('div.control-input-60', read(control.value)),
        ];

    } else if (control.type === 'timestamp') {
        return [
            m('div.control-label-40', read(control.caption)),
            m(TimeStamp, { control: control }),
        ];

    } else if (control.type === 'checkbox') {
        control.attributes.checked = read(control.value);
        return [
            m('div.control-label-40', read(control.caption)),
            m('div.control-input-60',
                m('input[type="checkbox"]', control.attributes),
            ),
        ];

    } else if (control.type === 'text') {
        control.attributes.value = read(control.value);
        return [
            m('div.control-label-100', read(control.caption)),
            m('div.ph3.w-100',
                m('input[type="text"].w-100', control.attributes),
            ),
        ];

    } else if (control.type === 'text-split') {
        control.attributes.value = read(control.value);
        return [
            m('div.dib.pr3.tr.f5.w-40', read(control.caption)),
            m('div.dib.w-60',
                m('input[type="text"].w-100', control.attributes),
            ),
        ];

    } else if (control.type === 'url') {
        control.attributes.value = read(control.value);
        return [
            m('div.control-label-100', read(control.caption)),
            m('div.ph3.w-100',
                m('input[type="url"].w-100', control.attributes),
            ),
        ];

    } else if (control.type === 'colorbox') {
        control.attributes.value = read(control.value);
        return m('input[type="color"]', control.attributes);

    } else if (control.type === 'range') {
        control.attributes.value = read(control.value);
        return [
            m('div.control-label-40', read(control.caption)),
            m('div.control-input-60',
                m('input[type="range"]', control.attributes),
            ),
            ! control.attributes.list
                ? m('span')
                : m('datalist', {id: control.attributes.list}, control.datalist.map(entry => m('option', entry))),

        ];

    } else if (control.type === 'number') {
        control.attributes.value = read(control.value);
        if (control.dimension) {
            return [
                m('div.control-label-40',           read(control.caption)),
                m('input[type="number"].w-30',        control.attributes),
                m('div.dib.dimension.tl.f5.pl2.w-30', control.dimension),
            ];
        } else {
            return [
                m('div.control-label-40',    read(control.caption)),
                m('input[type="number"].w-60', control.attributes),
            ];
        }

    } else if (control.type === 'select') {
        // control.attributes.value = read(control.value);
        return [
            m('div.control-label-100', read(control.caption)),
            m('select.mh3', control.attributes, control.options.map( opt => m('option', opt) )),
        ];

    } else if (control.type === 'selectindexed') {
        const index = read(control.value).idx;
        return [
            m('div.control-label-100', read(control.caption)),
            m('div.tl.f5.pl3.pv2.w-100',
                m('select.ph2.pv1.w-100',
                    control.attributes,
                    control.options.map( opt => m('option', {value: opt.idx, selected: opt.idx === index}, opt.caption) ),
                ),
            ),

        ];

    } else if (control.type === 'selectindexed-split') {
        const index = read(control.value).idx;
        return [
            m('div.dib.control-label-40', read(control.caption)),
            m('div.dib.tl.f5.pv2.w-60',
                m('select.ph2.pv1.w-100',
                    control.attributes,
                    control.options.map( opt => m('option', {value: opt.idx, selected: opt.idx === index}, opt.caption) ),
                ),
            ),

        ];

    } else {
        return control.control + ' unknown';
    }

}

export default {

    view( vnode ) {

        const { formdata, categories } = vnode.attrs;
        const catArray = typeof categories === 'string' ? [categories] : categories;

        return m('div.bg-eee', vnode.attrs,
            FormDefinitions(formdata)
                .filter(cat => catArray.includes(cat.category))
                .sort( (a, b) => a.sort - b.sort )
                .map( renderCat )
            ,
        );

    },
};
