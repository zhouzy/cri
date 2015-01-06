/*! VelocityJS.org (1.1.0). (C) 2014 Julian Shapiro. MIT @license: en.wikipedia.org/wiki/MIT_License */

/*************************
   Velocity jQuery Shim
*************************/

/*! VelocityJS.org jQuery Shim (1.0.1). (C) 2014 The jQuery Foundation. MIT @license: en.wikipedia.org/wiki/MIT_License. */

/* This file contains the jQuery functions that Velocity relies on, thereby removing Velocity's dependency on a full copy of jQuery, and allowing it to work in any environment. */
/* These shimmed functions are only used if jQuery isn't present. If both this shim and jQuery are loaded, Velocity defaults to jQuery proper. */
/* Browser support: Using this shim instead of jQuery proper removes support for IE8. */

;(function (window) {
    /***************
         Setup
    ***************/

    /* If jQuery is already loaded, there's no point in loading this shim. */
    if (window.jQuery) {
        return;
    }

    /* jQuery base. */
    var $ = function (selector, context) {
        return new $.fn.init(selector, context);
    };

    /********************
       Private Methods
    ********************/

    /* jQuery */
    $.isWindow = function (obj) {
        /* jshint eqeqeq: false */
        return obj != null && obj == obj.window;
    };

    /* jQuery */
    $.type = function (obj) {
        if (obj == null) {
            return obj + "";
        }

        return typeof obj === "object" || typeof obj === "function" ?
            class2type[toString.call(obj)] || "object" :
            typeof obj;
    };

    /* jQuery */
    $.isArray = Array.isArray || function (obj) {
        return $.type(obj) === "array";
    };

    /* jQuery */
    function isArraylike (obj) {
        var length = obj.length,
            type = $.type(obj);

        if (type === "function" || $.isWindow(obj)) {
            return false;
        }

        if (obj.nodeType === 1 && length) {
            return true;
        }

        return type === "array" || length === 0 || typeof length === "number" && length > 0 && (length - 1) in obj;
    }

    /***************
       $ Methods
    ***************/

    /* jQuery: Support removed for IE<9. */
    $.isPlainObject = function (obj) {
        var key;

        if (!obj || $.type(obj) !== "object" || obj.nodeType || $.isWindow(obj)) {
            return false;
        }

        try {
            if (obj.constructor &&
                !hasOwn.call(obj, "constructor") &&
                !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                return false;
            }
        } catch (e) {
            return false;
        }

        for (key in obj) {}

        return key === undefined || hasOwn.call(obj, key);
    };

    /* jQuery */
    $.each = function(obj, callback, args) {
        var value,
            i = 0,
            length = obj.length,
            isArray = isArraylike(obj);

        if (args) {
            if (isArray) {
                for (; i < length; i++) {
                    value = callback.apply(obj[i], args);

                    if (value === false) {
                        break;
                    }
                }
            } else {
                for (i in obj) {
                    value = callback.apply(obj[i], args);

                    if (value === false) {
                        break;
                    }
                }
            }

        } else {
            if (isArray) {
                for (; i < length; i++) {
                    value = callback.call(obj[i], i, obj[i]);

                    if (value === false) {
                        break;
                    }
                }
            } else {
                for (i in obj) {
                    value = callback.call(obj[i], i, obj[i]);

                    if (value === false) {
                        break;
                    }
                }
            }
        }

        return obj;
    };

    /* Custom */
    $.data = function (node, key, value) {
        /* $.getData() */
        if (value === undefined) {
            var id = node[$.expando],
                store = id && cache[id];

            if (key === undefined) {
                return store;
            } else if (store) {
                if (key in store) {
                    return store[key];
                }
            }
        /* $.setData() */
        } else if (key !== undefined) {
            var id = node[$.expando] || (node[$.expando] = ++$.uuid);

            cache[id] = cache[id] || {};
            cache[id][key] = value;

            return value;
        }
    };

    /* Custom */
    $.removeData = function (node, keys) {
        var id = node[$.expando],
            store = id && cache[id];

        if (store) {
            $.each(keys, function(_, key) {
                delete store[key];
            });
        }
    };

    /* jQuery */
    $.extend = function () {
        var src, copyIsArray, copy, name, options, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        if (typeof target === "boolean") {
            deep = target;

            target = arguments[i] || {};
            i++;
        }

        if (typeof target !== "object" && $.type(target) !== "function") {
            target = {};
        }

        if (i === length) {
            target = this;
            i--;
        }

        for (; i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name];
                    copy = options[name];

                    if (target === copy) {
                        continue;
                    }

                    if (deep && copy && ($.isPlainObject(copy) || (copyIsArray = $.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && $.isArray(src) ? src : [];

                        } else {
                            clone = src && $.isPlainObject(src) ? src : {};
                        }

                        target[name] = $.extend(deep, clone, copy);

                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        return target;
    };

    /* jQuery 1.4.3 */
    $.queue = function (elem, type, data) {
        function $makeArray (arr, results) {
            var ret = results || [];

            if (arr != null) {
                if (isArraylike(Object(arr))) {
                    /* $.merge */
                    (function(first, second) {
                        var len = +second.length,
                            j = 0,
                            i = first.length;

                        while (j < len) {
                            first[i++] = second[j++];
                        }

                        if (len !== len) {
                            while (second[j] !== undefined) {
                                first[i++] = second[j++];
                            }
                        }

                        first.length = i;

                        return first;
                    })(ret, typeof arr === "string" ? [arr] : arr);
                } else {
                    [].push.call(ret, arr);
                }
            }

            return ret;
        }

        if (!elem) {
            return;
        }

        type = (type || "fx") + "queue";

        var q = $.data(elem, type);

        if (!data) {
            return q || [];
        }

        if (!q || $.isArray(data)) {
            q = $.data(elem, type, $makeArray(data));
        } else {
            q.push(data);
        }

        return q;
    };

    /* jQuery 1.4.3 */
    $.dequeue = function (elems, type) {
        /* Custom: Embed element iteration. */
        $.each(elems.nodeType ? [ elems ] : elems, function(i, elem) {
            type = type || "fx";

            var queue = $.queue(elem, type),
                fn = queue.shift();

            if (fn === "inprogress") {
                fn = queue.shift();
            }

            if (fn) {
                if (type === "fx") {
                    queue.unshift("inprogress");
                }

                fn.call(elem, function() {
                    $.dequeue(elem, type);
                });
            }
        });
    };

    /******************
       $.fn Methods
    ******************/

    /* jQuery */
    $.fn = $.prototype = {
        init: function (selector) {
            /* Just return the element wrapped inside an array; don't proceed with the actual jQuery node wrapping process. */
            if (selector.nodeType) {
                this[0] = selector;

                return this;
            } else {
                throw new Error("Not a DOM node.");
            }
        },

        offset: function () {
            /* jQuery altered code: Dropped disconnected DOM node checking. */
            var box = this[0].getBoundingClientRect ? this[0].getBoundingClientRect() : { top: 0, left: 0 };

            return {
                top: box.top + (window.pageYOffset || document.scrollTop  || 0)  - (document.clientTop  || 0),
                left: box.left + (window.pageXOffset || document.scrollLeft  || 0) - (document.clientLeft || 0)
            };
        },

        position: function () {
            /* jQuery */
            function offsetParent() {
                var offsetParent = this.offsetParent || document;

                while (offsetParent && (!offsetParent.nodeType.toLowerCase === "html" && offsetParent.style.position === "static")) {
                    offsetParent = offsetParent.offsetParent;
                }

                return offsetParent || document;
            }

            /* Zepto */
            var elem = this[0],
                offsetParent = offsetParent.apply(elem),
                offset = this.offset(),
                parentOffset = /^(?:body|html)$/i.test(offsetParent.nodeName) ? { top: 0, left: 0 } : $(offsetParent).offset()

            offset.top -= parseFloat(elem.style.marginTop) || 0;
            offset.left -= parseFloat(elem.style.marginLeft) || 0;

            if (offsetParent.style) {
                parentOffset.top += parseFloat(offsetParent.style.borderTopWidth) || 0
                parentOffset.left += parseFloat(offsetParent.style.borderLeftWidth) || 0
            }

            return {
                top: offset.top - parentOffset.top,
                left: offset.left - parentOffset.left
            };
        }
    };

    /**********************
       Private Variables
    **********************/

    /* For $.data() */
    var cache = {};
    $.expando = "velocity" + (new Date().getTime());
    $.uuid = 0;

    /* For $.queue() */
    var class2type = {},
        hasOwn = class2type.hasOwnProperty,
        toString = class2type.toString;

    var types = "Boolean Number String Function Array Date RegExp Object Error".split(" ");
    for (var i = 0; i < types.length; i++) {
        class2type["[object " + types[i] + "]"] = types[i].toLowerCase();
    }

    /* Makes $(node) possible, without having to call init. */
    $.fn.init.prototype = $.fn;

    /* Globalize Velocity onto the window, and assign its Utilities property. */
    window.Velocity = { Utilities: $ };
})(window);

/******************
    Velocity.js
******************/

;(function (factory) {
    /* CommonJS module. */
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = factory();
    /* AMD module. */
    } else if (typeof define === "function" && define.amd) {
        define(factory);
    /* Browser globals. */
    } else {
        factory();
    }
}(function() {
return function (global, window, document, undefined) {

    /***************
        Summary
    ***************/

    /*
    - CSS: CSS stack that works independently from the rest of Velocity.
    - animate(): Core animation method that iterates over the targeted elements and queues the incoming call onto each element individually.
      - Pre-Queueing: Prepare the element for animation by instantiating its data cache and processing the call's options.
      - Queueing: The logic that runs once the call has reached its point of execution in the element's $.queue() stack.
                  Most logic is placed here to avoid risking it becoming stale (if the element's properties have changed).
      - Pushing: Consolidation of the tween data followed by its push onto the global in-progress calls container.
    - tick(): The single requestAnimationFrame loop responsible for tweening all in-progress calls.
    - completeCall(): Handles the cleanup process for each Velocity call.
    */

    /*********************
       Helper Functions
    *********************/

    /* IE detection. Gist: https://gist.github.com/julianshapiro/9098609 */
    var IE = (function() {
        if (document.documentMode) {
            return document.documentMode;
        } else {
            for (var i = 7; i > 4; i--) {
                var div = document.createElement("div");

                div.innerHTML = "<!--[if IE " + i + "]><span></span><![endif]-->";

                if (div.getElementsByTagName("span").length) {
                    div = null;

                    return i;
                }
            }
        }

        return undefined;
    })();

    /* rAF shim. Gist: https://gist.github.com/julianshapiro/9497513 */
    var rAFShim = (function() {
        var timeLast = 0;

        return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
            var timeCurrent = (new Date()).getTime(),
                timeDelta;

            /* Dynamically set delay on a per-tick basis to match 60fps. */
            /* Technique by Erik Moller. MIT license: https://gist.github.com/paulirish/1579671 */
            timeDelta = Math.max(0, 16 - (timeCurrent - timeLast));
            timeLast = timeCurrent + timeDelta;

            return setTimeout(function() { callback(timeCurrent + timeDelta); }, timeDelta);
        };
    })();

    /* Array compacting. Copyright Lo-Dash. MIT License: https://github.com/lodash/lodash/blob/master/LICENSE.txt */
    function compactSparseArray (array) {
        var index = -1,
            length = array ? array.length : 0,
            result = [];

        while (++index < length) {
            var value = array[index];

            if (value) {
                result.push(value);
            }
        }

        return result;
    }

    function sanitizeElements (elements) {
        /* Unwrap jQuery/Zepto objects. */
        if (Type.isWrapped(elements)) {
            elements = [].slice.call(elements);
        /* Wrap a single element in an array so that $.each() can iterate with the element instead of its node's children. */
        } else if (Type.isNode(elements)) {
            elements = [ elements ];
        }

        return elements;
    }

    var Type = {
        isString: function (variable) {
            return (typeof variable === "string");
        },
        isArray: Array.isArray || function (variable) {
            return Object.prototype.toString.call(variable) === "[object Array]";
        },
        isFunction: function (variable) {
            return Object.prototype.toString.call(variable) === "[object Function]";
        },
        isNode: function (variable) {
            return variable && variable.nodeType;
        },
        /* Copyright Martin Bohm. MIT License: https://gist.github.com/Tomalak/818a78a226a0738eaade */
        isNodeList: function (variable) {
            return typeof variable === "object" &&
                /^\[object (HTMLCollection|NodeList|Object)\]$/.test(Object.prototype.toString.call(variable)) &&
                variable.length !== undefined &&
                (variable.length === 0 || (typeof variable[0] === "object" && variable[0].nodeType > 0));
        },
        /* Determine if variable is a wrapped jQuery or Zepto element. */
        isWrapped: function (variable) {
            return variable && (variable.jquery || (window.Zepto && window.Zepto.zepto.isZ(variable)));
        },
        isSVG: function (variable) {
            return window.SVGElement && (variable instanceof window.SVGElement);
        },
        isEmptyObject: function (variable) {
            for (var name in variable) {
                return false;
            }

            return true;
        }
    };

    /*****************
       Dependencies
    *****************/

    var $,
        isJQuery = false;

    if (global.fn && global.fn.jquery) {
        $ = global;
        isJQuery = true;
    } else {
        $ = window.Velocity.Utilities;
    }

    if (IE <= 8 && !isJQuery) {
        throw new Error("Velocity: IE8 and below require jQuery to be loaded before Velocity.");
    } else if (IE <= 7) {
        /* Revert to jQuery's $.animate(), and lose Velocity's extra features. */
        jQuery.fn.velocity = jQuery.fn.animate;

        /* Now that $.fn.velocity is aliased, abort this Velocity declaration. */
        return;
    }

    /*****************
        Constants
    *****************/

    var DURATION_DEFAULT = 400,
        EASING_DEFAULT = "swing";

    /*************
        State
    *************/

    /* Note: The global object also doubles as a publicly-accessible data store for the purposes of unit testing. */
    /* Note: Alias the lowercase and uppercase variants of "velocity" to minimize user confusion due to the lowercase nature of the $.fn extension. */
    var Velocity = {
        /* Container for page-wide Velocity state data. */
        State: {
            /* Detect mobile devices to determine if mobileHA should be turned on. */
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            /* The mobileHA option's behavior changes on older Android devices (Gingerbread, versions 2.3.3-2.3.7). */
            isAndroid: /Android/i.test(navigator.userAgent),
            isGingerbread: /Android 2\.3\.[3-7]/i.test(navigator.userAgent),
            isChrome: window.chrome,
            isFirefox: /Firefox/i.test(navigator.userAgent),
            /* Create a cached element for re-use when checking for CSS property prefixes. */
            prefixElement: document.createElement("div"),
            /* Cache every prefix match to avoid repeating lookups. */
            prefixMatches: {},
            /* Cache the anchor used for animating window scrolling. */
            scrollAnchor: null,
            /* Cache the property names associated with the scroll anchor. */
            scrollPropertyLeft: null,
            scrollPropertyTop: null,
            /* Keep track of whether our RAF tick is running. */
            isTicking: false,
            /* Container for every in-progress call to Velocity. */
            calls: []
        },
        /* Velocity's custom CSS stack. Made global for unit testing. */
        CSS: { /* Defined below. */ },
        /* Defined by Velocity's optional jQuery shim. */
        Utilities: $,
        /* Container for the user's custom animation redirects that are referenced by name in place of a properties map object. */
        Redirects: { /* Manually registered by the user. */ },
        Easings: { /* Defined below. */ },
        /* Attempt to use ES6 Promises by default. Users can override this with a third-party promises library. */
        Promise: window.Promise,
        /* Page-wide option defaults, which can be overriden by the user. */
        defaults: {
            queue: "",
            duration: DURATION_DEFAULT,
            easing: EASING_DEFAULT,
            begin: undefined,
            complete: undefined,
            progress: undefined,
            display: undefined,
            visibility: undefined,
            loop: false,
            delay: false,
            mobileHA: true,
            /* Set to false to prevent property values from being cached between consecutive Velocity-initiated chain calls. */
            _cacheValues: true
        },
        /* A design goal of Velocity is to cache data wherever possible in order to avoid DOM requerying.
           Accordingly, each element has a data cache instantiated on it. */
        init: function (element) {
            $.data(element, "velocity", {
                /* Store whether this is an SVG element, since its properties are retrieved and updated differently than standard HTML elements. */
                isSVG: Type.isSVG(element),
                /* Keep track of whether the element is currently being animated by Velocity.
                   This is used to ensure that property values are not transferred between non-consecutive (stale) calls. */
                isAnimating: false,
                /* A reference to the element's live computedStyle object. Learn more here: https://developer.mozilla.org/en/docs/Web/API/window.getComputedStyle */
                computedStyle: null,
                /* Tween data is cached for each animation on the element so that data can be passed across calls --
                   in particular, end values are used as subsequent start values in consecutive Velocity calls. */
                tweensContainer: null,
                /* The full root property values of each CSS hook being animated on this element are cached so that:
                   1) Concurrently-animating hooks sharing the same root can have their root values' merged into one while tweening.
                   2) Post-hook-injection root values can be transferred over to consecutively chained Velocity calls as starting root values. */
                rootPropertyValueCache: {},
                /* A cache for transform updates, which must be manually flushed via CSS.flushTransformCache(). */
                transformCache: {}
            });
        },
        /* A parallel to jQuery's $.css(), used for getting/setting Velocity's hooked CSS properties. */
        hook: null, /* Defined below. */
        /* Velocity-wide animation time remapping for testing purposes. */
        mock: false,
        version: { major: 1, minor: 1, patch: 0 },
        /* Set to 1 or 2 (most verbose) to output debug info to console. */
        debug: false
    };

    /* Retrieve the appropriate scroll anchor and property name for the browser: https://developer.mozilla.org/en-US/docs/Web/API/Window.scrollY */
    if (window.pageYOffset !== undefined) {
        Velocity.State.scrollAnchor = window;
        Velocity.State.scrollPropertyLeft = "pageXOffset";
        Velocity.State.scrollPropertyTop = "pageYOffset";
    } else {
        Velocity.State.scrollAnchor = document.documentElement || document.body.parentNode || document.body;
        Velocity.State.scrollPropertyLeft = "scrollLeft";
        Velocity.State.scrollPropertyTop = "scrollTop";
    }

    /* Shorthand alias for jQuery's $.data() utility. */
    function Data (element) {
        /* Hardcode a reference to the plugin name. */
        var response = $.data(element, "velocity");

        /* jQuery <=1.4.2 returns null instead of undefined when no match is found. We normalize this behavior. */
        return response === null ? undefined : response;
    };

    /**************
        Easing
    **************/

    /* Step easing generator. */
    function generateStep (steps) {
        return function (p) {
            return Math.round(p * steps) * (1 / steps);
        };
    }

    /* Bezier curve function generator. Copyright Gaetan Renaudeau. MIT License: http://en.wikipedia.org/wiki/MIT_License */
    function generateBezier (mX1, mY1, mX2, mY2) {
        var NEWTON_ITERATIONS = 4,
            NEWTON_MIN_SLOPE = 0.001,
            SUBDIVISION_PRECISION = 0.0000001,
            SUBDIVISION_MAX_ITERATIONS = 10,
            kSplineTableSize = 11,
            kSampleStepSize = 1.0 / (kSplineTableSize - 1.0),
            float32ArraySupported = "Float32Array" in window;

        /* Must contain four arguments. */
        if (arguments.length !== 4) {
            return false;
        }

        /* Arguments must be numbers. */
        for (var i = 0; i < 4; ++i) {
            if (typeof arguments[i] !== "number" || isNaN(arguments[i]) || !isFinite(arguments[i])) {
                return false;
            }
        }

        /* X values must be in the [0, 1] range. */
        mX1 = Math.min(mX1, 1);
        mX2 = Math.min(mX2, 1);
        mX1 = Math.max(mX1, 0);
        mX2 = Math.max(mX2, 0);

        var mSampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);

        function A (aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
        function B (aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; }
        function C (aA1)      { return 3.0 * aA1; }

        function calcBezier (aT, aA1, aA2) {
            return ((A(aA1, aA2)*aT + B(aA1, aA2))*aT + C(aA1))*aT;
        }

        function getSlope (aT, aA1, aA2) {
            return 3.0 * A(aA1, aA2)*aT*aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
        }

        function newtonRaphsonIterate (aX, aGuessT) {
            for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
                var currentSlope = getSlope(aGuessT, mX1, mX2);

                if (currentSlope === 0.0) return aGuessT;

                var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
                aGuessT -= currentX / currentSlope;
            }

            return aGuessT;
        }

        function calcSampleValues () {
            for (var i = 0; i < kSplineTableSize; ++i) {
                mSampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
            }
        }

        function binarySubdivide (aX, aA, aB) {
            var currentX, currentT, i = 0;

            do {
                currentT = aA + (aB - aA) / 2.0;
                currentX = calcBezier(currentT, mX1, mX2) - aX;
                if (currentX > 0.0) {
                  aB = currentT;
                } else {
                  aA = currentT;
                }
            } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);

            return currentT;
        }

        function getTForX (aX) {
            var intervalStart = 0.0,
                currentSample = 1,
                lastSample = kSplineTableSize - 1;

            for (; currentSample != lastSample && mSampleValues[currentSample] <= aX; ++currentSample) {
                intervalStart += kSampleStepSize;
            }

            --currentSample;

            var dist = (aX - mSampleValues[currentSample]) / (mSampleValues[currentSample+1] - mSampleValues[currentSample]),
                guessForT = intervalStart + dist * kSampleStepSize,
                initialSlope = getSlope(guessForT, mX1, mX2);

            if (initialSlope >= NEWTON_MIN_SLOPE) {
                return newtonRaphsonIterate(aX, guessForT);
            } else if (initialSlope == 0.0) {
                return guessForT;
            } else {
                return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize);
            }
        }

        var _precomputed = false;

        function precompute() {
            _precomputed = true;
            if (mX1 != mY1 || mX2 != mY2) calcSampleValues();
        }

        var f = function (aX) {
            if (!_precomputed) precompute();
            if (mX1 === mY1 && mX2 === mY2) return aX;
            if (aX === 0) return 0;
            if (aX === 1) return 1;

            return calcBezier(getTForX(aX), mY1, mY2);
        };

        f.getControlPoints = function() { return [{ x: mX1, y: mY1 }, { x: mX2, y: mY2 }]; };

        var str = "generateBezier(" + [mX1, mY1, mX2, mY2] + ")";
        f.toString = function () { return str; };

        return f;
    }

    /* Runge-Kutta spring physics function generator. Adapted from Framer.js, copyright Koen Bok. MIT License: http://en.wikipedia.org/wiki/MIT_License */
    /* Given a tension, friction, and duration, a simulation at 60FPS will first run without a defined duration in order to calculate the full path. A second pass
       then adjusts the time delta -- using the relation between actual time and duration -- to calculate the path for the duration-constrained animation. */
    var generateSpringRK4 = (function () {
        function springAccelerationForState (state) {
            return (-state.tension * state.x) - (state.friction * state.v);
        }

        function springEvaluateStateWithDerivative (initialState, dt, derivative) {
            var state = {
                x: initialState.x + derivative.dx * dt,
                v: initialState.v + derivative.dv * dt,
                tension: initialState.tension,
                friction: initialState.friction
            };

            return { dx: state.v, dv: springAccelerationForState(state) };
        }

        function springIntegrateState (state, dt) {
            var a = {
                    dx: state.v,
                    dv: springAccelerationForState(state)
                },
                b = springEvaluateStateWithDerivative(state, dt * 0.5, a),
                c = springEvaluateStateWithDerivative(state, dt * 0.5, b),
                d = springEvaluateStateWithDerivative(state, dt, c),
                dxdt = 1.0 / 6.0 * (a.dx + 2.0 * (b.dx + c.dx) + d.dx),
                dvdt = 1.0 / 6.0 * (a.dv + 2.0 * (b.dv + c.dv) + d.dv);

            state.x = state.x + dxdt * dt;
            state.v = state.v + dvdt * dt;

            return state;
        }

        return function springRK4Factory (tension, friction, duration) {

            var initState = {
                    x: -1,
                    v: 0,
                    tension: null,
                    friction: null
                },
                path = [0],
                time_lapsed = 0,
                tolerance = 1 / 10000,
                DT = 16 / 1000,
                have_duration, dt, last_state;

            tension = parseFloat(tension) || 500;
            friction = parseFloat(friction) || 20;
            duration = duration || null;

            initState.tension = tension;
            initState.friction = friction;

            have_duration = duration !== null;

            /* Calculate the actual time it takes for this animation to complete with the provided conditions. */
            if (have_duration) {
                /* Run the simulation without a duration. */
                time_lapsed = springRK4Factory(tension, friction);
                /* Compute the adjusted time delta. */
                dt = time_lapsed / duration * DT;
            } else {
                dt = DT;
            }

            while (true) {
                /* Next/step function .*/
                last_state = springIntegrateState(last_state || initState, dt);
                /* Store the position. */
                path.push(1 + last_state.x);
                time_lapsed += 16;
                /* If the change threshold is reached, break. */
                if (!(Math.abs(last_state.x) > tolerance && Math.abs(last_state.v) > tolerance)) {
                    break;
                }
            }

            /* If duration is not defined, return the actual time required for completing this animation. Otherwise, return a closure that holds the
               computed path and returns a snapshot of the position according to a given percentComplete. */
            return !have_duration ? time_lapsed : function(percentComplete) { return path[ (percentComplete * (path.length - 1)) | 0 ]; };
        };
    }());

    /* jQuery easings. */
    Velocity.Easings = {
        linear: function(p) { return p; },
        swing: function(p) { return 0.5 - Math.cos( p * Math.PI ) / 2 },
        /* Bonus "spring" easing, which is a less exaggerated version of easeInOutElastic. */
        spring: function(p) { return 1 - (Math.cos(p * 4.5 * Math.PI) * Math.exp(-p * 6)); }
    };

    /* CSS3 and Robert Penner easings. */
    $.each(
        [
            [ "ease", [ 0.25, 0.1, 0.25, 1.0 ] ],
            [ "ease-in", [ 0.42, 0.0, 1.00, 1.0 ] ],
            [ "ease-out", [ 0.00, 0.0, 0.58, 1.0 ] ],
            [ "ease-in-out", [ 0.42, 0.0, 0.58, 1.0 ] ],
            [ "easeInSine", [ 0.47, 0, 0.745, 0.715 ] ],
            [ "easeOutSine", [ 0.39, 0.575, 0.565, 1 ] ],
            [ "easeInOutSine", [ 0.445, 0.05, 0.55, 0.95 ] ],
            [ "easeInQuad", [ 0.55, 0.085, 0.68, 0.53 ] ],
            [ "easeOutQuad", [ 0.25, 0.46, 0.45, 0.94 ] ],
            [ "easeInOutQuad", [ 0.455, 0.03, 0.515, 0.955 ] ],
            [ "easeInCubic", [ 0.55, 0.055, 0.675, 0.19 ] ],
            [ "easeOutCubic", [ 0.215, 0.61, 0.355, 1 ] ],
            [ "easeInOutCubic", [ 0.645, 0.045, 0.355, 1 ] ],
            [ "easeInQuart", [ 0.895, 0.03, 0.685, 0.22 ] ],
            [ "easeOutQuart", [ 0.165, 0.84, 0.44, 1 ] ],
            [ "easeInOutQuart", [ 0.77, 0, 0.175, 1 ] ],
            [ "easeInQuint", [ 0.755, 0.05, 0.855, 0.06 ] ],
            [ "easeOutQuint", [ 0.23, 1, 0.32, 1 ] ],
            [ "easeInOutQuint", [ 0.86, 0, 0.07, 1 ] ],
            [ "easeInExpo", [ 0.95, 0.05, 0.795, 0.035 ] ],
            [ "easeOutExpo", [ 0.19, 1, 0.22, 1 ] ],
            [ "easeInOutExpo", [ 1, 0, 0, 1 ] ],
            [ "easeInCirc", [ 0.6, 0.04, 0.98, 0.335 ] ],
            [ "easeOutCirc", [ 0.075, 0.82, 0.165, 1 ] ],
            [ "easeInOutCirc", [ 0.785, 0.135, 0.15, 0.86 ] ]
        ], function(i, easingArray) {
            Velocity.Easings[easingArray[0]] = generateBezier.apply(null, easingArray[1]);
        });

    /* Determine the appropriate easing type given an easing input. */
    function getEasing(value, duration) {
        var easing = value;

        /* The easing option can either be a string that references a pre-registered easing,
           or it can be a two-/four-item array of integers to be converted into a bezier/spring function. */
        if (Type.isString(value)) {
            /* Ensure that the easing has been assigned to jQuery's Velocity.Easings object. */
            if (!Velocity.Easings[value]) {
                easing = false;
            }
        } else if (Type.isArray(value) && value.length === 1) {
            easing = generateStep.apply(null, value);
        } else if (Type.isArray(value) && value.length === 2) {
            /* springRK4 must be passed the animation's duration. */
            /* Note: If the springRK4 array contains non-numbers, generateSpringRK4() returns an easing
               function generated with default tension and friction values. */
            easing = generateSpringRK4.apply(null, value.concat([ duration ]));
        } else if (Type.isArray(value) && value.length === 4) {
            /* Note: If the bezier array contains non-numbers, generateBezier() returns false. */
            easing = generateBezier.apply(null, value);
        } else {
            easing = false;
        }

        /* Revert to the Velocity-wide default easing type, or fall back to "swing" (which is also jQuery's default)
           if the Velocity-wide default has been incorrectly modified. */
        if (easing === false) {
            if (Velocity.Easings[Velocity.defaults.easing]) {
                easing = Velocity.defaults.easing;
            } else {
                easing = EASING_DEFAULT;
            }
        }

        return easing;
    }

    /*****************
        CSS Stack
    *****************/

    /* The CSS object is a highly condensed and performant CSS stack that fully replaces jQuery's.
       It handles the validation, getting, and setting of both standard CSS properties and CSS property hooks. */
    /* Note: A "CSS" shorthand is aliased so that our code is easier to read. */
    var CSS = Velocity.CSS = {

        /*************
            RegEx
        *************/

        RegEx: {
            isHex: /^#([A-f\d]{3}){1,2}$/i,
            /* Unwrap a property value's surrounding text, e.g. "rgba(4, 3, 2, 1)" ==> "4, 3, 2, 1" and "rect(4px 3px 2px 1px)" ==> "4px 3px 2px 1px". */
            valueUnwrap: /^[A-z]+\((.*)\)$/i,
            wrappedValueAlreadyExtracted: /[0-9.]+ [0-9.]+ [0-9.]+( [0-9.]+)?/,
            /* Split a multi-value property into an array of subvalues, e.g. "rgba(4, 3, 2, 1) 4px 3px 2px 1px" ==> [ "rgba(4, 3, 2, 1)", "4px", "3px", "2px", "1px" ]. */
            valueSplit: /([A-z]+\(.+\))|(([A-z0-9#-.]+?)(?=\s|$))/ig
        },

        /************
            Lists
        ************/

        Lists: {
            colors: [ "fill", "stroke", "stopColor", "color", "backgroundColor", "borderColor", "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor", "outlineColor" ],
            transformsBase: [ "translateX", "translateY", "scale", "scaleX", "scaleY", "skewX", "skewY", "rotateZ" ],
            transforms3D: [ "transformPerspective", "translateZ", "scaleZ", "rotateX", "rotateY" ]
        },

        /************
            Hooks
        ************/

        /* Hooks allow a subproperty (e.g. "boxShadowBlur") of a compound-value CSS property
           (e.g. "boxShadow: X Y Blur Spread Color") to be animated as if it were a discrete property. */
        /* Note: Beyond enabling fine-grained property animation, hooking is necessary since Velocity only
           tweens properties with single numeric values; unlike CSS transitions, Velocity does not interpolate compound-values. */
        Hooks: {
            /********************
                Registration
            ********************/

            /* Templates are a concise way of indicating which subproperties must be individually registered for each compound-value CSS property. */
            /* Each template consists of the compound-value's base name, its constituent subproperty names, and those subproperties' default values. */
            templates: {
                "textShadow": [ "Color X Y Blur", "black 0px 0px 0px" ],
                /* Todo: Add support for inset boxShadows. (webkit places it last whereas IE places it first.) */
                "boxShadow": [ "Color X Y Blur Spread", "black 0px 0px 0px 0px" ],
                "clip": [ "Top Right Bottom Left", "0px 0px 0px 0px" ],
                "backgroundPosition": [ "X Y", "0% 0%" ],
                "transformOrigin": [ "X Y Z", "50% 50% 0px" ],
                "perspectiveOrigin": [ "X Y", "50% 50%" ]
            },

            /* A "registered" hook is one that has been converted from its template form into a live,
               tweenable property. It contains data to associate it with its root property. */
            registered: {
                /* Note: A registered hook looks like this ==> textShadowBlur: [ "textShadow", 3 ],
                   which consists of the subproperty's name, the associated root property's name,
                   and the subproperty's position in the root's value. */
            },
            /* Convert the templates into individual hooks then append them to the registered object above. */
            register: function () {
                /* Color hooks registration: Colors are defaulted to white -- as opposed to black -- since colors that are
                   currently set to "transparent" default to their respective template below when color-animated,
                   and white is typically a closer match to transparent than black is. An exception is made for text ("color"),
                   which is almost always set closer to black than white. */
                for (var i = 0; i < CSS.Lists.colors.length; i++) {
                    var rgbComponents = (CSS.Lists.colors[i] === "color") ? "0 0 0 1" : "255 255 255 1";
                    CSS.Hooks.templates[CSS.Lists.colors[i]] = [ "Red Green Blue Alpha", rgbComponents ];
                }

                var rootProperty,
                    hookTemplate,
                    hookNames;

                /* In IE, color values inside compound-value properties are positioned at the end the value instead of at the beginning.
                   Thus, we re-arrange the templates accordingly. */
                if (IE) {
                    for (rootProperty in CSS.Hooks.templates) {
                        hookTemplate = CSS.Hooks.templates[rootProperty];
                        hookNames = hookTemplate[0].split(" ");

                        var defaultValues = hookTemplate[1].match(CSS.RegEx.valueSplit);

                        if (hookNames[0] === "Color") {
                            /* Reposition both the hook's name and its default value to the end of their respective strings. */
                            hookNames.push(hookNames.shift());
                            defaultValues.push(defaultValues.shift());

                            /* Replace the existing template for the hook's root property. */
                            CSS.Hooks.templates[rootProperty] = [ hookNames.join(" "), defaultValues.join(" ") ];
                        }
                    }
                }

                /* Hook registration. */
                for (rootProperty in CSS.Hooks.templates) {
                    hookTemplate = CSS.Hooks.templates[rootProperty];
                    hookNames = hookTemplate[0].split(" ");

                    for (var i in hookNames) {
                        var fullHookName = rootProperty + hookNames[i],
                            hookPosition = i;

                        /* For each hook, register its full name (e.g. textShadowBlur) with its root property (e.g. textShadow)
                           and the hook's position in its template's default value string. */
                        CSS.Hooks.registered[fullHookName] = [ rootProperty, hookPosition ];
                    }
                }
            },

            /*****************************
               Injection and Extraction
            *****************************/

            /* Look up the root property associated with the hook (e.g. return "textShadow" for "textShadowBlur"). */
            /* Since a hook cannot be set directly (the browser won't recognize it), style updating for hooks is routed through the hook's root property. */
            getRoot: function (property) {
                var hookData = CSS.Hooks.registered[property];

                if (hookData) {
                    return hookData[0];
                } else {
                    /* If there was no hook match, return the property name untouched. */
                    return property;
                }
            },
            /* Convert any rootPropertyValue, null or otherwise, into a space-delimited list of hook values so that
               the targeted hook can be injected or extracted at its standard position. */
            cleanRootPropertyValue: function(rootProperty, rootPropertyValue) {
                /* If the rootPropertyValue is wrapped with "rgb()", "clip()", etc., remove the wrapping to normalize the value before manipulation. */
                if (CSS.RegEx.valueUnwrap.test(rootPropertyValue)) {
                    rootPropertyValue = rootPropertyValue.match(CSS.RegEx.valueUnwrap)[1];
                }

                /* If rootPropertyValue is a CSS null-value (from which there's inherently no hook value to extract),
                   default to the root's default value as defined in CSS.Hooks.templates. */
                /* Note: CSS null-values include "none", "auto", and "transparent". They must be converted into their
                   zero-values (e.g. textShadow: "none" ==> textShadow: "0px 0px 0px black") for hook manipulation to proceed. */
                if (CSS.Values.isCSSNullValue(rootPropertyValue)) {
                    rootPropertyValue = CSS.Hooks.templates[rootProperty][1];
                }

                return rootPropertyValue;
            },
            /* Extracted the hook's value from its root property's value. This is used to get the starting value of an animating hook. */
            extractValue: function (fullHookName, rootPropertyValue) {
                var hookData = CSS.Hooks.registered[fullHookName];

                if (hookData) {
                    var hookRoot = hookData[0],
                        hookPosition = hookData[1];

                    rootPropertyValue = CSS.Hooks.cleanRootPropertyValue(hookRoot, rootPropertyValue);

                    /* Split rootPropertyValue into its constituent hook values then grab the desired hook at its standard position. */
                    return rootPropertyValue.toString().match(CSS.RegEx.valueSplit)[hookPosition];
                } else {
                    /* If the provided fullHookName isn't a registered hook, return the rootPropertyValue that was passed in. */
                    return rootPropertyValue;
                }
            },
            /* Inject the hook's value into its root property's value. This is used to piece back together the root property
               once Velocity has updated one of its individually hooked values through tweening. */
            injectValue: function (fullHookName, hookValue, rootPropertyValue) {
                var hookData = CSS.Hooks.registered[fullHookName];

                if (hookData) {
                    var hookRoot = hookData[0],
                        hookPosition = hookData[1],
                        rootPropertyValueParts,
                        rootPropertyValueUpdated;

                    rootPropertyValue = CSS.Hooks.cleanRootPropertyValue(hookRoot, rootPropertyValue);

                    /* Split rootPropertyValue into its individual hook values, replace the targeted value with hookValue,
                       then reconstruct the rootPropertyValue string. */
                    rootPropertyValueParts = rootPropertyValue.toString().match(CSS.RegEx.valueSplit);
                    rootPropertyValueParts[hookPosition] = hookValue;
                    rootPropertyValueUpdated = rootPropertyValueParts.join(" ");

                    return rootPropertyValueUpdated;
                } else {
                    /* If the provided fullHookName isn't a registered hook, return the rootPropertyValue that was passed in. */
                    return rootPropertyValue;
                }
            }
        },

        /*******************
           Normalizations
        *******************/

        /* Normalizations standardize CSS property manipulation by pollyfilling browser-specific implementations (e.g. opacity)
           and reformatting special properties (e.g. clip, rgba) to look like standard ones. */
        Normalizations: {
            /* Normalizations are passed a normalization target (either the property's name, its extracted value, or its injected value),
               the targeted element (which may need to be queried), and the targeted property value. */
            registered: {
                clip: function (type, element, propertyValue) {
                    switch (type) {
                        case "name":
                            return "clip";
                        /* Clip needs to be unwrapped and stripped of its commas during extraction. */
                        case "extract":
                            var extracted;

                            /* If Velocity also extracted this value, skip extraction. */
                            if (CSS.RegEx.wrappedValueAlreadyExtracted.test(propertyValue)) {
                                extracted = propertyValue;
                            } else {
                                /* Remove the "rect()" wrapper. */
                                extracted = propertyValue.toString().match(CSS.RegEx.valueUnwrap);

                                /* Strip off commas. */
                                extracted = extracted ? extracted[1].replace(/,(\s+)?/g, " ") : propertyValue;
                            }

                            return extracted;
                        /* Clip needs to be re-wrapped during injection. */
                        case "inject":
                            return "rect(" + propertyValue + ")";
                    }
                },

                blur: function(type, element, propertyValue) {
                    switch (type) {
                        case "name":
                            return "-webkit-filter";
                        case "extract":
                            var extracted = parseFloat(propertyValue);

                            /* If extracted is NaN, meaning the value isn't already extracted. */
                            if (!(extracted || extracted === 0)) {
                                var blurComponent = propertyValue.toString().match(/blur\(([0-9]+[A-z]+)\)/i);

                                /* If the filter string had a blur component, return just the blur value and unit type. */
                                if (blurComponent) {
                                    extracted = blurComponent[1];
                                /* If the component doesn't exist, default blur to 0. */
                                } else {
                                    extracted = 0;
                                }
                            }

                            return extracted;
                        /* Blur needs to be re-wrapped during injection. */
                        case "inject":
                            /* For the blur effect to be fully de-applied, it needs to be set to "none" instead of 0. */
                            if (!parseFloat(propertyValue)) {
                                return "none";
                            } else {
                                return "blur(" + propertyValue + ")";
                            }
                    }
                },

                /* <=IE8 do not support the standard opacity property. They use filter:alpha(opacity=INT) instead. */
                opacity: function (type, element, propertyValue) {
                    if (IE <= 8) {
                        switch (type) {
                            case "name":
                                return "filter";
                            case "extract":
                                /* <=IE8 return a "filter" value of "alpha(opacity=\d{1,3})".
                                   Extract the value and convert it to a decimal value to match the standard CSS opacity property's formatting. */
                                var extracted = propertyValue.toString().match(/alpha\(opacity=(.*)\)/i);

                                if (extracted) {
                                    /* Convert to decimal value. */
                                    propertyValue = extracted[1] / 100;
                                } else {
                                    /* When extracting opacity, default to 1 since a null value means opacity hasn't been set. */
                                    propertyValue = 1;
                                }

                                return propertyValue;
                            case "inject":
                                /* Opacified elements are required to have their zoom property set to a non-zero value. */
                                element.style.zoom = 1;

                                /* Setting the filter property on elements with certain font property combinations can result in a
                                   highly unappealing ultra-bolding effect. There's no way to remedy this throughout a tween, but dropping the
                                   value altogether (when opacity hits 1) at leasts ensures that the glitch is gone post-tweening. */
                                if (parseFloat(propertyValue) >= 1) {
                                    return "";
                                } else {
                                  /* As per the filter property's spec, convert the decimal value to a whole number and wrap the value. */
                                  return "alpha(opacity=" + parseInt(parseFloat(propertyValue) * 100, 10) + ")";
                                }
                        }
                    /* With all other browsers, normalization is not required; return the same values that were passed in. */
                    } else {
                        switch (type) {
                            case "name":
                                return "opacity";
                            case "extract":
                                return propertyValue;
                            case "inject":
                                return propertyValue;
                        }
                    }
                }
            },

            /*****************************
                Batched Registrations
            *****************************/

            /* Note: Batched normalizations extend the CSS.Normalizations.registered object. */
            register: function () {

                /*****************
                    Transforms
                *****************/

                /* Transforms are the subproperties contained by the CSS "transform" property. Transforms must undergo normalization
                   so that they can be referenced in a properties map by their individual names. */
                /* Note: When transforms are "set", they are actually assigned to a per-element transformCache. When all transform
                   setting is complete complete, CSS.flushTransformCache() must be manually called to flush the values to the DOM.
                   Transform setting is batched in this way to improve performance: the transform style only needs to be updated
                   once when multiple transform subproperties are being animated simultaneously. */
                /* Note: IE9 and Android Gingerbread have support for 2D -- but not 3D -- transforms. Since animating unsupported
                   transform properties results in the browser ignoring the *entire* transform string, we prevent these 3D values
                   from being normalized for these browsers so that tweening skips these properties altogether
                   (since it will ignore them as being unsupported by the browser.) */
                if (!(IE <= 9) && !Velocity.State.isGingerbread) {
                    /* Note: Since the standalone CSS "perspective" property and the CSS transform "perspective" subproperty
                    share the same name, the latter is given a unique token within Velocity: "transformPerspective". */
                    CSS.Lists.transformsBase = CSS.Lists.transformsBase.concat(CSS.Lists.transforms3D);
                }

                for (var i = 0; i < CSS.Lists.transformsBase.length; i++) {
                    /* Wrap the dynamically generated normalization function in a new scope so that transformName's value is
                    paired with its respective function. (Otherwise, all functions would take the final for loop's transformName.) */
                    (function() {
                        var transformName = CSS.Lists.transformsBase[i];

                        CSS.Normalizations.registered[transformName] = function (type, element, propertyValue) {
                            switch (type) {
                                /* The normalized property name is the parent "transform" property -- the property that is actually set in CSS. */
                                case "name":
                                    return "transform";
                                /* Transform values are cached onto a per-element transformCache object. */
                                case "extract":
                                    /* If this transform has yet to be assigned a value, return its null value. */
                                    if (Data(element) === undefined || Data(element).transformCache[transformName] === undefined) {
                                        /* Scale CSS.Lists.transformsBase default to 1 whereas all other transform properties default to 0. */
                                        return /^scale/i.test(transformName) ? 1 : 0;
                                    /* When transform values are set, they are wrapped in parentheses as per the CSS spec.
                                       Thus, when extracting their values (for tween calculations), we strip off the parentheses. */
                                    } else {
                                        return Data(element).transformCache[transformName].replace(/[()]/g, "");
                                    }
                                case "inject":
                                    var invalid = false;

                                    /* If an individual transform property contains an unsupported unit type, the browser ignores the *entire* transform property.
                                       Thus, protect users from themselves by skipping setting for transform values supplied with invalid unit types. */
                                    /* Switch on the base transform type; ignore the axis by removing the last letter from the transform's name. */
                                    switch (transformName.substr(0, transformName.length - 1)) {
                                        /* Whitelist unit types for each transform. */
                                        case "translate":
                                            invalid = !/(%|px|em|rem|vw|vh|\d)$/i.test(propertyValue);
                                            break;
                                        /* Since an axis-free "scale" property is supported as well, a little hack is used here to detect it by chopping off its last letter. */
                                        case "scal":
                                        case "scale":
                                            /* Chrome on Android has a bug in which scaled elements blur if their initial scale
                                               value is below 1 (which can happen with forcefeeding). Thus, we detect a yet-unset scale property
                                               and ensure that its first value is always 1. More info: http://stackoverflow.com/questions/10417890/css3-animations-with-transform-causes-blurred-elements-on-webkit/10417962#10417962 */
                                            if (Velocity.State.isAndroid && Data(element).transformCache[transformName] === undefined && propertyValue < 1) {
                                                propertyValue = 1;
                                            }

                                            invalid = !/(\d)$/i.test(propertyValue);
                                            break;
                                        case "skew":
                                            invalid = !/(deg|\d)$/i.test(propertyValue);
                                            break;
                                        case "rotate":
                                            invalid = !/(deg|\d)$/i.test(propertyValue);
                                            break;
                                    }

                                    if (!invalid) {
                                        /* As per the CSS spec, wrap the value in parentheses. */
                                        Data(element).transformCache[transformName] = "(" + propertyValue + ")";
                                    }

                                    /* Although the value is set on the transformCache object, return the newly-updated value for the calling code to process as normal. */
                                    return Data(element).transformCache[transformName];
                            }
                        };
                    })();
                }

                /*************
                    Colors
                *************/

                /* Since Velocity only animates a single numeric value per property, color animation is achieved by hooking the individual RGBA components of CSS color properties.
                   Accordingly, color values must be normalized (e.g. "#ff0000", "red", and "rgb(255, 0, 0)" ==> "255 0 0 1") so that their components can be injected/extracted by CSS.Hooks logic. */
                for (var i = 0; i < CSS.Lists.colors.length; i++) {
                    /* Wrap the dynamically generated normalization function in a new scope so that colorName's value is paired with its respective function.
                       (Otherwise, all functions would take the final for loop's colorName.) */
                    (function () {
                        var colorName = CSS.Lists.colors[i];

                        /* Note: In IE<=8, which support rgb but not rgba, color properties are reverted to rgb by stripping off the alpha component. */
                        CSS.Normalizations.registered[colorName] = function(type, element, propertyValue) {
                            switch (type) {
                                case "name":
                                    return colorName;
                                /* Convert all color values into the rgb format. (Old IE can return hex values and color names instead of rgb/rgba.) */
                                case "extract":
                                    var extracted;

                                    /* If the color is already in its hookable form (e.g. "255 255 255 1") due to having been previously extracted, skip extraction. */
                                    if (CSS.RegEx.wrappedValueAlreadyExtracted.test(propertyValue)) {
                                        extracted = propertyValue;
                                    } else {
                                        var converted,
                                            colorNames = {
                                                black: "rgb(0, 0, 0)",
                                                blue: "rgb(0, 0, 255)",
                                                gray: "rgb(128, 128, 128)",
                                                green: "rgb(0, 128, 0)",
                                                red: "rgb(255, 0, 0)",
                                                white: "rgb(255, 255, 255)"
                                            };

                                        /* Convert color names to rgb. */
                                        if (/^[A-z]+$/i.test(propertyValue)) {
                                            if (colorNames[propertyValue] !== undefined) {
                                                converted = colorNames[propertyValue]
                                            } else {
                                                /* If an unmatched color name is provided, default to black. */
                                                converted = colorNames.black;
                                            }
                                        /* Convert hex values to rgb. */
                                        } else if (CSS.RegEx.isHex.test(propertyValue)) {
                                            converted = "rgb(" + CSS.Values.hexToRgb(propertyValue).join(" ") + ")";
                                        /* If the provided color doesn't match any of the accepted color formats, default to black. */
                                        } else if (!(/^rgba?\(/i.test(propertyValue))) {
                                            converted = colorNames.black;
                                        }

                                        /* Remove the surrounding "rgb/rgba()" string then replace commas with spaces and strip
                                           repeated spaces (in case the value included spaces to begin with). */
                                        extracted = (converted || propertyValue).toString().match(CSS.RegEx.valueUnwrap)[1].replace(/,(\s+)?/g, " ");
                                    }

                                    /* So long as this isn't <=IE8, add a fourth (alpha) component if it's missing and default it to 1 (visible). */
                                    if (!(IE <= 8) && extracted.split(" ").length === 3) {
                                        extracted += " 1";
                                    }

                                    return extracted;
                                case "inject":
                                    /* If this is IE<=8 and an alpha component exists, strip it off. */
                                    if (IE <= 8) {
                                        if (propertyValue.split(" ").length === 4) {
                                            propertyValue = propertyValue.split(/\s+/).slice(0, 3).join(" ");
                                        }
                                    /* Otherwise, add a fourth (alpha) component if it's missing and default it to 1 (visible). */
                                    } else if (propertyValue.split(" ").length === 3) {
                                        propertyValue += " 1";
                                    }

                                    /* Re-insert the browser-appropriate wrapper("rgb/rgba()"), insert commas, and strip off decimal units
                                       on all values but the fourth (R, G, and B only accept whole numbers). */
                                    return (IE <= 8 ? "rgb" : "rgba") + "(" + propertyValue.replace(/\s+/g, ",").replace(/\.(\d)+(?=,)/g, "") + ")";
                            }
                        };
                    })();
                }
            }
        },

        /************************
           CSS Property Names
        ************************/

        Names: {
            /* Camelcase a property name into its JavaScript notation (e.g. "background-color" ==> "backgroundColor").
               Camelcasing is used to normalize property names between and across calls. */
            camelCase: function (property) {
                return property.replace(/-(\w)/g, function (match, subMatch) {
                    return subMatch.toUpperCase();
                });
            },

            /* For SVG elements, some properties (namely, dimensional ones) are GET/SET via the element's HTML attributes (instead of via CSS styles). */
            SVGAttribute: function (property) {
                var SVGAttributes = "width|height|x|y|cx|cy|r|rx|ry|x1|x2|y1|y2";

                /* Certain browsers require an SVG transform to be applied as an attribute. (Otherwise, application via CSS is preferable due to 3D support.) */
                if (IE || (Velocity.State.isAndroid && !Velocity.State.isChrome)) {
                    SVGAttributes += "|transform";
                }

                return new RegExp("^(" + SVGAttributes + ")$", "i").test(property);
            },

            /* Determine whether a property should be set with a vendor prefix. */
            /* If a prefixed version of the property exists, return it. Otherwise, return the original property name.
               If the property is not at all supported by the browser, return a false flag. */
            prefixCheck: function (property) {
                /* If this property has already been checked, return the cached value. */
                if (Velocity.State.prefixMatches[property]) {
                    return [ Velocity.State.prefixMatches[property], true ];
                } else {
                    var vendors = [ "", "Webkit", "Moz", "ms", "O" ];

                    for (var i = 0, vendorsLength = vendors.length; i < vendorsLength; i++) {
                        var propertyPrefixed;

                        if (i === 0) {
                            propertyPrefixed = property;
                        } else {
                            /* Capitalize the first letter of the property to conform to JavaScript vendor prefix notation (e.g. webkitFilter). */
                            propertyPrefixed = vendors[i] + property.replace(/^\w/, function(match) { return match.toUpperCase(); });
                        }

                        /* Check if the browser supports this property as prefixed. */
                        if (Type.isString(Velocity.State.prefixElement.style[propertyPrefixed])) {
                            /* Cache the match. */
                            Velocity.State.prefixMatches[property] = propertyPrefixed;

                            return [ propertyPrefixed, true ];
                        }
                    }

                    /* If the browser doesn't support this property in any form, include a false flag so that the caller can decide how to proceed. */
                    return [ property, false ];
                }
            }
        },

        /************************
           CSS Property Values
        ************************/

        Values: {
            /* Hex to RGB conversion. Copyright Tim Down: http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb */
            hexToRgb: function (hex) {
                var shortformRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
                    longformRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i,
                    rgbParts;

                hex = hex.replace(shortformRegex, function (m, r, g, b) {
                    return r + r + g + g + b + b;
                });

                rgbParts = longformRegex.exec(hex);

                return rgbParts ? [ parseInt(rgbParts[1], 16), parseInt(rgbParts[2], 16), parseInt(rgbParts[3], 16) ] : [ 0, 0, 0 ];
            },

            isCSSNullValue: function (value) {
                /* The browser defaults CSS values that have not been set to either 0 or one of several possible null-value strings.
                   Thus, we check for both falsiness and these special strings. */
                /* Null-value checking is performed to default the special strings to 0 (for the sake of tweening) or their hook
                   templates as defined as CSS.Hooks (for the sake of hook injection/extraction). */
                /* Note: Chrome returns "rgba(0, 0, 0, 0)" for an undefined color whereas IE returns "transparent". */
                return (value == 0 || /^(none|auto|transparent|(rgba\(0, ?0, ?0, ?0\)))$/i.test(value));
            },

            /* Retrieve a property's default unit type. Used for assigning a unit type when one is not supplied by the user. */
            getUnitType: function (property) {
                if (/^(rotate|skew)/i.test(property)) {
                    return "deg";
                } else if (/(^(scale|scaleX|scaleY|scaleZ|alpha|flexGrow|flexHeight|zIndex|fontWeight)$)|((opacity|red|green|blue|alpha)$)/i.test(property)) {
                    /* The above properties are unitless. */
                    return "";
                } else {
                    /* Default to px for all other properties. */
                    return "px";
                }
            },

            /* HTML elements default to an associated display type when they're not set to display:none. */
            /* Note: This function is used for correctly setting the non-"none" display value in certain Velocity redirects, such as fadeIn/Out. */
            getDisplayType: function (element) {
                var tagName = element && element.tagName.toString().toLowerCase();

                if (/^(b|big|i|small|tt|abbr|acronym|cite|code|dfn|em|kbd|strong|samp|var|a|bdo|br|img|map|object|q|script|span|sub|sup|button|input|label|select|textarea)$/i.test(tagName)) {
                    return "inline";
                } else if (/^(li)$/i.test(tagName)) {
                    return "list-item";
                } else if (/^(tr)$/i.test(tagName)) {
                    return "table-row";
                /* Default to "block" when no match is found. */
                } else {
                    return "block";
                }
            },

            /* The class add/remove functions are used to temporarily apply a "velocity-animating" class to elements while they're animating. */
            addClass: function (element, className) {
                if (element.classList) {
                    element.classList.add(className);
                } else {
                    element.className += (element.className.length ? " " : "") + className;
                }
            },

            removeClass: function (element, className) {
                if (element.classList) {
                    element.classList.remove(className);
                } else {
                    element.className = element.className.toString().replace(new RegExp("(^|\\s)" + className.split(" ").join("|") + "(\\s|$)", "gi"), " ");
                }
            }
        },

        /****************************
           Style Getting & Setting
        ****************************/

        /* The singular getPropertyValue, which routes the logic for all normalizations, hooks, and standard CSS properties. */
        getPropertyValue: function (element, property, rootPropertyValue, forceStyleLookup) {
            /* Get an element's computed property value. */
            /* Note: Retrieving the value of a CSS property cannot simply be performed by checking an element's
               style attribute (which only reflects user-defined values). Instead, the browser must be queried for a property's
               *computed* value. You can read more about getComputedStyle here: https://developer.mozilla.org/en/docs/Web/API/window.getComputedStyle */
            function computePropertyValue (element, property) {
                /* When box-sizing isn't set to border-box, height and width style values are incorrectly computed when an
                   element's scrollbars are visible (which expands the element's dimensions). Thus, we defer to the more accurate
                   offsetHeight/Width property, which includes the total dimensions for interior, border, padding, and scrollbar.
                   We subtract border and padding to get the sum of interior + scrollbar. */
                var computedValue = 0;

                /* IE<=8 doesn't support window.getComputedStyle, thus we defer to jQuery, which has an extensive array
                   of hacks to accurately retrieve IE8 property values. Re-implementing that logic here is not worth bloating the
                   codebase for a dying browser. The performance repercussions of using jQuery here are minimal since
                   Velocity is optimized to rarely (and sometimes never) query the DOM. Further, the $.css() codepath isn't that slow. */
                if (IE <= 8) {
                    computedValue = $.css(element, property); /* GET */
                /* All other browsers support getComputedStyle. The returned live object reference is cached onto its
                   associated element so that it does not need to be refetched upon every GET. */
                } else {
                    /* Browsers do not return height and width values for elements that are set to display:"none". Thus, we temporarily
                       toggle display to the element type's default value. */
                    var toggleDisplay = false;

                    if (/^(width|height)$/.test(property) && CSS.getPropertyValue(element, "display") === 0) {
                        toggleDisplay = true;
                        CSS.setPropertyValue(element, "display", CSS.Values.getDisplayType(element));
                    }

                    function revertDisplay () {
                        if (toggleDisplay) {
                            CSS.setPropertyValue(element, "display", "none");
                        }
                    }

                    if (!forceStyleLookup) {
                        if (property === "height" && CSS.getPropertyValue(element, "boxSizing").toString().toLowerCase() !== "border-box") {
                            var contentBoxHeight = element.offsetHeight - (parseFloat(CSS.getPropertyValue(element, "borderTopWidth")) || 0) - (parseFloat(CSS.getPropertyValue(element, "borderBottomWidth")) || 0) - (parseFloat(CSS.getPropertyValue(element, "paddingTop")) || 0) - (parseFloat(CSS.getPropertyValue(element, "paddingBottom")) || 0);
                            revertDisplay();

                            return contentBoxHeight;
                        } else if (property === "width" && CSS.getPropertyValue(element, "boxSizing").toString().toLowerCase() !== "border-box") {
                            var contentBoxWidth = element.offsetWidth - (parseFloat(CSS.getPropertyValue(element, "borderLeftWidth")) || 0) - (parseFloat(CSS.getPropertyValue(element, "borderRightWidth")) || 0) - (parseFloat(CSS.getPropertyValue(element, "paddingLeft")) || 0) - (parseFloat(CSS.getPropertyValue(element, "paddingRight")) || 0);
                            revertDisplay();

                            return contentBoxWidth;
                        }
                    }

                    var computedStyle;

                    /* For elements that Velocity hasn't been called on directly (e.g. when Velocity queries the DOM on behalf
                       of a parent of an element its animating), perform a direct getComputedStyle lookup since the object isn't cached. */
                    if (Data(element) === undefined) {
                        computedStyle = window.getComputedStyle(element, null); /* GET */
                    /* If the computedStyle object has yet to be cached, do so now. */
                    } else if (!Data(element).computedStyle) {
                        computedStyle = Data(element).computedStyle = window.getComputedStyle(element, null); /* GET */
                    /* If computedStyle is cached, use it. */
                    } else {
                        computedStyle = Data(element).computedStyle;
                    }

                    /* IE and Firefox do not return a value for the generic borderColor -- they only return individual values for each border side's color.
                       As a polyfill for querying individual border side colors, just return the top border's color. */
                    if ((IE || Velocity.State.isFirefox) && property === "borderColor") {
                        property = "borderTopColor";
                    }

                    /* IE9 has a bug in which the "filter" property must be accessed from computedStyle using the getPropertyValue method
                       instead of a direct property lookup. The getPropertyValue method is slower than a direct lookup, which is why we avoid it by default. */
                    if (IE === 9 && property === "filter") {
                        computedValue = computedStyle.getPropertyValue(property); /* GET */
                    } else {
                        computedValue = computedStyle[property];
                    }

                    /* Fall back to the property's style value (if defined) when computedValue returns nothing,
                       which can happen when the element hasn't been painted. */
                    if (computedValue === "" || computedValue === null) {
                        computedValue = element.style[property];
                    }

                    revertDisplay();
                }

                /* For top, right, bottom, and left (TRBL) values that are set to "auto" on elements of "fixed" or "absolute" position,
                   defer to jQuery for converting "auto" to a numeric value. (For elements with a "static" or "relative" position, "auto" has the same
                   effect as being set to 0, so no conversion is necessary.) */
                /* An example of why numeric conversion is necessary: When an element with "position:absolute" has an untouched "left"
                   property, which reverts to "auto", left's value is 0 relative to its parent element, but is often non-zero relative
                   to its *containing* (not parent) element, which is the nearest "position:relative" ancestor or the viewport (and always the viewport in the case of "position:fixed"). */
                if (computedValue === "auto" && /^(top|right|bottom|left)$/i.test(property)) {
                    var position = computePropertyValue(element, "position"); /* GET */

                    /* For absolute positioning, jQuery's $.position() only returns values for top and left;
                       right and bottom will have their "auto" value reverted to 0. */
                    /* Note: A jQuery object must be created here since jQuery doesn't have a low-level alias for $.position().
                       Not a big deal since we're currently in a GET batch anyway. */
                    if (position === "fixed" || (position === "absolute" && /top|left/i.test(property))) {
                        /* Note: jQuery strips the pixel unit from its returned values; we re-add it here to conform with computePropertyValue's behavior. */
                        computedValue = $(element).position()[property] + "px"; /* GET */
                    }
                }

                return computedValue;
            }

            var propertyValue;

            /* If this is a hooked property (e.g. "clipLeft" instead of the root property of "clip"),
               extract the hook's value from a normalized rootPropertyValue using CSS.Hooks.extractValue(). */
            if (CSS.Hooks.registered[property]) {
                var hook = property,
                    hookRoot = CSS.Hooks.getRoot(hook);

                /* If a cached rootPropertyValue wasn't passed in (which Velocity always attempts to do in order to avoid requerying the DOM),
                   query the DOM for the root property's value. */
                if (rootPropertyValue === undefined) {
                    /* Since the browser is now being directly queried, use the official post-prefixing property name for this lookup. */
                    rootPropertyValue = CSS.getPropertyValue(element, CSS.Names.prefixCheck(hookRoot)[0]); /* GET */
                }

                /* If this root has a normalization registered, peform the associated normalization extraction. */
                if (CSS.Normalizations.registered[hookRoot]) {
                    rootPropertyValue = CSS.Normalizations.registered[hookRoot]("extract", element, rootPropertyValue);
                }

                /* Extract the hook's value. */
                propertyValue = CSS.Hooks.extractValue(hook, rootPropertyValue);

            /* If this is a normalized property (e.g. "opacity" becomes "filter" in <=IE8) or "translateX" becomes "transform"),
               normalize the property's name and value, and handle the special case of transforms. */
            /* Note: Normalizing a property is mutually exclusive from hooking a property since hook-extracted values are strictly
               numerical and therefore do not require normalization extraction. */
            } else if (CSS.Normalizations.registered[property]) {
                var normalizedPropertyName,
                    normalizedPropertyValue;

                normalizedPropertyName = CSS.Normalizations.registered[property]("name", element);

                /* Transform values are calculated via normalization extraction (see below), which checks against the element's transformCache.
                   At no point do transform GETs ever actually query the DOM; initial stylesheet values are never processed.
                   This is because parsing 3D transform matrices is not always accurate and would bloat our codebase;
                   thus, normalization extraction defaults initial transform values to their zero-values (e.g. 1 for scaleX and 0 for translateX). */
                if (normalizedPropertyName !== "transform") {
                    normalizedPropertyValue = computePropertyValue(element, CSS.Names.prefixCheck(normalizedPropertyName)[0]); /* GET */

                    /* If the value is a CSS null-value and this property has a hook template, use that zero-value template so that hooks can be extracted from it. */
                    if (CSS.Values.isCSSNullValue(normalizedPropertyValue) && CSS.Hooks.templates[property]) {
                        normalizedPropertyValue = CSS.Hooks.templates[property][1];
                    }
                }

                propertyValue = CSS.Normalizations.registered[property]("extract", element, normalizedPropertyValue);
            }

            /* If a (numeric) value wasn't produced via hook extraction or normalization, query the DOM. */
            if (!/^[\d-]/.test(propertyValue)) {
                /* For SVG elements, dimensional properties (which SVGAttribute() detects) are tweened via
                   their HTML attribute values instead of their CSS style values. */
                if (Data(element) && Data(element).isSVG && CSS.Names.SVGAttribute(property)) {
                    /* Since the height/width attribute values must be set manually, they don't reflect computed values.
                       Thus, we use use getBBox() to ensure we always get values for elements with undefined height/width attributes. */
                    if (/^(height|width)$/i.test(property)) {
                        propertyValue = element.getBBox()[property];
                    /* Otherwise, access the attribute value directly. */
                    } else {
                        propertyValue = element.getAttribute(property);
                    }
                } else {
                    propertyValue = computePropertyValue(element, CSS.Names.prefixCheck(property)[0]); /* GET */
                }
            }

            /* Since property lookups are for animation purposes (which entails computing the numeric delta between start and end values),
               convert CSS null-values to an integer of value 0. */
            if (CSS.Values.isCSSNullValue(propertyValue)) {
                propertyValue = 0;
            }

            if (Velocity.debug >= 2) console.log("Get " + property + ": " + propertyValue);

            return propertyValue;
        },

        /* The singular setPropertyValue, which routes the logic for all normalizations, hooks, and standard CSS properties. */
        setPropertyValue: function(element, property, propertyValue, rootPropertyValue, scrollData) {
            var propertyName = property;

            /* In order to be subjected to call options and element queueing, scroll animation is routed through Velocity as if it were a standard CSS property. */
            if (property === "scroll") {
                /* If a container option is present, scroll the container instead of the browser window. */
                if (scrollData.container) {
                    scrollData.container["scroll" + scrollData.direction] = propertyValue;
                /* Otherwise, Velocity defaults to scrolling the browser window. */
                } else {
                    if (scrollData.direction === "Left") {
                        window.scrollTo(propertyValue, scrollData.alternateValue);
                    } else {
                        window.scrollTo(scrollData.alternateValue, propertyValue);
                    }
                }
            } else {
                /* Transforms (translateX, rotateZ, etc.) are applied to a per-element transformCache object, which is manually flushed via flushTransformCache().
                   Thus, for now, we merely cache transforms being SET. */
                if (CSS.Normalizations.registered[property] && CSS.Normalizations.registered[property]("name", element) === "transform") {
                    /* Perform a normalization injection. */
                    /* Note: The normalization logic handles the transformCache updating. */
                    CSS.Normalizations.registered[property]("inject", element, propertyValue);

                    propertyName = "transform";
                    propertyValue = Data(element).transformCache[property];
                } else {
                    /* Inject hooks. */
                    if (CSS.Hooks.registered[property]) {
                        var hookName = property,
                            hookRoot = CSS.Hooks.getRoot(property);

                        /* If a cached rootPropertyValue was not provided, query the DOM for the hookRoot's current value. */
                        rootPropertyValue = rootPropertyValue || CSS.getPropertyValue(element, hookRoot); /* GET */

                        propertyValue = CSS.Hooks.injectValue(hookName, propertyValue, rootPropertyValue);
                        property = hookRoot;
                    }

                    /* Normalize names and values. */
                    if (CSS.Normalizations.registered[property]) {
                        propertyValue = CSS.Normalizations.registered[property]("inject", element, propertyValue);
                        property = CSS.Normalizations.registered[property]("name", element);
                    }

                    /* Assign the appropriate vendor prefix before performing an official style update. */
                    propertyName = CSS.Names.prefixCheck(property)[0];

                    /* A try/catch is used for IE<=8, which throws an error when "invalid" CSS values are set, e.g. a negative width.
                       Try/catch is avoided for other browsers since it incurs a performance overhead. */
                    if (IE <= 8) {
                        try {
                            element.style[propertyName] = propertyValue;
                        } catch (error) { if (Velocity.debug) console.log("Browser does not support [" + propertyValue + "] for [" + propertyName + "]"); }
                    /* SVG elements have their dimensional properties (width, height, x, y, cx, etc.) applied directly as attributes instead of as styles. */
                    /* Note: IE8 does not support SVG elements, so it's okay that we skip it for SVG animation. */
                    } else if (Data(element) && Data(element).isSVG && CSS.Names.SVGAttribute(property)) {
                        /* Note: For SVG attributes, vendor-prefixed property names are never used. */
                        /* Note: Not all CSS properties can be animated via attributes, but the browser won't throw an error for unsupported properties. */
                        element.setAttribute(property, propertyValue);
                    } else {
                        element.style[propertyName] = propertyValue;
                    }

                    if (Velocity.debug >= 2) console.log("Set " + property + " (" + propertyName + "): " + propertyValue);
                }
            }

            /* Return the normalized property name and value in case the caller wants to know how these values were modified before being applied to the DOM. */
            return [ propertyName, propertyValue ];
        },

        /* To increase performance by batching transform updates into a single SET, transforms are not directly applied to an element until flushTransformCache() is called. */
        /* Note: Velocity applies transform properties in the same order that they are chronogically introduced to the element's CSS styles. */
        flushTransformCache: function(element) {
            var transformString = "";

            /* Certain browsers require that SVG transforms be applied as an attribute. However, the SVG transform attribute takes a modified version of CSS's transform string
               (units are dropped and, except for skewX/Y, subproperties are merged into their master property -- e.g. scaleX and scaleY are merged into scale(X Y). */
            if ((IE || (Velocity.State.isAndroid && !Velocity.State.isChrome)) && Data(element).isSVG) {
                /* Since transform values are stored in their parentheses-wrapped form, we use a helper function to strip out their numeric values.
                   Further, SVG transform properties only take unitless (representing pixels) values, so it's okay that parseFloat() strips the unit suffixed to the float value. */
                function getTransformFloat (transformProperty) {
                    return parseFloat(CSS.getPropertyValue(element, transformProperty));
                }

                /* Create an object to organize all the transforms that we'll apply to the SVG element. To keep the logic simple,
                   we process *all* transform properties -- even those that may not be explicitly applied (since they default to their zero-values anyway). */
                var SVGTransforms = {
                    translate: [ getTransformFloat("translateX"), getTransformFloat("translateY") ],
                    skewX: [ getTransformFloat("skewX") ], skewY: [ getTransformFloat("skewY") ],
                    /* If the scale property is set (non-1), use that value for the scaleX and scaleY values
                       (this behavior mimics the result of animating all these properties at once on HTML elements). */
                    scale: getTransformFloat("scale") !== 1 ? [ getTransformFloat("scale"), getTransformFloat("scale") ] : [ getTransformFloat("scaleX"), getTransformFloat("scaleY") ],
                    /* Note: SVG's rotate transform takes three values: rotation degrees followed by the X and Y values
                       defining the rotation's origin point. We ignore the origin values (default them to 0). */
                    rotate: [ getTransformFloat("rotateZ"), 0, 0 ]
                };

                /* Iterate through the transform properties in the user-defined property map order.
                   (This mimics the behavior of non-SVG transform animation.) */
                $.each(Data(element).transformCache, function(transformName) {
                    /* Except for with skewX/Y, revert the axis-specific transform subproperties to their axis-free master
                       properties so that they match up with SVG's accepted transform properties. */
                    if (/^translate/i.test(transformName)) {
                        transformName = "translate";
                    } else if (/^scale/i.test(transformName)) {
                        transformName = "scale";
                    } else if (/^rotate/i.test(transformName)) {
                        transformName = "rotate";
                    }

                    /* Check that we haven't yet deleted the property from the SVGTransforms container. */
                    if (SVGTransforms[transformName]) {
                        /* Append the transform property in the SVG-supported transform format. As per the spec, surround the space-delimited values in parentheses. */
                        transformString += transformName + "(" + SVGTransforms[transformName].join(" ") + ")" + " ";

                        /* After processing an SVG transform property, delete it from the SVGTransforms container so we don't
                           re-insert the same master property if we encounter another one of its axis-specific properties. */
                        delete SVGTransforms[transformName];
                    }
                });
            } else {
                var transformValue,
                    perspective;

                /* Transform properties are stored as members of the transformCache object. Concatenate all the members into a string. */
                $.each(Data(element).transformCache, function(transformName) {
                    transformValue = Data(element).transformCache[transformName];

                    /* Transform's perspective subproperty must be set first in order to take effect. Store it temporarily. */
                    if (transformName === "transformPerspective") {
                        perspective = transformValue;
                        return true;
                    }

                    /* IE9 only supports one rotation type, rotateZ, which it refers to as "rotate". */
                    if (IE === 9 && transformName === "rotateZ") {
                        transformName = "rotate";
                    }

                    transformString += transformName + transformValue + " ";
                });

                /* If present, set the perspective subproperty first. */
                if (perspective) {
                    transformString = "perspective" + perspective + " " + transformString;
                }
            }

            CSS.setPropertyValue(element, "transform", transformString);
        }
    };

    /* Register hooks and normalizations. */
    CSS.Hooks.register();
    CSS.Normalizations.register();

    /* Allow hook setting in the same fashion as jQuery's $.css(). */
    Velocity.hook = function (elements, arg2, arg3) {
        var value = undefined;

        elements = sanitizeElements(elements);

        $.each(elements, function(i, element) {
            /* Initialize Velocity's per-element data cache if this element hasn't previously been animated. */
            if (Data(element) === undefined) {
                Velocity.init(element);
            }

            /* Get property value. If an element set was passed in, only return the value for the first element. */
            if (arg3 === undefined) {
                if (value === undefined) {
                    value = Velocity.CSS.getPropertyValue(element, arg2);
                }
            /* Set property value. */
            } else {
                /* sPV returns an array of the normalized propertyName/propertyValue pair used to update the DOM. */
                var adjustedSet = Velocity.CSS.setPropertyValue(element, arg2, arg3);

                /* Transform properties don't automatically set. They have to be flushed to the DOM. */
                if (adjustedSet[0] === "transform") {
                    Velocity.CSS.flushTransformCache(element);
                }

                value = adjustedSet;
            }
        });

        return value;
    };

    /*****************
        Animation
    *****************/

    var animate = function() {

        /******************
            Call Chain
        ******************/

        /* Logic for determining what to return to the call stack when exiting out of Velocity. */
        function getChain () {
            /* If we are using the utility function, attempt to return this call's promise. If no promise library was detected,
               default to null instead of returning the targeted elements so that utility function's return value is standardized. */
            if (isUtility) {
                return promiseData.promise || null;
            /* Otherwise, if we're using $.fn, return the jQuery-/Zepto-wrapped element set. */
            } else {
                return elementsWrapped;
            }
        }

        /*************************
           Arguments Assignment
        *************************/

        /* To allow for expressive CoffeeScript code, Velocity supports an alternative syntax in which "properties" and "options"
           objects are defined on a container object that's passed in as Velocity's sole argument. */
        /* Note: Some browsers automatically populate arguments with a "properties" object. We detect it by checking for its default "names" property. */
        var syntacticSugar = (arguments[0] && (($.isPlainObject(arguments[0].properties) && !arguments[0].properties.names) || Type.isString(arguments[0].properties))),
            /* Whether Velocity was called via the utility function (as opposed to on a jQuery/Zepto object). */
            isUtility,
            /* When Velocity is called via the utility function ($.Velocity()/Velocity()), elements are explicitly
               passed in as the first parameter. Thus, argument positioning varies. We normalize them here. */
            elementsWrapped,
            argumentIndex;

        var elements,
            propertiesMap,
            options;

        /* Detect jQuery/Zepto elements being animated via the $.fn method. */
        if (Type.isWrapped(this)) {
            isUtility = false;

            argumentIndex = 0;
            elements = this;
            elementsWrapped = this;
        /* Otherwise, raw elements are being animated via the utility function. */
        } else {
            isUtility = true;

            argumentIndex = 1;
            elements = syntacticSugar ? arguments[0].elements : arguments[0];
        }

        elements = sanitizeElements(elements);

        if (!elements) {
            return;
        }

        if (syntacticSugar) {
            propertiesMap = arguments[0].properties;
            options = arguments[0].options;
        } else {
            propertiesMap = arguments[argumentIndex];
            options = arguments[argumentIndex + 1];
        }

        /* The length of the element set (in the form of a nodeList or an array of elements) is defaulted to 1 in case a
           single raw DOM element is passed in (which doesn't contain a length property). */
        var elementsLength = elements.length,
            elementsIndex = 0;

        /***************************
            Argument Overloading
        ***************************/

        /* Support is included for jQuery's argument overloading: $.animate(propertyMap [, duration] [, easing] [, complete]).
           Overloading is detected by checking for the absence of an object being passed into options. */
        /* Note: The stop action does not accept animation options, and is therefore excluded from this check. */
        if (propertiesMap !== "stop" && !$.isPlainObject(options)) {
            /* The utility function shifts all arguments one position to the right, so we adjust for that offset. */
            var startingArgumentPosition = argumentIndex + 1;

            options = {};

            /* Iterate through all options arguments */
            for (var i = startingArgumentPosition; i < arguments.length; i++) {
                /* Treat a number as a duration. Parse it out. */
                /* Note: The following RegEx will return true if passed an array with a number as its first item.
                   Thus, arrays are skipped from this check. */
                if (!Type.isArray(arguments[i]) && (/^(fast|normal|slow)$/i.test(arguments[i]) || /^\d/.test(arguments[i]))) {
                    options.duration = arguments[i];
                /* Treat strings and arrays as easings. */
                } else if (Type.isString(arguments[i]) || Type.isArray(arguments[i])) {
                    options.easing = arguments[i];
                /* Treat a function as a complete callback. */
                } else if (Type.isFunction(arguments[i])) {
                    options.complete = arguments[i];
                }
            }
        }

        /***************
            Promises
        ***************/

        var promiseData = {
                promise: null,
                resolver: null,
                rejecter: null
            };

        /* If this call was made via the utility function (which is the default method of invocation when jQuery/Zepto are not being used), and if
           promise support was detected, create a promise object for this call and store references to its resolver and rejecter methods. The resolve
           method is used when a call completes naturally or is prematurely stopped by the user. In both cases, completeCall() handles the associated
           call cleanup and promise resolving logic. The reject method is used when an invalid set of arguments is passed into a Velocity call. */
        /* Note: Velocity employs a call-based queueing architecture, which means that stopping an animating element actually stops the full call that
           triggered it -- not that one element exclusively. Similarly, there is one promise per call, and all elements targeted by a Velocity call are
           grouped together for the purposes of resolving and rejecting a promise. */
        if (isUtility && Velocity.Promise) {
            promiseData.promise = new Velocity.Promise(function (resolve, reject) {
                promiseData.resolver = resolve;
                promiseData.rejecter = reject;
            });
        }

        /*********************
           Action Detection
        *********************/

        /* Velocity's behavior is categorized into "actions": Elements can either be specially scrolled into view,
           or they can be started, stopped, or reversed. If a literal or referenced properties map is passed in as Velocity's
           first argument, the associated action is "start". Alternatively, "scroll", "reverse", or "stop" can be passed in instead of a properties map. */
        var action;

        switch (propertiesMap) {
            case "scroll":
                action = "scroll";
                break;

            case "reverse":
                action = "reverse";
                break;

            case "stop":
                /*******************
                    Action: Stop
                *******************/

                /* Clear the currently-active delay on each targeted element. */
                $.each(elements, function(i, element) {
                    if (Data(element) && Data(element).delayTimer) {
                        /* Stop the timer from triggering its cached next() function. */
                        clearTimeout(Data(element).delayTimer.setTimeout);

                        /* Manually call the next() function so that the subsequent queue items can progress. */
                        if (Data(element).delayTimer.next) {
                            Data(element).delayTimer.next();
                        }

                        delete Data(element).delayTimer;
                    }
                });

                var callsToStop = [];

                /* When the stop action is triggered, the elements' currently active call is immediately stopped. The active call might have
                   been applied to multiple elements, in which case all of the call's elements will be subjected to stopping. When an element
                   is stopped, the next item in its animation queue is immediately triggered. */
                /* An additional argument may be passed in to clear an element's remaining queued calls. Either true (which defaults to the "fx" queue)
                   or a custom queue string can be passed in. */
                /* Note: The stop command runs prior to Queueing since its behavior is intended to take effect *immediately*,
                   regardless of the element's current queue state. */

                /* Iterate through every active call. */
                $.each(Velocity.State.calls, function(i, activeCall) {
                    /* Inactive calls are set to false by the logic inside completeCall(). Skip them. */
                    if (activeCall) {
                        /* Iterate through the active call's targeted elements. */
                        $.each(activeCall[1], function(k, activeElement) {
                            var queueName = Type.isString(options) ? options : "";

                            if (options !== undefined && activeCall[2].queue !== queueName) {
                                return true;
                            }

                            /* Iterate through the calls targeted by the stop command. */
                            $.each(elements, function(l, element) {
                                /* Check that this call was applied to the target element. */
                                if (element === activeElement) {
                                    /* Optionally clear the remaining queued calls. */
                                    if (options !== undefined) {
                                        /* Iterate through the items in the element's queue. */
                                        $.each($.queue(element, queueName), function(_, item) {
                                            /* The queue array can contain an "inprogress" string, which we skip. */
                                            if (Type.isFunction(item)) {
                                                /* Pass the item's callback a flag indicating that we want to abort from the queue call.
                                                   (Specifically, the queue will resolve the call's associated promise then abort.)  */
                                                item(null, true);
                                            }
                                        });

                                        /* Clearing the $.queue() array is achieved by resetting it to []. */
                                        $.queue(element, queueName, []);
                                    }

                                    if (Data(element) && queueName === "") {
                                        /* Since "reverse" uses cached start values (the previous call's endValues),
                                           these values must be changed to reflect the final value that the elements were actually tweened to. */
                                        $.each(Data(element).tweensContainer, function(m, activeTween) {
                                            activeTween.endValue = activeTween.currentValue;
                                        });
                                    }

                                    callsToStop.push(i);
                                }
                            });
                        });
                    }
                });

                /* Prematurely call completeCall() on each matched active call, passing an additional flag to indicate
                   that the complete callback and display:none setting should be skipped since we're completing prematurely. */
                $.each(callsToStop, function(i, j) {
                    completeCall(j, true);
                });

                if (promiseData.promise) {
                    /* Immediately resolve the promise associated with this stop call since stop runs synchronously. */
                    promiseData.resolver(elements);
                }

                /* Since we're stopping, and not proceeding with queueing, exit out of Velocity. */
                return getChain();

            default:
                /* Treat a non-empty plain object as a literal properties map. */
                if ($.isPlainObject(propertiesMap) && !Type.isEmptyObject(propertiesMap)) {
                    action = "start";

                /****************
                    Redirects
                ****************/

                /* Check if a string matches a registered redirect (see Redirects above). */
                } else if (Type.isString(propertiesMap) && Velocity.Redirects[propertiesMap]) {
                    var opts = $.extend({}, options),
                        durationOriginal = opts.duration,
                        delayOriginal = opts.delay || 0;

                    /* If the backwards option was passed in, reverse the element set so that elements animate from the last to the first. */
                    if (opts.backwards === true) {
                        elements = $.extend(true, [], elements).reverse();
                    }

                    /* Individually trigger the redirect for each element in the set to prevent users from having to handle iteration logic in their redirect. */
                    $.each(elements, function(elementIndex, element) {
                        /* If the stagger option was passed in, successively delay each element by the stagger value (in ms). Retain the original delay value. */
                        if (parseFloat(opts.stagger)) {
                            opts.delay = delayOriginal + (parseFloat(opts.stagger) * elementIndex);
                        } else if (Type.isFunction(opts.stagger)) {
                            opts.delay = delayOriginal + opts.stagger.call(element, elementIndex, elementsLength);
                        }

                        /* If the drag option was passed in, successively increase/decrease (depending on the presense of opts.backwards)
                           the duration of each element's animation, using floors to prevent producing very short durations. */
                        if (opts.drag) {
                            /* Default the duration of UI pack effects (callouts and transitions) to 1000ms instead of the usual default duration of 400ms. */
                            opts.duration = parseFloat(durationOriginal) || (/^(callout|transition)/.test(propertiesMap) ? 1000 : DURATION_DEFAULT);

                            /* For each element, take the greater duration of: A) animation completion percentage relative to the original duration,
                               B) 75% of the original duration, or C) a 200ms fallback (in case duration is already set to a low value).
                               The end result is a baseline of 75% of the redirect's duration that increases/decreases as the end of the element set is approached. */
                            opts.duration = Math.max(opts.duration * (opts.backwards ? 1 - elementIndex/elementsLength : (elementIndex + 1) / elementsLength), opts.duration * 0.75, 200);
                        }

                        /* Pass in the call's opts object so that the redirect can optionally extend it. It defaults to an empty object instead of null to
                           reduce the opts checking logic required inside the redirect. */
                        Velocity.Redirects[propertiesMap].call(element, element, opts || {}, elementIndex, elementsLength, elements, promiseData.promise ? promiseData : undefined);
                    });

                    /* Since the animation logic resides within the redirect's own code, abort the remainder of this call.
                       (The performance overhead up to this point is virtually non-existant.) */
                    /* Note: The jQuery call chain is kept intact by returning the complete element set. */
                    return getChain();
                } else {
                    var abortError = "Velocity: First argument (" + propertiesMap + ") was not a property map, a known action, or a registered redirect. Aborting.";

                    if (promiseData.promise) {
                        promiseData.rejecter(new Error(abortError));
                    } else {
                        console.log(abortError);
                    }

                    return getChain();
                }
        }

        /**************************
            Call-Wide Variables
        **************************/

        /* A container for CSS unit conversion ratios (e.g. %, rem, and em ==> px) that is used to cache ratios across all elements
           being animated in a single Velocity call. Calculating unit ratios necessitates DOM querying and updating, and is therefore
           avoided (via caching) wherever possible. This container is call-wide instead of page-wide to avoid the risk of using stale
           conversion metrics across Velocity animations that are not immediately consecutively chained. */
        var callUnitConversionData = {
                lastParent: null,
                lastPosition: null,
                lastFontSize: null,
                lastPercentToPxWidth: null,
                lastPercentToPxHeight: null,
                lastEmToPx: null,
                remToPx: null,
                vwToPx: null,
                vhToPx: null
            };

        /* A container for all the ensuing tween data and metadata associated with this call. This container gets pushed to the page-wide
           Velocity.State.calls array that is processed during animation ticking. */
        var call = [];

        /************************
           Element Processing
        ************************/

        /* Element processing consists of three parts -- data processing that cannot go stale and data processing that *can* go stale (i.e. third-party style modifications):
           1) Pre-Queueing: Element-wide variables, including the element's data storage, are instantiated. Call options are prepared. If triggered, the Stop action is executed.
           2) Queueing: The logic that runs once this call has reached its point of execution in the element's $.queue() stack. Most logic is placed here to avoid risking it becoming stale.
           3) Pushing: Consolidation of the tween data followed by its push onto the global in-progress calls container.
        */

        function processElement () {

            /*************************
               Part I: Pre-Queueing
            *************************/

            /***************************
               Element-Wide Variables
            ***************************/

            var element = this,
                /* The runtime opts object is the extension of the current call's options and Velocity's page-wide option defaults. */
                opts = $.extend({}, Velocity.defaults, options),
                /* A container for the processed data associated with each property in the propertyMap.
                   (Each property in the map produces its own "tween".) */
                tweensContainer = {},
                elementUnitConversionData;

            /******************
               Element Init
            ******************/

            if (Data(element) === undefined) {
                Velocity.init(element);
            }

            /******************
               Option: Delay
            ******************/

            /* Since queue:false doesn't respect the item's existing queue, we avoid injecting its delay here (it's set later on). */
            /* Note: Velocity rolls its own delay function since jQuery doesn't have a utility alias for $.fn.delay()
               (and thus requires jQuery element creation, which we avoid since its overhead includes DOM querying). */
            if (parseFloat(opts.delay) && opts.queue !== false) {
                $.queue(element, opts.queue, function(next) {
                    /* This is a flag used to indicate to the upcoming completeCall() function that this queue entry was initiated by Velocity. See completeCall() for further details. */
                    Velocity.velocityQueueEntryFlag = true;

                    /* The ensuing queue item (which is assigned to the "next" argument that $.queue() automatically passes in) will be triggered after a setTimeout delay.
                       The setTimeout is stored so that it can be subjected to clearTimeout() if this animation is prematurely stopped via Velocity's "stop" command. */
                    Data(element).delayTimer = {
                        setTimeout: setTimeout(next, parseFloat(opts.delay)),
                        next: next
                    };
                });
            }

            /*********************
               Option: Duration
            *********************/

            /* Support for jQuery's named durations. */
            switch (opts.duration.toString().toLowerCase()) {
                case "fast":
                    opts.duration = 200;
                    break;

                case "normal":
                    opts.duration = DURATION_DEFAULT;
                    break;

                case "slow":
                    opts.duration = 600;
                    break;

                default:
                    /* Remove the potential "ms" suffix and default to 1 if the user is attempting to set a duration of 0 (in order to produce an immediate style change). */
                    opts.duration = parseFloat(opts.duration) || 1;
            }

            /************************
               Global Option: Mock
            ************************/

            if (Velocity.mock !== false) {
                /* In mock mode, all animations are forced to 1ms so that they occur immediately upon the next rAF tick.
                   Alternatively, a multiplier can be passed in to time remap all delays and durations. */
                if (Velocity.mock === true) {
                    opts.duration = opts.delay = 1;
                } else {
                    opts.duration *= parseFloat(Velocity.mock) || 1;
                    opts.delay *= parseFloat(Velocity.mock) || 1;
                }
            }

            /*******************
               Option: Easing
            *******************/

            opts.easing = getEasing(opts.easing, opts.duration);

            /**********************
               Option: Callbacks
            **********************/

            /* Callbacks must functions. Otherwise, default to null. */
            if (opts.begin && !Type.isFunction(opts.begin)) {
                opts.begin = null;
            }

            if (opts.progress && !Type.isFunction(opts.progress)) {
                opts.progress = null;
            }

            if (opts.complete && !Type.isFunction(opts.complete)) {
                opts.complete = null;
            }

            /*********************************
               Option: Display & Visibility
            *********************************/

            /* Refer to Velocity's documentation (VelocityJS.org/#displayAndVisibility) for a description of the display and visibility options' behavior. */
            /* Note: We strictly check for undefined instead of falsiness because display accepts an empty string value. */
            if (opts.display !== undefined && opts.display !== null) {
                opts.display = opts.display.toString().toLowerCase();

                /* Users can pass in a special "auto" value to instruct Velocity to set the element to its default display value. */
                if (opts.display === "auto") {
                    opts.display = Velocity.CSS.Values.getDisplayType(element);
                }
            }

            if (opts.visibility !== undefined && opts.visibility !== null) {
                opts.visibility = opts.visibility.toString().toLowerCase();
            }

            /**********************
               Option: mobileHA
            **********************/

            /* When set to true, and if this is a mobile device, mobileHA automatically enables hardware acceleration (via a null transform hack)
               on animating elements. HA is removed from the element at the completion of its animation. */
            /* Note: Android Gingerbread doesn't support HA. If a null transform hack (mobileHA) is in fact set, it will prevent other tranform subproperties from taking effect. */
            /* Note: You can read more about the use of mobileHA in Velocity's documentation: VelocityJS.org/#mobileHA. */
            opts.mobileHA = (opts.mobileHA && Velocity.State.isMobile && !Velocity.State.isGingerbread);

            /***********************
               Part II: Queueing
            ***********************/

            /* When a set of elements is targeted by a Velocity call, the set is broken up and each element has the current Velocity call individually queued onto it.
               In this way, each element's existing queue is respected; some elements may already be animating and accordingly should not have this current Velocity call triggered immediately. */
            /* In each queue, tween data is processed for each animating property then pushed onto the call-wide calls array. When the last element in the set has had its tweens processed,
               the call array is pushed to Velocity.State.calls for live processing by the requestAnimationFrame tick. */
            function buildQueue (next) {

                /*******************
                   Option: Begin
                *******************/

                /* The begin callback is fired once per call -- not once per elemenet -- and is passed the full raw DOM element set as both its context and its first argument. */
                if (opts.begin && elementsIndex === 0) {
                    /* We throw callbacks in a setTimeout so that thrown errors don't halt the execution of Velocity itself. */
                    try {
                        opts.begin.call(elements, elements);
                    } catch (error) {
                        setTimeout(function() { throw error; }, 1);
                    }
                }

                /*****************************************
                   Tween Data Construction (for Scroll)
                *****************************************/

                /* Note: In order to be subjected to chaining and animation options, scroll's tweening is routed through Velocity as if it were a standard CSS property animation. */
                if (action === "scroll") {
                    /* The scroll action uniquely takes an optional "offset" option -- specified in pixels -- that offsets the targeted scroll position. */
                    var scrollDirection = (/^x$/i.test(opts.axis) ? "Left" : "Top"),
                        scrollOffset = parseFloat(opts.offset) || 0,
                        scrollPositionCurrent,
                        scrollPositionCurrentAlternate,
                        scrollPositionEnd;

                    /* Scroll also uniquely takes an optional "container" option, which indicates the parent element that should be scrolled --
                       as opposed to the browser window itself. This is useful for scrolling toward an element that's inside an overflowing parent element. */
                    if (opts.container) {
                        /* Ensure that either a jQuery object or a raw DOM element was passed in. */
                        if (Type.isWrapped(opts.container) || Type.isNode(opts.container)) {
                            /* Extract the raw DOM element from the jQuery wrapper. */
                            opts.container = opts.container[0] || opts.container;
                            /* Note: Unlike other properties in Velocity, the browser's scroll position is never cached since it so frequently changes
                               (due to the user's natural interaction with the page). */
                            scrollPositionCurrent = opts.container["scroll" + scrollDirection]; /* GET */

                            /* $.position() values are relative to the container's currently viewable area (without taking into account the container's true dimensions
                               -- say, for example, if the container was not overflowing). Thus, the scroll end value is the sum of the child element's position *and*
                               the scroll container's current scroll position. */
                            /* Note: jQuery does not offer a utility alias for $.position(), so we have to incur jQuery object conversion here.
                               This syncs up with an ensuing batch of GETs, so it fortunately does not trigger layout thrashing. */
                            scrollPositionEnd = (scrollPositionCurrent + $(element).position()[scrollDirection.toLowerCase()]) + scrollOffset; /* GET */
                        /* If a value other than a jQuery object or a raw DOM element was passed in, default to null so that this option is ignored. */
                        } else {
                            opts.container = null;
                        }
                    } else {
                        /* If the window itself is being scrolled -- not a containing element -- perform a live scroll position lookup using
                           the appropriate cached property names (which differ based on browser type). */
                        scrollPositionCurrent = Velocity.State.scrollAnchor[Velocity.State["scrollProperty" + scrollDirection]]; /* GET */
                        /* When scrolling the browser window, cache the alternate axis's current value since window.scrollTo() doesn't let us change only one value at a time. */
                        scrollPositionCurrentAlternate = Velocity.State.scrollAnchor[Velocity.State["scrollProperty" + (scrollDirection === "Left" ? "Top" : "Left")]]; /* GET */

                        /* Unlike $.position(), $.offset() values are relative to the browser window's true dimensions -- not merely its currently viewable area --
                           and therefore end values do not need to be compounded onto current values. */
                        scrollPositionEnd = $(element).offset()[scrollDirection.toLowerCase()] + scrollOffset; /* GET */
                    }

                    /* Since there's only one format that scroll's associated tweensContainer can take, we create it manually. */
                    tweensContainer = {
                        scroll: {
                            rootPropertyValue: false,
                            startValue: scrollPositionCurrent,
                            currentValue: scrollPositionCurrent,
                            endValue: scrollPositionEnd,
                            unitType: "",
                            easing: opts.easing,
                            scrollData: {
                                container: opts.container,
                                direction: scrollDirection,
                                alternateValue: scrollPositionCurrentAlternate
                            }
                        },
                        element: element
                    };

                    if (Velocity.debug) console.log("tweensContainer (scroll): ", tweensContainer.scroll, element);

                /******************************************
                   Tween Data Construction (for Reverse)
                ******************************************/

                /* Reverse acts like a "start" action in that a property map is animated toward. The only difference is
                   that the property map used for reverse is the inverse of the map used in the previous call. Thus, we manipulate
                   the previous call to construct our new map: use the previous map's end values as our new map's start values. Copy over all other data. */
                /* Note: Reverse can be directly called via the "reverse" parameter, or it can be indirectly triggered via the loop option. (Loops are composed of multiple reverses.) */
                /* Note: Reverse calls do not need to be consecutively chained onto a currently-animating element in order to operate on cached values;
                   there is no harm to reverse being called on a potentially stale data cache since reverse's behavior is simply defined
                   as reverting to the element's values as they were prior to the previous *Velocity* call. */
                } else if (action === "reverse") {
                    /* Abort if there is no prior animation data to reverse to. */
                    if (!Data(element).tweensContainer) {
                        /* Dequeue the element so that this queue entry releases itself immediately, allowing subsequent queue entries to run. */
                        $.dequeue(element, opts.queue);

                        return;
                    } else {
                        /*********************
                           Options Parsing
                        *********************/

                        /* If the element was hidden via the display option in the previous call,
                           revert display to "auto" prior to reversal so that the element is visible again. */
                        if (Data(element).opts.display === "none") {
                            Data(element).opts.display = "auto";
                        }

                        if (Data(element).opts.visibility === "hidden") {
                            Data(element).opts.visibility = "visible";
                        }

                        /* If the loop option was set in the previous call, disable it so that "reverse" calls aren't recursively generated.
                           Further, remove the previous call's callback options; typically, users do not want these to be refired. */
                        Data(element).opts.loop = false;
                        Data(element).opts.begin = null;
                        Data(element).opts.complete = null;

                        /* Since we're extending an opts object that has already been extended with the defaults options object,
                           we remove non-explicitly-defined properties that are auto-assigned values. */
                        if (!options.easing) {
                            delete opts.easing;
                        }

                        if (!options.duration) {
                            delete opts.duration;
                        }

                        /* The opts object used for reversal is an extension of the options object optionally passed into this
                           reverse call plus the options used in the previous Velocity call. */
                        opts = $.extend({}, Data(element).opts, opts);

                        /*************************************
                           Tweens Container Reconstruction
                        *************************************/

                        /* Create a deepy copy (indicated via the true flag) of the previous call's tweensContainer. */
                        var lastTweensContainer = $.extend(true, {}, Data(element).tweensContainer);

                        /* Manipulate the previous tweensContainer by replacing its end values and currentValues with its start values. */
                        for (var lastTween in lastTweensContainer) {
                            /* In addition to tween data, tweensContainers contain an element property that we ignore here. */
                            if (lastTween !== "element") {
                                var lastStartValue = lastTweensContainer[lastTween].startValue;

                                lastTweensContainer[lastTween].startValue = lastTweensContainer[lastTween].currentValue = lastTweensContainer[lastTween].endValue;
                                lastTweensContainer[lastTween].endValue = lastStartValue;

                                /* Easing is the only option that embeds into the individual tween data (since it can be defined on a per-property basis).
                                   Accordingly, every property's easing value must be updated when an options object is passed in with a reverse call.
                                   The side effect of this extensibility is that all per-property easing values are forcefully reset to the new value. */
                                if (!Type.isEmptyObject(options)) {
                                    lastTweensContainer[lastTween].easing = opts.easing;
                                }

                                if (Velocity.debug) console.log("reverse tweensContainer (" + lastTween + "): " + JSON.stringify(lastTweensContainer[lastTween]), element);
                            }
                        }

                        tweensContainer = lastTweensContainer;
                    }

                /*****************************************
                   Tween Data Construction (for Start)
                *****************************************/

                } else if (action === "start") {

                    /*************************
                        Value Transferring
                    *************************/

                    /* If this queue entry follows a previous Velocity-initiated queue entry *and* if this entry was created
                       while the element was in the process of being animated by Velocity, then this current call is safe to use
                       the end values from the prior call as its start values. Velocity attempts to perform this value transfer
                       process whenever possible in order to avoid requerying the DOM. */
                    /* If values aren't transferred from a prior call and start values were not forcefed by the user (more on this below),
                       then the DOM is queried for the element's current values as a last resort. */
                    /* Note: Conversely, animation reversal (and looping) *always* perform inter-call value transfers; they never requery the DOM. */
                    var lastTweensContainer;

                    /* The per-element isAnimating flag is used to indicate whether it's safe (i.e. the data isn't stale)
                       to transfer over end values to use as start values. If it's set to true and there is a previous
                       Velocity call to pull values from, do so. */
                    if (Data(element).tweensContainer && Data(element).isAnimating === true) {
                        lastTweensContainer = Data(element).tweensContainer;
                    }

                    /***************************
                       Tween Data Calculation
                    ***************************/

                    /* This function parses property data and defaults endValue, easing, and startValue as appropriate. */
                    /* Property map values can either take the form of 1) a single value representing the end value,
                       or 2) an array in the form of [ endValue, [, easing] [, startValue] ].
                       The optional third parameter is a forcefed startValue to be used instead of querying the DOM for
                       the element's current value. Read Velocity's docmentation to learn more about forcefeeding: VelocityJS.org/#forcefeeding */
                    function parsePropertyValue (valueData, skipResolvingEasing) {
                        var endValue = undefined,
                            easing = undefined,
                            startValue = undefined;

                        /* Handle the array format, which can be structured as one of three potential overloads:
                           A) [ endValue, easing, startValue ], B) [ endValue, easing ], or C) [ endValue, startValue ] */
                        if (Type.isArray(valueData)) {
                            /* endValue is always the first item in the array. Don't bother validating endValue's value now
                               since the ensuing property cycling logic does that. */
                            endValue = valueData[0];

                            /* Two-item array format: If the second item is a number, function, or hex string, treat it as a
                               start value since easings can only be non-hex strings or arrays. */
                            if ((!Type.isArray(valueData[1]) && /^[\d-]/.test(valueData[1])) || Type.isFunction(valueData[1]) || CSS.RegEx.isHex.test(valueData[1])) {
                                startValue = valueData[1];
                            /* Two or three-item array: If the second item is a non-hex string or an array, treat it as an easing. */
                            } else if ((Type.isString(valueData[1]) && !CSS.RegEx.isHex.test(valueData[1])) || Type.isArray(valueData[1])) {
                                easing = skipResolvingEasing ? valueData[1] : getEasing(valueData[1], opts.duration);

                                /* Don't bother validating startValue's value now since the ensuing property cycling logic inherently does that. */
                                if (valueData[2] !== undefined) {
                                    startValue = valueData[2];
                                }
                            }
                        /* Handle the single-value format. */
                        } else {
                            endValue = valueData;
                        }

                        /* Default to the call's easing if a per-property easing type was not defined. */
                        if (!skipResolvingEasing) {
                            easing = easing || opts.easing;
                        }

                        /* If functions were passed in as values, pass the function the current element as its context,
                           plus the element's index and the element set's size as arguments. Then, assign the returned value. */
                        if (Type.isFunction(endValue)) {
                            endValue = endValue.call(element, elementsIndex, elementsLength);
                        }

                        if (Type.isFunction(startValue)) {
                            startValue = startValue.call(element, elementsIndex, elementsLength);
                        }

                        /* Allow startValue to be left as undefined to indicate to the ensuing code that its value was not forcefed. */
                        return [ endValue || 0, easing, startValue ];
                    }

                    /* Cycle through each property in the map, looking for shorthand color properties (e.g. "color" as opposed to "colorRed"). Inject the corresponding
                       colorRed, colorGreen, and colorBlue RGB component tweens into the propertiesMap (which Velocity understands) and remove the shorthand property. */
                    $.each(propertiesMap, function(property, value) {
                        /* Find shorthand color properties that have been passed a hex string. */
                        if (RegExp("^" + CSS.Lists.colors.join("$|^") + "$").test(property)) {
                            /* Parse the value data for each shorthand. */
                            var valueData = parsePropertyValue(value, true),
                                endValue = valueData[0],
                                easing = valueData[1],
                                startValue = valueData[2];

                            if (CSS.RegEx.isHex.test(endValue)) {
                                /* Convert the hex strings into their RGB component arrays. */
                                var colorComponents = [ "Red", "Green", "Blue" ],
                                    endValueRGB = CSS.Values.hexToRgb(endValue),
                                    startValueRGB = startValue ? CSS.Values.hexToRgb(startValue) : undefined;

                                /* Inject the RGB component tweens into propertiesMap. */
                                for (var i = 0; i < colorComponents.length; i++) {
                                    var dataArray = [ endValueRGB[i] ];

                                    if (easing) {
                                        dataArray.push(easing);
                                    }

                                    if (startValueRGB !== undefined) {
                                        dataArray.push(startValueRGB[i]);
                                    }

                                    propertiesMap[property + colorComponents[i]] = dataArray;
                                }

                                /* Remove the intermediary shorthand property entry now that we've processed it. */
                                delete propertiesMap[property];
                            }
                        }
                    });

                    /* Create a tween out of each property, and append its associated data to tweensContainer. */
                    for (var property in propertiesMap) {

                        /**************************
                           Start Value Sourcing
                        **************************/

                        /* Parse out endValue, easing, and startValue from the property's data. */
                        var valueData = parsePropertyValue(propertiesMap[property]),
                            endValue = valueData[0],
                            easing = valueData[1],
                            startValue = valueData[2];

                        /* Now that the original property name's format has been used for the parsePropertyValue() lookup above,
                           we force the property to its camelCase styling to normalize it for manipulation. */
                        property = CSS.Names.camelCase(property);

                        /* In case this property is a hook, there are circumstances where we will intend to work on the hook's root property and not the hooked subproperty. */
                        var rootProperty = CSS.Hooks.getRoot(property),
                            rootPropertyValue = false;

                        /* Properties that are not supported by the browser (and do not have an associated normalization) will
                           inherently produce no style changes when set, so they are skipped in order to decrease animation tick overhead.
                           Property support is determined via prefixCheck(), which returns a false flag when no supported is detected. */
                        /* Note: Since SVG elements have some of their properties directly applied as HTML attributes,
                           there is no way to check for their explicit browser support, and so we skip skip this check for them. */
                        if (!Data(element).isSVG && CSS.Names.prefixCheck(rootProperty)[1] === false && CSS.Normalizations.registered[rootProperty] === undefined) {
                            if (Velocity.debug) console.log("Skipping [" + rootProperty + "] due to a lack of browser support.");

                            continue;
                        }

                        /* If the display option is being set to a non-"none" (e.g. "block") and opacity (filter on IE<=8) is being
                           animated to an endValue of non-zero, the user's intention is to fade in from invisible, thus we forcefeed opacity
                           a startValue of 0 if its startValue hasn't already been sourced by value transferring or prior forcefeeding. */
                        if (((opts.display !== undefined && opts.display !== null && opts.display !== "none") || (opts.visibility !== undefined && opts.visibility !== "hidden")) && /opacity|filter/.test(property) && !startValue && endValue !== 0) {
                            startValue = 0;
                        }

                        /* If values have been transferred from the previous Velocity call, extract the endValue and rootPropertyValue
                           for all of the current call's properties that were *also* animated in the previous call. */
                        /* Note: Value transferring can optionally be disabled by the user via the _cacheValues option. */
                        if (opts._cacheValues && lastTweensContainer && lastTweensContainer[property]) {
                            if (startValue === undefined) {
                                startValue = lastTweensContainer[property].endValue + lastTweensContainer[property].unitType;
                            }

                            /* The previous call's rootPropertyValue is extracted from the element's data cache since that's the
                               instance of rootPropertyValue that gets freshly updated by the tweening process, whereas the rootPropertyValue
                               attached to the incoming lastTweensContainer is equal to the root property's value prior to any tweening. */
                            rootPropertyValue = Data(element).rootPropertyValueCache[rootProperty];
                        /* If values were not transferred from a previous Velocity call, query the DOM as needed. */
                        } else {
                            /* Handle hooked properties. */
                            if (CSS.Hooks.registered[property]) {
                               if (startValue === undefined) {
                                    rootPropertyValue = CSS.getPropertyValue(element, rootProperty); /* GET */
                                    /* Note: The following getPropertyValue() call does not actually trigger a DOM query;
                                       getPropertyValue() will extract the hook from rootPropertyValue. */
                                    startValue = CSS.getPropertyValue(element, property, rootPropertyValue);
                                /* If startValue is already defined via forcefeeding, do not query the DOM for the root property's value;
                                   just grab rootProperty's zero-value template from CSS.Hooks. This overwrites the element's actual
                                   root property value (if one is set), but this is acceptable since the primary reason users forcefeed is
                                   to avoid DOM queries, and thus we likewise avoid querying the DOM for the root property's value. */
                                } else {
                                    /* Grab this hook's zero-value template, e.g. "0px 0px 0px black". */
                                    rootPropertyValue = CSS.Hooks.templates[rootProperty][1];
                                }
                            /* Handle non-hooked properties that haven't already been defined via forcefeeding. */
                            } else if (startValue === undefined) {
                                startValue = CSS.getPropertyValue(element, property); /* GET */
                            }
                        }

                        /**************************
                           Value Data Extraction
                        **************************/

                        var separatedValue,
                            endValueUnitType,
                            startValueUnitType,
                            operator = false;

                        /* Separates a property value into its numeric value and its unit type. */
                        function separateValue (property, value) {
                            var unitType,
                                numericValue;

                            numericValue = (value || "0")
                                .toString()
                                .toLowerCase()
                                /* Match the unit type at the end of the value. */
                                .replace(/[%A-z]+$/, function(match) {
                                    /* Grab the unit type. */
                                    unitType = match;

                                    /* Strip the unit type off of value. */
                                    return "";
                                });

                            /* If no unit type was supplied, assign one that is appropriate for this property (e.g. "deg" for rotateZ or "px" for width). */
                            if (!unitType) {
                                unitType = CSS.Values.getUnitType(property);
                            }

                            return [ numericValue, unitType ];
                        }

                        /* Separate startValue. */
                        separatedValue = separateValue(property, startValue);
                        startValue = separatedValue[0];
                        startValueUnitType = separatedValue[1];

                        /* Separate endValue, and extract a value operator (e.g. "+=", "-=") if one exists. */
                        separatedValue = separateValue(property, endValue);
                        endValue = separatedValue[0].replace(/^([+-\/*])=/, function(match, subMatch) {
                            operator = subMatch;

                            /* Strip the operator off of the value. */
                            return "";
                        });
                        endValueUnitType = separatedValue[1];

                        /* Parse float values from endValue and startValue. Default to 0 if NaN is returned. */
                        startValue = parseFloat(startValue) || 0;
                        endValue = parseFloat(endValue) || 0;

                        /***************************************
                           Property-Specific Value Conversion
                        ***************************************/

                        /* Custom support for properties that don't actually accept the % unit type, but where pollyfilling is trivial and relatively foolproof. */
                        if (endValueUnitType === "%") {
                            /* A %-value fontSize/lineHeight is relative to the parent's fontSize (as opposed to the parent's dimensions),
                               which is identical to the em unit's behavior, so we piggyback off of that. */
                            if (/^(fontSize|lineHeight)$/.test(property)) {
                                /* Convert % into an em decimal value. */
                                endValue = endValue / 100;
                                endValueUnitType = "em";
                            /* For scaleX and scaleY, convert the value into its decimal format and strip off the unit type. */
                            } else if (/^scale/.test(property)) {
                                endValue = endValue / 100;
                                endValueUnitType = "";
                            /* For RGB components, take the defined percentage of 255 and strip off the unit type. */
                            } else if (/(Red|Green|Blue)$/i.test(property)) {
                                endValue = (endValue / 100) * 255;
                                endValueUnitType = "";
                            }
                        }

                        /***************************
                           Unit Ratio Calculation
                        ***************************/

                        /* When queried, the browser returns (most) CSS property values in pixels. Therefore, if an endValue with a unit type of
                           %, em, or rem is animated toward, startValue must be converted from pixels into the same unit type as endValue in order
                           for value manipulation logic (increment/decrement) to proceed. Further, if the startValue was forcefed or transferred
                           from a previous call, startValue may also not be in pixels. Unit conversion logic therefore consists of two steps:
                           1) Calculating the ratio of %/em/rem/vh/vw relative to pixels
                           2) Converting startValue into the same unit of measurement as endValue based on these ratios. */
                        /* Unit conversion ratios are calculated by inserting a sibling node next to the target node, copying over its position property,
                           setting values with the target unit type then comparing the returned pixel value. */
                        /* Note: Even if only one of these unit types is being animated, all unit ratios are calculated at once since the overhead
                           of batching the SETs and GETs together upfront outweights the potential overhead
                           of layout thrashing caused by re-querying for uncalculated ratios for subsequently-processed properties. */
                        /* Todo: Shift this logic into the calls' first tick instance so that it's synced with RAF. */
                        function calculateUnitRatios () {

                            /************************
                                Same Ratio Checks
                            ************************/

                            /* The properties below are used to determine whether the element differs sufficiently from this call's
                               previously iterated element to also differ in its unit conversion ratios. If the properties match up with those
                               of the prior element, the prior element's conversion ratios are used. Like most optimizations in Velocity,
                               this is done to minimize DOM querying. */
                            var sameRatioIndicators = {
                                    myParent: element.parentNode || document.body, /* GET */
                                    position: CSS.getPropertyValue(element, "position"), /* GET */
                                    fontSize: CSS.getPropertyValue(element, "fontSize") /* GET */
                                },
                                /* Determine if the same % ratio can be used. % is based on the element's position value and its parent's width and height dimensions. */
                                samePercentRatio = ((sameRatioIndicators.position === callUnitConversionData.lastPosition) && (sameRatioIndicators.myParent === callUnitConversionData.lastParent)),
                                /* Determine if the same em ratio can be used. em is relative to the element's fontSize. */
                                sameEmRatio = (sameRatioIndicators.fontSize === callUnitConversionData.lastFontSize);

                            /* Store these ratio indicators call-wide for the next element to compare against. */
                            callUnitConversionData.lastParent = sameRatioIndicators.myParent;
                            callUnitConversionData.lastPosition = sameRatioIndicators.position;
                            callUnitConversionData.lastFontSize = sameRatioIndicators.fontSize;

                            /***************************
                               Element-Specific Units
                            ***************************/

                            /* Note: IE8 rounds to the nearest pixel when returning CSS values, thus we perform conversions using a measurement
                               of 100 (instead of 1) to give our ratios a precision of at least 2 decimal values. */
                            var measurement = 100,
                                unitRatios = {};

                            if (!sameEmRatio || !samePercentRatio) {
                                var dummy = Data(element).isSVG ? document.createElementNS("http://www.w3.org/2000/svg", "rect") : document.createElement("div");

                                Velocity.init(dummy);
                                sameRatioIndicators.myParent.appendChild(dummy);

                                /* To accurately and consistently calculate conversion ratios, the element's cascaded overflow and box-sizing are stripped.
                                   Similarly, since width/height can be artificially constrained by their min-/max- equivalents, these are controlled for as well. */
                                /* Note: Overflow must be also be controlled for per-axis since the overflow property overwrites its per-axis values. */
                                $.each([ "overflow", "overflowX", "overflowY" ], function(i, property) {
                                    Velocity.CSS.setPropertyValue(dummy, property, "hidden");
                                });
                                Velocity.CSS.setPropertyValue(dummy, "position", sameRatioIndicators.position);
                                Velocity.CSS.setPropertyValue(dummy, "fontSize", sameRatioIndicators.fontSize);
                                Velocity.CSS.setPropertyValue(dummy, "boxSizing", "content-box");

                                /* width and height act as our proxy properties for measuring the horizontal and vertical % ratios. */
                                $.each([ "minWidth", "maxWidth", "width", "minHeight", "maxHeight", "height" ], function(i, property) {
                                    Velocity.CSS.setPropertyValue(dummy, property, measurement + "%");
                                });
                                /* paddingLeft arbitrarily acts as our proxy property for the em ratio. */
                                Velocity.CSS.setPropertyValue(dummy, "paddingLeft", measurement + "em");

                                /* Divide the returned value by the measurement to get the ratio between 1% and 1px. Default to 1 since working with 0 can produce Infinite. */
                                unitRatios.percentToPxWidth = callUnitConversionData.lastPercentToPxWidth = (parseFloat(CSS.getPropertyValue(dummy, "width", null, true)) || 1) / measurement; /* GET */
                                unitRatios.percentToPxHeight = callUnitConversionData.lastPercentToPxHeight = (parseFloat(CSS.getPropertyValue(dummy, "height", null, true)) || 1) / measurement; /* GET */
                                unitRatios.emToPx = callUnitConversionData.lastEmToPx = (parseFloat(CSS.getPropertyValue(dummy, "paddingLeft")) || 1) / measurement; /* GET */

                                sameRatioIndicators.myParent.removeChild(dummy);
                            } else {
                                unitRatios.emToPx = callUnitConversionData.lastEmToPx;
                                unitRatios.percentToPxWidth = callUnitConversionData.lastPercentToPxWidth;
                                unitRatios.percentToPxHeight = callUnitConversionData.lastPercentToPxHeight;
                            }

                            /***************************
                               Element-Agnostic Units
                            ***************************/

                            /* Whereas % and em ratios are determined on a per-element basis, the rem unit only needs to be checked
                               once per call since it's exclusively dependant upon document.body's fontSize. If this is the first time
                               that calculateUnitRatios() is being run during this call, remToPx will still be set to its default value of null,
                               so we calculate it now. */
                            if (callUnitConversionData.remToPx === null) {
                                /* Default to browsers' default fontSize of 16px in the case of 0. */
                                callUnitConversionData.remToPx = parseFloat(CSS.getPropertyValue(document.body, "fontSize")) || 16; /* GET */
                            }

                            /* Similarly, viewport units are %-relative to the window's inner dimensions. */
                            if (callUnitConversionData.vwToPx === null) {
                                callUnitConversionData.vwToPx = parseFloat(window.innerWidth) / 100; /* GET */
                                callUnitConversionData.vhToPx = parseFloat(window.innerHeight) / 100; /* GET */
                            }

                            unitRatios.remToPx = callUnitConversionData.remToPx;
                            unitRatios.vwToPx = callUnitConversionData.vwToPx;
                            unitRatios.vhToPx = callUnitConversionData.vhToPx;

                            if (Velocity.debug >= 1) console.log("Unit ratios: " + JSON.stringify(unitRatios), element);

                            return unitRatios;
                        }

                        /********************
                           Unit Conversion
                        ********************/

                        /* The * and / operators, which are not passed in with an associated unit, inherently use startValue's unit. Skip value and unit conversion. */
                        if (/[\/*]/.test(operator)) {
                            endValueUnitType = startValueUnitType;
                        /* If startValue and endValue differ in unit type, convert startValue into the same unit type as endValue so that if endValueUnitType
                           is a relative unit (%, em, rem), the values set during tweening will continue to be accurately relative even if the metrics they depend
                           on are dynamically changing during the course of the animation. Conversely, if we always normalized into px and used px for setting values, the px ratio
                           would become stale if the original unit being animated toward was relative and the underlying metrics change during the animation. */
                        /* Since 0 is 0 in any unit type, no conversion is necessary when startValue is 0 -- we just start at 0 with endValueUnitType. */
                        } else if ((startValueUnitType !== endValueUnitType) && startValue !== 0) {
                            /* Unit conversion is also skipped when endValue is 0, but *startValueUnitType* must be used for tween values to remain accurate. */
                            /* Note: Skipping unit conversion here means that if endValueUnitType was originally a relative unit, the animation won't relatively
                               match the underlying metrics if they change, but this is acceptable since we're animating toward invisibility instead of toward visibility,
                               which remains past the point of the animation's completion. */
                            if (endValue === 0) {
                                endValueUnitType = startValueUnitType;
                            } else {
                                /* By this point, we cannot avoid unit conversion (it's undesirable since it causes layout thrashing).
                                   If we haven't already, we trigger calculateUnitRatios(), which runs once per element per call. */
                                elementUnitConversionData = elementUnitConversionData || calculateUnitRatios();

                                /* The following RegEx matches CSS properties that have their % values measured relative to the x-axis. */
                                /* Note: W3C spec mandates that all of margin and padding's properties (even top and bottom) are %-relative to the *width* of the parent element. */
                                var axis = (/margin|padding|left|right|width|text|word|letter/i.test(property) || /X$/.test(property) || property === "x") ? "x" : "y";

                                /* In order to avoid generating n^2 bespoke conversion functions, unit conversion is a two-step process:
                                   1) Convert startValue into pixels. 2) Convert this new pixel value into endValue's unit type. */
                                switch (startValueUnitType) {
                                    case "%":
                                        /* Note: translateX and translateY are the only properties that are %-relative to an element's own dimensions -- not its parent's dimensions.
                                           Velocity does not include a special conversion process to account for this behavior. Therefore, animating translateX/Y from a % value
                                           to a non-% value will produce an incorrect start value. Fortunately, this sort of cross-unit conversion is rarely done by users in practice. */
                                        startValue *= (axis === "x" ? elementUnitConversionData.percentToPxWidth : elementUnitConversionData.percentToPxHeight);
                                        break;

                                    case "px":
                                        /* px acts as our midpoint in the unit conversion process; do nothing. */
                                        break;

                                    default:
                                        startValue *= elementUnitConversionData[startValueUnitType + "ToPx"];
                                }

                                /* Invert the px ratios to convert into to the target unit. */
                                switch (endValueUnitType) {
                                    case "%":
                                        startValue *= 1 / (axis === "x" ? elementUnitConversionData.percentToPxWidth : elementUnitConversionData.percentToPxHeight);
                                        break;

                                    case "px":
                                        /* startValue is already in px, do nothing; we're done. */
                                        break;

                                    default:
                                        startValue *= 1 / elementUnitConversionData[endValueUnitType + "ToPx"];
                                }
                            }
                        }

                        /*********************
                           Relative Values
                        *********************/

                        /* Operator logic must be performed last since it requires unit-normalized start and end values. */
                        /* Note: Relative *percent values* do not behave how most people think; while one would expect "+=50%"
                           to increase the property 1.5x its current value, it in fact increases the percent units in absolute terms:
                           50 points is added on top of the current % value. */
                        switch (operator) {
                            case "+":
                                endValue = startValue + endValue;
                                break;

                            case "-":
                                endValue = startValue - endValue;
                                break;

                            case "*":
                                endValue = startValue * endValue;
                                break;

                            case "/":
                                endValue = startValue / endValue;
                                break;
                        }

                        /**************************
                           tweensContainer Push
                        **************************/

                        /* Construct the per-property tween object, and push it to the element's tweensContainer. */
                        tweensContainer[property] = {
                            rootPropertyValue: rootPropertyValue,
                            startValue: startValue,
                            currentValue: startValue,
                            endValue: endValue,
                            unitType: endValueUnitType,
                            easing: easing
                        };

                        if (Velocity.debug) console.log("tweensContainer (" + property + "): " + JSON.stringify(tweensContainer[property]), element);
                    }

                    /* Along with its property data, store a reference to the element itself onto tweensContainer. */
                    tweensContainer.element = element;
                }

                /*****************
                    Call Push
                *****************/

                /* Note: tweensContainer can be empty if all of the properties in this call's property map were skipped due to not
                   being supported by the browser. The element property is used for checking that the tweensContainer has been appended to. */
                if (tweensContainer.element) {
                    /* Apply the "velocity-animating" indicator class. */
                    CSS.Values.addClass(element, "velocity-animating");

                    /* The call array houses the tweensContainers for each element being animated in the current call. */
                    call.push(tweensContainer);

                    /* Store the tweensContainer and options if we're working on the default effects queue, so that they can be used by the reverse command. */
                    if (opts.queue === "") {
                        Data(element).tweensContainer = tweensContainer;
                        Data(element).opts = opts;
                    }

                    /* Switch on the element's animating flag. */
                    Data(element).isAnimating = true;

                    /* Once the final element in this call's element set has been processed, push the call array onto
                       Velocity.State.calls for the animation tick to immediately begin processing. */
                    if (elementsIndex === elementsLength - 1) {
                        /* To speed up iterating over this array, it is compacted (falsey items -- calls that have completed -- are removed)
                           when its length has ballooned to a point that can impact tick performance. This only becomes necessary when animation
                           has been continuous with many elements over a long period of time; whenever all active calls are completed, completeCall() clears Velocity.State.calls. */
                        if (Velocity.State.calls.length > 10000) {
                            Velocity.State.calls = compactSparseArray(Velocity.State.calls);
                        }

                        /* Add the current call plus its associated metadata (the element set and the call's options) onto the global call container.
                           Anything on this call container is subjected to tick() processing. */
                        Velocity.State.calls.push([ call, elements, opts, null, promiseData.resolver ]);

                        /* If the animation tick isn't running, start it. (Velocity shuts it off when there are no active calls to process.) */
                        if (Velocity.State.isTicking === false) {
                            Velocity.State.isTicking = true;

                            /* Start the tick loop. */
                            tick();
                        }
                    } else {
                        elementsIndex++;
                    }
                }
            }

            /* When the queue option is set to false, the call skips the element's queue and fires immediately. */
            if (opts.queue === false) {
                /* Since this buildQueue call doesn't respect the element's existing queue (which is where a delay option would have been appended),
                   we manually inject the delay property here with an explicit setTimeout. */
                if (opts.delay) {
                    setTimeout(buildQueue, opts.delay);
                } else {
                    buildQueue();
                }
            /* Otherwise, the call undergoes element queueing as normal. */
            /* Note: To interoperate with jQuery, Velocity uses jQuery's own $.queue() stack for queuing logic. */
            } else {
                $.queue(element, opts.queue, function(next, clearQueue) {
                    /* If the clearQueue flag was passed in by the stop command, resolve this call's promise. (Promises can only be resolved once,
                       so it's fine if this is repeatedly triggered for each element in the associated call.) */
                    if (clearQueue === true) {
                        if (promiseData.promise) {
                            promiseData.resolver(elements);
                        }

                        /* Do not continue with animation queueing. */
                        return true;
                    }

                    /* This flag indicates to the upcoming completeCall() function that this queue entry was initiated by Velocity.
                       See completeCall() for further details. */
                    Velocity.velocityQueueEntryFlag = true;

                    buildQueue(next);
                });
            }

            /*********************
                Auto-Dequeuing
            *********************/

            /* As per jQuery's $.queue() behavior, to fire the first non-custom-queue entry on an element, the element
               must be dequeued if its queue stack consists *solely* of the current call. (This can be determined by checking
               for the "inprogress" item that jQuery prepends to active queue stack arrays.) Regardless, whenever the element's
               queue is further appended with additional items -- including $.delay()'s or even $.animate() calls, the queue's
               first entry is automatically fired. This behavior contrasts that of custom queues, which never auto-fire. */
            /* Note: When an element set is being subjected to a non-parallel Velocity call, the animation will not begin until
               each one of the elements in the set has reached the end of its individually pre-existing queue chain. */
            /* Note: Unfortunately, most people don't fully grasp jQuery's powerful, yet quirky, $.queue() function.
               Lean more here: http://stackoverflow.com/questions/1058158/can-somebody-explain-jquery-queue-to-me */
            if ((opts.queue === "" || opts.queue === "fx") && $.queue(element)[0] !== "inprogress") {
                $.dequeue(element);
            }
        }

        /**************************
           Element Set Iteration
        **************************/

        /* If the "nodeType" property exists on the elements variable, we're animating a single element.
           Place it in an array so that $.each() can iterate over it. */
        $.each(elements, function(i, element) {
            /* Ensure each element in a set has a nodeType (is a real element) to avoid throwing errors. */
            if (Type.isNode(element)) {
                processElement.call(element);
            }
        });

        /******************
           Option: Loop
        ******************/

        /* The loop option accepts an integer indicating how many times the element should loop between the values in the
           current call's properties map and the element's property values prior to this call. */
        /* Note: The loop option's logic is performed here -- after element processing -- because the current call needs
           to undergo its queue insertion prior to the loop option generating its series of constituent "reverse" calls,
           which chain after the current call. Two reverse calls (two "alternations") constitute one loop. */
        var opts = $.extend({}, Velocity.defaults, options),
            reverseCallsCount;

        opts.loop = parseInt(opts.loop);
        reverseCallsCount = (opts.loop * 2) - 1;

        if (opts.loop) {
            /* Double the loop count to convert it into its appropriate number of "reverse" calls.
               Subtract 1 from the resulting value since the current call is included in the total alternation count. */
            for (var x = 0; x < reverseCallsCount; x++) {
                /* Since the logic for the reverse action occurs inside Queueing and therefore this call's options object
                   isn't parsed until then as well, the current call's delay option must be explicitly passed into the reverse
                   call so that the delay logic that occurs inside *Pre-Queueing* can process it. */
                var reverseOptions = {
                    delay: opts.delay,
                    progress: opts.progress
                };

                /* If a complete callback was passed into this call, transfer it to the loop redirect's final "reverse" call
                   so that it's triggered when the entire redirect is complete (and not when the very first animation is complete). */
                if (x === reverseCallsCount - 1) {
                    reverseOptions.display = opts.display;
                    reverseOptions.visibility = opts.visibility;
                    reverseOptions.complete = opts.complete;
                }

                animate(elements, "reverse", reverseOptions);
            }
        }

        /***************
            Chaining
        ***************/

        /* Return the elements back to the call chain, with wrapped elements taking precedence in case Velocity was called via the $.fn. extension. */
        return getChain();
    };

    /* Turn Velocity into the animation function, extended with the pre-existing Velocity object. */
    Velocity = $.extend(animate, Velocity);
    /* For legacy support, also expose the literal animate method. */
    Velocity.animate = animate;

    /**************
        Timing
    **************/

    /* Ticker function. */
    var ticker = window.requestAnimationFrame || rAFShim;

    /* Inactive browser tabs pause rAF, which results in all active animations immediately sprinting to their completion states when the tab refocuses.
       To get around this, we dynamically switch rAF to setTimeout (which the browser *doesn't* pause) when the tab loses focus. We skip this for mobile
       devices to avoid wasting battery power on inactive tabs. */
    /* Note: Tab focus detection doesn't work on older versions of IE, but that's okay since they don't support rAF to begin with. */
    if (!Velocity.State.isMobile && document.hidden !== undefined) {
        document.addEventListener("visibilitychange", function() {
            /* Reassign the rAF function (which the global tick() function uses) based on the tab's focus state. */
            if (document.hidden) {
                ticker = function(callback) {
                    /* The tick function needs a truthy first argument in order to pass its internal timestamp check. */
                    return setTimeout(function() { callback(true) }, 16);
                };

                /* The rAF loop has been paused by the browser, so we manually restart the tick. */
                tick();
            } else {
                ticker = window.requestAnimationFrame || rAFShim;
            }
        });
    }

    /************
        Tick
    ************/

    /* Note: All calls to Velocity are pushed to the Velocity.State.calls array, which is fully iterated through upon each tick. */
    function tick (timestamp) {
        /* An empty timestamp argument indicates that this is the first tick occurence since ticking was turned on.
           We leverage this metadata to fully ignore the first tick pass since RAF's initial pass is fired whenever
           the browser's next tick sync time occurs, which results in the first elements subjected to Velocity
           calls being animated out of sync with any elements animated immediately thereafter. In short, we ignore
           the first RAF tick pass so that elements being immediately consecutively animated -- instead of simultaneously animated
           by the same Velocity call -- are properly batched into the same initial RAF tick and consequently remain in sync thereafter. */
        if (timestamp) {
            /* We ignore RAF's high resolution timestamp since it can be significantly offset when the browser is
               under high stress; we opt for choppiness over allowing the browser to drop huge chunks of frames. */
            var timeCurrent = (new Date).getTime();

            /********************
               Call Iteration
            ********************/

            /* Iterate through each active call. */
            for (var i = 0, callsLength = Velocity.State.calls.length; i < callsLength; i++) {
                /* When a Velocity call is completed, its Velocity.State.calls entry is set to false. Continue on to the next call. */
                if (!Velocity.State.calls[i]) {
                    continue;
                }

                /************************
                   Call-Wide Variables
                ************************/

                var callContainer = Velocity.State.calls[i],
                    call = callContainer[0],
                    opts = callContainer[2],
                    timeStart = callContainer[3],
                    firstTick = !!timeStart;

                /* If timeStart is undefined, then this is the first time that this call has been processed by tick().
                   We assign timeStart now so that its value is as close to the real animation start time as possible.
                   (Conversely, had timeStart been defined when this call was added to Velocity.State.calls, the delay
                   between that time and now would cause the first few frames of the tween to be skipped since
                   percentComplete is calculated relative to timeStart.) */
                /* Further, subtract 16ms (the approximate resolution of RAF) from the current time value so that the
                   first tick iteration isn't wasted by animating at 0% tween completion, which would produce the
                   same style value as the element's current value. */
                if (!timeStart) {
                    timeStart = Velocity.State.calls[i][3] = timeCurrent - 16;
                }

                /* The tween's completion percentage is relative to the tween's start time, not the tween's start value
                   (which would result in unpredictable tween durations since JavaScript's timers are not particularly accurate).
                   Accordingly, we ensure that percentComplete does not exceed 1. */
                var percentComplete = Math.min((timeCurrent - timeStart) / opts.duration, 1);

                /**********************
                   Element Iteration
                **********************/

                /* For every call, iterate through each of the elements in its set. */
                for (var j = 0, callLength = call.length; j < callLength; j++) {
                    var tweensContainer = call[j],
                        element = tweensContainer.element;

                    /* Check to see if this element has been deleted midway through the animation by checking for the
                       continued existence of its data cache. If it's gone, skip animating this element. */
                    if (!Data(element)) {
                        continue;
                    }

                    var transformPropertyExists = false;

                    /**********************************
                       Display & Visibility Toggling
                    **********************************/

                    /* If the display option is set to non-"none", set it upfront so that the element can become visible before tweening begins.
                       (Otherwise, display's "none" value is set in completeCall() once the animation has completed.) */
                    if (opts.display !== undefined && opts.display !== null && opts.display !== "none") {
                        if (opts.display === "flex") {
                            var flexValues = [ "-webkit-box", "-moz-box", "-ms-flexbox", "-webkit-flex" ];

                            $.each(flexValues, function(i, flexValue) {
                                CSS.setPropertyValue(element, "display", flexValue);
                            });
                        }

                        CSS.setPropertyValue(element, "display", opts.display);
                    }

                    /* Same goes with the visibility option, but its "none" equivalent is "hidden". */
                    if (opts.visibility !== undefined && opts.visibility !== "hidden") {
                        CSS.setPropertyValue(element, "visibility", opts.visibility);
                    }

                    /************************
                       Property Iteration
                    ************************/

                    /* For every element, iterate through each property. */
                    for (var property in tweensContainer) {
                        /* Note: In addition to property tween data, tweensContainer contains a reference to its associated element. */
                        if (property !== "element") {
                            var tween = tweensContainer[property],
                                currentValue,
                                /* Easing can either be a pre-genereated function or a string that references a pre-registered easing
                                   on the Velocity.Easings object. In either case, return the appropriate easing *function*. */
                                easing = Type.isString(tween.easing) ? Velocity.Easings[tween.easing] : tween.easing;

                            /******************************
                               Current Value Calculation
                            ******************************/

                            /* If this is the last tick pass (if we've reached 100% completion for this tween),
                               ensure that currentValue is explicitly set to its target endValue so that it's not subjected to any rounding. */
                            if (percentComplete === 1) {
                                currentValue = tween.endValue;
                            /* Otherwise, calculate currentValue based on the current delta from startValue. */
                            } else {
                                currentValue = tween.startValue + ((tween.endValue - tween.startValue) * easing(percentComplete));

                                /* If no value change is occurring, don't proceed with DOM updating. */
                                if (!firstTick && (currentValue === tween.currentValue)) {
                                    continue;
                                }
                            }

                            tween.currentValue = currentValue;

                            /******************
                               Hooks: Part I
                            ******************/

                            /* For hooked properties, the newly-updated rootPropertyValueCache is cached onto the element so that it can be used
                               for subsequent hooks in this call that are associated with the same root property. If we didn't cache the updated
                               rootPropertyValue, each subsequent update to the root property in this tick pass would reset the previous hook's
                               updates to rootPropertyValue prior to injection. A nice performance byproduct of rootPropertyValue caching is that
                               subsequently chained animations using the same hookRoot but a different hook can use this cached rootPropertyValue. */
                            if (CSS.Hooks.registered[property]) {
                                var hookRoot = CSS.Hooks.getRoot(property),
                                    rootPropertyValueCache = Data(element).rootPropertyValueCache[hookRoot];

                                if (rootPropertyValueCache) {
                                    tween.rootPropertyValue = rootPropertyValueCache;
                                }
                            }

                            /*****************
                                DOM Update
                            *****************/

                            /* setPropertyValue() returns an array of the property name and property value post any normalization that may have been performed. */
                            /* Note: To solve an IE<=8 positioning bug, the unit type is dropped when setting a property value of 0. */
                            var adjustedSetData = CSS.setPropertyValue(element, /* SET */
                                                                       property,
                                                                       tween.currentValue + (parseFloat(currentValue) === 0 ? "" : tween.unitType),
                                                                       tween.rootPropertyValue,
                                                                       tween.scrollData);

                            /*******************
                               Hooks: Part II
                            *******************/

                            /* Now that we have the hook's updated rootPropertyValue (the post-processed value provided by adjustedSetData), cache it onto the element. */
                            if (CSS.Hooks.registered[property]) {
                                /* Since adjustedSetData contains normalized data ready for DOM updating, the rootPropertyValue needs to be re-extracted from its normalized form. ?? */
                                if (CSS.Normalizations.registered[hookRoot]) {
                                    Data(element).rootPropertyValueCache[hookRoot] = CSS.Normalizations.registered[hookRoot]("extract", null, adjustedSetData[1]);
                                } else {
                                    Data(element).rootPropertyValueCache[hookRoot] = adjustedSetData[1];
                                }
                            }

                            /***************
                               Transforms
                            ***************/

                            /* Flag whether a transform property is being animated so that flushTransformCache() can be triggered once this tick pass is complete. */
                            if (adjustedSetData[0] === "transform") {
                                transformPropertyExists = true;
                            }
                        }
                    }

                    /****************
                        mobileHA
                    ****************/

                    /* If mobileHA is enabled, set the translate3d transform to null to force hardware acceleration.
                       It's safe to override this property since Velocity doesn't actually support its animation (hooks are used in its place). */
                    if (opts.mobileHA) {
                        /* Don't set the null transform hack if we've already done so. */
                        if (Data(element).transformCache.translate3d === undefined) {
                            /* All entries on the transformCache object are later concatenated into a single transform string via flushTransformCache(). */
                            Data(element).transformCache.translate3d = "(0px, 0px, 0px)";

                            transformPropertyExists = true;
                        }
                    }

                    if (transformPropertyExists) {
                        CSS.flushTransformCache(element);
                    }
                }

                /* The non-"none" display value is only applied to an element once -- when its associated call is first ticked through.
                   Accordingly, it's set to false so that it isn't re-processed by this call in the next tick. */
                if (opts.display !== undefined && opts.display !== "none") {
                    Velocity.State.calls[i][2].display = false;
                }
                if (opts.visibility !== undefined && opts.visibility !== "hidden") {
                    Velocity.State.calls[i][2].visibility = false;
                }


                /* Pass the elements and the timing data (percentComplete, msRemaining, and timeStart) into the progress callback. */
                if (opts.progress) {
                    opts.progress.call(callContainer[1],
                                       callContainer[1],
                                       percentComplete,
                                       Math.max(0, (timeStart + opts.duration) - timeCurrent),
                                       timeStart);
                }

                /* If this call has finished tweening, pass its index to completeCall() to handle call cleanup. */
                if (percentComplete === 1) {
                    completeCall(i);
                }
            }
        }

        /* Note: completeCall() sets the isTicking flag to false when the last call on Velocity.State.calls has completed. */
        if (Velocity.State.isTicking) {
            ticker(tick);
        }
    }

    /**********************
        Call Completion
    **********************/

    /* Note: Unlike tick(), which processes all active calls at once, call completion is handled on a per-call basis. */
    function completeCall (callIndex, isStopped) {
        /* Ensure the call exists. */
        if (!Velocity.State.calls[callIndex]) {
            return false;
        }

        /* Pull the metadata from the call. */
        var call = Velocity.State.calls[callIndex][0],
            elements = Velocity.State.calls[callIndex][1],
            opts = Velocity.State.calls[callIndex][2],
            resolver = Velocity.State.calls[callIndex][4];

        var remainingCallsExist = false;

        /*************************
           Element Finalization
        *************************/

        for (var i = 0, callLength = call.length; i < callLength; i++) {
            var element = call[i].element;

            /* If the user set display to "none" (intending to hide the element), set it now that the animation has completed. */
            /* Note: display:none isn't set when calls are manually stopped (via Velocity("stop"). */
            /* Note: Display gets ignored with "reverse" calls and infinite loops, since this behavior would be undesirable. */
            if (!isStopped && !opts.loop) {
                if (opts.display === "none") {
                    CSS.setPropertyValue(element, "display", opts.display);
                }

                if (opts.visibility === "hidden") {
                    CSS.setPropertyValue(element, "visibility", opts.visibility);
                }
            }

            /* If the element's queue is empty (if only the "inprogress" item is left at position 0) or if its queue is about to run
               a non-Velocity-initiated entry, turn off the isAnimating flag. A non-Velocity-initiatied queue entry's logic might alter
               an element's CSS values and thereby cause Velocity's cached value data to go stale. To detect if a queue entry was initiated by Velocity,
               we check for the existence of our special Velocity.queueEntryFlag declaration, which minifiers won't rename since the flag
               is assigned to jQuery's global $ object and thus exists out of Velocity's own scope. */
            if (opts.loop !== true && ($.queue(element)[1] === undefined || !/\.velocityQueueEntryFlag/i.test($.queue(element)[1]))) {
                /* The element may have been deleted. Ensure that its data cache still exists before acting on it. */
                if (Data(element)) {
                    Data(element).isAnimating = false;
                    /* Clear the element's rootPropertyValueCache, which will become stale. */
                    Data(element).rootPropertyValueCache = {};

                    var transformHAPropertyExists = false;
                    /* If any 3D transform subproperty is at its default value (regardless of unit type), remove it. */
                    $.each(CSS.Lists.transforms3D, function(i, transformName) {
                        var defaultValue = /^scale/.test(transformName) ? 1 : 0,
                            currentValue = Data(element).transformCache[transformName];

                        if (Data(element).transformCache[transformName] !== undefined && new RegExp("^\\(" + defaultValue + "[^.]").test(currentValue)) {
                            transformHAPropertyExists = true;

                            delete Data(element).transformCache[transformName];
                        }
                    });

                    /* Mobile devices have hardware acceleration removed at the end of the animation in order to avoid hogging the GPU's memory. */
                    if (opts.mobileHA) {
                        transformHAPropertyExists = true;
                        delete Data(element).transformCache.translate3d;
                    }

                    /* Flush the subproperty removals to the DOM. */
                    if (transformHAPropertyExists) {
                        CSS.flushTransformCache(element);
                    }

                    /* Remove the "velocity-animating" indicator class. */
                    CSS.Values.removeClass(element, "velocity-animating");
                }
            }

            /*********************
               Option: Complete
            *********************/

            /* Complete is fired once per call (not once per element) and is passed the full raw DOM element set as both its context and its first argument. */
            /* Note: Callbacks aren't fired when calls are manually stopped (via Velocity("stop"). */
            if (!isStopped && opts.complete && !opts.loop && (i === callLength - 1)) {
                /* We throw callbacks in a setTimeout so that thrown errors don't halt the execution of Velocity itself. */
                try {
                    opts.complete.call(elements, elements);
                } catch (error) {
                    setTimeout(function() { throw error; }, 1);
                }
            }

            /**********************
               Promise Resolving
            **********************/

            /* Note: Infinite loops don't return promises. */
            if (resolver && opts.loop !== true) {
                resolver(elements);
            }

            /****************************
               Option: Loop (Infinite)
            ****************************/

            if (opts.loop === true && !isStopped) {
                /* If a rotateX/Y/Z property is being animated to 360 deg with loop:true, swap tween start/end values to enable
                   continuous iterative rotation looping. (Otherise, the element would just rotate back and forth.) */
                $.each(Data(element).tweensContainer, function(propertyName, tweenContainer) {
                    if (/^rotate/.test(propertyName) && parseFloat(tweenContainer.endValue) === 360) {
                        tweenContainer.endValue = 0;
                        tweenContainer.startValue = 360;
                    }
                });

                Velocity(element, "reverse", { loop: true, delay: opts.delay });
            }

            /***************
               Dequeueing
            ***************/

            /* Fire the next call in the queue so long as this call's queue wasn't set to false (to trigger a parallel animation),
               which would have already caused the next call to fire. Note: Even if the end of the animation queue has been reached,
               $.dequeue() must still be called in order to completely clear jQuery's animation queue. */
            if (opts.queue !== false) {
                $.dequeue(element, opts.queue);
            }
        }

        /************************
           Calls Array Cleanup
        ************************/

        /* Since this call is complete, set it to false so that the rAF tick skips it. This array is later compacted via compactSparseArray().
          (For performance reasons, the call is set to false instead of being deleted from the array: http://www.html5rocks.com/en/tutorials/speed/v8/) */
        Velocity.State.calls[callIndex] = false;

        /* Iterate through the calls array to determine if this was the final in-progress animation.
           If so, set a flag to end ticking and clear the calls array. */
        for (var j = 0, callsLength = Velocity.State.calls.length; j < callsLength; j++) {
            if (Velocity.State.calls[j] !== false) {
                remainingCallsExist = true;

                break;
            }
        }

        if (remainingCallsExist === false) {
            /* tick() will detect this flag upon its next iteration and subsequently turn itself off. */
            Velocity.State.isTicking = false;

            /* Clear the calls array so that its length is reset. */
            delete Velocity.State.calls;
            Velocity.State.calls = [];
        }
    }

    /******************
        Frameworks
    ******************/

    /* Both jQuery and Zepto allow their $.fn object to be extended to allow wrapped elements to be subjected to plugin calls.
       If either framework is loaded, register a "velocity" extension pointing to Velocity's core animate() method.  Velocity
       also registers itself onto a global container (window.jQuery || window.Zepto || window) so that certain features are
       accessible beyond just a per-element scope. This master object contains an .animate() method, which is later assigned to $.fn
       (if jQuery or Zepto are present). Accordingly, Velocity can both act on wrapped DOM elements and stand alone for targeting raw DOM elements. */
    global.Velocity = Velocity;

    if (global !== window) {
        /* Assign the element function to Velocity's core animate() method. */
        global.fn.velocity = animate;
        /* Assign the object function's defaults to Velocity's global defaults object. */
        global.fn.velocity.defaults = Velocity.defaults;
    }

    /***********************
       Packaged Redirects
    ***********************/

    /* slideUp, slideDown */
    $.each([ "Down", "Up" ], function(i, direction) {
        Velocity.Redirects["slide" + direction] = function (element, options, elementsIndex, elementsSize, elements, promiseData) {
            var opts = $.extend({}, options),
                begin = opts.begin,
                complete = opts.complete,
                computedValues = { height: "", marginTop: "", marginBottom: "", paddingTop: "", paddingBottom: "" },
                inlineValues = {};

            if (opts.display === undefined) {
                /* Show the element before slideDown begins and hide the element after slideUp completes. */
                /* Note: Inline elements cannot have dimensions animated, so they're reverted to inline-block. */
                opts.display = (direction === "Down" ? (Velocity.CSS.Values.getDisplayType(element) === "inline" ? "inline-block" : "block") : "none");
            }

            opts.begin = function() {
                /* If the user passed in a begin callback, fire it now. */
                begin && begin.call(elements, elements);

                /* Cache the elements' original vertical dimensional property values so that we can animate back to them. */
                for (var property in computedValues) {
                    /* Cache all inline values, we reset to upon animation completion. */
                    inlineValues[property] = element.style[property];

                    /* For slideDown, use forcefeeding to animate all vertical properties from 0. For slideUp,
                       use forcefeeding to start from computed values and animate down to 0. */
                    var propertyValue = Velocity.CSS.getPropertyValue(element, property);
                    computedValues[property] = (direction === "Down") ? [ propertyValue, 0 ] : [ 0, propertyValue ];
                }

                /* Force vertical overflow content to clip so that sliding works as expected. */
                inlineValues.overflow = element.style.overflow;
                element.style.overflow = "hidden";
            }

            opts.complete = function() {
                /* Reset element to its pre-slide inline values once its slide animation is complete. */
                for (var property in inlineValues) {
                    element.style[property] = inlineValues[property];
                }

                /* If the user passed in a complete callback, fire it now. */
                complete && complete.call(elements, elements);
                promiseData && promiseData.resolver(elements);
            };

            Velocity(element, computedValues, opts);
        };
    });

    /* fadeIn, fadeOut */
    $.each([ "In", "Out" ], function(i, direction) {
        Velocity.Redirects["fade" + direction] = function (element, options, elementsIndex, elementsSize, elements, promiseData) {
            var opts = $.extend({}, options),
                propertiesMap = { opacity: (direction === "In") ? 1 : 0 },
                originalComplete = opts.complete;

            /* Since redirects are triggered individually for each element in the animated set, avoid repeatedly triggering
               callbacks by firing them only when the final element has been reached. */
            if (elementsIndex !== elementsSize - 1) {
                opts.complete = opts.begin = null;
            } else {
                opts.complete = function() {
                    if (originalComplete) {
                        originalComplete.call(elements, elements);
                    }

                    promiseData && promiseData.resolver(elements);
                }
            }

            /* If a display was passed in, use it. Otherwise, default to "none" for fadeOut or the element-specific default for fadeIn. */
            /* Note: We allow users to pass in "null" to skip display setting altogether. */
            if (opts.display === undefined) {
                opts.display = (direction === "In" ? "auto" : "none");
            }

            Velocity(this, propertiesMap, opts);
        };
    });

    return Velocity;
}((window.jQuery || window.Zepto || window), window, document);
}));

/******************
   Known Issues
******************/

/* The CSS spec mandates that the translateX/Y/Z transforms are %-relative to the element itself -- not its parent.
Velocity, however, doesn't make this distinction. Thus, converting to or from the % unit with these subproperties
will produce an inaccurate conversion value. The same issue exists with the cx/cy attributes of SVG circles and ellipses. */

/**********************
   Velocity UI Pack
**********************/

/* VelocityJS.org UI Pack (5.0.0). (C) 2014 Julian Shapiro. MIT @license: en.wikipedia.org/wiki/MIT_License. Portions copyright Daniel Eden, Christian Pucci. */

;(function (factory) {
    /* CommonJS module. */
    if (typeof require === "function" && typeof exports === "object" ) {
        module.exports = factory();
    /* AMD module. */
    } else if (typeof define === "function" && define.amd) {
        define([ "velocity" ], factory);
    /* Browser globals. */
    } else {
        factory();
    }
}(function() {
return function (global, window, document, undefined) {

    /*************
        Checks
    *************/

    if (!global.Velocity || !global.Velocity.Utilities) {
        window.console && console.log("Velocity UI Pack: Velocity must be loaded first. Aborting.");
        return;
    } else {
        var Velocity = global.Velocity,
            $ = Velocity.Utilities;
    }

    var velocityVersion = Velocity.version,
        requiredVersion = { major: 1, minor: 1, patch: 0 };

    function greaterSemver (primary, secondary) {
        var versionInts = [];

        if (!primary || !secondary) { return false; }

        $.each([ primary, secondary ], function(i, versionObject) {
            var versionIntsComponents = [];

            $.each(versionObject, function(component, value) {
                while (value.toString().length < 5) {
                    value = "0" + value;
                }
                versionIntsComponents.push(value);
            });

            versionInts.push(versionIntsComponents.join(""))
        });

        return (parseFloat(versionInts[0]) > parseFloat(versionInts[1]));
    }

    if (greaterSemver(requiredVersion, velocityVersion)){
        var abortError = "Velocity UI Pack: You need to update Velocity (jquery.velocity.js) to a newer version. Visit http://github.com/julianshapiro/velocity.";
        alert(abortError);
        throw new Error(abortError);
    }

    /************************
       Effect Registration
    ************************/

    /* Note: RegisterUI is a legacy name. */
    Velocity.RegisterEffect = Velocity.RegisterUI = function (effectName, properties) {
        /* Animate the expansion/contraction of the elements' parent's height for In/Out effects. */
        function animateParentHeight (elements, direction, totalDuration, stagger) {
            var totalHeightDelta = 0,
                parentNode;

            /* Sum the total height (including padding and margin) of all targeted elements. */
            $.each(elements.nodeType ? [ elements ] : elements, function(i, element) {
                if (stagger) {
                    /* Increase the totalDuration by the successive delay amounts produced by the stagger option. */
                    totalDuration += i * stagger;
                }

                parentNode = element.parentNode;

                $.each([ "height", "paddingTop", "paddingBottom", "marginTop", "marginBottom"], function(i, property) {
                    totalHeightDelta += parseFloat(Velocity.CSS.getPropertyValue(element, property));
                });
            });

            /* Animate the parent element's height adjustment (with a varying duration multiplier for aesthetic benefits). */
            Velocity.animate(
                parentNode,
                { height: (direction === "In" ? "+" : "-") + "=" + totalHeightDelta },
                { queue: false, easing: "ease-in-out", duration: totalDuration * (direction === "In" ? 0.6 : 1) }
            );
        }

        /* Register a custom redirect for each effect. */
        Velocity.Redirects[effectName] = function (element, redirectOptions, elementsIndex, elementsSize, elements, promiseData) {
            var finalElement = (elementsIndex === elementsSize - 1);

            if (typeof properties.defaultDuration === "function") {
                properties.defaultDuration = properties.defaultDuration.call(elements, elements);
            } else {
                properties.defaultDuration = parseFloat(properties.defaultDuration);
            }

            /* Iterate through each effect's call array. */
            for (var callIndex = 0; callIndex < properties.calls.length; callIndex++) {
                var call = properties.calls[callIndex],
                    propertyMap = call[0],
                    redirectDuration = (redirectOptions.duration || properties.defaultDuration || 1000),
                    durationPercentage = call[1],
                    callOptions = call[2] || {},
                    opts = {};

                /* Assign the whitelisted per-call options. */
                opts.duration = redirectDuration * (durationPercentage || 1);
                opts.queue = redirectOptions.queue || "";
                opts.easing = callOptions.easing || "ease";
                opts.delay = parseFloat(callOptions.delay) || 0;
                opts._cacheValues = callOptions._cacheValues || true;

                /* Special processing for the first effect call. */
                if (callIndex === 0) {
                    /* If a delay was passed into the redirect, combine it with the first call's delay. */
                    opts.delay += (parseFloat(redirectOptions.delay) || 0);

                    if (elementsIndex === 0) {
                        opts.begin = function() {
                            /* Only trigger a begin callback on the first effect call with the first element in the set. */
                            redirectOptions.begin && redirectOptions.begin.call(elements, elements);

                            var direction = effectName.match(/(In|Out)$/);

                            /* Make "in" transitioning elements invisible immediately so that there's no FOUC between now
                               and the first RAF tick. */
                            if ((direction && direction[0] === "In") && propertyMap.opacity !== undefined) {
                                $.each(elements.nodeType ? [ elements ] : elements, function(i, element) {
                                    Velocity.CSS.setPropertyValue(element, "opacity", 0);
                                });
                            }

                            /* Only trigger animateParentHeight() if we're using an In/Out transition. */
                            if (redirectOptions.animateParentHeight && direction) {
                                animateParentHeight(elements, direction[0], redirectDuration + opts.delay, redirectOptions.stagger);
                            }
                        }
                    }

                    /* If the user isn't overriding the display option, default to "auto" for "In"-suffixed transitions. */
                    if (redirectOptions.display !== null) {
                        if (redirectOptions.display !== undefined && redirectOptions.display !== "none") {
                            opts.display = redirectOptions.display;
                        } else if (/In$/.test(effectName)) {
                            /* Inline elements cannot be subjected to transforms, so we switch them to inline-block. */
                            var defaultDisplay = Velocity.CSS.Values.getDisplayType(element);
                            opts.display = (defaultDisplay === "inline") ? "inline-block" : defaultDisplay;
                        }
                    }

                    if (redirectOptions.visibility && redirectOptions.visibility !== "hidden") {
                        opts.visibility = redirectOptions.visibility;
                    }
                }

                /* Special processing for the last effect call. */
                if (callIndex === properties.calls.length - 1) {
                    /* Append promise resolving onto the user's redirect callback. */
                    function injectFinalCallbacks () {
                        if ((redirectOptions.display === undefined || redirectOptions.display === "none") && /Out$/.test(effectName)) {
                            $.each(elements.nodeType ? [ elements ] : elements, function(i, element) {
                                Velocity.CSS.setPropertyValue(element, "display", "none");
                            });
                        }

                        redirectOptions.complete && redirectOptions.complete.call(elements, elements);

                        if (promiseData) {
                            promiseData.resolver(elements || element);
                        }
                    }

                    opts.complete = function() {
                        if (properties.reset) {
                            for (var resetProperty in properties.reset) {
                                var resetValue = properties.reset[resetProperty];

                                /* Format each non-array value in the reset property map to [ value, value ] so that changes apply
                                   immediately and DOM querying is avoided (via forcefeeding). */
                                /* Note: Don't forcefeed hooks, otherwise their hook roots will be defaulted to their null values. */
                                if (Velocity.CSS.Hooks.registered[resetProperty] === undefined && (typeof resetValue === "string" || typeof resetValue === "number")) {
                                    properties.reset[resetProperty] = [ properties.reset[resetProperty], properties.reset[resetProperty] ];
                                }
                            }

                            /* So that the reset values are applied instantly upon the next rAF tick, use a zero duration and parallel queueing. */
                            var resetOptions = { duration: 0, queue: false };

                            /* Since the reset option uses up the complete callback, we trigger the user's complete callback at the end of ours. */
                            if (finalElement) {
                                resetOptions.complete = injectFinalCallbacks;
                            }

                            Velocity.animate(element, properties.reset, resetOptions);
                        /* Only trigger the user's complete callback on the last effect call with the last element in the set. */
                        } else if (finalElement) {
                            injectFinalCallbacks();
                        }
                    };

                    if (redirectOptions.visibility === "hidden") {
                        opts.visibility = redirectOptions.visibility;
                    }
                }

                Velocity.animate(element, propertyMap, opts);
            }
        };

        /* Return the Velocity object so that RegisterUI calls can be chained. */
        return Velocity;
    };

    /*********************
       Packaged Effects
    *********************/

    /* Externalize the packagedEffects data so that they can optionally be modified and re-registered. */
    /* Support: <=IE8: Callouts will have no effect, and transitions will simply fade in/out. IE9/Android 2.3: Most effects are fully supported, the rest fade in/out. All other browsers: full support. */
    Velocity.RegisterEffect.packagedEffects =
        {
            /* Animate.css */
            "callout.bounce": {
                defaultDuration: 550,
                calls: [
                    [ { translateY: -30 }, 0.25 ],
                    [ { translateY: 0 }, 0.125 ],
                    [ { translateY: -15 }, 0.125 ],
                    [ { translateY: 0 }, 0.25 ]
                ]
            },
            /* Animate.css */
            "callout.shake": {
                defaultDuration: 800,
                calls: [
                    [ { translateX: -11 }, 0.125 ],
                    [ { translateX: 11 }, 0.125 ],
                    [ { translateX: -11 }, 0.125 ],
                    [ { translateX: 11 }, 0.125 ],
                    [ { translateX: -11 }, 0.125 ],
                    [ { translateX: 11 }, 0.125 ],
                    [ { translateX: -11 }, 0.125 ],
                    [ { translateX: 0 }, 0.125 ]
                ]
            },
            /* Animate.css */
            "callout.flash": {
                defaultDuration: 1100,
                calls: [
                    [ { opacity: [ 0, "easeInOutQuad", 1 ] }, 0.25 ],
                    [ { opacity: [ 1, "easeInOutQuad" ] }, 0.25 ],
                    [ { opacity: [ 0, "easeInOutQuad" ] }, 0.25 ],
                    [ { opacity: [ 1, "easeInOutQuad" ] }, 0.25 ]
                ]
            },
            /* Animate.css */
            "callout.pulse": {
                defaultDuration: 825,
                calls: [
                    [ { scaleX: 1.1, scaleY: 1.1 }, 0.50 ],
                    [ { scaleX: 1, scaleY: 1 }, 0.50 ]
                ]
            },
            /* Animate.css */
            "callout.swing": {
                defaultDuration: 950,
                calls: [
                    [ { rotateZ: 15 }, 0.20 ],
                    [ { rotateZ: -10 }, 0.20 ],
                    [ { rotateZ: 5 }, 0.20 ],
                    [ { rotateZ: -5 }, 0.20 ],
                    [ { rotateZ: 0 }, 0.20 ]
                ]
            },
            /* Animate.css */
            "callout.tada": {
                defaultDuration: 1000,
                calls: [
                    [ { scaleX: 0.9, scaleY: 0.9, rotateZ: -3 }, 0.10 ],
                    [ { scaleX: 1.1, scaleY: 1.1, rotateZ: 3 }, 0.10 ],
                    [ { scaleX: 1.1, scaleY: 1.1, rotateZ: -3 }, 0.10 ],
                    [ "reverse", 0.125 ],
                    [ "reverse", 0.125 ],
                    [ "reverse", 0.125 ],
                    [ "reverse", 0.125 ],
                    [ "reverse", 0.125 ],
                    [ { scaleX: 1, scaleY: 1, rotateZ: 0 }, 0.20 ]
                ]
            },
            "transition.fadeIn": {
                defaultDuration: 500,
                calls: [
                    [ { opacity: [ 1, 0 ] } ]
                ]
            },
            "transition.fadeOut": {
                defaultDuration: 500,
                calls: [
                    [ { opacity: [ 0, 1 ] } ]
                ]
            },
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipXIn": {
                defaultDuration: 700,
                calls: [
                    [ { opacity: [ 1, 0 ], transformPerspective: [ 800, 800 ], rotateY: [ 0, -55 ] } ]
                ],
                reset: { transformPerspective: 0 }
            },
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipXOut": {
                defaultDuration: 700,
                calls: [
                    [ { opacity: [ 0, 1 ], transformPerspective: [ 800, 800 ], rotateY: 55 } ]
                ],
                reset: { transformPerspective: 0, rotateY: 0 }
            },
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipYIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], transformPerspective: [ 800, 800 ], rotateX: [ 0, -45 ] } ]
                ],
                reset: { transformPerspective: 0 }
            },
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipYOut": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 0, 1 ], transformPerspective: [ 800, 800 ], rotateX: 25 } ]
                ],
                reset: { transformPerspective: 0, rotateX: 0 }
            },
            /* Animate.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipBounceXIn": {
                defaultDuration: 900,
                calls: [
                    [ { opacity: [ 0.725, 0 ], transformPerspective: [ 400, 400 ], rotateY: [ -10, 90 ] }, 0.50 ],
                    [ { opacity: 0.80, rotateY: 10 }, 0.25 ],
                    [ { opacity: 1, rotateY: 0 }, 0.25 ]
                ],
                reset: { transformPerspective: 0 }
            },
            /* Animate.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipBounceXOut": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 0.9, 1 ], transformPerspective: [ 400, 400 ], rotateY: -10 }, 0.50 ],
                    [ { opacity: 0, rotateY: 90 }, 0.50 ]
                ],
                reset: { transformPerspective: 0, rotateY: 0 }
            },
            /* Animate.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipBounceYIn": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 0.725, 0 ], transformPerspective: [ 400, 400 ], rotateX: [ -10, 90 ] }, 0.50 ],
                    [ { opacity: 0.80, rotateX: 10 }, 0.25 ],
                    [ { opacity: 1, rotateX: 0 }, 0.25 ]
                ],
                reset: { transformPerspective: 0 }
            },
            /* Animate.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.flipBounceYOut": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 0.9, 1 ], transformPerspective: [ 400, 400 ], rotateX: -15 }, 0.50 ],
                    [ { opacity: 0, rotateX: 90 }, 0.50 ]
                ],
                reset: { transformPerspective: 0, rotateX: 0 }
            },
            /* Magic.css */
            "transition.swoopIn": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 1, 0 ], transformOriginX: [ "100%", "50%" ], transformOriginY: [ "100%", "100%" ], scaleX: [ 1, 0 ], scaleY: [ 1, 0 ], translateX: [ 0, -700 ], translateZ: 0 } ]
                ],
                reset: { transformOriginX: "50%", transformOriginY: "50%" }
            },
            /* Magic.css */
            "transition.swoopOut": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 0, 1 ], transformOriginX: [ "50%", "100%" ], transformOriginY: [ "100%", "100%" ], scaleX: 0, scaleY: 0, translateX: -700, translateZ: 0 } ]
                ],
                reset: { transformOriginX: "50%", transformOriginY: "50%", scaleX: 1, scaleY: 1, translateX: 0 }
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3. (Fades and scales only.) */
            "transition.whirlIn": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 1, 0 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: [ 1, 0 ], scaleY: [ 1, 0 ], rotateY: [ 0, 160 ] }, 1, { easing: "easeInOutSine" } ]
                ]
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3. (Fades and scales only.) */
            "transition.whirlOut": {
                defaultDuration: 750,
                calls: [
                    [ { opacity: [ 0, "easeInOutQuint", 1 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: 0, scaleY: 0, rotateY: 160 }, 1, { easing: "swing" } ]
                ],
                reset: { scaleX: 1, scaleY: 1, rotateY: 0 }
            },
            "transition.shrinkIn": {
                defaultDuration: 750,
                calls: [
                    [ { opacity: [ 1, 0 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: [ 1, 1.5 ], scaleY: [ 1, 1.5 ], translateZ: 0 } ]
                ]
            },
            "transition.shrinkOut": {
                defaultDuration: 600,
                calls: [
                    [ { opacity: [ 0, 1 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: 1.3, scaleY: 1.3, translateZ: 0 } ]
                ],
                reset: { scaleX: 1, scaleY: 1 }
            },
            "transition.expandIn": {
                defaultDuration: 700,
                calls: [
                    [ { opacity: [ 1, 0 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: [ 1, 0.625 ], scaleY: [ 1, 0.625 ], translateZ: 0 } ]
                ]
            },
            "transition.expandOut": {
                defaultDuration: 700,
                calls: [
                    [ { opacity: [ 0, 1 ], transformOriginX: [ "50%", "50%" ], transformOriginY: [ "50%", "50%" ], scaleX: 0.5, scaleY: 0.5, translateZ: 0 } ]
                ],
                reset: { scaleX: 1, scaleY: 1 }
            },
            /* Animate.css */
            "transition.bounceIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], scaleX: [ 1.05, 0.3 ], scaleY: [ 1.05, 0.3 ] }, 0.40 ],
                    [ { scaleX: 0.9, scaleY: 0.9, translateZ: 0 }, 0.20 ],
                    [ { scaleX: 1, scaleY: 1 }, 0.50 ]
                ]
            },
            /* Animate.css */
            "transition.bounceOut": {
                defaultDuration: 800,
                calls: [
                    [ { scaleX: 0.95, scaleY: 0.95 }, 0.35 ],
                    [ { scaleX: 1.1, scaleY: 1.1, translateZ: 0 }, 0.35 ],
                    [ { opacity: [ 0, 1 ], scaleX: 0.3, scaleY: 0.3 }, 0.30 ]
                ],
                reset: { scaleX: 1, scaleY: 1 }
            },
            /* Animate.css */
            "transition.bounceUpIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], translateY: [ -30, 1000 ] }, 0.60, { easing: "easeOutCirc" } ],
                    [ { translateY: 10 }, 0.20 ],
                    [ { translateY: 0 }, 0.20 ]
                ]
            },
            /* Animate.css */
            "transition.bounceUpOut": {
                defaultDuration: 1000,
                calls: [
                    [ { translateY: 20 }, 0.20 ],
                    [ { opacity: [ 0, "easeInCirc", 1 ], translateY: -1000 }, 0.80 ]
                ],
                reset: { translateY: 0 }
            },
            /* Animate.css */
            "transition.bounceDownIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], translateY: [ 30, -1000 ] }, 0.60, { easing: "easeOutCirc" } ],
                    [ { translateY: -10 }, 0.20 ],
                    [ { translateY: 0 }, 0.20 ]
                ]
            },
            /* Animate.css */
            "transition.bounceDownOut": {
                defaultDuration: 1000,
                calls: [
                    [ { translateY: -20 }, 0.20 ],
                    [ { opacity: [ 0, "easeInCirc", 1 ], translateY: 1000 }, 0.80 ]
                ],
                reset: { translateY: 0 }
            },
            /* Animate.css */
            "transition.bounceLeftIn": {
                defaultDuration: 750,
                calls: [
                    [ { opacity: [ 1, 0 ], translateX: [ 30, -1250 ] }, 0.60, { easing: "easeOutCirc" } ],
                    [ { translateX: -10 }, 0.20 ],
                    [ { translateX: 0 }, 0.20 ]
                ]
            },
            /* Animate.css */
            "transition.bounceLeftOut": {
                defaultDuration: 750,
                calls: [
                    [ { translateX: 30 }, 0.20 ],
                    [ { opacity: [ 0, "easeInCirc", 1 ], translateX: -1250 }, 0.80 ]
                ],
                reset: { translateX: 0 }
            },
            /* Animate.css */
            "transition.bounceRightIn": {
                defaultDuration: 750,
                calls: [
                    [ { opacity: [ 1, 0 ], translateX: [ -30, 1250 ] }, 0.60, { easing: "easeOutCirc" } ],
                    [ { translateX: 10 }, 0.20 ],
                    [ { translateX: 0 }, 0.20 ]
                ]
            },
            /* Animate.css */
            "transition.bounceRightOut": {
                defaultDuration: 750,
                calls: [
                    [ { translateX: -30 }, 0.20 ],
                    [ { opacity: [ 0, "easeInCirc", 1 ], translateX: 1250 }, 0.80 ]
                ],
                reset: { translateX: 0 }
            },
            "transition.slideUpIn": {
                defaultDuration: 900,
                calls: [
                    [ { opacity: [ 1, 0 ], translateY: [ 0, 20 ], translateZ: 0 } ]
                ]
            },
            "transition.slideUpOut": {
                defaultDuration: 900,
                calls: [
                    [ { opacity: [ 0, 1 ], translateY: -20, translateZ: 0 } ]
                ],
                reset: { translateY: 0 }
            },
            "transition.slideDownIn": {
                defaultDuration: 900,
                calls: [
                    [ { opacity: [ 1, 0 ], translateY: [ 0, -20 ], translateZ: 0 } ]
                ]
            },
            "transition.slideDownOut": {
                defaultDuration: 900,
                calls: [
                    [ { opacity: [ 0, 1 ], translateY: 20, translateZ: 0 } ]
                ],
                reset: { translateY: 0 }
            },
            "transition.slideLeftIn": {
                defaultDuration: 1000,
                calls: [
                    [ { opacity: [ 1, 0 ], translateX: [ 0, -20 ], translateZ: 0 } ]
                ]
            },
            "transition.slideLeftOut": {
                defaultDuration: 1050,
                calls: [
                    [ { opacity: [ 0, 1 ], translateX: -20, translateZ: 0 } ]
                ],
                reset: { translateX: 0 }
            },
            "transition.slideRightIn": {
                defaultDuration: 1000,
                calls: [
                    [ { opacity: [ 1, 0 ], translateX: [ 0, 20 ], translateZ: 0 } ]
                ]
            },
            "transition.slideRightOut": {
                defaultDuration: 1050,
                calls: [
                    [ { opacity: [ 0, 1 ], translateX: 20, translateZ: 0 } ]
                ],
                reset: { translateX: 0 }
            },
            "transition.slideUpBigIn": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 1, 0 ], translateY: [ 0, 75 ], translateZ: 0 } ]
                ]
            },
            "transition.slideUpBigOut": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 0, 1 ], translateY: -75, translateZ: 0 } ]
                ],
                reset: { translateY: 0 }
            },
            "transition.slideDownBigIn": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 1, 0 ], translateY: [ 0, -75 ], translateZ: 0 } ]
                ]
            },
            "transition.slideDownBigOut": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 0, 1 ], translateY: 75, translateZ: 0 } ]
                ],
                reset: { translateY: 0 }
            },
            "transition.slideLeftBigIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], translateX: [ 0, -75 ], translateZ: 0 } ]
                ]
            },
            "transition.slideLeftBigOut": {
                defaultDuration: 750,
                calls: [
                    [ { opacity: [ 0, 1 ], translateX: -75, translateZ: 0 } ]
                ],
                reset: { translateX: 0 }
            },
            "transition.slideRightBigIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], translateX: [ 0, 75 ], translateZ: 0 } ]
                ]
            },
            "transition.slideRightBigOut": {
                defaultDuration: 750,
                calls: [
                    [ { opacity: [ 0, 1 ], translateX: 75, translateZ: 0 } ]
                ],
                reset: { translateX: 0 }
            },
            /* Magic.css */
            "transition.perspectiveUpIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], transformPerspective: [ 800, 800 ], transformOriginX: [ 0, 0 ], transformOriginY: [ "100%", "100%" ], rotateX: [ 0, -180 ] } ]
                ]
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.perspectiveUpOut": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 0, 1 ], transformPerspective: [ 800, 800 ], transformOriginX: [ 0, 0 ], transformOriginY: [ "100%", "100%" ], rotateX: -180 } ]
                ],
                reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%", rotateX: 0 }
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.perspectiveDownIn": {
                defaultDuration: 800,
                calls: [
                    [ { opacity: [ 1, 0 ], transformPerspective: [ 800, 800 ], transformOriginX: [ 0, 0 ], transformOriginY: [ 0, 0 ], rotateX: [ 0, 180 ] } ]
                ],
                reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%" }
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.perspectiveDownOut": {
                defaultDuration: 850,
                calls: [
                    [ { opacity: [ 0, 1 ], transformPerspective: [ 800, 800 ], transformOriginX: [ 0, 0 ], transformOriginY: [ 0, 0 ], rotateX: 180 } ]
                ],
                reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%", rotateX: 0 }
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.perspectiveLeftIn": {
                defaultDuration: 950,
                calls: [
                    [ { opacity: [ 1, 0 ], transformPerspective: [ 2000, 2000 ], transformOriginX: [ 0, 0 ], transformOriginY: [ 0, 0 ], rotateY: [ 0, -180 ] } ]
                ],
                reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%" }
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.perspectiveLeftOut": {
                defaultDuration: 950,
                calls: [
                    [ { opacity: [ 0, 1 ], transformPerspective: [ 2000, 2000 ], transformOriginX: [ 0, 0 ], transformOriginY: [ 0, 0 ], rotateY: -180 } ]
                ],
                reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%", rotateY: 0 }
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.perspectiveRightIn": {
                defaultDuration: 950,
                calls: [
                    [ { opacity: [ 1, 0 ], transformPerspective: [ 2000, 2000 ], transformOriginX: [ "100%", "100%" ], transformOriginY: [ 0, 0 ], rotateY: [ 0, 180 ] } ]
                ],
                reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%" }
            },
            /* Magic.css */
            /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
            "transition.perspectiveRightOut": {
                defaultDuration: 950,
                calls: [
                    [ { opacity: [ 0, 1 ], transformPerspective: [ 2000, 2000 ], transformOriginX: [ "100%", "100%" ], transformOriginY: [ 0, 0 ], rotateY: 180 } ]
                ],
                reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%", rotateY: 0 }
            }
        };

    /* Register the packaged effects. */
    for (var effectName in Velocity.RegisterEffect.packagedEffects) {
        Velocity.RegisterEffect(effectName, Velocity.RegisterEffect.packagedEffects[effectName]);
    }

    /*********************
       Sequence Running
    **********************/

    /* Sequence calls must use Velocity's single-object arguments syntax. */
    Velocity.RunSequence = function (originalSequence) {
        var sequence = $.extend(true, [], originalSequence);

        if (sequence.length > 1) {
            $.each(sequence.reverse(), function(i, currentCall) {
                var nextCall = sequence[i + 1];

                if (nextCall) {
                    /* Parallel sequence calls (indicated via sequenceQueue:false) are triggered
                       in the previous call's begin callback. Otherwise, chained calls are normally triggered
                       in the previous call's complete callback. */
                    var timing = (currentCall.options && currentCall.options.sequenceQueue === false) ? "begin" : "complete",
                        callbackOriginal = nextCall.options && nextCall.options[timing],
                        options = {};

                    options[timing] = function() {
                        var elements = nextCall.elements.nodeType ? [ nextCall.elements ] : nextCall.elements;

                        callbackOriginal && callbackOriginal.call(elements, elements);
                        Velocity(currentCall);
                    }

                    nextCall.options = $.extend({}, nextCall.options, options);
                }
            });

            sequence.reverse();
        }

        Velocity(sequence[0]);
    };
}((window.jQuery || window.Zepto || window), window, document);
}));
/**
 * Author zhouzy
 * Date   2014/9/23
 *
 * 青牛软件成都研发中心
 * 前端框架 cri 基础类
 *
 * 版本 v 2.0
 *
 */

