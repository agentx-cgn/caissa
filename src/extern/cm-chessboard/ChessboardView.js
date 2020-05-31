/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard
 * License: MIT, see file 'LICENSE'
 */

import {SQUARE_COORDINATES} from "./ChessboardState.js"
import {ChessboardMoveInput} from "./ChessboardMoveInput.js"
import {COLOR, MOVE_INPUT_MODE, INPUT_EVENT_TYPE} from "./Chessboard.js"
import {ChessboardPiecesAnimation} from "./ChessboardPiecesAnimation.js"

const SPRITE_LOADING_STATUS = {
    notLoaded: 1,
    loading: 2,
    loaded: 3
}

export class ChessboardView {

    constructor(chessboard, callbackAfterCreation) {
        this.animationRunning = false
        this.currentAnimation = null
        this.chessboard = chessboard
        this.spriteLoadWaitingTries = 0
        this.loadSprite(chessboard.props, () => {
            this.spriteLoadWaitDelay = 0
            this.moveInput = new ChessboardMoveInput(this, chessboard.state, chessboard.props,
                this.moveStartCallback.bind(this),
                this.moveDoneCallback.bind(this),
                this.moveCanceledCallback.bind(this)
            )
            this.animationQueue = []
            if (chessboard.props.responsive) {
                this.resizeListener = this.handleResize.bind(this)
                window.addEventListener("resize", this.resizeListener)
            }
            if (chessboard.props.moveInputMode !== MOVE_INPUT_MODE.viewOnly) {
                this.pointerDownListener = this.pointerDownHandler.bind(this)
                this.chessboard.element.addEventListener("mousedown", this.pointerDownListener)
                this.chessboard.element.addEventListener("touchstart", this.pointerDownListener)
            }
            this.createSvgAndGroups()
            this.updateMetrics()
            callbackAfterCreation()
        })
    }

    pointerDownHandler(e) {
        e.preventDefault()
        this.moveInput.onPointerDown(e)
    }

    destroy() {
        this.moveInput.destroy()
        window.removeEventListener('resize', this.resizeListener)
        this.chessboard.element.removeEventListener("mousedown", this.pointerDownListener)
        this.chessboard.element.removeEventListener("touchstart", this.pointerDownListener)
        window.clearTimeout(this.resizeDebounce)
        window.clearTimeout(this.redrawDebounce)
        window.clearTimeout(this.drawPiecesDebounce)
        window.clearTimeout(this.drawMarkersDebounce)
        window.clearTimeout(this.drawArrowssDebounce)
        Svg.removeElement(this.svg)
        this.animationQueue = []
        if (this.currentAnimation) {
            cancelAnimationFrame(this.currentAnimation.frameHandle)
        }
    }

    // Sprite //

    loadSprite(props, callback) {
        if (ChessboardView.spriteLoadingStatus === SPRITE_LOADING_STATUS.notLoaded) {
            ChessboardView.spriteLoadingStatus = SPRITE_LOADING_STATUS.loading
            Svg.loadSprite(props.sprite.url, [
                "wk", "wq", "wr", "wb", "wn", "wp",
                "bk", "bq", "br", "bb", "bn", "bp",
                "marker1", "marker2", "marker3"
                ].concat(props.sprite.markers), () => {
                ChessboardView.spriteLoadingStatus = SPRITE_LOADING_STATUS.loaded
                callback()
            }, props.sprite.grid)
        } else if (ChessboardView.spriteLoadingStatus === SPRITE_LOADING_STATUS.loading) {
            setTimeout(() => {
                this.spriteLoadWaitingTries++
                if (this.spriteLoadWaitingTries < 50) {
                    this.loadSprite(props, callback)
                } else {
                    console.error("timeout loading sprite", props.sprite.url)
                }
            }, this.spriteLoadWaitDelay)
            this.spriteLoadWaitDelay += 10
        } else if (ChessboardView.spriteLoadingStatus === SPRITE_LOADING_STATUS.loaded) {
            callback()
        } else {
            console.error("error ChessboardView.spriteLoadingStatus", ChessboardView.spriteLoadingStatus)
        }
    }

    // Draw //

