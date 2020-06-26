
import interact from 'interactjs';

import Dispatcher from '../../globals/dispatcher';
import Tools      from '../../tools/tools';

const fire = Dispatcher.connect({name: 'board-pieces'}, false);

export default {
    name: 'BoardPieces',
    onremove () {
        interact('.dropzone').unset();
    },
    oncreate () {

        // enable draggables to be dropped into this
        interact('.dropzone').dropzone({
            // only accept elements matching this CSS selector
            accept: '*',
            // Require a 75% element overlap for a drop to be possible
            overlap: 0.75,

            // listen for drop related events:

            ondropactivate: function (event) {
                // add active dropzone feedback
                event.target.classList.add('drop-active');
            },
            ondragenter: function (event) {
                var draggableElement = event.relatedTarget;
                var dropzoneElement = event.target;

                // feedback the possibility of a drop
                dropzoneElement.classList.add('drop-target');
                draggableElement.classList.add('can-drop');
                // draggableElement.style.transform.replace(/scale(\d+)/, 'scale(2)');

                // dropzoneElement.style.outline = '2px solid red';
                dropzoneElement.style.fill = 'cadetblue';

                // draggableElement.style.transform.scale = 2.0;
                // draggableElement.textContent = 'Dragged in';
            },
            ondragleave: function (event) {
                // remove the drop feedback style
                event.target.classList.remove('drop-target');
                event.relatedTarget.classList.remove('can-drop');
                // event.relatedTarget.textContent = 'Dragged out';
                // event.target.style.outline = 'none';
                event.target.style.fill = '';
                // event.relatedTarget.style.transform.replace(/scale(\d+)/, 'scale(1)');

            },
            ondrop: function (event) {
                const drag = event.relatedTarget;
                const zone = event.target;
                const dropindex = zone.attributes['data-index'].nodeValue;
                const dragpiece = drag.attributes['data-piece'].nodeValue;
                event.target.style.fill = '';
                fire('board', 'piece', ['add', dragpiece, Tools.Board.squareIndexToField(dropindex)]);
            },
            ondropdeactivate: function (event) {
                // remove active dropzone feedback
                event.target.classList.remove('drop-active');
                event.target.classList.remove('drop-target');
            },
        });

        // target elements with the "draggable" class
        interact('.draggable')
            .draggable({
                // enable inertial throwing
                inertia: true,
                // keep the element within the area of it's parent
                // modifiers: [
                //     interact.modifiers.restrictRect({
                //         restriction: 'parent',
                //         endOnly: true,
                //     }),
                // ],
                // enable autoScroll
                autoScroll: false,

                listeners: {

                    start () {
                        [...document.querySelectorAll('div.chessboard rect.square')].forEach( ele => {
                            ele.classList.add('dropzone');
                        });
                    },

                    // call this function on every dragmove event
                    move: dragMoveListener,

                    // call this function on every dragend event
                    end (event) {

                        var target = event.target;

                        target.style.transform = 'translate(0,0)';
                        // update the posiion attributes
                        target.setAttribute('data-x', 0);
                        target.setAttribute('data-y', 0);

                        [...document.querySelectorAll('div.chessboard rect.square')].forEach( ele => {
                            ele.classList.remove('dropzone');
                        });

                    },
                },
            });

        function dragMoveListener (event) {

            var target = event.target;
            // keep the dragged position in the data-x/data-y attributes
            var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
            var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

            // translate the element
            target.style.webkitTransform =
                target.style.transform =
                'translate(' + x + 'px, ' + y + 'px)'
            ;

            // update the position attributes
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
        }

        // this function is used later in the resizing and gesture demos
        window.dragMoveListener = dragMoveListener;

    },

    view ( vnode ) {

        const height   = 40;
        const size     = height - 8;
        const svgstuff = '[xmlns="http://www.w3.org/2000/svg"][xmlns:xlink="http://www.w3.org/1999/xlink"]';

        let left = 0,  counter = 0, lastPiece = '';

        return m('[', vnode.attrs.pieces.map( (piece, idx) => {

            counter = lastPiece === piece ? ++counter : 0;
            lastPiece = piece;
            left = -counter * size/2 * 1.3;

            return m(`svg[viewBox="0 0 ${size} ${size}"]` + svgstuff, {
                class: 'draggable', 'data-index': idx, 'data-piece': piece,
                style:`position: relative; left: ${left}px; width: ${size}px; height: ${size}px; `, //transform:'translate(0) scale(1.0)'`,
            },
            m('g[transform="translate(0,0)"]', m('use', {
                href: '#' + piece,
                transform: `translate(${0,0}) scale(${1.0})`,
            })),
            );

        }));

    },

};

