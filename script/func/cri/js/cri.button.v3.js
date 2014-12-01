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
        onClick:null,//button={iconCls:"",handler:""}
        enable:true
    };

    var BUTTON = "button";

    var Button = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        this.$inputGroup = null;
        cri.Widgets.apply(this,arguments);
    });

    $.extend(Button.prototype,{
        _eventListen:function(){

        },

        _init:function(){
            this._create();
        },

        _create:function(){
            var op = this.options,
                $e = this.$element.hide();

            $e.wrap('<div class="'+ BUTTON + '"></div>');

            var $button = this.$button = $e.parent();
            var $icon = $('<i class="' + op.iconCls + '"></i>');
            var text = op.text || $e.text() || $e.val();
            $button.append($icon, text);
            $button.on("click",function(){
                op.onClick && op.onClick.call();
            });
        },

        _destory:function(){

        }
    });

    cri.Button = Button;

    $.fn.button = function(option) {
        var o = null;
        this.each(function () {
            var $this   = $(this),
                o   = $this.data('button'),
                options = typeof option == 'object' && option;
            if(o != null){
                o._destory();
            }
            $this.data('button', (o = new Button(this, options)));
        });
        return o;
    };
}(window);