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

    var INPUTSELECTOR = ":input:not(:button,[type=submit],[type=reset],[disabled])",
        NUMBERINPUTSELECTOR = "[role=number],[role=range]";

    var emailRegExp = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,
        urlRegExp = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,
        telRegExp = /((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/i,
        ipRegExp = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){3}$/i;

    function patternMatcher(value, pattern) {
        if (typeof pattern === "string") {
            pattern = new RegExp('^(?:' + pattern + ')$');
        }
        return pattern.test(value);
    }

    function matcher(input, selector, pattern) {
        var value = input.val();
        if (input.filter(selector).length && value !== "") {
            return patternMatcher(value, pattern);
        }
        return true;
    }

    function hasAttribute(input, name) {
        if (input.length)  {
            return input[0].attributes[name] != null;
        }
        return false;
    }

    var Rules = {
        required: function(input) {
            var checkbox = input.filter("[type=checkbox]").length && !input.is(":checked"),
                value = input.val();

            return !(hasAttribute(input, "required") && (value === "" || !value  || checkbox));
        },
        pattern: function(input) {
            if (input.filter("[role=text]").filter("[pattern]").length && input.val() !== "") {
                return patternMatcher(input.val(), input.attr("pattern"));
            }
            return true;
        },
        min: function(input){
            if (input.filter(NUMBERINPUTSELECTOR).filter("[min]").length && input.val() !== "") {
                var min = parseFloat(input.attr("min")) || 0,
                    val = parseFloat(input.val());
                return min <= val;
            }
            return true;
        },
        max: function(input){
            if (input.filter(NUMBERINPUTSELECTOR).filter("[max]").length && input.val() !== "") {
                var max = parseFloat(input.attr("max")) || 0,
                    val = parseFloat(input.val());
                return max >= val;
            }
            return true;
        },

        email: function(input) {
            return matcher(input, "[role=email]", emailRegExp);
        },
        url: function(input) {
            return matcher(input, "[role=url]", urlRegExp);
        },
        number: function(input) {
            if(input.filter(NUMBERINPUTSELECTOR).length && input.val()){
                return cri.isNum(input.val());
            }
            return true;
        },
        tel: function(input){
            return matcher(input, "[role=tel]", telRegExp);
        },
        ip: function(input){
            return matcher(input, "[role=ip]", ipRegExp);
        }
    };

    var Messages = {
        required:"该值不能为空",
        min:"请输入大于的数字",
        max:"请输入小于的数字",
        email:"请输入有效的邮箱地址",
        url:"请输入有效的URL地址",
        number:"请输入数字",
        tel:"请输入有效的号码",
        pattern:"该值无效,请重新输入",
        ip:'请输入有效IP地址'
    };

    var _defaultOptions = {
        rules : Rules,
        messages:Messages,
        validateOnBlur:false
    };

    var Validator = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        cri.Widgets.apply(this,arguments);
    });

    $.extend(Validator.prototype,{
        _eventListen:function(){
            /**
             * 如果是表单,在提交时验证
             * 如果设置validateOnBlur,则在input blur事件中验证
             */
            var that = this,
                $element = this.$element;
            if(this.$element.is("form")){
                this.$element.on("submit",function(){
                    that.validate();
                });
            }
            if(that.options.validateOnBlur){
                if(!$element.is(INPUTSELECTOR)){
                    $element.find(INPUTSELECTOR).each(function(){
                        $(this).on("blur",function(){
                            that._validateInput($(this));
                        });
                        if(!$(this).is('[role=timeInput]')){
                            $(this).on("blur",function(){
                                that._validateInput($(this));
                            });
                        }
                    });
                    $element.find("select").each(function(){
                        $(this).on("change",function(){
                            that._validateInput($(this));
                        });
                    });
                }else{
                    $element.on("blur",function(){
                        that._validateInput($element);
                    });
                }
            }
        },

        /**
         * 检查 input 合法性
         * @param $input
         * @private
         */
        _checkValidity:function($input){
            var rules = this.options.rules,
                rule;
            for (rule in rules) {
                if (!rules[rule].call(this, $input)) {
                    return { valid: false, key: rule };
                }
            }
            return { valid: true };
        },

        /**
         * 验证表单或者输入框,
         * 如果传入值，则验证指定的对象
         */
        validate:function($e){
            var that = this,
                $element = $e || this.$element,
                result = true;
            if(!$element.is(INPUTSELECTOR)){
                $element.find(INPUTSELECTOR).each(function(){
                    var isValidity = that._validateInput($(this));
                    result = result && isValidity;
                });
            }else{
                result = result && that._validateInput($element)
            }
            return result;
        },

        /**
         * 验证每个Input
         * @param $input
         * @returns {boolean|Validator._checkValidity.valid|exports.valid|valid}
         * @private
         */
        _validateInput:function($input){
            var that = this,
                result = this._checkValidity($input),
                valid = result.valid;
            if(!valid){
                var errorMsg = this.options.messages[result.key];
                if(result.key == 'min'){
                    errorMsg = '请输入不小于'+ $input.attr('min') + '的数字';
                }
                if(result.key == 'max'){
                    errorMsg = '请输入不大于'+ $input.attr('max') + '的数字';
                }

                this._showMessage($input,errorMsg);
                if($input.is("[readonly=readonly]")){
                    $input.closest(".input-group").one("click",function(){
                        that._hideMessage($input);
                    });
                }
                $input.one("focus",function(){
                    that._hideMessage($input);
                });
            }else{
                this._hideMessage($input);
            }
            return valid;
        },

        _showMessage:function($input,errorMsg){
            errorMsg = errorMsg || $input.attr('error-msg') || '请检查';
            var role = $input.data("role");
            if(role){
                var widget = $input.data('widget');
                if(widget){
                    widget._showValidateMsg(errorMsg)
                }
            }
            else{
                $input.closest('.form-group').addClass('has-error');
                var _$helpBlock = $input.next();
                if(_$helpBlock.is('.help-block')){
                    _$helpBlock.text(errorMsg);
                }
                else{
                    _$helpBlock = $('<span class="help-block">' + errorMsg + '</span>');
                    $input.after(_$helpBlock);
                }
                _$helpBlock.show();
            }
        },

        _hideMessage:function($input){
            var role = $input.data("role");
            if(role){
                var widget = $input.data('widget');
                widget && typeof(widget._hideValidateMsg) == 'function' && widget._hideValidateMsg();
            }
            else{
                $input.closest('.form-group').removeClass('.has-error');
                var _$helpBlock = $input.next();
                if(_$helpBlock.is('.help-block')){
                    _$helpBlock.hide();
                }
            }
        },

        hideMessages:function(names){
            if(names){
                if(cri.isArray(names)){
                    for(var i = 0,len=names.length;i<len;i++){
                        this._hideMessage($('[name='+names[i]+']'));
                    }
                }
                else{
                    this._hideMessage($('[name='+names+']'));
                }
            }else{
                $(".input-warm",this.$element).hide();
            }
        }
    });

    cri.Validator = Validator;

    $.fn.validator = function(option) {
        var validator = null;
        this.each(function () {
            var $this   = $(this),
                options = typeof option == 'object' && option;
            validator = $this.data('validator');
            if(validator != null){
            }
            $this.data('validator', (validator = new Validator(this, options)));
        });
        return validator;
    };

}(window);
