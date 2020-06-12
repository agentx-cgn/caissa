
import { FormGroups }  from '../data/form-groups';
import { H }           from '../services/helper';
import Factory         from './factory';

const read = H.interprete;

const TimeStamp = function () {
    let _dom, ticker;
    return {
        name: 'TimeStamp',
        oncreate ({ dom, attrs }) {
            _dom = dom;
            ticker = setInterval( () => {
                m.render(_dom, H.date2isoLocal(new Date()));
                attrs.control.ontick();
            }, 1000);
        },
        onremove () { clearInterval(ticker); },
        view ( vnode ) {
            return m('div', vnode.attrs, H.date2isoLocal(new Date()));
        },
    };
};

function renderFormGroup (group)  {

    return m('[', [
        m('div.group.title.sair', group.title),
        ...group.controls
            .sort( (a, b) => a.sort - b.sort)
            .filter (control => control.active)
            .map( control => m('div.control', renderGroupControl(control) ))
        ,
    ]);

}

function renderGroupControl (control) {

    // console.log('renderGroupControl', control);

    if (control.type === 'button') {
        if (control.title) {
            return [
                m('div.control-label-40', control.title),
                m('div.control-60',
                    m('button.w-100', control.attributes, read(control.caption)),
                ),
            ];
        } else {
            return [
                m('div.control-100',
                    m('button.tc.w-100.pv1.ph2', control.attributes, read(control.caption)),
                ),
            ];

        }

    } else if (control.type === 'passive') {
        return [
            m('div.control-label-40', read(control.caption)),
            m('div.control-60', read(control.value)),
        ];

    } else if (control.type === 'timestamp') {
        return [
            m('div.control-label-40', read(control.caption)),
            m(TimeStamp, { class: 'control-60', control: control }),
        ];

    } else if (control.type === 'checkbox') {
        control.attributes.checked = read(control.value);
        return [
            m('div.control-label-40', read(control.caption)),
            m('div.control-60',
                m('input[type="checkbox"]', control.attributes),
            ),
        ];

    } else if (control.type === 'text') {
        control.attributes.value = read(control.value);
        return [
            m('div.control-label-100', read(control.caption)),
            m('div.control-100',
                m('input[type="text"].w-100', control.attributes),
            ),
        ];

    } else if (control.type === 'text-split') {
        control.attributes.value = read(control.value);
        return [
            m('div.control-label-40', read(control.caption)),
            m('div.control-60',
                m('input[type="text"].w-100', control.attributes),
            ),
        ];

    } else if (control.type === 'url') {
        control.attributes.value = read(control.value);
        return [
            m('div.control-label-100', read(control.caption)),
            m('div.control-60',
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
            m('div.control-60',
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
                m('div.dimension.w-30', control.dimension),
            ];
        } else {
            return [
                m('div.control-label-40',    read(control.caption)),
                m('div.control-60',
                    m('input[type="number"].w-100', control.attributes),
                ),
            ];
        }

    } else if (control.type === 'select') {
        // control.attributes.value = read(control.value);
        return [
            m('div.control-label-100', read(control.caption)),
            m('div.control-100',
                m('select.mh3', control.attributes, control.options.map( opt => m('option', opt) )),
            ),
        ];

    } else if (control.type === 'selectindexed') {
        const index = read(control.value).idx;
        return [
            m('div.control-label-100', read(control.caption)),
            m('div.tl.f5.pl3.pv2.w-100',
                m('select.ph2.w-100', {style: 'padding-top: 2px; padding-bottom: 2px;'},
                    control.attributes,
                    control.options.map( opt => m('option', {value: opt.idx, selected: opt.idx === index}, opt.caption) ),
                ),
            ),

        ];

    } else if (control.type === 'selectindexed-split') {
        // const value = read(control.value);
        // if (!value || value.idx === undefined){
        //     console.log('form.error', control, value, value.idx);
        // }
        const index = read(control.value).idx;
        return [
            m('div.control-label-40', read(control.caption)),
            m('div.control-60',
                m('select.ph2.w-100', {style: 'padding-top: 2px; padding-bottom: 2px;',  ...control.attributes},
                    control.options.map( opt => m('option', {value: opt.idx, selected: opt.idx === index}, opt.caption) ),
                ),
            ),

        ];

    } else {
        return control.type + ' unknown';
    }

}

const Forms = Factory.create('Forms', {
    view( vnode ) {

        const { formdata } = vnode.attrs;

        return m('div.forms', vnode.attrs,
            FormGroups(formdata)
                .filter(
                    form => form.group === formdata.group,
                )
                .sort( (a, b) => a.sort - b.sort )
                .map( renderFormGroup )
            ,
        );

    },
});

export default Forms;
