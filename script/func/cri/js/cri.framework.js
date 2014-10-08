/**
 * Author zhouzy
 * Date   2014/9/23
 *
 * 青牛软件成都研发中心
 * 前端框架 cri
 *
 * 版本 v 2.0
 *
 * 包括组件：datagrid treegrid tree
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

    Class.prototype._initOptions = function(options) {
        this.options = $.extend({}, this.options, options);
    };
    cri.Class = Class;
}(window);