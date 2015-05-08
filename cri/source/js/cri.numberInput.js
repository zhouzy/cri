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

    var INPUT_GROUP = "input-group",
        INPUT_BTN   = "input-btn",
        WITH_BTN    = "with-btn";

    var _defaultOptions = {
        label:null,
        value:0,
        readonly:false,
        onFocus:null,
        onBlur:null,
        enable:true,
        required:false
    };

    var NumberInput = cri.Input.extend(function(element,options){
        this.options = _defaultOptions;
        this.$inputGroup = null;
        cri.Widgets.apply(this,arguments);
        this.$element.attr('data-role','numberinput');
    });

    $.extend(NumberInput.prototype,{
        _eventListen:function(){

        },

        _wrapInput:function() {
            var that   = this,
                op     = that.options,
                $input = that.$element;

            if (op.readonly) {
                $input = this._readonlyInput($input);
            }
            else {
                $input.on("focus", function () {
                    that.options.onFocus && that.options.onFocus.call(that);
                }).blur(function () {
                    that.options.onBlur && that.options.onBlur.call(that);
                });
            }
            this.$input = $input;
            $input.addClass(WITH_BTN);
            this._appendBtn();
        },

        _appendBtn:function(){
            var that         = this,
                $plusButton  = $('<i class="fa fa-sort-up plus-button"></i>'),
                $minusButton = $('<i class="fa fa-sort-down minus-button"></i>'),
                $Buttons     = $('<span class="plus-minus-button"></span>').append($minusButton,$plusButton);

            $plusButton.click(function(){
                var val = that.value();
                if(cri.isNum(val)){
                    that.value(+val + 1);
                }
                else{
                    that.value(parseInt(val,10) + 1);
                }
            });
            $minusButton.click(function(){
                var val = that.value();
                if(cri.isNum(val)){
                    that.value(+val - 1);
                }
                else{
                    that.value(parseInt(val,10) - 1);
                }
            });
            this.$input.after($Buttons);
        }

    });
    cri.NumberInput = NumberInput;

    $.fn.numberInput = function(option) {
        var o = null;
        this.each(function () {
            var $this   = $(this),
                input   = $this.data('numberinput'),
                options = typeof option == 'object' && option,
                role    = $this.attr("role");
            if(input != null){
                input._destroy();
            }
            $this.data('numberinput', (o = new NumberInput(this, options)));
        });
        return o;
    };
}(window);