!function(window){
    window.cri = {};

    function Class(){}

    Class.extend = function(subType){
        var prototype = (function(prototype){
            function Prototype(){};
            Prototype.prototype = prototype;
            return new Prototype();
        }(this.prototype));

        prototype.constructor = subType;

        subType.prototype = prototype;

        subType.extend = this.extend;

        return subType;
    };

    cri.Class = Class;

    cri.isArray = function(o){
        return Object.prototype.toString.call(o) === '[object Array]';
    };

    /**
     * 获取表单值
     * @param $form
     * @returns {{}}
     */
    cri.getFormValue = function($form){
        var o = {};
        $("input[name],select[name],textarea[name]",$form).each(function(){
            if($(this).is("[type=checkbox]")){
                if($(this).prop("checked")) {
                    o[this.name] = this.value;
                }
                else{
                    return true;
                }
            }
            if($(this).is("select")){
                o[this.name] = $(this).val();
            }
            else{
                o[this.name] = this.value;
            }
        });
        return o;
    };

    /**
     * 设置表单值
     * @param $form
     * @param o
     */
    cri.setFormValue = function($form,o){
        for(var name in o){
            $("[name=" + name + "]",$form).val(o[name]);
        }
    };

    /**
     * 拓展 jquery formValue 方法
     *
     * @param o
     * @returns {{}}
     */
    $.fn.formValue = function(o){
        if(arguments.length>0){
            cri.setFormValue($(this),o);
        }
        else{
            return cri.getFormValue($(this));
        }
    };

    /**
     * 判断是否为闰年
     * @param year
     * @returns {boolean}
     */
    cri.isLeapYear = function(year){
        return (0==year%4&&((year%100!=0)||(year%400==0)));
    };

    /**
     * 日期格式化
     * 格式 YYYY/yyyy/YY/yy 表示年份
     * MM/M 月份
     * W/w 星期
     * dd/DD/d/D 日期
     * hh/HH/h/H 时间
     * mm/m 分钟
     * ss/SS/s/S 秒
     */
    cri.formatDate = function(date,formatStr){
        var str    = formatStr,
            year   = date.getFullYear(),
            month  = date.getMonth()+1,
            day    = date.getDate(),
            hour   = date.getHours(),
            minute = date.getMinutes(),
            second = date.getSeconds();

        str=str.replace(/yyyy|YYYY/,year);
        str=str.replace(/yy|YY/,(year % 100)>9?(year % 100).toString():'0' + (year % 100));

        str=str.replace(/MM/,month>9?month.toString():'0' + month);
        str=str.replace(/M/g,month);

        str=str.replace(/dd|DD/,day>9?day.toString():'0' + day);
        str=str.replace(/d|D/g,day);

        str=str.replace(/hh|HH/,hour>9?hour.toString():'0' + hour);
        str=str.replace(/h|H/g,hour);

        str=str.replace(/mm/,minute>9?minute.toString():'0' + minute);
        str=str.replace(/m/g,minute);

        str=str.replace(/ss|SS/,second>9?second.toString():'0' + second);
        str=str.replace(/s|S/g,second);
        return str;
    };

    /**
     *把日期分割成数组
     */
    cri.date2Array = function(myDate){
        return [
            myDate.getFullYear(),
            myDate.getMonth(),
            myDate.getDate(),
            myDate.getHours(),
            myDate.getMinutes(),
            myDate.getSeconds()
        ];
    };

    /**
     * 日期保存为JSON
     * @param myDate
     * @returns {{yyyy: number, MM: number, dd: (*|number), HH: number, mm: number, ss: number, ww: number}}
     */
    cri.date2Json = function(myDate){
        return {
            yyyy:myDate.getFullYear(),
            MM:myDate.getMonth(),
            dd:myDate.getDate(),
            HH:myDate.getHours(),
            mm:myDate.getMinutes(),
            ss:myDate.getSeconds(),
            ww:myDate.getDay()
        };
    };
    /**
     * 字符串转成日期类型
     * 格式 MM/dd/YYYY MM-dd-YYYY YYYY/MM/dd YYYY-MM-dd
     */
    cri.string2Date  = function(DateStr){
        var converted = Date.parse(DateStr);
        var myDate    = new Date(converted);
        if (isNaN(myDate))
        {
            var arys= DateStr.split('-');
            myDate = new Date(arys[0],--arys[1],arys[2]);
        }
        return myDate;
    };

    cri.parseJSON = function(json){
        return json ? (new Function("return " + json))(): {};
    };

}(window);


