
import { Svg }   from './ChessboardView';
// import { COLOR } from './Chessboard.js';

export class Illustrator {

    constructor(chessboard, view) {
        this.chessboard = chessboard;
        this.view = view;
        this.sprites = ['marker1', 'marker2', 'marker3'];
    }

    destroy() {
        window.clearTimeout(this.drawMarkersDebounce);
        window.clearTimeout(this.drawArrowsDebounce);
    }

    createSvgAndGroups (svg) {
        this.svg = svg;
        this.markersGroup = Svg.addElement(svg, 'g', {class: 'markers'});
        this.arrowsGroup  = Svg.addElement(svg, 'g', {class: 'arrows'});
    }

    drawMarkersDebounced() {
        window.clearTimeout(this.drawMarkersDebounce);
        this.drawMarkersDebounce = setTimeout(() => {
            this.drawMarkers();
        }, 10);
    }

    drawMarkers() {
        if (this.markersGroup) {
            while (this.markersGroup.firstChild) {
                this.markersGroup.removeChild(this.markersGroup.firstChild);
            }
            this.chessboard.state.markers.forEach((marker) => {
                this.drawMarker(marker);
            });
        }
    }

    drawMarker(marker) {
        const markerGroup = Svg.addElement(this.markersGroup, 'g');
        markerGroup.setAttribute('data-index', marker.index);
        const point = this.view.squareIndexToPoint(marker.index);
        const transform = (this.svg.createSVGTransform());
        transform.setTranslate(point.x, point.y);
        markerGroup.transform.baseVal.appendItem(transform);
        const markerUse = Svg.addElement(markerGroup, 'use',
            {href: `#${marker.type.slice}`, class: 'marker ' + marker.type.class});
        const transformScale = (this.svg.createSVGTransform());
        transformScale.setScale(this.view.scalingX, this.view.scalingY);
        markerUse.transform.baseVal.appendItem(transformScale);
        return markerGroup;
    }

    drawArrowsDebounced() {
        window.clearTimeout(this.drawArrowsDebounce);
        this.drawArrowsDebounce = setTimeout( () => {
            this.drawArrows();
        }, 10);
    }

    drawArrows () {
        if (this.arrowsGroup) {
            while (this.arrowsGroup.firstChild) {
                this.arrowsGroup.removeChild(this.arrowsGroup.firstChild);
            }
            this.chessboard.state.arrows.forEach((arrow) => {
                this.drawArrow(arrow);
            });
        }
    }

    calcAngle (x1, y1, x2, y2) {

        return (
            x1 === x2 && y1  <  y2 ?   0 :   // north
            x1  >  x2 && y1 === y2 ?  90 :   // east
            x1 === x2 && y1  >  y2 ? 180 :   // south
            x1  <  x2 && y1 === y2 ? 270 :   // west

            x1  >  x2 && y1  <  y2 ?  45 :   // north east
            x1  >  x2 && y1  >  y2 ? 135 :   // south east
            x1  <  x2 && y1  >  y2 ? 225 :   // south west
            x1  <  x2 && y1  <  y2 ? 315 :   // north west

            22
        );

    }

    addPolyline (parent, points) {
        const polyline = Svg.addElement(parent, 'polyline');
        polyline.setAttribute('points', points);
        return polyline;
    }

    drawArrow(arrow) {

        let angle, start, end, head;

        const
            round = Math.round, abs = Math.abs,
            arrowGroup = Svg.addElement(
                this.arrowsGroup, 'g',
                {class: arrow.attributes.class},
            ),
            translate  = this.svg.createSVGTransform(),
            scale      = this.svg.createSVGTransform(),
            rotate     = this.svg.createSVGTransform(),
            from       = this.view.squareIndexToPoint(arrow.from),
            to         = this.view.squareIndexToPoint(arrow.to),
            grd2       = this.chessboard.props.sprite.grid/2,
            hd    = grd2 / 2,
            dX    = (from.x - to.x) / this.view.scalingX,
            dY    = (from.y - to.y) / this.view.scalingY,
            tx    = grd2 - dX,
            ty    = grd2 - dY,
            t1x   = (Math.abs(dX) > Math.abs(dY)) ? tx : grd2,
            t1y   = (Math.abs(dX) > Math.abs(dY)) ? grd2 : ty
        ;

        // if resizing can't determine square size...
        if (!tx || !ty) { return;}

        if (arrow.attributes.onclick) {
            arrowGroup.addEventListener('click', arrow.attributes.onclick);
            arrowGroup.addEventListener('touchstart', arrow.attributes.onclick);
        }

        // move group to from
        translate.setTranslate(from.x, from.y);
        arrowGroup.transform.baseVal.appendItem(translate);

        // scale arrow to board size
        scale.setScale(this.view.scalingX, this.view.scalingY);

        // construct arrow ~ compensates rounding errors
        if (abs(round(dY)) === abs(round(dX)) || round(dY) === 0 || round(dX) === 0) {

            // non knight
            start  = this.addPolyline (arrowGroup, `${grd2},${grd2} ${tx},${ty}`);
            head   = this.addPolyline (arrowGroup, `${tx-10},${ty-10} ${tx},${ty} ${tx+10},${ty-10}`);
            angle  = this.calcAngle(from.x, from.y, to.x, to.y);

        } else {

            // knight
            start  = this.addPolyline (arrowGroup, `${grd2},${grd2} ${t1x},${t1y}`);
            end    = this.addPolyline (arrowGroup, `${t1x},${t1y} ${tx},${ty}`);
            head   = this.addPolyline (arrowGroup, `${tx-hd},${ty-hd} ${tx},${ty} ${tx+hd},${ty-hd}`);
            angle  = this.calcAngle(t1x, t1y, tx, ty);
            end.transform.baseVal.appendItem(scale);

        }

        rotate.setRotate(angle, tx, ty);

        start.transform.baseVal.appendItem(scale);
        head.transform.baseVal.appendItem(scale);
        head.transform.baseVal.appendItem(rotate);

        return arrowGroup;

    }

}

export default Illustrator;
