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
    Widgets.prototype._destroy = function(){
        var $element = this.$element;
        var $warpper = $element.parent();
        $warpper.after($element).remove();
    };

    /**
     *
     * @private
     */
    Widgets.prototype._getHeightPixelValue = function($d,value){
        var styleHeight = $d[0].style.height,
            propHeight  = $d[0].height,
            calHeight   = value || styleHeight || propHeight;

        if(calHeight){
            var arr = ("" + calHeight).split("%");
            if(arr.length>1){
                /**
                 * 当 parent 为隐藏元素，则不能获取到parent高度,或者 parent 未设置高度,此时返回 null
                 */
                var $parent = $d.parent();
                if($parent.is(":visible") && $parent.style.height){
                    calHeight = Math.floor($d.parent().height() * arr[0] / 100);
                }
                else{
                    return null;
                }
                calHeight = (""+calHeight).split("px")[0];
            }
            if(calHeight){
                return parseInt(calHeight);
            }
        }
        else{
            return null;
        }
    };

    cri.Widgets = Widgets;
}(window);