    createSvgAndGroups() {
        if (this.svg) {
            Svg.removeElement(this.svg)
        }
        this.svg = Svg.createSvg(this.chessboard.element)
        let cssClass = this.chessboard.props.style.cssClass ? this.chessboard.props.style.cssClass : "default"
        if (this.chessboard.props.style.showBorder) {
            this.svg.setAttribute("class", "cm-chessboard has-border " + cssClass)
        } else {
            this.svg.setAttribute("class", "cm-chessboard " + cssClass)
        }
        this.updateMetrics()
        this.boardGroup = Svg.addElement(this.svg, "g", {class: "board"})
        this.coordinatesGroup = Svg.addElement(this.svg, "g", {class: "coordinates"})
        this.markersGroup = Svg.addElement(this.svg, "g", {class: "markers"})
        this.arrowsGroup  = Svg.addElement(this.svg, "g", {class: "caissa-arrows"})
        this.piecesGroup  = Svg.addElement(this.svg, "g", {class: "pieces"})
    }

    updateMetrics() {
        this.width = this.chessboard.element.offsetWidth
        this.height = this.chessboard.element.offsetHeight
        if (this.chessboard.props.style.showBorder) {
            this.borderSize = this.width / 32
        } else {
            this.borderSize = this.width / 320
        }
        this.innerWidth = this.width - 2 * this.borderSize
        this.innerHeight = this.height - 2 * this.borderSize
        this.squareWidth = this.innerWidth / 8
        this.squareHeight = this.innerHeight / 8
        this.scalingX = this.squareWidth / this.chessboard.props.sprite.grid
        this.scalingY = this.squareHeight / this.chessboard.props.sprite.grid
        this.pieceXTranslate = (this.squareWidth / 2 - this.chessboard.props.sprite.grid * this.scalingY / 2)
    }

    handleResize() {
        window.clearTimeout(this.resizeDebounce)
        this.resizeDebounce = setTimeout(() => {
            if (this.chessboard.element.offsetWidth !== this.width ||
                this.chessboard.element.offsetHeight !== this.height) {
                this.updateMetrics()
                this.redraw()
            }
            this.svg.setAttribute("width", "100%") // safari bugfix
            this.svg.setAttribute("height", "100%")
        })
    }

    redraw() {
        return new Promise((resolve) => {
            window.clearTimeout(this.redrawDebounce)
            this.redrawDebounce = setTimeout(() => {
                if (!this.boardGroup) return;
                this.drawBoard()
                this.drawCoordinates()
                this.drawMarkers()
                this.drawArrows()
                this.setCursor()
            })
            this.drawPiecesDebounced(this.chessboard.state.squares, () => {
                resolve()
            })
        })
    }

    // Board //

    drawBoard() {
        while (this.boardGroup.firstChild) {
            this.boardGroup.removeChild(this.boardGroup.lastChild)
        }
        let boardBorder = Svg.addElement(this.boardGroup, "rect", {width: this.width, height: this.height})
        boardBorder.setAttribute("class", "border")
        if (this.chessboard.props.style.showBorder) {
            const innerPos = this.borderSize - this.borderSize / 9
            let borderInner = Svg.addElement(this.boardGroup, "rect", {
                x: innerPos,
                y: innerPos,
                width: this.width - innerPos * 2,
                height: this.height - innerPos * 2
            })
            borderInner.setAttribute("class", "border-inner")
        }
        for (let i = 0; i < 64; i++) {
            const index = this.chessboard.state.orientation === COLOR.white ? i : 63 - i
            const squareColor = ((9 * index) & 8) === 0 ? 'black' : 'white'
            const fieldClass = `square ${squareColor}`
            const point = this.squareIndexToPoint(index)
            const squareRect = Svg.addElement(this.boardGroup, "rect", {
                x: point.x, y: point.y, width: this.squareWidth, height: this.squareHeight
            })
            squareRect.setAttribute("class", fieldClass)
            squareRect.setAttribute("data-index", "" + index)
        }
    }