/**
 * Author zhouzy
 * Date   2014/10/14
 *
 * jQuery 插件基类
 * 继承自Class
 *
 */
!function(window){

    "use strict";

    var cri = window.cri,
        $   = window.jQuery;

    var Widgets = cri.Class.extend(function(element,options){
        this.$element = $(element);
        this._initOptions(options);
        this._init();
        this._eventListen();
    });

    /**
     * 初始化组件配置参数
     * @param options
     * @private
     */
    Widgets.prototype._initOptions = function(options) {
        this.options = $.extend(true,{}, this.options, options);
    };

    /**
     * 初始化组件DOM结构
     * @private
     */
    Widgets.prototype._init = function(){};

    /**
     * 初始化组件监听事件
     * @private
     */
    Widgets.prototype._eventListen = function(){};

    /**
     * 销毁组件
     * @private
     */
    Widgets.prototype._destory = function(){
        var $element = this.$element;
        var $warpper = $element.parent();
        $warpper.after($element).remove();
    };

    cri.Widgets = Widgets;
}(window);
/**
 * Author zhouzy
 * Date   2014/9/18
 * grid 组件
 * dependens Pager
 */
!function(window){

    "use strict";

    var cri = window.cri,
        $   = window.jQuery;

    /**
     * 定义表格标题，工具栏，分页高度
     */
    var _titleH       = 31, //标题高度
        _toolbarH     = 31, //工具栏高度
        _pagerH       = 41, //分页高度
        _gridHeadH    = 31, //表格头高度
        _cellMinW     = 5;  //单元格最小宽度

    /**
     * 计算表格高度
     * 1.若初始化时，定义了高度属性
     * 2.若设置了高度属性(height)
     * 3.若设置了高度样式
     * 4.都未定义 默认auto
     * @param $ele
     * @param height 初始化时指定的高度
     * @private
     */
    function _getElementHeight($ele,height){
        var styleHeight = $ele[0].style.height,
            propHeight  = $ele[0].height,
            calHeight   = height || styleHeight || propHeight;

        if(calHeight){
            var arr = ("" + calHeight).split("%");
            if(arr.length>1){
                calHeight = Math.floor($ele.parent().height() * arr[0] / 100);
            }
            calHeight = (""+calHeight).split("px")[0];
            if(calHeight){
                return parseInt(calHeight);
            }
        }
        else{
            return null;
        }
    }

    /**
     * 获取Grid每列信息
     * @param $table        原始 table jquery对象
     * @param optionColumns 使用 options.columns 初始化列属性
     * @returns {*}         处理后的列属性
     * @private
     */
    function _getColumnsDef($table,optionColumns){
        var columns = optionColumns || (function(){
            var fieldArr = "[";
            $("tr th,td", $table).each(function(){
                var data  = $(this).data("options"),
                    title = $(this).html();
                if(data){
                    fieldArr += "{title:\'" + title + "\'," + data + "},";
                }
                else{
                    fieldArr  += "{title:\'" + title + "\'},";
                }
            });
            fieldArr += "]";
            fieldArr = fieldArr.replace(/\},\]/g, "}]").replace(/\],\]/g, "]]");

            return (new Function("return " + fieldArr))();
        }());

        $.map(columns,function(column){
            if(column.field && column.width){
                column._width = column.width;
            }
            return column;
        });

        return columns;
    }

    /**
     * 表格默认属性
     * @type {{url: null, param: {}, title: null, toolbar: null, columns: null, rows: null, onChange: null, onDblClick: null, rowNum: boolean, checkBox: boolean, onChecked: null, pagination: boolean, page: number, pageSize: number, total: number, ajaxDone: null, ajaxError: null}}
     * @private
     */
    var _defaultOptions = {
        title:null,
        height:null,
        width:null,
        toolbar:null,
        url:null,
        param:{},
        checkBox:false,
        rowNum:true,
        columns:null,
        pagination:true,
        page:1,
        pageSize:10,

        onChange:null,   //行点击时触发
        onDblClick:null, //双击行时触发
        onSelected:null, //当选择一行或者多行时触发
        onLoad:null,     //构造表格结束时触发
        ajaxDone:null,   //当AJAX请求成功后触发
        ajaxError:null   //当AJAX请求失败后触发
    };

    var Grid = cri.Widgets.extend(function(element,options){
        this.options     = _defaultOptions;
        this.$element    = $(element);
        this.$grid       = null;
        this.$gridhead   = null;
        this.$gridbody   = null;
        this.toolbar     = null;
        this.pager       = null;
        this.$title      = null;
        this._rows       = null;
        this._columns    = [];
        this._selectedId = [];
        this._gridClassName = this._gridClassName || "datagrid";
        cri.Widgets.apply(this,arguments);
    });

    $.extend(Grid.prototype,{
        _eventListen:function(){
            var that = this;
            var op = this.options;
            var dragStartX = 0;

            this.$gridbody
                .on("scroll",function(e){
                    $(".grid-head-wrap",that.$gridhead).scrollLeft($(this).scrollLeft());
                })
                .on('click', "tr", function(e){
                    $("input[type=checkbox]",that.$gridhead).prop("checked",false);
                    that._setSelected(e);
                    that.options.onChange && that.options.onChange.call(that);
                })
                .on('dblclick', "tr", function(e){
                    that._onDblClickRow(e);
                });
            $(document).on("mouseup",function(e){
                that.$gridhead.css("cursor","");
                $(document).off("mousemove");
            });

            this.$gridhead
                .on('mousedown',".drag-line",function(e){
                    that.$gridhead.css("cursor","e-resize");
                    var dragLineIndex = 0;
                    op.rowNum && dragLineIndex++;
                    op.checkBox && dragLineIndex++;
                    dragLineIndex += $(this).data("drag");
                    var $col = $("col:eq("+ dragLineIndex +")",that.$gridhead);
                    dragStartX = e.pageX;
                    $(document).on("mousemove",function(e){
                        var px = e.pageX - dragStartX;
                        var width = +$col.width() + px;
                        var tableWidth = $("table",that.$gridhead).width();
                        dragStartX = e.pageX;
                        console.log(width);
                        if(width >= _cellMinW){
                            $("table",that.$gridbody).width(tableWidth + px);
                            $("table",that.$gridhead).width(tableWidth + px);
                            $("col:eq("+ dragLineIndex +")",that.$gridhead).width(width);
                            $("col:eq("+ dragLineIndex +")",that.$gridbody).width(width);
                        }
                    });
                })
                .on('click',"input[type=checkbox]",function(e){
                    var isChecked = $(e.target).prop("checked");
                    if(isChecked){
                        that._selectedId = [];
                        $("tr",that.$gridbody).each(function(){
                            var $tr = $(this);
                            that._selectedId.push($tr.data("rowid"));
                            $tr.addClass("selected");
                            $('input[type=checkbox]',$tr).prop("checked",isChecked);
                        });
                    }else{
                        that._selectedId = [];
                        $("tr",that.$gridbody).removeClass("selected");
                    }
                    $("input[type=checkbox]",that.$gridbody).each(function(){
                        $(this).prop("checked",isChecked);
                    });
                    op.onChange && op.onChange.call(that);
                });
        },

        _init:function() {
            this._columns = _getColumnsDef(this.$element,this.options.columns);
            this._createGrid();
            this._createPage();
            this._getData();
            if(this.options.onLoad && typeof(this.options.onLoad) === 'function'){
                this.options.onLoad.call(this);
            }
            this._colsWidth();
        },

        _createGrid:function(){
            var height = _getElementHeight(this.$element,this.options.height);
            var $grid = $("<div></div>").addClass("grid").addClass(this._gridClassName);
            $grid.attr("style",this.$element.attr("style")).show().css("height",height);
            this.$element.wrap($grid);
            this.$element.hide();
            this.$grid = this.$element.parent();
            this._createTitle(this.$grid);
            this._createToolbar(this.$grid);
            this._createGridView(this.$grid,height);
        },

        _createGridView:function($parent,height){
            this.$gridview = $("<div></div>").addClass("grid-view");
            this.$gridhead = $("<div></div>").addClass("grid-head");
            $parent.append(this.$gridview.append(this.$gridhead).append(this.$gridbody));
            if(height){
                height -= _gridHeadH;
                this.options.title      && (height -= _titleH);
                this.options.toolbar    && (height -= _toolbarH);
                this.options.pagination && (height -= _pagerH);
            }
            this._createHead(this.$gridhead);
            this.$gridbody = this._createBody(height);
            this.$grid.append(this.$gridbody);
        },

        _createTitle:function($grid){
            if(this.options.title){
                this.$title = $('<div class="title"><span>' + this.options.title + '</span></div>');
                $grid.append(this.$title);
            }
        },

        _createHead:function($parent){
            var $headWrap = $("<div></div>").addClass("grid-head-wrap"),
                $table    = $("<table></table>"),
                $tr       = $("<tr></tr>"),
                op        = this.options,
                columns   = this._columns;

            $table.append(this._createColGroup($parent.width()));

            if(op.checkBox){
                var $lineCheckbox = $("<td></td>").addClass("line-checkbox").append('<span class="td-content"><input type="checkbox"/></span>');
                $tr.append($lineCheckbox);
            }
            if(op.rowNum){
                var $lineNumber = $("<td></td>").addClass("line-number").append('<div class="td-content"></div>');
                $tr.append($lineNumber);
            }

            for(var i = 0,len = columns.length; i<len; i++){
                var $td        = $('<td></td>'),
                    $dragLine  = $('<div></div>').addClass('drag-line').data('drag',i),
                    $tdContent = $('<div></div>').addClass('td-content grid-header-text'),
                    column     = columns[i];
                for(var key in column){
                    var value = column[key];
                    if(key == 'title'){
                        $tdContent.prop('title',value).append(value);
                    }
                    else if(key !== 'field' && key !== 'width'){
                        $td.css(key,value);
                    }
                }
                $td.append($tdContent);
                i < (len - 1) && $td.append($dragLine);
                $tr.append($td);
            }
            $table.append($tr);
            $parent.html($headWrap.html($table));
        },

        _createBody:function(gridBodyHeight){
            var $gridbody = $('<div class="grid-body loading"></div>'),
                $loadingIcon = $('<i class="fa fa-spinner fa-spin"></i>').addClass("loadingIcon");
            gridBodyHeight && $gridbody.height(gridBodyHeight);
            $gridbody.append($loadingIcon);
            return $gridbody;
        },

        /**
         * 刷新Grid Body数据行
         * @private
         */
        _refreshBody:function(){
            var $table   = $('<table></table>'),
                op       = this.options,
                id       = 0,
                lineNum  = 1 + op.pageSize * (op.page - 1),
                columns  = this._columns,
                rows     = this._rows;

            $table.append($("colgroup",this.$gridhead).clone());

            for(var i = 0,len = rows.length; i<len; i++){
                var row = rows[i],
                    $tr = $('<tr></tr>').data("rowid",id);

                if(op.checkBox){
                    $tr.append($("<td></td>").addClass("line-checkbox").append('<input type="checkbox"/>'));
                }

                if(op.rowNum){
                    $tr.append($("<td></td>").addClass("line-number").append(lineNum));
                }

                for(var j = 0,length = columns.length; j<length;j++){
                    var $td = $('<td></td>');
                    var $content = $('<div></div>').addClass('td-content');
                    var column = columns[j],
                        text   = row[column.field] || "",
                        _text  = ("" + text).replace(/<.\w+\s*[^<]+>/g,"");
                    $content.prop("title",_text).text(_text);
                    $td.append(_text);
                    $tr.append($td);
                }
                lineNum++;id++;
                $table.append($tr);
            }
            this.$gridbody.removeClass("loading").html($table);
            /**
             *fixed IE8 do not support nth-child selector;
             */
            $("tr:nth-child(odd)",$table).css("background","#FFF");
            /**
             *根据gird-body纵向滚动条宽度决定headWrap rightPadding
             */
            var scrollBarW = this.$gridbody.width()-this.$gridbody.prop("clientWidth");
            this.$gridhead.css("paddingRight",scrollBarW);
        },

        _createColGroup:function(parentWidth){
            var $colgroup= $("<colgroup></colgroup>"),
                op       = this.options,
                columns  = this._columns,
                width    = 0;
            op.checkBox && $colgroup.append($("<col/>").width(30)) && (width+=30);
            op.rowNum   && $colgroup.append($("<col/>").width(25)) && (width+=20);
            /**
             * 当表格列宽总长度小于table宽度，设置最后一列宽度为auto,避免checkBox与rowNum列自动计算宽度
             */
            for(var i= 0,len=columns.length; i<len;i++){
                var $col = $("<col/>");
                var columnWidth = columns[i]._width;
                columnWidth && $col.width(columnWidth) && (width+=columnWidth);
                if(width < parentWidth){
                    $col.width("auto");
                }
                $colgroup.append($col);
            }
            return $colgroup;
        },

        _createToolbar:function($parent){
            if(this.options.toolbar) {
                this.toolbar = new cri.ToolBar($parent, {
                    buttons: this.options.toolbar
                });
            }
        },

        _createPage:function(){
            var op = this.options;
            var grid = this;
            if(this.options.pagination){
                this.pager = new cri.Pager(this.$grid,{
                    page:op.page,
                    pageSize:op.pageSize,
                    total:0,
                    rowsLen:0,
                    onPage:function(page,pageSize){
                        op.page = page;
                        op.pageSize = pageSize;
                        grid._getData();
                    }
                });
            }
        },

        _getData:function(){
            var result = true,
                op     = this.options,
                that   = this;
            if(op.pagination){
                op.param.page = op.page;
                op.param.rows = op.pageSize;
            }
            $.ajax({
                type: "post",
                url: this.options.url,
                success: function(data){
                    if(op.ajaxDone){
                        op.ajaxDone(data);
                    }
                    that._rows = data.rows || [];
                    op.total = data.total || 0;
                    that.pager && that.pager.update(op.page,op.pageSize,op.total,that._rows.length);
                    that._refreshBody(that.$gridbody);
                },
                error: function(XMLHttpRequest, textStatus, errorThrown){
                    that._rows = [];
                    op.total = 0;
                    that.pager && that.pager.update(op.page,op.pageSize,op.total,that._rows.length);
                    that._refreshBody(that.$gridbody);
                },
                data:op.param,
                dataType:"JSON",
                async:false
            });
            return result;
        },

        /**
         * 当用户点击选中行时触发onSelected事件
         * 当options.checkbox=true为多选,否则为单选
         * @param e
         * @private
         */
        _setSelected:function(e){
            var item  = $(e.target).closest("tr"),
                rowId = item.data('rowid');

            if(!this.options.checkBox){
                if(item.hasClass("selected")){
                    this._selectedId = [];
                    item.removeClass("selected");
                }else{
                    this._selectedId = this._selectedId || [];
                    $("tr.selected",this.$gridbody).removeClass("selected");
                    item.addClass("selected");
                    this._selectedId = [rowId];
                }
            }
            else{
                if(item.hasClass("selected")){
                    var index = $.inArray(rowId,this._selectedId);
                    index >= 0 && this._selectedId.splice(index,1);
                    item.removeClass("selected");
                    $("input[type=checkbox]",item).prop("checked",false);
                }else{
                    this._selectedId = this._selectedId || [];
                    item.addClass("selected");
                    this._selectedId.push(rowId);
                    if(this.options.checkBox){
                        $("input[type=checkbox]",item).prop("checked",true);
                    }
                }
            }
            if(this._selectedId && this._selectedId.length){
                this.options.onSelected && this.options.onSelected.call(this);
            }
        },

        /**
         * 根据td计算col的宽度
         * @private
         */
        _colsWidth:function(){
            var that = this;
            $("tr:eq(0) td",this.$gridhead).each(function(index){
                $('col:eq('+ index +')',that.$gridbody).width($(this).width() + 2*4);
                $('col:eq('+ index +')',that.$gridhead).width($(this).width() + 2*4);
            });
        },

        _getRowDataById:function(rowid){
            return this._rows[parseInt(rowid)];
        },

        _onDblClickRow:function(e){
            var op = this.options
                ,item = $(e.target).closest("tr")
                ,rowid = item.data('rowid')
                ,that = this;
            this._selectedId = [rowid];
            if(op.onDblClick){
                op.onDblClick();
            }
        },

        reload:function(param){
            param && (this.options.param = param);
            this._selectedId = [];
            this._getData();
        },

        loadData:function(param){
            if(param.push){
                this._rows = param;
                this._refreshBody();
            }
        },

        getSelected:function(){
            var selected = [],
                selectedId = this._selectedId;
            for(var i=0; i<selectedId.length;i++){
                selected.push(this._getRowDataById(selectedId[i]));
            }
            return selected;
        }

    });

    cri.Grid = Grid;
}(window);
/**
 * Author zhouzy
 * Date   2014/9/18
 * Button 组件
 *
 */
