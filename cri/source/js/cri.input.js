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
        enable:true,
        required:false
    };

    var INPUT_GROUP = "input-group",
        ERROR_MSG_HEIGHT = 23,//验证消息框高度
        WITH_BTN    = "with-btn";

    var Input = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        this.$inputGroup = null;
        this.button = null;
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

            if(op.button){
                var $button = $('<button></button>');
                $input.after($button);
                this._button($button);
                $input.addClass(WITH_BTN);
            }

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

        _button:function($button){
            this.button = $button.button(this.options.button);
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
                this.$input.change();
            }else{
                if(this.$element.is("select")){
                    this.$element.val(value);
                    if(this.$element.attr("multiple")){
                        var text = [];
                        this.$element.find("option:selected").each(function(){
                            text.push($(this).text());
                        });
                        this.$input.text(text.join(","));
                    }
                    else{
                        this.$input.text(this.$element.find("option:selected").text());
                    }
                }
                else{
                    this.$element.val(value);
                    this.$input.text(value);
                }
                this.$element.change();
            }
        },

        _getValue:function(){
            return this.$element.val();
        },

        /**
         * @param: errorMsg 异常提示
         * @private
         */
        _showValidateMsg: function(errorMsg){
            this.$input.addClass("failure");
            var offset = this.$input.offset();
            if(!this.$errorMsg){
                this.$errorMsg = $('<div class="input-warm"><i class="fa fa-exclamation"></i><span>' + errorMsg + '</span></div>');
                this.$input.after(this.$errorMsg);
            }
            else{
                this.$errorMsg.find("span").text(errorMsg);
            }
            if(offset.top <= (ERROR_MSG_HEIGHT)){
                this.$errorMsg.addClass("bottom-input");
            }
            else{
                this.$errorMsg.removeClass("bottom-input");
            }
            this.$errorMsg.show();

            $('html,body').is(':animated') || $('html,body').animate({
                scrollTop: this.$input.offset().top
            },300);

        },

        _hideValidateMsg: function(){
            this.$input.removeClass("failure");
            this.$errorMsg && this.$errorMsg.hide();
        },

        /**
         * 返回input的button对象
         */
        getButton:function(){
            return this.button;
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