    drawCoordinates() {
        if (!this.chessboard.props.style.showCoordinates) {
            return
        }
        while (this.coordinatesGroup.firstChild) {
            this.coordinatesGroup.removeChild(this.coordinatesGroup.lastChild)
        }
        const inline = !this.chessboard.props.style.showBorder
        for (let file = 0; file < 8; file++) {
            let x = this.borderSize + (18 + this.chessboard.props.sprite.grid * file) * this.scalingX
            let y = this.height - this.scalingY * 2.6
            let cssClass = "coordinate file"
            if (inline) {
                x = x + this.scalingX * 15.5
                if (this.chessboard.props.style.showBorder) {
                    y = y - this.scalingY * 11
                }
                cssClass += file % 2 ? " dark" : " light"
            }
            const textElement = Svg.addElement(this.coordinatesGroup, "text", {
                class: cssClass,
                x: x,
                y: y,
                style: `font-size: ${this.scalingY * 8}px`
            })
            if (this.chessboard.state.orientation === COLOR.white) {
                textElement.textContent = String.fromCharCode(97 + file)
            } else {
                textElement.textContent = String.fromCharCode(104 - file)
            }
        }
        for (let rank = 0; rank < 8; rank++) {
            let x = (this.borderSize / 3.7)
            let y = this.borderSize + 24 * this.scalingY + rank * this.squareHeight
            let cssClass = "coordinate rank"
            if (inline) {
                cssClass += rank % 2 ? " light" : " dark"
                if (this.chessboard.props.style.showBorder) {
                    x = x + this.scalingX * 10
                    y = y - this.scalingY * 15
                } else {
                    x = x + this.scalingX * 2
                    y = y - this.scalingY * 15
                }
            }
            const textElement = Svg.addElement(this.coordinatesGroup, "text", {
                class: cssClass,
                x: x,
                y: y,
                style: `font-size: ${this.scalingY * 8}px`
            })
            if (this.chessboard.state.orientation === COLOR.white) {
                textElement.textContent = 8 - rank
            } else {
                textElement.textContent = 1 + rank
            }
        }
    }

    // Pieces //

    drawPiecesDebounced(squares = this.chessboard.state.squares, callback = null) {
        window.clearTimeout(this.drawPiecesDebounce)
        this.drawPiecesDebounce = setTimeout(() => {
            this.drawPieces(squares)
            if (callback) {
                callback()
            }
        })
    }

    drawPieces(squares = this.chessboard.state.squares) {
        if (this.piecesGroup){
            while (this.piecesGroup.firstChild) {
                this.piecesGroup.removeChild(this.piecesGroup.lastChild)
            }
            for (let i = 0; i < 64; i++) {
                const pieceName = squares[i]
                if (pieceName) {
                    this.drawPiece(i, pieceName)
                }
            }
        }
    }

    drawPiece(index, pieceName) {
        const pieceGroup = Svg.addElement(this.piecesGroup, "g")
        pieceGroup.setAttribute("data-piece", pieceName)
        pieceGroup.setAttribute("data-index", index)
        const point = this.squareIndexToPoint(index)
        const transform = (this.svg.createSVGTransform())
        transform.setTranslate(point.x, point.y)
        pieceGroup.transform.baseVal.appendItem(transform)
        const pieceUse = Svg.addElement(pieceGroup, "use", {"href": `#${pieceName}`, "class": "piece"}) 
        // center on square
        const transformTranslate = (this.svg.createSVGTransform())
        transformTranslate.setTranslate(this.pieceXTranslate, 0)
        pieceUse.transform.baseVal.appendItem(transformTranslate)
        // scale
        const transformScale = (this.svg.createSVGTransform())
        transformScale.setScale(this.scalingY, this.scalingY)
        pieceUse.transform.baseVal.appendItem(transformScale)
        return pieceGroup
    }

    setPieceVisibility(index, visible = true) {
        const piece = this.getPiece(index)
        if (visible) {
            piece.setAttribute("visibility", "visible")
        } else {
            piece.setAttribute("visibility", "hidden")
        }

    }

    getPiece(index) {
        return this.piecesGroup.querySelector(`g[data-index='${index}']`)
    }

    // Markers //

    drawMarkersDebounced() {
        window.clearTimeout(this.drawMarkersDebounce)
        this.drawMarkersDebounce = setTimeout(() => {
            this.drawMarkers()
        }, 10)
    }

    drawMarkers() {
        if (this.markersGroup) {
            while (this.markersGroup.firstChild) {
                this.markersGroup.removeChild(this.markersGroup.firstChild)
            }
            this.chessboard.state.markers.forEach((marker) => {
                    this.drawMarker(marker)
                }
            )
        }
    }

