import {create} from "d3-selection";
import {defined} from "../defined.js";

const indexOf = (d, i) => i;
const identity = d => d;

class Bar {
  constructor({
    channels,
    fill = "currentColor",
    fillOpacity,
    stroke,
    strokeWidth,
    strokeOpacity,
    mixBlendMode,
    insetTop = 0,
    insetRight = 0,
    insetBottom = 0,
    insetLeft = 0
  } = {}) {
    this.fill = fill;
    this.fillOpacity = fillOpacity;
    this.stroke = stroke;
    this.strokeWidth = strokeWidth;
    this.strokeOpacity = strokeOpacity;
    this.mixBlendMode = mixBlendMode;
    this.insetTop = insetTop;
    this.insetRight = insetRight;
    this.insetBottom = insetBottom;
    this.insetLeft = insetLeft;
    this.channels = channels;
  }
  render(scales) {
    const {
      fill,
      fillOpacity,
      stroke,
      strokeWidth,
      strokeOpacity,
      mixBlendMode,
      channels: {
        x: {value: X},
        y: {value: Y}
      }
    } = this;
    const {length} = X;
    if (length !== Y.length) throw new Error("X and Y are different length");
    return create("svg:g")
        .attr("fill", fill)
        .attr("fill-opacity", fillOpacity)
        .attr("stroke", stroke)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-opacity", strokeOpacity)
        .call(g => g.selectAll()
          .data(Array.from(X, (_, i) => i)
            .filter(i => defined(X[i]) && defined(Y[i])))
          .join("rect")
            .style("mix-blend-mode", mixBlendMode)
            .attr("x", this._x(scales))
            .attr("width", this._width(scales))
            .attr("y", this._y(scales))
            .attr("height", this._height(scales)))
      .node();
  }
}

export class BarX extends Bar {
  constructor({
    x = identity,
    y = indexOf,
    ...options
  } = {}) {
    super({
      ...options,
      channels: {
        x: {value: x, scale: "x"},
        y: {value: y, scale: "y", type: "band"},
        x0: {value: [0], scale: "x"} // ensure the x-domain includes zero
      }
    });
  }
  _x({x: {scale: x}}) {
    const {insetLeft, channels: {x: {value: X}}} = this;
    return i => Math.min(x(0), x(X[i])) + insetLeft;
  }
  _y({y: {scale: y}}) {
    const {insetTop, channels: {y: {value: Y}}} = this;
    return i => y(Y[i]) + insetTop;
  }
  _width({x: {scale: x}}) {
    const {insetLeft, insetRight, channels: {x: {value: X}}} = this;
    return i => Math.max(0, Math.abs(x(X[i]) - x(0)) - insetLeft - insetRight);
  }
  _height({y: {scale: y}}) {
    const {insetTop, insetBottom} = this;
    return Math.max(0, y.bandwidth() - insetTop - insetBottom);
  }
}

export class BarY extends Bar {
  constructor({
    x = indexOf,
    y = identity,
    ...options
  } = {}) {
    super({
      ...options,
      channels: {
        x: {value: x, scale: "x", type: "band"},
        y: {value: y, scale: "y"},
        y0: {value: [0], scale: "y"} // ensure the y-domain includes zero
      }
    });
  }
  _x({x: {scale: x}}) {
    const {insetLeft, channels: {x: {value: X}}} = this;
    return i => x(X[i]) + insetLeft;
  }
  _y({y: {scale: y}}) {
    const {insetTop, channels: {y: {value: Y}}} = this;
    return i => Math.min(y(0), y(Y[i])) + insetTop;
  }
  _width({x: {scale: x}}) {
    const {insetLeft, insetRight} = this;
    return Math.max(0, x.bandwidth() - insetLeft - insetRight);
  }
  _height({y: {scale: y}}) {
    const {insetTop, insetBottom, channels: {y: {value: Y}}} = this;
    return i => Math.max(0, Math.abs(y(0) - y(Y[i])) - insetTop - insetBottom);
  }
}