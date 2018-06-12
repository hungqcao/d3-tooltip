// https://bl.ocks.org/mbostock/1087001
/**
 * d3 tooltip
 * Copyright (c) 2018 Hung Cao
 * Thank Justin Palmer <justin@labratrevenge.com> (http://labratrevenge.com/d3-tip)
 * Absolute positioned tooltips for d3.js SVG visualizations
 */

// Public - constructs a new tooltip
//
// Returns a tip
d3.tip = function () {
    let offset = d3TipOffset,
        html = d3TipHTML,
        rootElement = document.body,
        node = initNode(),
        svg = null,
        point = null,
        target = null;

    function tip(vis) {
        svg = getSVGNode(vis);
        if (!svg) return
        point = svg.createSVGPoint()
        rootElement.appendChild(node)
    }

    tip.mouseover = () => {
        let args = Array.prototype.slice.call(arguments);
        if (args[args.length - 1] instanceof SVGElement) target = args.pop();

        let content = html.apply(this, args), nodel = getNodeEl();

        nodel.html(content).style("display", "inline");
    }

    tip.mousemove = () => {
        let args = Array.prototype.slice.call(arguments);
        var nodel = getNodeEl();
        console.log(getScreenBBox());
        var poffset = offset.apply(this, args);
        nodel.style("left", (d3.event.pageX + poffset[0]) + "px")
            .style("top", (d3.event.pageY + poffset[1]) + "px");
    }

    tip.mouseout = () => {
        var nodel = getNodeEl();
        nodel.style("display", "none");
        return tip;
    }

    // Public: Proxy attr calls to the d3 tip container.
    // Sets or gets attribute value.
    //
    // n - name of the attribute
    // v - value of the attribute
    //
    // Returns tip or attribute value
    // eslint-disable-next-line no-unused-vars
    tip.attr = function (n, v) {
        if (arguments.length < 2 && typeof n === 'string') {
            return getNodeEl().attr(n)
        }

        var args = Array.prototype.slice.call(arguments)
        d3.selection.prototype.attr.apply(getNodeEl(), args)
        return tip
    }

    // Public: Proxy style calls to the d3 tip container.
    // Sets or gets a style value.
    //
    // n - name of the property
    // v - value of the property
    //
    // Returns tip or style property value
    // eslint-disable-next-line no-unused-vars
    tip.style = function (n, v) {
        if (arguments.length < 2 && typeof n === 'string') {
            return getNodeEl().style(n)
        }

        var args = Array.prototype.slice.call(arguments)
        d3.selection.prototype.style.apply(getNodeEl(), args)
        return tip
    }

    // Public: Sets or gets the offset of the tip
    //
    // v - Array of [x, y] offset
    //
    // Returns offset or
    tip.offset = function (v) {
        if (!arguments.length) return offset
        offset = v == null ? v : functor(v)

        return tip
    }

    // Public: sets or gets the html value of the tooltip
    //
    // v - String value of the tip
    //
    // Returns html value or tip
    tip.html = function (v) {
        if (!arguments.length) return html
        html = v == null ? v : functor(v)

        return tip
    }

    // Public: sets or gets the root element anchor of the tooltip
    //
    // v - root element of the tooltip
    //
    // Returns root node of tip
    tip.rootElement = function (v) {
        if (!arguments.length) return rootElement
        rootElement = v == null ? v : functor(v)

        return tip
    }

    // Public: destroys the tooltip and removes it from the DOM
    //
    // Returns a tip
    tip.destroy = function () {
        if (node) {
            getNodeEl().remove()
            node = null
        }
        return tip
    }

    // Private - gets the screen coordinates of a shape
    //
    // Given a shape on the screen, will return an SVGPoint for the directions
    // n(north), s(south), e(east), w(west), ne(northeast), se(southeast), nw(northwest),
    // sw(southwest).
    //
    //    +-+-+
    //    |   |
    //    +   +
    //    |   |
    //    +-+-+
    //
    // Returns an Object {n, s, e, w, nw, sw, ne, se}
    function getScreenBBox() {
        var targetel = target || d3.event.target,
            bbox = {},
            matrix = targetel.getScreenCTM ? targetel.getScreenCTM() : $(targetel).closest("foreignObject").get(0).getScreenCTM(),
            tbbox = targetel.getBBox ? targetel.getBBox() : $(targetel).closest("foreignObject").get(0).getBBox(),
            width = tbbox.width,
            height = tbbox.height,
            x = tbbox.x,   
            y = tbbox.y,
            scrollTop = document.documentElement.scrollTop || document.body.scrollTop,
            scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft

        if (!targetel.getBBox && !targetel.getScreenCTM) {
            //Trying to fix issue in Edge, in Edge, it somehow can calculate the x and y using getBBox for foreignObjects
            x = 0;
            y = 0;
        }

        point.x = x + scrollLeft
        point.y = y + scrollTop
        bbox.nw = point.matrixTransform(matrix)
        point.x += width
        bbox.ne = point.matrixTransform(matrix)
        point.y += height
        bbox.se = point.matrixTransform(matrix)
        point.x -= width
        bbox.sw = point.matrixTransform(matrix)
        point.y -= height / 2
        bbox.w = point.matrixTransform(matrix)
        point.x += width
        bbox.e = point.matrixTransform(matrix)
        point.x -= width / 2
        point.y -= height / 2
        bbox.n = point.matrixTransform(matrix)
        point.y += height
        bbox.s = point.matrixTransform(matrix)

        return bbox
    }

    function d3TipOffset() { return [0, 0] }
    function d3TipHTML() { return ' ' }

    function initNode() {
        var div = d3.select(document.createElement('div'))
        div
            .style('position', 'absolute')
            .style('display', 'none')
            .style('box-sizing', 'border-box')

        return div.node()
    }

    function getSVGNode(element) {
        var svgNode = element.node()
        if (!svgNode) return null
        if (svgNode.tagName.toLowerCase() === 'svg') return svgNode
        return svgNode.ownerSVGElement
    }

    function getNodeEl() {
        if (node == null) {
            node = initNode()
            // re-add node to DOM
            rootElement.appendChild(node)
        }
        return d3.select(node)
    }

    // Private - replace D3JS 3.X d3.functor() function
    function functor(v) {
        return typeof v === 'function' ? v : function () {
            return v
        }
    }

    return tip
}