!function(window){

    "use strict";

    var cri = window.cri,
        $   = window.jQuery;

    var _defaultOptions = {
        text:"",
        iconCls:null,
        handler:null,
        enable:true
    };

    var BUTTON = "button";

    //TODO:添加enable，disable方法

    var Button = cri.Widgets.extend(function(element,options){
        this.options     = _defaultOptions;
        this.$inputGroup = null;
        this.$button     = null;
        cri.Widgets.apply(this,arguments);
    });

    $.extend(Button.prototype,{

        _init:function(){
            this._create();
        },

        _create:function(){
            var op = this.options,
                $e = this.$element.hide();

            $e.wrap('<div class="'+ BUTTON + '"></div>');
            var $button = this.$button = $e.parent(),
                $icon = $('<i class="' + op.iconCls + '"></i>'),
                text = op.text || $e.text() || $e.val();
            $button.append($icon, text);
            $button.on("click",function(){
                op.handler && op.handler.call();
            });
            if(!op.enable){
                this.disable();
            }
        },

        enable:function(){
            var that = this;
            this.$button.removeClass("disabled");
            this.$button.on("click",function(){
                that.options.handler && that.options.handler.call();
            });
        },

        disable:function(){
            this.$button.addClass("disabled");
            this.$button.off("click");
        }
    });

    cri.Button = Button;

    $.fn.button = function(option) {
        var o = null;
        this.each(function () {
            var $this   = $(this),
                button  = $this.data('button'),
                options = typeof option == 'object' && option;
            if(button != null){
                button._destory();
            }
            $this.data('button', (o = new Button(this, options)));
        });
        return o;
    };
}(window);
/**
 * Author zhouzy
 * Date   2014/9/23
 *
 * DataGrid
 *
 * 依赖 Grid
 */
