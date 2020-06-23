
import Factory  from '../../components/factory';

let progressdom;

const GameProgressBar = Factory.create('GameProgressBar', {
    render ( percent ) {
        progressdom && (progressdom.innerHTML = `<div class="gm-progress" style="width:${percent}%">`);
    },
    oncreate ({ dom }) {
        progressdom = dom;
    },
    view () {
        return m('div.gm-bar-progress');
    },
});

export default GameProgressBar;
