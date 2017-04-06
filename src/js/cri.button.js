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

    var BUTTON = "btn";

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
            this.$button.on("click",function(evt){
                that.options.enable && that.options.handler && that.options.handler.call();
				evt.preventDefault();
            });
        },

        _init:function(){
            this._create();
        },

        _reInit:function(options){
            this.options = $.extend(this.options,options);
            this.text(this.options.text);
            this.iconCls(this.options.iconCls);
            this.options.enable ? this.enable() : this.disable();
        },

        _create:function(){
            var op = this.options,
                iconCls = op.iconCls || '',
                $e = this.$element,
                $icon = '<span class="icon"><i class="' + iconCls + '"></i></span>';

            $e.addClass(BUTTON);
            $e.prepend($icon);
            op.text && $e.append(op.text);
            if(!op.enable){
                this.disable();
            }
            this.$button = $e;
        },

        /**
         * 设置按钮文本值
         * @param text
         */
        text:function(text){
            if(text.length){
                var $icon = this.$button.find('span.icon').clone();
                this.$button.empty();
                if($icon.length){
                    this.$button.append($icon);
                }
                this.$button.append(text);
            }
        },

        /**
         * 设置按钮图标
         * @param className
         */
        iconCls:function(className){
            this.$button.find('span.icon i').attr('class',className);
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
                button  = $this.data('widget'),
                options = typeof option == 'object' && option;
            if(button != null && button instanceof Button){
                button._reInit(option);
                o = button;
                return false;
            }
            $this.data('widget', (o = new Button(this, options)));

        });
        return o;
    };
}(window);
