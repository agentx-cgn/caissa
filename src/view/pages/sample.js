
import Dispatcher from '../globals/dispatcher';

const sample = {
    sample () {
        console.log('sample');
        fire();
    },
};

// const fire = Dispatcher.connect(sample, (msg) => {
//     if (sample[msg.action]){
//         sample[msg.action].apply(null, msg.params);
//         console.log('sample.listened', msg);
//     }
// });

const fire = Dispatcher.connect(sample);

export default function() {

    var count = 0; // added a variable

    // https://mithril.js.org/lifecycle-methods.html
    return {
        oninit: function( /* vnode */ ){
            // The oninit(vnode) hook is called before a vnode is touched by the virtual DOM engine.
            // The oninit hook is useful for initializing component state
            // based on arguments passed via vnode.attrs or vnode.children.
            console.log('sample.oninit', count);
        },
        oncreate: function( /* vnode */ ) {
            // The oncreate(vnode) hook is called after a DOM element is created and attached to the document.
            console.log('sample.oncreate', count);
        },
        onbeforeupdate: function( /* newVnode, oldVnode */ ) {
            // If this function is defined and returns false,
            // Mithril prevents a diff from happening to the vnode, and consequently to the vnode's children.
            return true;
        },
        onupdate: function( /* vnode */ ) {
            // DOM elements whose vnodes have an onupdate hook do not get recycled.
            console.log('sample.onupdate', count);
        },
        onbeforeremove: function( /* vnode */ ) {
            //console.log('exit animation can start');
            console.log('sample.onbeforeremove', count);
            return new Promise(function(resolve) {
                // call after animation completes
                resolve();
            });
        },
        onremove: function( /* vnode */ ) {
            console.log('sample.onremove', count);
        },
        view: function() {
            return m('main', [
                m('h1', {
                    class: 'title',
                }, 'My first component'),
                // changed the next line
                m('button', {
                    onclick: function() {
                        count++;
                    },
                }, count + ' clicks'),
            ]);
        },
    };

}
