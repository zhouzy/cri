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

    var Button = cri.Widgets.extend(function(element,options){
        this.options     = _defaultOptions;
        this.$inputGroup = null;
        this.$button     = null;
        cri.Widgets.apply(this,arguments);
    });

    $.extend(Button.prototype,{
        _eventListen:function(){
            var that = this,
                enable = this.options.enable;
            this.$button.on("click",function(){
                enable && that.options.handler && that.options.handler.call();
            });
        },

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
            this.$button.removeClass("disabled");
            this.options.enable = false;
        },

        disable:function(){
            this.$button.addClass("disabled");
            this.options.enable = true;
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