!function(window){

    var $   = window.jQuery,
        cri = window.cri;

    var DataGrid = cri.DataGrid = cri.Grid.extend(function(element,options){
        cri.Grid.apply(this,arguments);
    });

    $.fn.datagrid = function(option) {
        var datagrid = null;
        this.each(function () {
            var $this = $(this),
                dg    = $this.data('datagrid'),
            options = typeof option == 'object' && option;
            if(dg != null){
                dg._distory();
            }
            $this.data('datagrid', (datagrid = new DataGrid(this, options)));
        });
        return datagrid;
    };

}(window);


/*=====================================================================================
 * easy-bootstrap-fileUpload v2.0
 *
 * @author:niyq
 * @date:2013/08/22
 * @dependce:jquery
 *=====================================================================================*/
!function($){

    "use strict";

    var FileUpload = function(element,dataOptions){
        var thisObject = this;
        this.$element = $(element);
        this.dataOptions = $.extend({}, $.fn.fileUpload.defaults, dataOptions);
        this.title = "";
        if(this.$element.attr("title"))
            this.title = this.$element.attr("title");
        if(this.dataOptions.title)
            this.title = this.dataOptions.title;
        this.id = this.$element.attr("id");
        this.name = this.$element.attr("name");
        this.init();
    };

    FileUpload.prototype.init = function(){
        var thisObject = this;
        this.fileUploadObj = this.$element;                                                     //fileUploadObj
        this.fileUploadObj.wrap($('<div class="eb_fileUploadGroup"></div>'));
        this.parent = this.fileUploadObj.parent();                                              //parent
        this.parent.data('fileUpload',thisObject);
        this.fileUploadObj.after($('<input class="eb_fileUploadInput" name="'+thisObject.name+'" id="eb_fileUploadInput_'+thisObject.id+'" />'));
        this.inputObj = this.parent.children('.eb_fileUploadInput');                             //inputObj
        this.inputObj.data('fileUpload',thisObject);
        this.inputObj.before($('<span class="eb_title">'+thisObject.title+'</span>'));
        this.titleObj = this.parent.children('.eb_title');                                       //titleObj
        this.inputObj.after($('<div class="eb_button">浏览</div>'));
        this.buttonObj = this.parent.children('.eb_button');                                    //buttonObj
        this.fileUploadObj.change(function(){
            var value = thisObject.fileUploadObj.val();
            thisObject.inputObj.val(value);
            thisObject.parent.attr('value',value);
        });
        this.buttonObj.click(function(){
            thisObject.fileUploadObj.trigger('click');
            thisObject.fileUploadObj.get(0).focus();
        }).mousedown(function(){
            setTimeout(function(){
                thisObject.inputObj.addClass('focus');
                thisObject.buttonObj.addClass('focus');
            },1);
        });
        this.setWidth();
        this.setHeight();
        this.setStyle();
    };

    FileUpload.prototype.setValue = function(value){
        this.inputObj.val(value);
        this.fileUploadObj.val(value);
        if(this.fileUploadObjClone)
            his.fileUploadObjClone.val(value);
        this.parent.attr('value',value);
    };

    FileUpload.prototype.getValue = function(){
        var value = this.fileUploadObj.val();
        if(this.fileUploadObjClone)
            value = this.fileUploadObjClone.val();
        return value;
    };

    FileUpload.prototype.clearValue = function(){
        this.setValue('');
    }

    FileUpload.prototype.initInForm = function(formObj){
        var thisObject = this;
        formObj.append(thisObject.fileUploadObjClone = thisObject.fileUploadObj.clone().css('display','none').addClass('clone'));              //fileUploadObjClone
        this.fileUploadObj.click(function(){
            thisObject.fileUploadObjClone.trigger('click');
            return false;
        });
        this.fileUploadObjClone.change(function(){
            var value = $(this).val();
            thisObject.setValue(value);
        });
        return thisObject.fileUploadObjClone;
    };

    FileUpload.prototype.setWidth = function(widthParam){
        var thisObject = this;
        var width = $.fn.fileUpload.defaults.width;
        if(this.dataOptions.width)
            width = this.dataOptions.width;
        if(widthParam)
            width = widthParam;
        if(typeof width == 'string')
            width = width.split("px")[0];
        this.parent.width(width);
        this.inputObj.width(thisObject.parent.width()-140);
        this.fileUploadObj.width(thisObject.parent.width()-75);
        if(this.dataOptions.titleWidth || this.dataOptions.titleWidth == 0){
            var width = this.dataOptions.titleWidth;
            this.titleObj.width(width);
            this.inputObj.width(thisObject.parent.width()-width-67);
            this.fileUploadObj.width(thisObject.parent.width()-width-2);
        }
    };

    FileUpload.prototype.setHeight = function(heightParam){
        var thisObject = this;
        var height = $.fn.fileUpload.defaults.height;
        if(this.dataOptions.height)
            height = this.dataOptions.height;
        if(heightParam)
            height = heightParam;
        if(typeof height == "string")
            height = height.dplit("px")[0];
        this.parent.height(height);
        this.inputObj.height(height-2);
        this.inputObj.css('line-height',(height-2)+'px');
        this.fileUploadObj.height(height);
        this.titleObj.height(height);
        this.titleObj.css('line-height',(height+2)+'px');
        this.buttonObj.height(height);
        this.buttonObj.css('line-height',height+'px');
    };

    FileUpload.prototype.setStyle = function(){
        var thisObject = this;
        this.buttonObj.mouseover(function(){
            $(this).addClass('mouseover');
        }).mouseout(function(){
            $(this).removeClass('mouseover');
        }).mousedown(function(){
            $(this).addClass("mousedown");
        }).mouseup(function(){
            $(this).removeClass("mousedown");
        });
        this.fileUploadObj.focus(function(){
            thisObject.inputObj.addClass('focus');
            thisObject.buttonObj.addClass('focus');
        }).blur(function(){
            thisObject.inputObj.removeClass('focus');
            thisObject.buttonObj.removeClass('focus');
        });
    };

    $.fn.fileUpload = function (option,param) {
        var result = null;
        var thisObj = this.each(function () {
            var $this = $(this)
                , thisObject = $this.data('fileUpload')
                , dataOptions = typeof option == 'object' && option;
            if(typeof option == 'string' ){
                result = thisObject[option](param);
            }else{
                $this.data('fileUpload', (thisObject = new FileUpload(this, dataOptions)));
            }
        });
        if(typeof option == 'string' )return result;
        return thisObj;
    };

    $.fn.fileUpload.defaults = {
        width:250,
        height:20
    };

    $(window).on('load', function(){
        $(".eb_fileUpload").not('.clone').each(function () {
            var thisObj = $(this)
                , dataOptionsStr = thisObj.data('options');
            if(!dataOptionsStr)
                thisObj.fileUpload($.fn.fileUpload.defaults);
            else
                thisObj.fileUpload((new Function("return {" + dataOptionsStr + "}"))());
        });
    });
}(window.jQuery);

