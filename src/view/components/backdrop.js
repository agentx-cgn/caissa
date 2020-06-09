
import Factory   from './factory';

const Backdrop = ( function () {

    let callback = null;
    let visible  = false;

    return Factory.create('Backdrop', {
        show (cb) {
            callback = cb || null;
            visible  = true;
        },
        hide () {
            visible = false;
        },
        view () {
            return !visible
                ? m('back-drop')
                : m('back-drop.visible', { onclick: () => {
                    visible = false;
                    callback && callback();
                }})
            ;
        },
    });

}());

export default Backdrop;
