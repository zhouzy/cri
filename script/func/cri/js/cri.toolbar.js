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
        buttons:[] //按钮组{text:按钮文本,handle:按钮回调函数,iconCls:按钮图标}
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
        button.handle && $button.on("click",button.handle);
        return $button;
    }

    var ToolBar = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        this.$toolBar = null;
        cri.Widgets.apply(this,arguments);
    });

    $.extend(ToolBar.prototype,{
        _eventListen:function(){
            var that = this;
            this.$toolBar.on("click","li",function(e){
            });
        },

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
            $parent.html($toolbar);
        }
    });
    cri.ToolBar = ToolBar;
}(window);