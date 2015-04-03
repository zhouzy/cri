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
        onClick:null,
        enable:true,
        required:false
    };

    var INPUT_GROUP = "input-group",
        INPUT_BTN   = "input-btn",
        WITH_BTN    = "with-btn";

    var Input = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        this.$inputGroup = null;
        cri.Widgets.apply(this,arguments);
        this.$element.attr('data-role','input');
    });

    $.extend(Input.prototype,{
        _eventListen:function(){

        },

        _init:function(){
            var op = this.options,
                value = this.$element.val();
            if(op.value == null && value != null){
                op.value = value;
            }
            this._createInputGroup();
            if(op.value != null){
                this._setValue(op.value)
            }
        },

        _createInputGroup:function(){
            var $element = this.$element;
            $element.wrap('<div class="'+ INPUT_GROUP + '"></div>');
            this.$inputGroup = $element.parent();
            this._wrapInput();
            this.$input.before(this._label());
            this.options.enable || this.disable();
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

        },

        /**
         * 返回包装 readonly input
         * @param $element
         * @private
         */
        _readonlyInput:function($element){
            var that = this,
                $input = $('<span class="readonly" role="readonly"></span>');
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
            var $label = $('<label></label>').text(label);
            if(this.options.required){
                $label.addClass('required');
            }
            return $label;
        },

        _destroy:function(){
            var $input = this.$element;
            this.$inputGroup.replaceWith($input);
        },

        _setValue:function(value){
            if(value == null){
                return ;
            }
            if(this.$input.is("input")){
                this.$input.val(value);
            }else{
                if(this.$element.is("select")){
                    this.$element.val(value);
                    this.$input.text(this.$element.find("option:selected").text());
                }
                else{
                    this.$element.val(value);
                    this.$input.text(value);
                }
                this.$element.trigger("change");
            }
        },

        _getValue:function(){
            return this.$element.val();
        },

        /**
         * 使输入框不能用
         */
        disable:function(){
            var $layout = $('<div class="input-layout"></div>');
            if(this.$inputGroup.has(".input-layout").length == 0){
                this.$inputGroup.append($layout);
            }
        },

        /**
         * 使输入框可用
         */
        enable:function(){
            this.$inputGroup.children(".input-layout").remove();
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
        var o = null;
        this.each(function () {
            var $this   = $(this),
                input   = $this.data('input'),
                options = typeof option == 'object' && option,
                role    = $this.attr("role");
            if(role == "timeInput"){
                return input;
            }
            if(input != null){
                input._destroy();
            }
            $this.data('input', (o = new Input(this, options)));
        });
        return o;
    };
}(window);