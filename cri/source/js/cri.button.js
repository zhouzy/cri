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

    var BUTTON = "btn btn-default";

    var Button = cri.Widgets.extend(function(element,options){
        this.options     = _defaultOptions;
        this.$inputGroup = null;
        this.$button     = null;
        cri.Widgets.apply(this,arguments);
        this.$element.attr('data-role','button');
    });

    $.extend(Button.prototype,{
        _eventListen:function(){
            var that = this;
            this.$button.on("click",function(){
                that.options.enable && that.options.handler && that.options.handler.call();
            });
        },

        _init:function(){
            this._create();
        },

        _create:function(){
            var op = this.options,
                iconCls = op.iconCls || '',
                $e = this.$element.hide(),
                text = op.text || $e.text() || $e.val() || '',
                $icon = '<span class="icon"><i class="' + iconCls + '"></i></span>',
                buttonText = '<span class="text">'+text+'</span>';

            $e.wrap('<div class="'+ BUTTON + '"></div>');
            this.$button = $e.parent();
            this.$button.append($icon, buttonText);
            if(!op.enable){
                this.disable();
            }
        },

        /**
         * 设置按钮文本值
         * @param text
         */
        text:function(text){
            this.$button.find('text').text(text);
        },

        /**
         * 设置按钮图标
         * @param className
         */
        iconCls:function(className){
            this.$button.find('.icon i').attr('class',className);
        },

        enable:function(){
            this.$button.removeClass("disabled");
            this.options.enable = true;
        },

        disable:function(){
            this.$button.addClass("disabled");
            this.options.enable = false;
        }
    });

    cri.Button = Button;

    $.fn.btn = function(option) {
        var o = null;
        this.each(function () {
            var $this   = $(this),
                button  = $this.data('button'),
                options = typeof option == 'object' && option;
            if(button != null){
                button._destroy();
            }
            $this.data('button', (o = new Button(this, options)));
        });
        return o;
    };
}(window);