    drawMarker(marker) {
        const markerGroup = Svg.addElement(this.markersGroup, "g")
        markerGroup.setAttribute("data-index", marker.index)
        const point = this.squareIndexToPoint(marker.index)
        const transform = (this.svg.createSVGTransform())
        transform.setTranslate(point.x, point.y)
        markerGroup.transform.baseVal.appendItem(transform)
        const markerUse = Svg.addElement(markerGroup, "use",
            {href: `#${marker.type.slice}`, class: "marker " + marker.type.class})
        const transformScale = (this.svg.createSVGTransform())
        transformScale.setScale(this.scalingX, this.scalingY)
        markerUse.transform.baseVal.appendItem(transformScale)
        return markerGroup
    }

    // Arrows //

    drawArrowsDebounced() {
        window.clearTimeout(this.drawArrowsDebounce)
        this.drawArrowsDebounce = setTimeout(() => {
            this.drawArrows()
        }, 10)
    }

    drawArrows() {
        if (this.arrowsGroup) {
            while (this.arrowsGroup.firstChild) {
                this.arrowsGroup.removeChild(this.arrowsGroup.firstChild)
            }
            this.chessboard.state.arrows.forEach((arrow) => {
                    this.drawArrow(arrow)
                }
            )
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
        const polyline = Svg.addElement(parent, "polyline");
        polyline.setAttribute("points", points);
        return polyline;
    }

    drawArrow(arrow) {

        let angle, start, end, head;

        const 
            arrowGroup = Svg.addElement(
                this.arrowsGroup, "g", 
                {class: arrow.attributes.class}
            ),
            translate  = this.svg.createSVGTransform(),
            scale      = this.svg.createSVGTransform(),
            rotate     = this.svg.createSVGTransform(),
            from       = this.squareIndexToPoint(arrow.from),
            to         = this.squareIndexToPoint(arrow.to),
            grd2       = this.chessboard.props.sprite.grid/2,
            hd    = grd2 / 2,
            dX    = (from.x - to.x) / this.scalingX,
            dY    = (from.y - to.y) / this.scalingY,
            tx    = grd2 - dX,
            ty    = grd2 - dY,
            t1x   = (Math.abs(dX) > Math.abs(dY)) ? tx : grd2,
            t1y   = (Math.abs(dX) > Math.abs(dY)) ? grd2 : ty
        ;

        if (arrow.attributes.onclick) {
            arrowGroup.addEventListener('click', arrow.attributes.onclick);
            arrowGroup.addEventListener('touchstart', arrow.attributes.onclick);
        }
        
        // move group to from
        translate.setTranslate(from.x, from.y)
        arrowGroup.transform.baseVal.appendItem(translate)

        // scale arrow to board size
        scale.setScale(this.scalingX, this.scalingY)

        // construct arrow
        if (Math.abs(dY) === Math.abs(dX) || dY === 0 || dX === 0) {

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

        return arrowGroup

    }

    // animation queue //

    animatePieces(fromSquares, toSquares, callback) {
        this.animationQueue.push({fromSquares: fromSquares, toSquares: toSquares, callback: callback})
        if (!this.animationRunning) {
            this.nextPieceAnimationInQueue()
        }
    }

    nextPieceAnimationInQueue() {
        const nextAnimation = this.animationQueue.shift()
        if (nextAnimation !== undefined) {
            this.currentAnimation = new ChessboardPiecesAnimation(this, nextAnimation.fromSquares, nextAnimation.toSquares, this.chessboard.props.animationDuration / (this.animationQueue.length + 1), () => {
                if (!this.moveInput.dragablePiece) {
                    this.drawPieces(nextAnimation.toSquares)
                }
                this.nextPieceAnimationInQueue()
                if (nextAnimation.callback) {
                    nextAnimation.callback()
                }
            })
        }
    }

    // Callbacks //

    moveStartCallback(index) {
        if (this.chessboard.moveInputCallback) {
            return this.chessboard.moveInputCallback({
                chessboard: this.chessboard,
                type: INPUT_EVENT_TYPE.moveStart,
                square: SQUARE_COORDINATES[index]
            })
        } else {
            return true
        }
    }

    moveDoneCallback(fromIndex, toIndex) {
        if (this.chessboard.moveInputCallback) {
            return this.chessboard.moveInputCallback({
                chessboard: this.chessboard,
                type: INPUT_EVENT_TYPE.moveDone,
                squareFrom: SQUARE_COORDINATES[fromIndex],
                squareTo: SQUARE_COORDINATES[toIndex]
            })
        } else {
            return true
        }
    }

    moveCanceledCallback() {
        if (this.chessboard.moveInputCallback) {
            this.chessboard.moveInputCallback({
                chessboard: this.chessboard,
                type: INPUT_EVENT_TYPE.moveCanceled
            })
        }
    }

    // Helpers //

    setCursor() {
        this.chessboard.initialization.then(() => {
            if (this.chessboard.state.inputWhiteEnabled || this.chessboard.state.inputBlackEnabled) {
                this.boardGroup.setAttribute("class", "board input-enabled")
            } else {
                this.boardGroup.setAttribute("class", "board")
            }
        })
    }

    squareIndexToPoint(index) {
        let x, y
        if (this.chessboard.state.orientation === COLOR.white) {
            x = this.borderSize + (index % 8) * this.squareWidth
            y = this.borderSize + (7 - Math.floor(index / 8)) * this.squareHeight
        } else {
            x = this.borderSize + (7 - index % 8) * this.squareWidth
            y = this.borderSize + (Math.floor(index / 8)) * this.squareHeight
        }
        return {x: x, y: y}
    }

}

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
export class Svg {

    /**
     * create the Svg in the HTML DOM
     * @param containerElement
     * @returns {Element}
     */
    static createSvg(containerElement = null) {
        let svg = document.createElementNS(SVG_NAMESPACE, "svg");
        if(containerElement) {
            svg.setAttribute("width", "100%");
            svg.setAttribute("height", "100%");
            containerElement.appendChild(svg);
        }
        return svg;
    }

    /**
     * Add an Element to a SVG DOM
     * @param parent
     * @param name
     * @param attributes
     * @returns {Element}
     */
    static addElement(parent, name, attributes) {
        let element = document.createElementNS(SVG_NAMESPACE, name);
        if (name === "use") {
            attributes["xlink:href"] = attributes["href"]; // fix for safari
        }
        for (let attribute in attributes) {
            if (attribute.indexOf(":") !== -1) {
                const value = attribute.split(":");
                element.setAttributeNS("http://www.w3.org/1999/" + value[0], value[1], attributes[attribute]);
            } else {
                element.setAttribute(attribute, attributes[attribute]);
            }
        }
        parent.appendChild(element);
        return element;
    }

    /**
     * Remove an Element from a SVG DOM
     * @param element
     */
    static removeElement(element) {
        element.parentNode.removeChild(element);
    }

    /**
     * Load sprite into html document (as `svg/defs`), elements can be referenced by `use` from all Svgs in page
     * @param url
     * @param elementIds array of element-ids, relevant for `use` in the svgs
     * @param callback called after successful load, parameter is the svg element
     * @param grid the grid size of the sprite
     */
    static loadSprite(url, elementIds, callback, grid = 1) {
        const request = new XMLHttpRequest();
        request.open("GET", url);
        request.send();
        request.onload = () => {
            const response = request.response;
            const parser = new DOMParser();
            const svgDom = parser.parseFromString(response, "image/svg+xml");
            // add relevant nodes to sprite-svg
            const spriteSvg = this.createSvg(document.body);
            spriteSvg.setAttribute("style", "display: none");
            const defs = this.addElement(spriteSvg, "defs");
            // filter relevant nodes
            elementIds.forEach((elementId) => {
                let elementNode = svgDom.getElementById(elementId);
                if (!elementNode) {
                    console.error("error, node id=" + elementId + " not found in sprite");
                } else {
                    const transformList = elementNode.transform.baseVal;
                    for (let i = 0; i < transformList.numberOfItems; i++) {
                        const transform = transformList.getItem(i);
                        // re-transform items on grid
                        if (transform.type === 2) {
                            transform.setTranslate(transform.matrix.e % grid, transform.matrix.f % grid);
                        }
                    }
                    // filter all ids in childs of the node
                    let filterChilds = (childNodes) => {
                        childNodes.forEach((childNode) => {
                            if (childNode.nodeType === Node.ELEMENT_NODE) {
                                childNode.removeAttribute("id");
                                if (childNode.hasChildNodes()) {
                                    filterChilds(childNode.childNodes);
                                }
                            }
                        });
                    };
                    filterChilds(elementNode.childNodes);
                    defs.appendChild(elementNode);
                }
            });
            callback(spriteSvg);
        };
    }
}

ChessboardView.spriteLoadingStatus = SPRITE_LOADING_STATUS.notLoaded
