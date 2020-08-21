
import Factory  from '../../components/factory';

let domProgress;

const GameProgressBar = Factory.create('GameProgressBar', {
    render ( percent ) {
        domProgress && (domProgress.innerHTML = `<div class="gm-progress" style="width:${percent}%">`);
    },
    oncreate ({ dom }) {
        domProgress = dom;
    },
    view () {
        return m('div.gm-bar-progress');
    },
});

export default GameProgressBar;
