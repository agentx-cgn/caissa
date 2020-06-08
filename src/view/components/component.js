
import { H } from '../services/helper';

const freezer = [];

const Dispatcher = function (source) {

    return {
        send (msg) {
            freezer.forEach( comp => {
                if (comp[msg.channel] && typeof comp[msg.channel] === 'function' && source !== comp.name){
                    comp[msg.channel]({source, ...msg});
                    // console.log('dispatcher.send', msg, 'to', comp.name, 'from', source);
                }
            });
        },
    };

};

export default {
    create (name, comp) {

        let preventUpdates = false;

        if (typeof comp.onregister === 'function') {
            comp.onregister(Dispatcher(name));
        }

        const ice = H.deepCreateFreeze({
            name,
            oncreate() {},
            onupdate() {},
            onremove() {console.log(name, 'onremove');},
            onbeforeupdate( /* vnode, old */) {

                // https://mithril.js.org/lifecycle-methods.html#onbeforeupdate
                // The onbeforeupdate(vnode, old) hook is called before a vnode is diffed in a update.
                // If this function is defined and returns false, Mithril prevents a diff from happening to the vnode,
                // and consequently to the vnode's children.

                if (preventUpdates) {
                    console.log('Component.' + name, 'prevented Updates');
                }
                return !preventUpdates;
            },
            get preventUpdates () {
                return preventUpdates;
            },
            set preventUpdates (value) {
                preventUpdates = value;
            },
        }, comp);

        freezer.push(ice);

        return ice;
    },
};