/**
 * Author zhouzy
 * Date   2014/9/18
 * Input 组件
 *
 */
!function(window){

    "use strict";

    var cri = window.cri,
        $   = window.jQuery;

    var _defaultOptions = {
        label:null,
        value:null,
        button:null,//button={iconCls:"",handler:""}
        readonly:false,
        onFocus:null,
        onBlur:null,
        onClick:null
    };

    var INPUT_GROUP = "input-group",
        INPUT_BTN   = "input-btn",
        WITH_BTN    = "with-btn";

    var Input = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        this.$inputGroup = null;
        cri.Widgets.apply(this,arguments);
    });

    $.extend(Input.prototype,{
        _eventListen:function(){

        },

        _init:function(){
            this._createInputGroup();
        },

        _createInputGroup:function(){
            var $element = this.$element;
            $element.wrap('<div class="'+ INPUT_GROUP + '"></div>');
            this.$inputGroup = $element.parent();
            this._wrapInput();
            this.$input.before(this._label());
        },

        _wrapInput:function(){
            var that = this,
                op   = that.options,
                $input = this.$element;

            if(op.readonly){
                $input = this._readonlyInput($input);
            }
            else{
                $input.on("focus",function(){
                    that.options.onFocus && that.options.onFocus.call(that);
                }).blur(function(){
                    that.options.onBlur && that.options.onBlur.call(that);
                });
            }

            op.button && $input.after(this._button()) && $input.addClass(WITH_BTN);

            this.$input = $input;

            if(op.value != null){
                this._setValue(op.value)
            }
        },

        /**
         * 返回包装 readonly input
         * @param $element
         * @private
         */
        _readonlyInput:function($element){
            var that = this,
                $input = $('<span class="readonly" role="readonly">'+this.$element.val()+'</span>');
            $input.on("click",function(){
                that.options.onFocus && that.options.onFocus.call(that);
            }).blur(function(){
                that.options.onBlur && that.options.onBlur.call(that);
            });
            this.$element.attr("readonly",true).hide().after($input);
            return $input;
        },

        _button:function(){
            var op    = this.options,
                $icon = null,
                that  = this;
            if(op.button){
                $icon = $('<i class="' + INPUT_BTN + " " + op.button.iconCls + '"></i>').on("click",function(){
                    op.button.handler.call(that);
                });
            }
            return $icon;
        },

        _label:function(){
            var label = this.options.label ||
                this.$element.data("label") ||
                this.$element.attr("title") ||
                this.$element.attr("name") ||
                "";
            return $('<label></label>').text(label);
        },

        _destory:function(){
            var $input = this.$element;
            this.$inputGroup.replaceWith($input);
        },

        _setValue:function(value){
            if(this.$input.is("input")){
                this.$input.val(value);
            }else{
                this.$element.val(value);
                this.$input.text(value);
                this.$element.trigger("change");
            }
        },

        _getValue:function(){
            return this.$element.val();
        },

        value:function(value){
            if(arguments.length>0){
                this._setValue(value)
            }
            else{
                return this._getValue();
            }
        }
    });
    cri.Input = Input;

    $.fn.input = function(option) {
        var input = null;
        this.each(function () {
            var $this   = $(this),
                input   = $this.data('input'),
                options = typeof option == 'object' && option;
            if(input != null){
                input._destory();
            }
            $this.data('input', (input = new Input(this, options)));
        });
        return input;
    };
}(window);
/*=====================================================================================
 * easy-bootstrap-marquee v1.0
 *
 * @author:zhouzy
 * @date:2013/09/16
 * @dependce:jquery
 *=====================================================================================*/
!function($){
    "use strict";

    var Marquee = function (element, options) {
        this.options = $.extend({}, $.fn.marquee.defaults, options);
        this.$element = $(element);
        this.scrollInterval = null;
        this.contentInterval = null;
        this.$one = null;
        this.$two = null;
        this.ita = 0;
        this.init();
    };

    Marquee.prototype = {
        eventListen:function(){
            var that = this;
            this.$element.on("mouseenter",function(){
                clearInterval(that.scrollInterval);
            }).on("mouseleave",function(){
                that.start();
            });
        },

        init:function () {
            var that = this;
            this.ita = 0;
            if(this.options.content.length > 0){
                this.createEle();
                this.contentInterval = window.setInterval(function(){
                    that.start();
                },3000);
                this.eventListen();
            }
        },

        createEle:function(){
            this.$one || this.$element.append("<div class=\"contentOne\"></div>");
            this.$two || this.$element.append("<div class=\"contentTwo\"></div>");
            this.$one = $(".contentOne",this.$element);
            this.$two = $(".contentTwo",this.$element);
            if(this.options.content){
                this.$one.html("<span>" + this.options.content[0].text + "</span>");
                this.$two.html("<span>" + this.options.content[0].text + "</span>");
            }
        },
        start:function(){
            this.ita++;
            this.ita>=this.options.content.length && (this.ita=0);
            this.$two.html("<span>" + this.options.content[this.ita].text + "</span>");
            this.$element.scrollTop(0);
            clearInterval(this.scrollInterval);
            var that = this;
            this.scrollInterval = window.setInterval(function(){
                that.scroll();
            },20);
        },
        stop:function(){
            clearInterval(this.contentInterval);
        },
        scroll:function(){
            this.$element.scrollTop(this.$element.scrollTop() + 1);
            if(this.$element.scrollTop % 20 == 20){
                clearInterval(this.scrollInterval);
            }
        },

        refreshContent:function(param){
            this.options.content = param;
            this.init();
        }
    };

    $.fn.marquee = function (option,param) {
        var result = null;
        var $marquee = this.each(function () {
            var $this = $(this)
                , data = $this.data('marquee')
                , options = typeof option == 'object' && option;
            if(typeof option == 'string' ){
                result = data[option](param);
            }else{
                $this.data('marquee', (data = new Marquee(this, options)));
            }
        });
        if(typeof option == 'string')return result;
        return $marquee;
    };

    $.fn.marquee.defaults = {
        content:[],
        delayTime:3000,
        height:20
    };

    $(window).on('load', function(){
        $("[class='marquee']").each(function () {
            var $this = $(this)
                ,data = $this.data('options');
            if(!data) return;
            $this.marquee((new Function("return {" + data + "}"))());
        });
    });

}(window.jQuery);

/**
 * Author zhouzy
 * Date   2014/10/14
 * notification 组件
 *
 */
!function(window){

    var cri = window.cri,
        $   = window.jQuery;

    var Notification = function(){

    };

    Notification.prototype={
        _notiBody:function(type,message){
            var that = this;
            var icons = {success:"fa-exclamation",error:"fa-exclamation",warming:"fa-exclamation"};
            if(this.$notification && this.$notification.length){
                this._hide(this.$notification);
            }
            var $notification = this.$notification = $('<div class="notification ' + type + '"></div>'),
                $icon = $('<i class="icon fa ' + icons[type]+ '"></i>'),
                $message = $('<span class="message">' + message + '</span>'),
                $btn = $('<i class="btn fa fa-close"></i>').on("click",function(){
                    that._hide($notification);
                });
            $notification.append($icon,$message,$btn);
            $('body').append($notification);
            that._show();
            window.setTimeout(function(){
                that._hide($notification);
            },1000*5);
        },

        _hide:function($notification){
            $notification.animate({
                height:"hide"
            },function(){
                $notification.remove();
            });
        },

        _show:function(){
            this.$notification.animate({
                height:"show"
            });
        },

        error:function(message){
            this._notiBody("error",message);
        },
        warming:function(message){
            this._notiBody("warming",message);
        },
        success:function(message){
            this._notiBody("success",message);
        }
    }

    cri.notification = new Notification();

}(window);
/**
 * Author zhouzy
 * Date   2014/9/18
 * Pager 组件
 *
 */
!function(window){

    "use strict";

    var cri = window.cri,
        $   = window.jQuery;

    /**
     * 默认属性
     * @type {{page: number, pageSize: number, total: number}}
     * @private
     */
    var _defaultOptions = {
        page:1,      //当前页数
        pageSize:10, //每页条数
        total:0,     //总条数
        rowsLen:0,   //实际数据length
        onPage:null,  //当用户点击翻页按钮时触发
        onUpdate:null //更新翻页信息结束触发
    };

    var FIRSTPAGE = "first-page",
        PREVPAGE  = "prev-page",
        NEXTPAGE  = "next-page",
        LASTPAGE  = "last-page",
        PAGENUMBER    = "pager-number",
        PAGENAV       = "pager-nav",
        PAGEINFO      = "pager-info",
        STATEDISABLED = "state-disabled",
        STATEDSTATE   = "state-selected";

    var Pager = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        this.pager = null;
        cri.Widgets.apply(this,arguments);
    });

    $.extend(Pager.prototype,{
        _eventListen:function(){
            var that = this;
            this.$pager.on("click","a:not('."+STATEDISABLED+"')",function(e){
                var $a = $(e.target).closest("a");
                var page = $a.data("page");
                that._page(page);
            });
        },

        _init:function () {
            this._createPager(this.$element);
        },

        _createPager:function($parent){
            var $pager = this.$pager = $("<div></div>").addClass("pager");
            $pager.append(this._createPagerBtn()).append(this._createPagerInfo());
            $parent.append($pager);
        },

        _createPagerBtn: function(){
            var op        = this.options,
                pageSize  = op.pageSize || 10,
                total     = op.total || 0,
                page      = parseInt(op.page) || 1,
                lastPage  = Math.ceil(total / pageSize);

            var $pagerBtn   = $("<div></div>").addClass(PAGENAV),
                $firstPage  = $('<a></a>').addClass(FIRSTPAGE).append('<span class="fa fa-angle-double-left"></span>'),
                $prevPage   = $('<a></a>').addClass(PREVPAGE).append('<span class="fa fa-angle-left"></span>'),
                $nextPage   = $('<a></a>').addClass(NEXTPAGE).append('<span class="fa fa-angle-right"></span>'),
                $lastPage   = $('<a></a>').addClass(LASTPAGE).append('<span class="fa fa-angle-double-right"></span>'),
                $numberPage = $("<ul></ul>").addClass(PAGENUMBER);

            this._fourBtn($firstPage,$prevPage,$nextPage,$lastPage,page,lastPage);
            this._numberPage($numberPage,page,lastPage);

            $pagerBtn.append($firstPage).append($prevPage).append($numberPage).append($nextPage).append($lastPage);
            return $pagerBtn;
        },

        _updatePagerBtn:function(){
            var op       = this.options,
                pageSize = op.pageSize || 10,
                total    = op.total || 0,
                page     = parseInt(op.page) || 1,
                lastPage = Math.ceil(total / pageSize),

                $pagerBtn   = $("." + PAGENAV,this.$pager),
                $firstPage  = $("." + FIRSTPAGE,$pagerBtn),
                $prevPage   = $("." + PREVPAGE,$pagerBtn),
                $nextPage   = $("." + NEXTPAGE,$pagerBtn),
                $lastPage   = $("." + LASTPAGE,$pagerBtn),
                $numberPage = $("." + PAGENUMBER,$pagerBtn);

            this._fourBtn($firstPage,$prevPage,$nextPage,$lastPage,page,lastPage);
            $numberPage.empty();
            this._numberPage($numberPage,page,lastPage);
        },

        _fourBtn:function($firstPage,$prevPage,$nextPage,$lastPage,page,lastPage){
            var nextPage = page + 1,
                prevPage = page - 1;
            if(page <= 1){
                $firstPage.addClass(STATEDISABLED);
                $prevPage.addClass(STATEDISABLED);
            }
            else{
                $firstPage.removeClass(STATEDISABLED).data("page",1);
                $prevPage.removeClass(STATEDISABLED).data("page",prevPage);
            }

            if(page >= lastPage){
                $nextPage.addClass(STATEDISABLED);
                $lastPage.addClass(STATEDISABLED);
            }else{
                $nextPage.removeClass(STATEDISABLED).data("page",nextPage);
                $lastPage.removeClass(STATEDISABLED).data("page",lastPage);
            }
        },

        _numberPage:function($numberPage,page,lastPage){
            for(var i=-2; i<3; i++){
                var shiftPage = i + page;
                if(shiftPage>0 && shiftPage <= lastPage){
                    var $li = $("<li></li>"),
                        $a  = $("<a></a>").data("page",shiftPage).text(shiftPage);
                    shiftPage != page ?
                        $a.addClass("pager-num"):
                        $a.addClass(STATEDSTATE);
                    $numberPage.append($li.append($a));
                }
            }
        },

        _updatePagerInfo:function(){
            var op       = this.options,
                pageSize = op.pageSize || 10,
                total    = op.total || 0,
                page     = parseInt(op.page) || 1,
                numStart = (page-1) * pageSize + 1,
                numEnd   = (page-1) * pageSize + op.rowsLen,

                $pager     = this.$pager,
                $pagerInfo = $("."+PAGEINFO,$pager);

            $pagerInfo.text(numStart + ' - ' + numEnd + ' of ' + total + ' items');
        },

        _createPagerInfo:function(){
            var op  = this.options,
                pageSize  = op.pageSize || 10,
                total     = op.total || 0,
                page      = parseInt(op.page) || 1,
                numStart  = (page-1) * pageSize + 1,
                numEnd    = (page-1) * pageSize + op.rowsLen;

            return $("<div></div>").addClass(PAGEINFO).text(numStart + ' - ' + numEnd + ' of ' + total + ' items');
        },

        _page:function(page){
            var op = this.options;
            op.page = page;
            this.options.onPage.call(this,op.page,op.pageSize);
        },

        update:function(page,pageSize,total,rowsLen){
            var op = this.options;
            op.total = total;
            op.rowsLen = rowsLen;
            op.page = page;
            op.pageSize = pageSize;
            this._updatePagerBtn();
            this._updatePagerInfo();
            op.onUpdate && op.onUpdate(this);
        }
    });
    cri.Pager = Pager;
}(window);
/**
 * Author zhouzy
 * Date   2014/9/18
 * SelectBox 组件
 *
 */
