/**
 * Author zhouzy
 * Date   2014/9/23
 *
 * Widgets:插件基类
 */

!function(cri){

    "use strict";

    var Widgets = function (element, options) {
        this.defaultOptions = {};
        this.options     = $.extend({},this.defaultOptions,options);
        this.$element    = $(element);
        this.init();
        this.bind();
    };

    Widgets.prototype = {
        bind:function(){},
        init:function (){}
    };

    cri.Widgets = Widgets;

}(window.cri);