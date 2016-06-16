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

    var INPUT_GROUP    = "form-group",
        INPUT_SELECTOR = ":input:not(:button,[type=submit],[type=reset],[disabled])";

    var Input = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        this.$inputGroup = null;
        this.button = null;
        cri.Widgets.apply(this,arguments);
        this.$element.data('role','input');
    });

    $.extend(Input.prototype,{
        _eventListen:function(){
            var that = this;
            this.$element.on("focus",function(){
                that.options.onFocus && that.options.onFocus.call(that);
            }).blur(function(){
                that.options.onBlur && that.options.onBlur.call(that);
            });
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
            this._label();
            this.options.enable || this.disable();
        },

        _wrapInput:function(){
            var that = this,
                op   = that.options,
                $input = this.$element;
            $input.addClass('form-control');

            if(op.readonly){
                $input.prop('readonly',true);
            }

            if(op.button){
                $input.wrap('<div class="input-group"></div>');
                var $inputGroup = $input.parent();
                var $inputGroupBtn = $('<span class="input-group-btn"></span>');
                $inputGroup.append($inputGroupBtn);
                this._button($inputGroupBtn);
            }
            this.$input = $input;
        },

        _button:function($p){
            var button = this.options.button,
                text   = button.text || '',
                $i     = $('<i class="' + button.iconCls + '">' + text + '</i>'),
                $btn   = $('<button type="button" class="btn btn-fab-mini"></button>');
            $btn.append($i);
            this.button = $p.append($btn);
            $btn.click(function(){
                button.handler && button.handler.call();
            });
        },

        _label:function(){
            var label = this.options.label ||
                this.$element.data("label") ||
                this.$element.attr("title") ||
                this.$element.attr("name") ||
                "",
                $input = this.$element;
            if(label.length){
                var $label = $('<label class="control-label col-sm-4">' + label + '</label>');
                if(this.options.required){
                    $label.addClass('required');
                }
                this.$inputGroup.prepend($label);
                if($input.parent().is('.input-group')){
                    $input.parent().wrap('<div class="col-sm-8"></div>');
                }
                else{
                    $input.wrap('<div class="col-sm-8"></div>');
                }
            }
        },

        _destroy:function(){
            var $input = this.$element;
            this.$inputGroup.replaceWith($input);
        },

        _setValue:function(value){
            if(value == null){
                return ;
            }
            if(this.$input.is(INPUT_SELECTOR)){
                this.$input.val(value);
                this.$input.change();
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
            this.$inputGroup.addClass("has-error");
            if(!this.$errorMsg){
                this.$errorMsg = $('<span class="help-block">' + errorMsg + '</span>');
                this.$input.after(this.$errorMsg);
            }
            else{
                this.$errorMsg.text(errorMsg);
            }
            this.$errorMsg.show();
        },

        _hideValidateMsg: function(){
            this.$inputGroup.removeClass("has-error");
            this.$errorMsg && this.$errorMsg.hide();
        },

        /**
         * 使输入框不能用
         */
        disable:function(){
            this.$element.prop('disabled',true);
        },

        /**
         * 使输入框可用
         */
        enable:function(){
            this.$element.prop('disabled',false);
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
        var widget = null;
        this.each(function () {
            var $this   = $(this),
                options = typeof option == 'object' && option,
                role    = $this.attr("role");
            widget = $this.data('widget');

            if(widget != null){
                if(widget instanceof Input){
                    widget._destroy();
                }
                else if(widget instanceof cri.TimeInput){
                    widget = null;
                    return ;
                }
            }
            $this.data('widget', (widget = new Input(this, options)));
        });
        return widget;
    };
}(window);
