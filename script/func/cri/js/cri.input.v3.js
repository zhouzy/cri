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
        button:null,//button={iconCls:"",handler:""}
        value:null,
        onFocus:null,
        onClick:null,
        readonly:false
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

            if(!this.$element.is("input")) {
                $input = $("<input/>");
                this.$element.hide().after($input);
                $input.attr({
                    name:this.$element.attr("name"),
                    value:this.$element.val()
                });
                this.$element.removeAttr("name").attr("disable",true);
            }

            $input.on("focus",function(){
                that.options.onFocus && that.options.onFocus.call(this);
            });

            if(op.value != null){
                $input.val(op.value);
            }

            op.readonly && $input.attr("readonly",true);

            if(op.button){
                var $icon = $('<i class="' + INPUT_BTN + " " + op.button.iconCls + '"></i>').on("click",function(){
                    op.button.handler.call();
                });
                $input.after($icon);
                $input.addClass(WITH_BTN);
            }

            this.$input = $input;
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

        value:function(value){
            if(arguments.length>0){
                this.$input.val(value);
            }
            else{
                return this.$input.val();
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