!function(window){

    "use strict";

    var cri = window.cri,
        $   = window.jQuery;

    var SELECTBOX_GROUP = "selectBox-group",
        SELECTBOX_BTN   = "fa fa-caret-down",
        OPTIONS  = "options",
        SELECTED = "selected";

    var _defaultOptions = {
        label:'',
        data:null,  //Array [{value:"",text:""},{value:"",text:""}]
        change:null //Function: call back after select option
    };

    var SelectBox = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        this.$selectBoxGroup = null;
        this.input = null;
        this._value = null;
        this._text = null;
        cri.Widgets.apply(this,arguments);
    });

    $.extend(SelectBox.prototype,{
        _eventListen:function(){
        },

        _init:function(){
            this._create();
        },

        _create:function(){
            this.$element.hide();
            this.$element.wrap('<span class="' + SELECTBOX_GROUP + '"></span>');
            this.$selectBoxGroup = this.$element.parent();
            this._value = this.$element.val();
            this._text  = this.$element.find("option:selected").text();
            this._createInput();
            this._createListView();
        },

        _createInput:function(){
            var that = this,
                button = {iconCls:SELECTBOX_BTN,handler:function(){
                    that.listView.toggle();
                }};
            this.input = new cri.Input(this.$element,{
                label:that.label,
                readonly:true,
                value:that._text,
                button:button,
                onFocus:function(){
                    that.listView.toggle();
                }
            });
        },

        _createListView:function(){
            var that = this;
            this.listView = new ListView(this.$selectBoxGroup,{
                data:that._data(),
                value:that._value,
                onChange:function(value,text){
                    that.input.value(text);
                    that.$element.val(value);
                    that._value = value;
                    that._text = text;
                }
            });
        },

        /**
         * 获取options定义
         * 1.初始化时定义
         * 2.原始select元素options获取
         * @private
         */
        _data:function(){
            var data = this.options.data;
            if(!data){
                data = [];
                $("option",this.$element).each(function(){
                        var text = $(this).text();
                        var value = this.value;
                        data.push({text:text,value:value});
                    }
                );
            }
            this.options.data = data;
            return data;
        },

        /**
         * 根据value值获取对应的text值
         * @param value
         * @private
         */
        _getTextByValue:function(value){
            var data = this.options.data;
            for(var i= 0,len=data.length; i<len; i++){
                if(data[i].value === value){
                    return data[i].text;
                }
            }
        },

        /**
         * get or set selectBox value
         * @param value
         * @returns {*}
         */
        value:function(value){
            if(arguments.length>0){
                this._value = value;
                this.$element.val(value);
                this.input.value(this._getTextByValue(value));
            }
            else{
                return this._value;
            }
        },

        /**
         * get or set selectBox text
         * @param text
         * @returns {*}
         */
        text:function(text){
            if(arguments.length>0){
                var value = null;
                for(var p in this.options.data){
                    if(p.text === text){
                        value = p.value || "";
                    }
                }
                this._value = value;
                this.$element.val(value);
                this.input.value(text);
            }
            else{
                return this._text;
            }
        }
    });

    var ListView = function($parent,options){
        this.options = $.extend({
            data:[],
            onChange:null
        },options);
        this.$options = null;
        this.$parent = $parent;
        this.value = options.value;//下拉框初始值
        this._init();
        this.text = null;
    };

    ListView.prototype = {
        /**
         * 初始化下拉选择框
         * @returns {*|HTMLElement}
         * @private
         */
        _init:function(){
            var data = this.options.data;
            var $options = this.$options = $('<ul class="' + OPTIONS + '"></ul>').hide();
            if(data){
                for(var i = 0,len = data.length; i<len; i++){
                    $options.append(this._createOption(data[i]));
                }
            }
            this.$parent.append($options);
        },

        /**
         * 构造单个option
         * @param option
         * @private
         */
        _createOption:function(option){
            var $li = $('<li></li>').text(option.text),
                that = this;
            $li.on("click",function(){
                if(!$li.is("." + SELECTED)){
                    $("li."+SELECTED,that.$options).removeClass(SELECTED);
                    $li.addClass(SELECTED);
                    that.text = option.text;
                    that.value = option.value;
                    that._change();
                }
                that.toggle();
            });
            that.value == option.value && $li.addClass(SELECTED);
            return $li;
        },

        /**
         * 显示隐藏切换options选择框
         * @private
         */
        toggle:function(){
            var that = this;
            this.$options.animate({
                    height:'toggle'
                },200,function(){
                    if(!that.$options.is(":hidden")){
                        that._clickBlank();
                    }
                });
        },

        /**
         * 当在非本元素范围内点击，收缩下拉框
         * @private
         */
        _clickBlank:function(){
            var that = this;
            $(document).mouseup(function(e) {
                var _con = that.$parent;
                if (!_con.is(e.target) && _con.has(e.target).length === 0) {
                    that.$options.animate({
                        height:'hide'
                    },200);
                }
            });
        },

        /**
         * 获取options定义
         * 1.初始化时定义
         * 2.原始select元素options获取
         * @private
         */
        _data:function(){
            var data = this.options.data;
            if(!data){
                data = [];
                $("option",this.$element).each(function(){
                        var text = $(this).text();
                        var value = this.value;
                        data.push({text:text,value:value});
                    }
                );
            }
            this.options.data = data;
            return data;
        },

        /**
         * 单击option触发
         * @param e
         * @private
         */
        _change:function(){
            this.options.onChange && this.options.onChange.call(this,this.value,this.text);
        }
    };

    cri.SelectBox = SelectBox;

    $.fn.selectBox = function(option) {
        var o = null;
        this.each(function () {
            var $this = $(this),
                options = typeof option == 'object' && option;
            o = $this.data('selectBox');
            if(o != null){
                o._destory();
            }
            $this.data('selectBox', (o = new SelectBox(this, options)));
        });
        return o;
    };
}(window);
/**
 * Author zhouzy
 * Date   2014/12/26
 *
 * TabPage
 */

!function(window){

    "use strict";

    var cri = window.cri,
        $   = window.jQuery;

    var TABPAGE_GROUP  = "tabPage-group",
        TABPAGE_HEADER = "tabPage-header",
        TABPAGE_HEADER_LB = "tabPage-header-leftBtn",
        TABPAGE_HEADER_RB = "tabPage-header-rightBtn",
        TABPAGE_TABS_WRAP = "tabPage-header-tabs-wrap",
        TABPAGE_TABS      = "tabPage-header-tabs",
        TABPAGE_TAB       = "tabPage-header-tab",
        TABPAGE_TAB_CLOSE = "tabPage-header-tab-close",
        TABPAGE_BODY      = "tabPage-body",
        TAB_WIDTH         = 100;

    var _defaultOptions = {
        label:'',
        data:null,  //Array [{value:"",text:""},{value:"",text:""}]
        change:null //Function: call back after select option
    };

    var TabPage = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        this.$tabPageGroup = null;
        this.$tabs = null;
        this._pageBodyQueue = [];
        cri.Widgets.apply(this,arguments);
    });

    $.extend(TabPage.prototype,{
        _eventListen:function(){
        },

        _init:function(){
            this._create();
        },

        _create:function(){
            this.$tabPageGroup = this.$element.addClass(TABPAGE_GROUP);
            var bodys = [];
            this.$element.children().each(function(){
                bodys.push($(this).detach());
            });
            this._createHeader();
            if(bodys.length>0){
                for(var i=0; i<bodys.length; i++){
                    this.addTab(bodys[i],(bodys[i].data("title")|| ""));
                }
            }
        },

        _createHeader:function(){
            var that = this,
                $pageHeader = this.$pageHeader = $('<div class="' + TABPAGE_HEADER + '"></div>'),
                $leftBtn    = this.$leftBtn = $('<i class="fa fa-angle-double-left ' + TABPAGE_HEADER_LB + '"></i>').hide(),
                $rightBtn   = this.$rightBtn = $('<i class="fa fa-angle-double-right ' + TABPAGE_HEADER_RB + '"></i>').hide(),
                $tabsWrap   = this.$tabsWrap = $('<div class="' + TABPAGE_TABS_WRAP + '"></div>');
            $leftBtn.click(function(){
                that._offsetL();
            });
            $rightBtn.click(function(){
                that._offsetR();
            });
            $pageHeader.append($leftBtn,$rightBtn);
            $pageHeader.append($tabsWrap);
            $tabsWrap.append(this._createTabs());
            this.$tabPageGroup.append($pageHeader);
        },

        _offsetL:function(){
            var left = this.$tabs.position().left,
                width = this.$tabs.width(),
                containerWidth = this.$tabsWrap.width(),
                viewWidth = width + left - 25;
            if(viewWidth > containerWidth){
                if(viewWidth%100>0){
                    this.$tabs.velocity({left:"-="+(viewWidth%100)+"px"});
                }else{
                    this.$tabs.velocity({left:"-=100px"});
                }
            }
        },
        _offsetR:function(){
            var left  = this.$tabs.position().left,
                width = this.$tabs.width(),
                containerWidth = this.$tabsWrap.width();

            if(left <= 0){
                var viewWidth = width + left - 25;
                var right = containerWidth-viewWidth;
                if(right > 0){
                    this.$tabs.velocity({left:"+="+(right%100)+"px"});
                }
                else{
                    this.$tabs.velocity({left:"+=100px"});
                }
            }
        },
        _createTabs:function(){
            var $tabs = this.$tabs = $('<ul class="' + TABPAGE_TABS + '"></ul>');
            return $tabs;
        },

        _fouceTab:function($tab){
            var $tabs = this.$tabs,
                index = $(".selected",$tabs).removeClass("selected").data("for");
            index != null && this._pageBodyQueue[index].hide();
            $tab.addClass("selected");
            this._pageBodyQueue[$tab.data("for")].show();
        },

        _closeTab:function($tab){
            var index = $tab.data('for');
            if(index != undefined && index != null){
                this._pageBodyQueue[index]._destory();
                this._pageBodyQueue = this._pageBodyQueue.splice(index-1,1);
                $('li:gt('+ index +')',this.$tabs).each(function(){
                    var index = +$(this).data("for");
                    $(this).data("for",index-1);
                });
                $tab.remove();
                if($(".selected",this.$tabs).length == 0){
                    if(index >= this._pageBodyQueue.length){
                        index -= 1;
                    }
                    this._fouceTab(this._getTab(index));
                }
            }

        },
        _leftrightBtn:function(){
            var $tabs = this.$tabs;
            var tabsW = $tabs.width();
            var tabpageHeaderW = this.$pageHeader.width();

            if(tabsW > tabpageHeaderW){
                this.$leftBtn.show();
                this.$rightBtn.show();
                this.$pageHeader.addClass("shift");
            }
            else{
                this.$leftBtn.hide();
                this.$rightBtn.hide();
                this.$pageHeader.removeClass("shift");
            }
        },
        _getTab:function(index){
            return $('li:eq('+index+')',this.$tabs);
        },

        /**
         * 增加Tab
         * @param content : html字符串、url、jquery对象
         * @param title : tab name
         */
        addTab:function(content,title){
            title = title || 'New Tab';
            var that = this,
                $tabs = this.$tabs,
                $tab = $('<li class="' + TABPAGE_TAB + '">' + title + '</li>').data("for",this._pageBodyQueue.length),
                $closeBtn = $('<i class="fa fa-close ' + TABPAGE_TAB_CLOSE + '"></i>');
            $closeBtn.click(function(){
                that._closeTab($tab);
            });
            $tab.append($closeBtn);
            $tab.click(function(){
                that._fouceTab($(this));
            });

            $tabs.append($tab);
            var tabPageBody = new TabPageBody(this.$tabPageGroup,{
                content:content
            });
            this._pageBodyQueue.push(tabPageBody);
            this._fouceTab($tab);
            $tabs.width(this._pageBodyQueue.length*TAB_WIDTH);
            this._offsetL();
            this._leftrightBtn();
        },

        closeTab:function($tab){
            this._closeTab($('li:eq('+index+')',this.$tabs));
        }
    });

    var TabPageBody = function($parent,options){
        this.$parent = $parent;
        this.options = $.extend({
            content:null
        },options);
        this.$body = null;
        this._init();
    };

    $.extend(TabPageBody.prototype,{
        _init:function(){
            this._createBody();
        },
        _createBody:function(){
            this.$body = $('<div class="' + TABPAGE_BODY + '"></div>');
            this.$parent.append(this.$body);
            this._load();
        },
        _load:function(){
            var iframe = true;
            //jQuery
            if(this.options.content instanceof jQuery){
                iframe = false;
            }
            //HTML
            else if(/^<\w+>.*/g.test(this.options.content)){
                iframe = false;
            }
            if(iframe){
                var $iframe = $('<iframe src="'+this.options.content+'"></iframe>');
                this.$body.append($iframe);
            }
            else{
                this.$body.append(this.options.content);
            }
        },
        _destory:function(){
            this.$body.remove();
        },
        show:function(){
            this.$body.show();
        },
        hide:function(){
            this.$body.hide();
        }
    });

    cri.TabPage = TabPage;

    $.fn.tabPage = function(option) {
        var o = null;
        this.each(function () {
            var $this = $(this),
                options = typeof option == 'object' && option;
            o = $this.data('tabPage');
            if(o != null){
                o._destory();
            }
            $this.data('tabPage', (o = new TabPage(this,options)));
        });
        return o;
    };
}(window);

/*=====================================================================================
 * easy-bootstrap-textarea v2.0
 *
 * @author:niyq
 * @date:2013/08/22
 * @dependce:jquery
 *=====================================================================================*/
!function($){

    "use strict";

    var Textarea = function(element,dataOptions){
        var thisObject = this;
        this.$element = $(element);
        this.dataOptions = $.extend({}, $.fn.textarea.defaults, dataOptions);
        this.value = this.$element.val();
        this.title="";
        if(this.$element.attr("title"))
            this.title = this.$element.attr("title");
        if(this.dataOptions.title)
            this.title = this.dataOptions.title;
        this.id = this.$element.attr("id");
        this.name = this.$element.attr("name");
        if(this.$element.attr("placeholder"))
            this.placeholder = this.$element.attr("placeholder");
        else
            this.placeholder = "";
        this.init();     //初始化textareaGroup组件
        this.setStyle();
        this.$element.change(function(){
            thisObject.check();
        });
    };

    Textarea.prototype.check = function(){
        var thisObject = this;
        var result = {length:0,result:true};
        var val = this.$element.val();
        if(this.dataOptions.required == true){
            if(!val){
                result['required'] = 'fail';
                result.result = false;
                result.length++;
            }
        }
        return result;
    };

    Textarea.prototype.init = function(){
        var thisObject = this;
        this.$element.wrap($('<div class="eb_textareaGroup" name="'+thisObject.name+'" value="'+thisObject.value+'" data-options="'+thisObject.$element.data('options')+'" id="'+thisObject.id+'_subgroup"></div>'));
        this.parent = this.$element.parent();                 //parent
        this.parent.data('textarea',thisObject);
        this.parent.prepend('<div class="eb_title">'+this.title+'</div>');
        this.titleObj = this.parent.children('.eb_title');          //titleObj
        this.textareaObj = this.$element;                             //textareaObj
        if(this.dataOptions.defaultVal)
            this.textareaObj.val(thisObject.dataOptions.defaultVal);
        //this.textareaObj.attr("id","");
        if(this.dataOptions.required == true){
            this.textareaObj.attr('placeholder',thisObject.placeholder+'（必填）');
            this.parent.append('<span class="redStar">*</span>');
        }
        this.style = this.textareaObj.attr("style");
        this.parent.attr("style",thisObject.style);
        this.setWidth();
        this.setHeight();
        this.setEvent();
    };

    Textarea.prototype.setWidth = function(){
        if(this.dataOptions.width){
            var width = this.dataOptions.width;
            if(typeof width == "string")
                width = width.split("px")[0];
            this.parent.width(width);
            this.textareaObj.width(width-86);
        }
        if(this.dataOptions.titleWidth || this.dataOptions.titleWidth == 0){
            var titleWidth = this.dataOptions.titleWidth;
            if(typeof titleWidth == "string")
                titleWidth = titleWidth.split("px")[0];
            var width = this.parent.width();
            var textareaWidth = width - titleWidth - 13;
            this.textareaObj.width(textareaWidth);
            this.titleObj.width(titleWidth);
        }
    };

    Textarea.prototype.setValue = function(value){
        this.textareaObj.val(value);
        this.parent.attr("value",value);
    };

    Textarea.prototype.getValue = function(){
        return this.textareaObj.val();
    };

    Textarea.prototype.clearValue = function(){
        this.setValue("");
    };

    Textarea.prototype.setHeight = function(){
        if(this.dataOptions.height){
            var height = this.dataOptions.height;
            if(typeof height == "string")
                height = height.split("px")[0];
            this.parent.height(height);
            this.textareaObj.height(height-6);
        }
    };

    Textarea.prototype.setStyle = function(){
        var thisObject = this;
        this.textareaObj.focus(function(){
            thisObject.textareaObj.addClass("focus");
        }).blur(function(){
            thisObject.textareaObj.removeClass("focus");
        });
    };

    Textarea.prototype.check = function(){
        var thisObject = this;
        var result = {length:0,result:true};
        var val = this.$element.val();
        if(this.dataOptions.required == true){
            if(!val){
                result['required'] = 'fail';
                result.result = false;
                result.length++;
            }
        }
        if(this.dataOptions.validtype == 'numOnly'){
            if(!this.setNumOnly()){
                result['numOnly'] = 'fail';
                result.result = false;
                result.length++;
                thisObject.setValue(thisObject.value);
            }else{
                thisObject.value = thisObject.getValue();
            }
        }
        return result;
    };

    Textarea.prototype.setEvent = function(){          //处理绑定事件的方法，包括：onclick,onmousedown,onmouseup,ondblclick,onfocus,onblur,onkeypress,onkeydown,onkeyup,onchange
        var TIMEOUT = 250;
        if(this.dataOptions.dblclickTimeSpan)
            TIMEOUT = this.dataOptions.dblclickTimeSpan;
        var thisObject = this;
        var clickTimeoutId = null,mousedownTimeoutId = null,mouseupTimeoutId = null;
        var clickLock = false,mousedownLock = false,mouseupLock = false;
        if(this.dataOptions.onclickHandler){             //onclick
            if(this.dataOptions.ondblclickHandler){
                if(typeof this.dataOptions.onclickHandler == "string"){
                    this.textareaObj.get(0).onclick = function(){
                        if(!clickLock){
                            clickTimeoutId = setTimeout(window[this.dataOptions.onclickHandler],TIMEOUT);
                            clickLock = true;
                            setTimeout(function(){clickLock=false;},TIMEOUT);
                        }
                    };
                }else{
                    this.textareaObj.get(0).onclick = function(){
                        if(!clickLock){
                            clickTimeoutId = setTimeout(thisObject.dataOptions.onclickHandler,TIMEOUT);
                            clickLock = true;
                            setTimeout(function(){clickLock=false;},TIMEOUT);
                        }
                    };
                }
            }else{
                if(typeof this.dataOptions.onclickHandler == "string"){
                    this.textareaObj.get(0).onclick = window[this.dataOptions.onclickHandler];
                }else{
                    this.textareaObj.get(0).onclick = thisObject.dataOptions.onclickHandler;
                }
            }
        }
        if(this.dataOptions.onmousedownHandler){             //onmousedown
            if(this.dataOptions.ondblclickHandler){
                if(typeof this.dataOptions.onmousedownHandler == "string"){
                    this.textareaObj.get(0).onmousedown = function(){
                        if(!mousedownLock){
                            mousedownTimeoutId = setTimeout(window[this.dataOptions.onmousedownHandler],TIMEOUT);
                            mousedownLock = true;
                            setTimeout(function(){mousedownLock=false;},TIMEOUT);
                        }
                    };
                }else{
                    this.textareaObj.get(0).onmousedown = function(){
                        if(!mousedownLock){
                            mousedownTimeoutId = setTimeout(thisObject.dataOptions.onmousedownHandler,TIMEOUT);
                            mousedownLock = true;
                            setTimeout(function(){mousedownLock=false;},TIMEOUT);
                        }
                    };
                }
            }else{
                if(typeof this.dataOptions.onmousedownHandler == "string"){
                    this.textareaObj.get(0).onmousedown = window[this.dataOptions.onmousedownHandler];
                }else{
                    this.textareaObj.get(0).onmousedown = thisObject.dataOptions.onmousedownHandler;
                }
            }
        }
        if(this.dataOptions.onmouseupHandler){             //onmouseup
            if(this.dataOptions.ondblclickHandler){
                if(typeof this.dataOptions.onmouseupHandler == "string"){
                    this.textareaObj.get(0).onmouseup = function(){
                        if(!mouseupLock){
                            mouseupTimeoutId = setTimeout(window[this.dataOptions.onmouseupHandler],TIMEOUT);
                            mouseupLock = true;
                            setTimeout(function(){mouseupLock=false;},TIMEOUT);
                        }
                    };
                }else{
                    this.textareaObj.get(0).onmouseup = function(){
                        if(!mouseupLock){
                            mouseupTimeoutId = setTimeout(thisObject.dataOptions.onmouseupHandler,TIMEOUT);
                            mouseupLock = true;
                            setTimeout(function(){mouseupLock=false;},TIMEOUT);
                        }
                    };
                }
            }else{
                if(typeof this.dataOptions.onmouseupHandler == "string"){
                    this.textareaObj.get(0).onmouseup = window[this.dataOptions.onmouseupHandler];
                }else{
                    this.textareaObj.get(0).onmouseup = thisObject.dataOptions.onmouseupHandler;
                }
            }
        }
        if(this.dataOptions.ondblclickHandler){             //ondblclick
            if(typeof this.dataOptions.ondblclickHandler == "string"){
                this.textareaObj.get(0).ondblclick = function(){
                    if(clickTimeoutId){
                        clearTimeout(clickTimeoutId);
                        clickTimeoutId = null;
                    }
                    if(mousedownTimeoutId){
                        clearTimeout(mousedownTimeoutId);
                        mousedownTimeoutId = null;
                    }
                    if(mouseupTimeoutId){
                        clearTimeout(mouseupTimeoutId);
                        mouseupTimeoutId = null;
                    }
                    window[thisObject.dataOptions.ondblclickHandler]();
                };
            }else{
                this.textareaObj.get(0).ondblclick = function(){
                    if(clickTimeoutId){
                        clearTimeout(clickTimeoutId);
                        clickTimeoutId = null;
                    }
                    if(mousedownTimeoutId){
                        clearTimeout(mousedownTimeoutId);
                        mousedownTimeoutId = null;
                    }
                    if(mouseupTimeoutId){
                        clearTimeout(mouseupTimeoutId);
                        mouseupTimeoutId = null;
                    }
                    thisObject.dataOptions.ondblclickHandler();
                };
            }
        }
        if(this.dataOptions.onfocusHandler){                //onfocus
            if(typeof this.dataOptions.onfocusHandler == "string"){
                this.textareaObj.get(0).onfocus = window[this.dataOptions.onfocusHandler];
            }else{
                this.textareaObj.get(0).onfocus = this.dataOptions.onfocusHandler;
            }
        }
        if(this.dataOptions.onblurHandler){                //onblur
            if(typeof this.dataOptions.onblurHandler == "string"){
                this.textareaObj.get(0).onblur = window[this.dataOptions.onblurHandler];
            }else{
                this.textareaObj.get(0).onblur = this.dataOptions.onblurHandler;
            }
        }
        if(this.dataOptions.onkeypressHandler){                //onkeypress
            if(typeof this.dataOptions.onkeypressHandler == "string"){
                this.textareaObj.get(0).onkeypress = window[this.dataOptions.onkeypressHandler];
            }else{
                this.textareaObj.get(0).onkeypress = this.dataOptions.onkeypressHandler;
            }
        }
        if(this.dataOptions.onkeydownHandler){                //onkeydown
            if(typeof this.dataOptions.onkeydownHandler == "string"){
                this.textareaObj.get(0).onkeydown = window[this.dataOptions.onkeydownHandler];
            }else{
                this.textareaObj.get(0).onkeydown = this.dataOptions.onkeydownHandler;
            }
        }
        if(this.dataOptions.onkeyupHandler){                //onkeyup
            if(typeof this.dataOptions.onkeyupHandler == "string"){
                this.textareaObj.get(0).onkeyup = window[this.dataOptions.onkeyupHandler];
            }else{
                this.textareaObj.get(0).onkeyup = this.dataOptions.onkeyupHandler;
            }
        }
        if(this.dataOptions.onchangeHandler){                //onchange
            if(typeof this.dataOptions.onchangeHandler == "string"){
                this.textareaObj.get(0).onchange = window[this.dataOptions.onchangeHandler];
            }else{
                this.textareaObj.get(0).onchange = this.dataOptions.onchangeHandler;
            }
        }
    };

    $.fn.textarea = function (option,param) {
        var result = null;
        var thisObj = this.each(function () {
            var $this = $(this)
                , thisObject = $this.data('textarea')
                , dataOptions = typeof option == 'object' && option;
            if(typeof option == 'string' ){
                result = thisObject[option](param);
            }else{
                $this.data('textarea', (thisObject = new Textarea(this, dataOptions)));
            }
        });
        if(typeof option == 'string' )return result;
        return thisObj;
    };

    $.fn.textarea.defaults = {
        required:false,
        dblclickTimeSpan:250,
        width:250,
        height:90,
        titleWidth:73
    };

    $(window).on('load', function(){
        $(".eb_textarea").each(function () {
            var thisObj = $(this)
                , dataOptionsStr = thisObj.data('options');
            if(!dataOptionsStr)
                thisObj.textarea($.fn.textarea.defaults);
            else
                thisObj.textarea((new Function("return {" + dataOptionsStr + "}"))());
        });
    });
}(window.jQuery);

/*=====================================================================================
 * easy-bootstrap-timeInput v2.0
 *
 * @author:niyq
 * @date:2013/09/05
 * @dependce:jquery
 *=====================================================================================*/
!function(window){

    "use strict";

    var cri = window.cri,
        $   = window.jQuery;

    var TIME_INPUT_GROUP = "eb_timeInputGroup",
        TIME_BOX         = "eb_timeBox",
        TIME_INPUT_ICON  = "fa fa-table";

    /**
     * 获取某年的月份数组
     * @param year
     * @returns {number[]}
     */
    function getMonthArr (year){
        if(cri.isLeapYear(year))
            return [31,29,31,30,31,30,31,31,30,31,30,31];
        else
            return [31,28,31,30,31,30,31,31,30,31,30,31];
    }


    var _defaultOptions = {
        value:null,
        format:"yyyy/MM/dd",
        HMS:false
    };

    var TimeInput = cri.Widgets.extend(function(element,options){
        if(!options.HMS && options.format){
            options.format = options.format.replace(/\s*[Hh].*$/,"");
        }
        this.options = _defaultOptions;
        this.date  = null;
        this.input = null;
        this.selectView = null;
        cri.Widgets.apply(this,arguments);
    });

    TimeInput.prototype._init = function(){
        var $element = this.$element.attr("role","timeInput");
        $element.wrap('<div class="'+TIME_INPUT_GROUP+'"></div>');
        this.$timeInputGroup = $element.parent();
        this.date = this.options.value || new Date();
        this._wrapInput();
        this._timeSelectView();
    };

    /**
     * 生成Input
     * @private
     */
    TimeInput.prototype._wrapInput = function(){
        var that = this,
            value = this.date,
            button = {iconCls:TIME_INPUT_ICON,handler:function(){
                that.selectView.toggle();
            }};

        this.input = new cri.Input(this.$element,{readonly:true,value:cri.formatDate(value,this.options.format),button:button,onFocus:function(){
            that.selectView.toggle();
        }});
    };

    /**
     * 日期选择下拉面板
     * @private
     */
    TimeInput.prototype._timeSelectView = function(){
        var that = this,
            date = this.date;
        this.selectView = new TimeSelectView(this.$timeInputGroup,{
            value:date,
            HMS:this.options.HMS,
            onChange:function(){
                that.date = this.getDate();
                that.input.value(cri.formatDate(that.date,that.options.format));
            }
        });
    };

    /**
     * 设置值
     * @private
     */
    TimeInput.prototype._setValue = function(value){
        this.date = value;
        this.input.value(cri.formatDate(value,this.options.format));
        this.selectView.setDate(value);
    };

    TimeInput.prototype.value = function(value){
        if(value == undefined){
            return this.date;
        }
        else{
            this._setValue(value);
        }
    };

    var TimeSelectView = function($parent,options){
        this.$parent = $parent;
        this.$timeBox = null;
        this.$daySelect = null;
        this.options = $.extend({
            value:new Date(),
            HMS:false,
            onChange:null
        },options);
        this.date = cri.date2Json(this.options.value);
        this._create($parent);
    };

    TimeSelectView.prototype = {
        /**
         * 生成时间选择下拉面板
         * @returns {*|HTMLElement}
         * @private
         */
        _create:function($parent){
            var $timeBox = this.$timeBox = $('<div class="' + TIME_BOX + '"></div>');
            var $titleBar = $('<div class="eb_titleBar"></div>');
            $titleBar.append(
                this._yearSelect(),
                this._monthSelect(),
                '<span style="position:absolute;top:5px;right:23px;">月</span>');
            $timeBox.append($titleBar,this._daySelect());
            if(this.options.HMS == true){
                $timeBox.append(this._hmsSelect());
            }
            $parent.append($timeBox);
        },

        _yearSelect : function(){
            var that = this;
            var date = this.date;
            var $yearSelect = $('<div class="eb_yearSelecter"></div>');
            var $minusBtn   = $('<i class="eb_toLastYear eb_yearButton fa fa-minus"></i>');
            var $plusBtn    = $('<i class="eb_toNextYear eb_yearButton fa fa-plus"></i>');
            var $year       = $('<span class="eb_year">' + date.yyyy + '</span>');

            $minusBtn.on("click",function(){
                $year.html(--that.date.yyyy);
                that._change();
            });
            $plusBtn.on("click",function(){
                $year.html(++that.date.yyyy);
                that._change();
            });
            $yearSelect.append($minusBtn,$year,'年',$plusBtn);
            return $yearSelect;
        },

        _monthSelect:function(){
            var that = this,
                date = this.date,
                $select = $('<select class="eb_monthSelect">');

            $.each([1,2,3,4,5,6,7,8,9,10,11,12],function(index,value){
                value < 10 && (value = "0" + value);
                $select.append('<option value="' + index + '">' + value + '</option>');
            });
            $select.val(date.MM);

            $select.on("change",function(){
                date.MM = $select.val();
                that._refreshDaySelect();
                that._change();
            });

            return $select;
        },

        _daySelect:function(){
            var $daySelect = this.$daySelect = $('<table></table>'),
                $week = $('<tr class="week"></tr>'),
                week = {"Sunday":"日","Monday":"一","Tuesday":"二","Wednesday":"三",Thursday:"四","Friday":"五","Saturday":"六"},
                that = this;
            for(var day in week){
                var $day = $('<th>' + week[day] + '</th>');
                day == "Sunday" && $day.addClass("eb_red");
                day == "Saturday" && $day.addClass("red");
                $week.append($day);
            }
            $daySelect.append($week);
            for(var i=0; i<6; i++){
                var $tr = $('<tr class="days"></tr>');
                for(var j=0; j<7;j++){
                    var $td = $("<td></td>").on("click",function(){
                        var day = $(this).text();
                        if(day && day!=that.date.dd){
                            $('td.choosed',$daySelect).removeClass("choosed");
                            that.date.dd = +day;
                            $(this).addClass("choosed");
                            that._change();
                        }
                    });
                    $tr.append($td);
                }
                $daySelect.append($tr);
            }
            this._refreshDaySelect();
            return $daySelect;
        },

        /**
         * 当日期改变后，刷新daySelect
         * @private
         */
        _refreshDaySelect:function(){
            var date   = this.date,
                maxDay = getMonthArr(date.yyyy)[date.MM],
                shift  = new Date(date.yyyy,date.MM,1).getDay();
            $('td.choosed',this.$daySelect).removeClass("choosed");
            $('tr.days td',this.$daySelect).html("");
            for(var i=shift;i<maxDay+shift;i++){
                var rows = i%7,
                    cols = Math.floor(i/7),
                    $td = $('tr.days:eq("'+cols+'") td:eq("' + rows + '")',this.$daySelect),
                    day = i- shift + 1;
                $td.text(day);
                day == this.date.dd && $td.addClass("choosed");
            }
        },

        _hmsSelect:function(){
            var $hmsBar      = $('<div class="eb_HMSBar">'),
                $hourInput   = $('<input class="eb_HMSInput eb_Hour" value="00" />'),
                $minuteInput = $('<input class="eb_HMSInput eb_minute"  value="00" />'),
                $secondInput = $('<input class="eb_HMSInput eb_second"  value="00" />'),
                that         = this;

            $hourInput.on("change",_handleNumF(0,23));
            $minuteInput.on("change",_handleNumF(0,59));
            $secondInput.on("change",_handleNumF(0,59));
            function _handleNumF(min,max){
                return function(){
                    var value = +$(this).val();
                    if(value>max){
                        $(this).val(max);
                    }
                    else if(value<min){
                        $(this).val(min);
                    }
                    that.date.HH = +$hourInput.val();
                    that.date.mm = +$minuteInput.val();
                    that.date.ss = +$secondInput.val();
                    that._change();
                };
            }
            $hmsBar.append($hourInput,":",$minuteInput,":",$secondInput);
            $(".eb_HMSInput",$hmsBar).on("keydown",function(e){
                var keycode = e.keyCode || e.which || e.charCode;
                if((keycode>=48 && keycode<=57) || keycode == 8){
                    return true;
                }else{
                    return false;
                }
            });
            return $hmsBar;
        },

        _change:function(){
            this.options.onChange && this.options.onChange.call(this);
        },

        /**
         * 当在非本元素范围内点击，收缩下拉框
         * @private
         */
        _clickBlank:function(){
            var that = this;
            $(document).mouseup(function(e) {
                var _con = that.$parent;
                if (!_con.is(e.target) && _con.has(e.target).length === 0) {
                    that.$timeBox.animate({
                        height:'hide'
                    },200);
                }
            });
        },

        toggle:function(){
            var that = this;
            this.$timeBox.animate({
                height:"toggle"
            },200,function(){
                if(!that.$timeBox.is(":hidden")){
                    that._clickBlank();
                }
            });
        },

        getDate:function(){
            var date = this.date;
            return new Date(date.yyyy,date.MM,date.dd,date.HH,date.mm,date.ss);
        },

        setDate:function(date){
            this.date = cri.date2Json(date);
        }
    };

    $.fn.timeInput = function (option) {
        var o = null;
        this.each(function () {
            var $this = $(this),
                options = typeof option == 'object' && option;
            o = $this.data('timeInput');
            if(o != null){
                o._destory();
            }
            $this.data('timeInput', (o = new TimeInput(this, options)));
        });
        return o;
    };

}(window);

