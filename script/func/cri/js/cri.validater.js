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

    var _Rules = {
        required: function(input) {
            var checkbox = input.filter("[type=checkbox]").length && !input.is(":checked"),
                value = input.val();

            return !(hasAttribute(input, "required") && (value === "" || !value  || checkbox));
        },
        pattern: function(input) {
            if (input.filter("[type=text],[type=email],[type=url],[type=tel],[type=search],[type=password]").filter("[pattern]").length && input.val() !== "") {
                return patternMatcher(input.val(), input.attr("pattern"));
            }
            return true;
        },
        min: function(input){
            if (input.filter(NUMBERINPUTSELECTOR + ",[" + kendo.attr("type") + "=number]").filter("[min]").length && input.val() !== "") {
                var min = parseFloat(input.attr("min")) || 0,
                    val = kendo.parseFloat(input.val());

                return min <= val;
            }
            return true;
        },
        max: function(input){
            if (input.filter(NUMBERINPUTSELECTOR + ",[" + kendo.attr("type") + "=number]").filter("[max]").length && input.val() !== "") {
                var max = parseFloat(input.attr("max")) || 0,
                    val = kendo.parseFloat(input.val());

                return max >= val;
            }
            return true;
        },
        step: function(input){
            if (input.filter(NUMBERINPUTSELECTOR + ",[" + kendo.attr("type") + "=number]").filter("[step]").length && input.val() !== "") {
                var min = parseFloat(input.attr("min")) || 0,
                    step = parseFloat(input.attr("step")) || 1,
                    val = parseFloat(input.val()),
                    decimals = numberOfDecimalDigits(step),
                    raise;

                if (decimals) {
                    raise = Math.pow(10, decimals);
                    return (((val-min)*raise)%(step*raise)) / Math.pow(100, decimals) === 0;
                }
                return ((val-min)%step) === 0;
            }
            return true;
        },
        email: function(input) {
            return matcher(input, "[type=email],[" + kendo.attr("type") + "=email]", emailRegExp);
        },
        url: function(input) {
            return matcher(input, "[type=url],[" + kendo.attr("type") + "=url]", urlRegExp);
        },
        date: function(input) {
            if (input.filter("[type^=date],[" + kendo.attr("type") + "=date]").length && input.val() !== "") {
                return kendo.parseDate(input.val(), input.attr(kendo.attr("format"))) !== null;
            }
            return true;
        }
    };

    var Validator = cri.Widgets.extend(function(element,options){
        cri.Widgets.apply(this,arguments);
    });

    $.extend(Validator.prototype,{
        _init: function(element, options) {

        },
        _eventListen:function(){
            //TODO:如果是表单,在提交时验证
            //TODO:假如指定在输入框失去焦点时验证(input,selectBox,timeInput)
        },
        validate:function(){

        }
    });

}(window);