/**
 * Author zhouzy
 * Date   2014/9/18
 * ToolBar 组件
 *
 */
!function(window){

    "use strict";

    var cri = window.cri,
        $   = window.jQuery;

    var _defaultOptions = {
        buttons:[] //按钮组{text:按钮文本,handler:按钮回调函数,iconCls:按钮图标}
    };

    var TOOLBAR = "toolbar";

    function icon(iconCls){
        var $icon = $('<i class="' + iconCls + '"></i>');
        return $icon;
    }
    function button(button){
        var $button = $("<li></li>");
        button.iconCls && $button.append(icon(button.iconCls));
        button.text && $button.append(button.text);
        button.handler && $button.on("click",button.handler);
        return $button;
    }

    var ToolBar = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        this.$toolBar = null;
        cri.Widgets.apply(this,arguments);
    });

    $.extend(ToolBar.prototype,{
        _eventListen:function(){},

        _init:function () {
            this._create(this.$element);
        },

        _create:function($parent){
            var op = this.options;
            var buttons = op.buttons;
            var $toolbar = this.$toolBar = $('<ul class="'+TOOLBAR + '"></ul>');
            for(var i = 0,len = buttons.length; i<len; i++){
                var btn = buttons[i];
                $toolbar.append(button(btn));
            }
            $parent.append($toolbar);
        }
    });
    cri.ToolBar = ToolBar;
}(window);
/**
 * Author zhouzy
 * Date   2014/9/23
 *
 * Tree
 * 继承 Widgets
 */

!function(window){

    "use strict";

    var $   = window.jQuery,
        cri = window.cri;

    /**
     * 定义表格标题，工具栏，分页高度
     */
    var _titleH    = 31, //标题高度
        _toolbarH  = 31, //工具栏高度
        _iconWidth = 16; //

    var fileIcons = {"file":"icon fa fa-file","folderOpen":"icon fa fa-folder-open","folderClose":"icon fa fa-folder"};

    var _defaultOptions = {
        url:"",
        title:null,
        param:null,
        rows:[],
        onSelected:null,
        onDblClick:null,
        page:true,
        async:false,
        asyncUrl:null
    };

    /**
     * 计算原始元素高度
     * 1.若初始化时，定义了高度属性
     * 2.若设置了高度属性(height)
     * 3.若设置了高度样式
     * 4.都未定义 默认auto
     * @param $ele
     * @param height 初始化时指定的高度
     * @private
     */
    function _getElementHeight($ele,height){
        var styleHeight = $ele[0].style.height,
            propHeight  = $ele[0].height,
            calHeight   = height || styleHeight || propHeight;

        if(calHeight){
            var arr = ("" + calHeight).split("%");
            if(arr.length>1){
                calHeight = Math.floor($ele.parent().height() * arr[0] / 100);
                calHeight -= 2;
            }
            calHeight = (""+calHeight).split("px")[0];
            if(calHeight){
                return parseInt(calHeight);
            }
        }
        else{
            return null;
        }
    }

    /**
     * 1.如果组件初始化时,定义了高宽属性
     * 2.如果table设置了高宽(style)
     * 3.如果table设置了高宽属性
     * 4.都未定义 默认为100%
     * @private
     */
    function _getElementWidth($ele,width){
        var styleWidth = $ele[0].style.width,
            propWidth  = $ele[0].width,
            calWidth   = width || styleWidth || propWidth || "100%";

        var arr = ("" + calWidth).split("%");
        if(arr.length>1){
            return Math.floor($ele.parent().width() * arr[0] / 100);
        }
        calWidth = calWidth.split("px")[0];
        return parseInt(calWidth);
    }

    var Tree = cri.Tree = cri.Widgets.extend(function (element,options) {
        this.options = _defaultOptions;
        this.$tree = null;
        this.$treebody = null;
        this.selectedRow = null;
        this.toolbar = null;
        this._className = "tree";
        cri.Widgets.apply(this,arguments);
    });

    $.extend(Tree.prototype,{
        _init:function () {
            this._getData();
            this._createTree();
        },

        _eventListen:function(){
            var that = this;
            this.$treebody
                .on('click',"div.li-content",function(e){that._setSelected(e);})
                .on('click', "li i.icon", function(e){
                    that._fold(e);
                    return false;
                })
                .on('dblclick', "div.li-content", function(e){
                    that._onDblClickRow(e);
                });
        },

        /**
         * 展开、收缩子节点
         * @param e
         * @private
         */
        _fold:function(e){
            var op = this.options,
                item = $(e.target).closest("div"),
                id = item.data('uid'),
                $li = $(e.target).closest("li"),
                $icon = $("i",item);

            $icon.is(".fa-folder")?
                $icon.removeClass("fa-folder").addClass("fa-folder-open"):
                $icon.removeClass("fa-folder-open").addClass("fa-folder");

            this._getDataById(id);

            if(op.async){
                var pa = {};
                $.each(op.selectedRow,function(index,data){index != "childrenList" && (pa[index] = data);});
                op.selectedRow.childrenList || $.ajax({
                    type: "get",
                    url: op.asyncUrl,
                    success: function(data){
                        op.selectedRow.childrenList = data.rows;
                        this._appendChildren($li,data.rows);
                    },
                    data:pa,
                    dataType:"JSON",
                    async:false
                });
            }
            else{
                this._expand($li);
            }
        },

        /**
         * 收缩、展开后代节点
         * @param $li
         * @private
         */
        _expand:function($li){
            var $ul = $li.children("ul");
            if($ul.length){
                $ul.children("li").each(function(){
                    $(this).animate({
                        height:"toggle"
                    },500);
                });
            }
        },

        /**
         * 同步数据
         * @returns {boolean}
         * @private
         */
        _getData:function(){
            var tree = this;
            $.ajax({
                type: "get",
                url: this.options.url,
                success:function(data, textStatus){
                    tree.options.rows = data.rows;
                },
                data:this.options.param,
                dataType:"JSON",
                async:false
            });
            return true;
        },

        /**
         * 生成tree视图
         * @private
         */
        _createTree:function(){
            var op      = this.options,
                height  = _getElementHeight(this.$element,op.height),
                width   = _getElementWidth(this.$element,op.width),
                $tree   = $("<div></div>").addClass(this._className).width(width),

                $treeview = this.$treeview = $("<div></div>").addClass("tree-view"),
                $treebody = this.$treebody = $("<ul></ul>").addClass("tree-body");

            $tree.attr("style",this.$element.attr("style")).show().height(height);
            $treeview.append($treebody);
            if(height){
                this.options.title   && (height -= _titleH);
                this.options.toolbar && (height -= _toolbarH);
                this.$treeview.css("height",height);
            }
            this.$element.wrap($tree);
            this.$element.hide();
            this.$tree = this.$element.parent();
            this._createTitle(this.$tree);
            this._createToolbar(this.$tree);
            this._eachNode($treebody,op.rows,"show",0,0);
            this.$tree.append($treeview);
        },

        /**
         * 递归生成节点
         * 节点默认显示打开
         * @param $li
         * @param children
         * @private
         */
        _appendChildren:function($li,children){
            var $ul    = $("<ul></ul>"),
                indent = $(i,$li).attr("marginLeft");
            this._eachNode($ul,children,"show",0,indent);
            $li.append($ul);
        },

        /**
         * 生成每个节点
         * 同步树(当点击fold节点，不查询后台数据)
         * 异步树(当点击fold检点，实时查询后台后代节点)
         * 当为同步树，检查children进行递归生成节点
         * 当为异步树，检查hasChildren,children字段，hasChildren==true && (!children || children.length==0)时，访问后台
         *
         * @param $ul
         * @param data
         * @param isShow
         * @param id
         * @param indent
         * @private
         */
        _eachNode:function($ul,data,isShow,id,indent){
            for(var i = 0,len=data.length; i<len; i++){
                var row      = data[i],
                    $li      = $('<li></li>'),
                    $text    = $('<span class="li-text">' + row.text + '</span>'),
                    $icon    = $('<i class="' + fileIcons.file + '"></i>').css("marginLeft",indent),
                    $content = $('<div class="li-content"></div>').data("uid",++id);
                this._dealNodeData(row);
                $icon.attr("class",fileIcons[row.iconType]);
                $ul.append($li.append($content.append($icon,$text)));
                isShow == "hide" && $li.hide();
                if(row.hasChildren){
                    var $parent = $("<ul></ul>");
                    $li.append($parent);
                    indent += _iconWidth;
                    row.state && row.state == "close"
                        ? this._eachNode($parent,row.children,"hide",id*1000,indent)
                        : this._eachNode($parent,row.children,isShow,id*1000,indent);
                    indent -= _iconWidth;
                }
            }
        },

        /**
         * 处理node数据的默认值
         * state：默认值open
         * 获取节点图标类型
         * 如果节点指定 hasChildren 则图标显示为文件夹，
         * 如果 children 不存在，则显示为关闭文件夹
         * 如果未指定 state ，则默认为 close
         * @param node
         * @private
         */
        _dealNodeData:function(node){
            node.iconType = "file";
            if(node.children && node.children.length>0){
                node.hasChildren = true;
            }
            if(node.hasChildren){
                if(node["state"] == undefined || node["state"] == null){
                    node["state"] = "open";
                }
                if(node.state && node.state=="open" && node.children && node.children.length>0){
                    node.iconType = "folderOpen";
                }
                else{
                    node.iconType = "folderClose";
                }
            }
        },

        _createTitle:function($parent){
            if(this.options.title){
                this.$title = $('<div class="title"><span>' + this.options.title + '</span></div>');
                $parent.append(this.$title);
            }
        },

        _createToolbar:function($parent){
            if(this.options.toolbar) {
                this.toolbar = new cri.ToolBar($parent, {
                    buttons: this.options.toolbar
                });
            }
        },

        _setSelected:function(e){
            var item = $(e.target).closest("div")
                ,id = item.data('uid')
                ,op = this.options;
            this._getDataById(id);
            if(op.onSelected){
                op.onSelected(op.selectedRow);
            }
        },

        _clickToolbar:function(e){
            var toolbar = $(e.target)
                ,index = toolbar.data('toolbar');
            this.options.toolbar[index].handler();
        },

        _getDataById:function(id){
            var op = this.options
                ,rowdata = null;

            !function getRow(data){
                var arr = [];
                while(id >= 1){
                    var t = id%1000;
                    arr.push(t);
                    id = Math.floor(id/1000);
                }
                for(var i = arr.length - 1; i >= 0 ; i--){
                    var k = arr[i] - 1;
                    data[k]&&(rowdata = data[k])&&(data = data[k].children);
                }
            }(op.rows);

            op.selectedRow = rowdata;
        },

        _onDblClickRow:function(e){
            var item = $(e.target).closest("div")
                ,id = item.data('uid')
                ,op = this.options;
            this._getDataById(id);
            if(op.onDblClick){
                op.onDblClick(op.selectedRow);
            }
            return false;
        },

        getSelected:function(){
            return this.options.selectedRow;
        },

        reload:function(param){
            param && (this.options.param = param);
            this._init();
        }
    });

    $.fn.tree = function (option,param) {
        var tree = null;
        this.each(function () {
            var $this   = $(this),
                options = typeof option == 'object' && option;
            $this.data('tree', (tree = new Tree(this, options)));
        });
        return tree;
    };

}(window);
/**
 * Author zhouzy
 * Date   2014/9/23
 *
 * TreeGrid
 *
 * 依赖 Grid
 */
!function(window){

    var $   = window.jQuery,
        cri = window.cri;

    var TreeGrid = cri.TreeGrid = cri.Grid.extend(function(element,options){
        this._gridClassName = "treegrid";
        cri.Grid.apply(this,arguments);
        this._selfEvent();
    });

    TreeGrid.prototype._selfEvent = function(){
        var that = this;
        this.$gridbody
            .on('click', "tr td.line-file-icon i", function(e){
                that._fold(e);e.preventDefault();
            });
    };

    TreeGrid.prototype._refreshBody = function(){
        var $parent = this.$gridbody,
            $table  = $("<table></table>"),
            op      = this.options,
            columns = this._columns,
            lineNum = 1,
            paddingLeft = 1,
            iconWidth = 6;
        $table.append(this._createColGroup($parent.width()));
        /**
         * 拼装每行HTML
         */
        !function getRowHtml(rows,isShow,id){
            for(var i = 0,len = rows.length; i<len; i++){
                var $tr = $("<tr></tr>").data("rowid",++id).attr("data-rowid",id);
                var row = rows[i];

                isShow == "show" || $tr.hide();

                if(op.checkBox){
                    row.check ?
                        $tr.append($("<td></td>").addClass("line-checkbox").append('<input type="checkbox" checked/>')):
                        $tr.append($("<td></td>").addClass("line-checkbox").append('<input type="checkbox"/>'));

                }
                if(op.rowNum){
                    $tr.append($("<td></td>").addClass("line-number").append(lineNum++));
                }

                getColHtml($tr,columns,row,paddingLeft);
                $table.append($tr);

                if(row.children && row.children.length > 0){
                    row.hasChildren = true;
                    paddingLeft += iconWidth;
                    row.state && row.state == "closed" ?
                        getRowHtml(row.children,"hide",id*1000) :
                        getRowHtml(row.children,isShow,id*1000);
                    paddingLeft -= iconWidth;
                }
            }
        }(this._rows,"show",0);

        /**
         * 拼装列HTML
         * @param colDef     列定义
         * @param colData    列数据
         * @param textIndent 文件图标缩进
         * @param nodeId     id
         * @returns {Array}
         */
        function getColHtml($tr,colDef,colData,textIndent){
            var fileIcons = {"file":"fa fa-file","folderOpen":"fa fa-folder-open","folderClose":"fa fa-folder"};

            $.each(colDef,function(index){
                var $td = $("<td></td>");
                var text  = colData[this.field] || "";

                if(this.field == "text"){
                    var $icon = $("<i></i>").attr("class",fileIcons.file);
                    if(colData.hasChildren || (colData.children && colData.children.length)){
                        colData.state == "closed" ? $icon.attr("class",fileIcons.folderClose):$icon.attr("class",fileIcons.folderOpen);
                    }
                    $td.css("text-indent",textIndent).addClass("line-file-icon").append($icon).append(text);
                }
                else{
                    $td.text(text);
                }
                $tr.append($td);
            });
        }
        this.$gridbody.removeClass("loading").html($table);
        //fixed IE8 do not support nth-child selector;
        $("tr:nth-child(odd)",$table).css("background","#FFF");
        //根据gird-body 纵向滚动条决定headWrap rightPadding
        var scrollBarW = $parent.width()-$parent.prop("clientWidth");
        this.$gridhead.css("paddingRight",scrollBarW);
    };

    TreeGrid.prototype._fold = function(e){
        var op    = this.options,
            item  = $(e.target).closest("tr"),
            rowid = item.data('rowid'),
            that  = this;
        this.selectedRow = this._getRowDataById(rowid);

        if(this.selectedRow.state == "closed") {
            this.selectedRow.state = "open";
            if(op.async && !this.selectedRow.children){
                var pa = {};
                $.each(this.selectedRow,function(index,data){index != "children" && (pa[index] = data);});
                this.selectedRow.childrenList || $.ajax({
                    type: "post",
                    url: op.asyncUrl,
                    success: function(data, textStatus){
                        that.selectedRow.children = data.rows;
                    },
                    data:pa,
                    dataType:"JSON",
                    async:false
                });
            }
        }
        else{
            this.selectedRow.state = "closed";
        }
        this._refreshBody();
    };

    TreeGrid.prototype._checkbox = function(e){
        var input = $(e.target),
            tr    = $(e.target).closest("tr"),
            rowid = parseInt(tr.data('rowid')),
            id    = rowid,
            row   = this._getRowDataById(rowid),
            isChecked = input.prop("checked");

        !function(data){
            if(data.children && data.children.length > 0){
                id *= 1000;
                !function ita(data){
                    $.each(data,function(){
                        id += 1;
                        $("tr[data-rowid="+ id +"] input[type=checkbox]").prop("checked",isChecked);
                        if(this.children && this.children.length > 0){
                            id*=1000;
                            ita(this.children);
                            id= Math.floor(id/=1000);
                        }
                    });
                }(data.children);
            }
        }(row);
    };

    TreeGrid.prototype._getRowDataById = function(rowid){
        var op = this.options
            ,rowdata = null;
        rowid = parseInt(rowid);

        !function getRow(data){
            var arr = [];
            while(rowid >= 1){
                var t = rowid%1000;
                arr.push(t);
                rowid = Math.floor(rowid/1000);
            }
            for(var i = arr.length - 1; i >= 0 ; i--){
                var k = arr[i] - 1;
                data[k]&&(rowdata = data[k])&&(data = data[k].children);
            }
        }(this._rows);
        return rowdata;
    };

    $.fn.treegrid = function(option) {
        var treeGrid = null;
        this.each(function () {
            var $this    = $(this),
                options  = typeof option == 'object' && option;
            treeGrid = $this.data('treegrid');
            treeGrid && treeGrid.$grid.before($this).remove();
            $this.data('treegrid', (treeGrid = new TreeGrid(this, options)));
        });
        return treeGrid;
    };
}(window);

/**
 * Author zhouzy
 * Date   2014/10/14
 *
 * jQuery 插件基类
 * 继承自Class
 *
 */
!function(window){

    "use strict";

    var cri = window.cri,
        $   = window.jQuery;

    var INPUTSELECTOR = ":input:not(:button,[type=submit],[type=reset],[disabled])",
        CHECKBOXSELECTOR = ":checkbox:not([disabled],[readonly])",
        NUMBERINPUTSELECTOR = "[type=number],[type=range]";

    var emailRegExp = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,
        urlRegExp = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
    function patternMatcher(value, pattern) {
        if (typeof pattern === "string") {
            pattern = new RegExp('^(?:' + pattern + ')$');
        }
        return pattern.test(value);
    }

    function matcher(input, selector, pattern) {
        var value = input.val();
        if (input.filter(selector).length && value !== "") {
            return patternMatcher(value, pattern);
        }
        return true;
    }

    function hasAttribute(input, name) {
        if (input.length)  {
            return input[0].attributes[name] != null;
        }
        return false;
    }

    var Rules = {
        required: function(input) {
            var checkbox = input.filter("[type=checkbox]").length && !input.is(":checked"),
                value = input.val();

            return !(hasAttribute(input, "required") && (value === "" || !value  || checkbox));
        },
        pattern: function(input) {
            if (input.filter("[role=text],[role=email],[role=url],[role=tel],[role=search],[role=password]").filter("[pattern]").length && input.val() !== "") {
                return patternMatcher(input.val(), input.attr("pattern"));
            }
            return true;
        },
        min: function(input){
            if (input.filter(NUMBERINPUTSELECTOR + ",[role=number]").filter("[min]").length && input.val() !== "") {
                var min = parseFloat(input.attr("min")) || 0,
                    val = parseFloat(input.val());
                return min <= val;
            }
            return true;
        },
        max: function(input){
            if (input.filter(NUMBERINPUTSELECTOR + ",[role=number]").filter("[max]").length && input.val() !== "") {
                var max = parseFloat(input.attr("max")) || 0,
                    val = parseFloat(input.val());
                return max >= val;
            }
            return true;
        },

        email: function(input) {
            return matcher(input, "[role=email]", emailRegExp);
        },
        url: function(input) {
            return matcher(input, "[role=url]", urlRegExp);
        },
        date: function(input) {
            if (input.filter("[role^=date]").length && input.val() !== ""){
                return parseDate(input.val(), input.attr("format")) !== null;
            }
            return true;
        }
    };

    var Messages = {
        required:"请输入",
        min:"请输入大于的数字",
        max:"请输入小于的数字",
        email:"请输入合法的邮箱地址",
        url:"请输入合法的URL地址",
        date:"请输入合法的日期"
    };

    var _defaultOptions = {
        rules : Rules,
        messages:Messages,
        validateOnBlur:false
    };

    var Validator = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        cri.Widgets.apply(this,arguments);
    });

    $.extend(Validator.prototype,{
        _init: function(element, options){},
        _eventListen:function(){
            /**
             * 如果是表单,在提交时验证
             * 如果设置validateOnBlur,则在input blur事件中验证
             */
            var that = this,
                $element = this.$element;
            if(this.$element.is("form")){
                this.$element.on("submit",function(){
                    that.validate();
                });
            }
            if(that.options.validateOnBlur){
                if(!$element.is(INPUTSELECTOR)){
                    $element.find(INPUTSELECTOR).each(function(){
                        if($(this).is('[role=timeInput]')){
                            $(this).on("change",function(){
                                that._validateInput($(this));
                            });
                        }else{
                            $(this).on("blur",function(){
                                that._validateInput($(this));
                            });
                        }
                    });
                }else{
                    $element.on("blur",function(){
                        that._validateInput($element);
                    });
                }
            }
        },

        /**
         * 检查 input 合法性
         * @param $input
         * @private
         */
        _checkValidity:function($input){
            var rules = this.options.rules,
                rule;
            for (rule in rules) {
                if (!rules[rule].call(this, $input)) {
                    return { valid: false, key: rule };
                }
            }
            return { valid: true };
        },

        /**
         * 验证表单或者输入框
         */
        validate:function(){
            var that = this,
                $element = this.$element,
                result = true;
            if(!$element.is(INPUTSELECTOR)){
                $element.find(INPUTSELECTOR).each(function(){
                    var isValidity = that._validateInput($(this));
                    result = result && isValidity;
                });
            }else{
                result = result && that._validateInput($element)
            }
            return result;
        },

        /**
         * 验证每个Input
         * @param $input
         * @returns {boolean|Validator._checkValidity.valid|exports.valid|valid}
         * @private
         */
        _validateInput:function($input){
            var result = this._checkValidity($input),
                valid = result.valid;
            if(!valid){
                var $errormsg = $input.next(".input-warm");
                if($errormsg.length == 0){
                    $input.after($('<span class="input-warm">' + this.options.messages[result.key] + '</span>'));
                }
                else{
                    $errormsg.text(this.options.messages[result.key]);
                }
            }else{
                $input.next(".input-warm").remove();
            }
            return valid;
        }
    });

    cri.Validator = Validator;

    $.fn.validator = function(option) {
        var validator = null;
        this.each(function () {
            var $this   = $(this),
                options = typeof option == 'object' && option;
            validator = $this.data('validator');
            if(validator != null){
            }
            $this.data('validator', (validator = new Validator(this, options)));
        });
        return validator;
    };

}(window);
/**
 * Author zhouzy
 * Date   2014/10/14
 * window 组件
 *
 * 继承 Widgets
 *
 */
!function(window){

    "use strict";

    var cri = window.cri,
        $   = window.jQuery;

    var WINDOW_HEAD = "window-head";

    var icons = {Minimize:"fa fa-minus",Maximize:"fa fa-expand","Close":"fa fa-close","Resume":"fa fa-compress"},
        MINI_WINDOW_WIDTH = 140+10,
        ZINDEX = 10000;

    var _defaultOptions = {
        title:"",
        actions:["Close","Minimize","Maximize"],//Colse:关闭,Minimize:最下化,Maximize:最大化
        content:null,
        visible:true,
        modal:false,//模态窗口
        width:600,
        height:400,
        position:{top:0,left:0},
        center:true,//初始时是否居中
        resizable:true,
        onReady:null//当窗口初始化完成时触发
    };

    var Window = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        this.windowStatus = "normal";
        cri.Widgets.apply(this,arguments);
        Window.prototype.windowStack.push(this);
    });

    $.extend(Window.prototype,{

        windowStack : [],

        _initOptions:function(options) {
            this.options = $.extend(true,{}, this.options, options);
            if(options.actions && options.actions.length){
                this.options.actions = options.actions;
            }
        },

        /**
         * 初始化组件监听事件
         * @private
         */
        _eventListen : function(){
            var that = this;
            this.$window
                .on("click",".action",function(){
                    var action = that._actionForButton($(this));
                    action && typeof that[action] === "function" && that[action]();
                    return false;
                })
                .on("click",".window-head",function(){
                    that.toFront();
                })
                .on("mousedown",".window-head",function(e){
                    var left     = +that.$window.css("left").split("px")[0],
                        top      = +that.$window.css("top").split("px")[0],
                        width    = +that.$window.width(),
                        height   = +that.$window.height(),
                        startX   = e.pageX,
                        startY   = e.pageY;
                    $(document).on("mousemove",function(e){
                        var pageX  = e.pageX,
                            pageY  = e.pageY,
                            shiftX = pageX - startX,
                            shiftY = pageY - startY;
                        left += shiftX;
                        top  += shiftY;
                        startX = pageX;
                        startY = pageY;
                        that._setPosition({top:top,left:left,width:width,height:height});
                    });
                })
                .on("mousedown",".window-resizer",function(e){
                    var left     = +that.$window.css("left").split("px")[0],
                        top      = +that.$window.css("top").split("px")[0],
                        width    = +that.$window.width(),
                        height   = +that.$window.height(),
                        startX   = e.pageX,
                        startY   = e.pageY,
                        resizer  = /[ewsn]+$/.exec(this.className)[0];

                    $(document).on("mousemove",function(e){
                        var pageX  = e.pageX,
                            pageY  = e.pageY,
                            shiftX = pageX - startX,
                            shiftY = pageY - startY;
                        startX = pageX;
                        startY = pageY;
                        if(resizer.indexOf("e") >= 0){
                            width += shiftX;
                        }
                        if(resizer.indexOf("w") >= 0){
                            left = pageX;
                            width -= shiftX;
                        }
                        if(resizer.indexOf("n") >= 0){
                            top = pageY;
                            height -= shiftY;
                        }
                        if(resizer.indexOf("s") >= 0){
                            height += shiftY;
                        }
                        that._setPosition({top:top,left:left,width:width,height:height});
                    });
                });
            $(document).on("mouseup",function(){
                $(document).off("mousemove");
            });
        },

        /**
         * 初始化组件DOM结构
         * @private
         */
        _init : function(){
            var op = this.options;
            this._createBody();
            this._overlay();
            this._createHead();
            op.resizable && this._createResizeHandler();
            $("body").append(this.$window);
            if(op.visible){
                this.$window.show();
            }else{
                this.$window.hide();
            }
        },

        /**
         * 生成window 头部
         * @private
         */
        _createHead : function(){
            var $windowHead = $('<div class="' + WINDOW_HEAD + '"></div>');
            $windowHead.append(this._createTitle()).append(this._createActions());
            this.$window.prepend($windowHead);
            this.$windowHead = $windowHead;
        },

        /**
         * 包装window 内容部分
         * @private
         */
        _createBody : function(){
            var that     = this,
                op       = this.options,
                viewWidth = $(window).width(),
                viewHeight = $(window).height(),
                $element = this.$element,
                $window  = $('<div class="window"></div>'),
                $windowBody = $('<div class="window-content"></div>');
            $element.detach();
            this.$window = $window;
            if(op.center){
                op.position.left = (viewWidth - op.width) / 2;
                op.position.top  = (viewHeight - op.height) / 2;
            }
            $window.css({zIndex:this._zIndex()});

            this._setPosition({top:op.position.top,left:op.position.left,width:op.width,height:op.height});

            $window.append($windowBody);

            $windowBody.append($element);

            this.load(this.options.content);

            $("body").append(this.$window);
        },

        /**
         * 生成标题栏
         * @returns {*}
         * @private
         */
        _createTitle : function(){
            var title = this.options.title || "";
            var $title = $("<span></span>").addClass("title").text(title);
            return $title;
        },

        /**
         * 根据actions 按照（最小化，放大，关闭）顺序生成按钮
         * 模态窗口不生成最小化按钮
         * @returns {*}
         * @private
         */
        _createActions : function(){
            var options = this.options,
                $buttons = $("<div></div>").addClass("actions"),
                defaultButtons = options.modal ? ["Maximize","Close"]:["Minimize","Maximize","Close"];

            for(var i = 0, len = defaultButtons.length; i<len; i++){
                var defBtn = defaultButtons[i];
                for(var j = 0,l = options.actions.length; j < l; j++){
                    var action = options.actions[j];
                    if(action == defBtn){
                        var $button = $('<span class="action"></span>').addClass(action.toLowerCase()),
                            $icon   = $('<i class="' + icons[action] + '"></i>');
                        $buttons.append($button);
                        $button.append($icon);
                    }
                }
            }
            return $buttons;
        },

        /**
         * 生成 8个方位的 resizeHandler
         * @private
         */
        _createResizeHandler : function(){
            var resizerHandler = [],
                resizer = "n e s w nw ne se sw";
            $.each(resizer.split(" "),function(index,value){
                resizerHandler.push('<div class="window-resizer window-resizer-' + value + '" style="display: block;"></div>');
            });
            this.$window.append(resizerHandler.join(""));
        },

        /**
         * 生成模态窗口背景遮罩
         * @private
         */
        _overlay : function(){
            if(this.options.modal){
                var zIndex = +this.$window.css("zIndex");
                this.$window.css("zIndex",(zIndex+1));
                var $overlay = $(".overlay");
                if($overlay.length == 0){
                    $overlay = $("<div></div>").addClass("overlay");
                    $("body").append($overlay);
                }
                $overlay.css("zIndex",zIndex).show();
            }
        },

        /**
         * 设置窗口位置
         * @param position {top:number,left:number,height:number,width:number}
         * @private
         */
        _setPosition : function(position){
            var $window = this.$window;
            $window.css(position);
            this.options.position = position;
        },

        /**
         * 根据icon类名返回对应的处理函数
         * @param icon
         * @returns {*}
         * @private
         */
        _actionForButton : function(button) {
            var iconClass = /\baction \w+\b/.exec(button[0].className)[0];
            return {
                "action minimize": "minimize",
                "action maximize": "maximize",
                "action resume": "resume",
                "action close": "close"
            }[iconClass];
        },

        /**
         * 由最小化打开窗口
         */
        open : function(){
            this._setStyleByStatus("normal");
            $(".window-content",this.$window).show();
            this.windowStatus = "normal";
        },

        /**
         * 关闭当前窗口
         *
         * 隐藏并且放置到最底层
         */
        close : function(){
            var max      = ZINDEX,
                frontWnd = null,
                $windows = $(".window"),
                $overlay = $(".overlay");

            this.$window.css("zIndex",ZINDEX).hide();
            $windows.each(function(){
                var z = +this.style.zIndex + 1;
                this.style.zIndex = z;
                if(z >= max){
                    max = z;
                    frontWnd = this;
                }
            });
            frontWnd.style.zIndex = max+1;
            $windows.is(":visible") ? $overlay.css("zIndex",max) : $overlay.hide();

            this.$window.removeClass("mini-window");
            this.windowStatus = "close";
        },

        /**
         * 最大化窗口
         * 最大化后 复原、关闭
         */
        maximize : function(){
            this._setStyleByStatus("maximize");
            this._setButtons("maximize");
            this.windowStatus = "maximize";
        },

        /**
         * 最小化窗口
         * 依次排放到左下侧
         * 模态窗口没有最小化按钮
         */
        minimize : function(){
            this._setButtons("minimize");
            $(".window-content",this.$window).hide();
            var left = $(".mini-window").size() * MINI_WINDOW_WIDTH;
            this._setStyleByStatus("minimize");
            this.$window.css("left",left);
            this.windowStatus = "minimize";
        },

        /**
         * 复原窗口到初始(缩放、移动窗口会改变初始位置尺寸信息)尺寸、位置
         */
        resume : function(){
            this._setButtons("normal");
            this._setStyleByStatus("normal");
            $(".window-content",this.$window).show();
            if(this.windowStatus == "minimize"){
                var i = 0;
                this.windowStatus = "normal";
                $.each(Window.prototype.windowStack,function(index,wnd){
                    if(wnd.windowStatus == "minimize"){
                        wnd._moveLeft(i++);
                    }
                });
            }
            this.windowStatus = "normal";
        },

        /**
         * 根据窗口的状态设置窗口样式
         * @private
         */
        _setStyleByStatus : function(status){
            var op    = this.options,
                pos   = op.position,
                KLASS = {minimize:"window mini-window",maximize:"window maxi-window",closed:"window",normal:"window"},
                style = {width:op.width,height:op.height,left:pos.left,top:pos.top,bottom:"auto",right:"auto"};
            this.$window.prop("class",KLASS[status]).css(style);
        },

        /**
         * 根据当前窗口状态设置窗口按钮组
         * @param buttons
         * @private
         */
        _setButtons : function(status){
            var BUTTONS = {minimize:["resume","close"],maximize:["resume","close"],normal:["minimize","maximize","close"]};
            var $actions = $(".actions",this.$window);
            $(".action",$actions).hide();

            if(status == "minimize"){
                var $btn = $(".maximize",$actions).removeClass("maximize").addClass("resume");
                $("i",$btn).prop("class",icons["Maximize"]);
            }

            if(status == "maximize"){
                var $btn = $(".maximize",$actions).removeClass("maximize").addClass("resume");
                $("i",$btn).prop("class",icons["Resume"]);
            }
            if(status == "normal"){
                var $btn = $(".resume",$actions).removeClass("resume").addClass("maximize");
                $("i",$btn).prop("class",icons["Maximize"]);
            }
            $.each(BUTTONS[status],function(index,value){
                $("." + value,$actions).show();
            });
        },

        /**
         * 当左侧最小化窗口复原后，右侧最小化窗口依次左移一个窗口位置
         * @param index
         * @private
         */
        _moveLeft : function(index){
            this.$window.css("left",MINI_WINDOW_WIDTH * index);
        },

        /**
         * 把当前窗口顶至最前,与之前最上层窗口替换
         */
        toFront : function(){
            /**
             * 轮询窗口，取最大zindex,替换zindex
             */
            var frontWnd = this._getFrontWindow();
            if(this.$window != frontWnd){
                var zIndex = +this.$window.css("zIndex");
                this.$window.css("zIndex",frontWnd.css("zIndex"));
                frontWnd.css("zIndex",zIndex);
            }
        },

        /**
         * 获取最上层窗口
         * @private
         */
        _getFrontWindow : function(){
            var zIndex = +this.$window.css("zIndex"),
                wnd = this.$window;
            $(".window").each(function(){
                var tempZIndex = +this.style.zIndex;
                if(tempZIndex  > zIndex){
                    wnd = $(this);
                    zIndex = tempZIndex;
                }
            });
            return wnd;
        },

        load:function(content){
            var $element = this.$element,
                that = this,
                op = this.options,
                $loadingIcon = $('<i class="fa fa-spinner fa-spin"></i>').addClass("loadingIcon");
            if(content){
                $element.addClass("loading").html($loadingIcon);
                $element.load(content,function(response,status){
                    $element.removeClass("loading");
                    $loadingIcon.remove();
                    op.onReady && op.onReady.call(that,that.$window);
                });
            }else{
                op.onReady && op.onReady.call(that,that.$window);
            }
        },

        /**
         * 获取最大zIndex
         * @returns {number}
         * @private
         */
        _zIndex : function(){
            var zindex = ZINDEX;
            $(".window").each(function(i,element){
                zindex = Math.max(+this.style.zIndex,zindex);
            });
            return ++zindex;
        },

        _destory : function(){
            var $element = this.$element,
                $warpper = $element.parents(".window");
            $warpper.after($element).remove();
        }
    });
    cri.Window = Window;

    $.fn.window = function(option) {
        var wnd = null;
        this.each(function () {
            var $this   = $(this),
                wnd     = $this.data('window'),
                options = typeof option == 'object' && option;
            if(wnd != null){
                wnd._destory();
            }
            $this.data('window', (wnd = new Window(this, options)));
        });
        return wnd;
    };
}(window);