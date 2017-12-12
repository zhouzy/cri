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
        value:0,
        readonly:false,
        onFocus:null,
        onBlur:null,
        enable:true,
        required:false,
        max:null,
        min:null,
        step:null,
        button:{}
    };

    var NumberInput = cri.Input.extend(function(element,options){
        this.options = _defaultOptions;
        this.$inputGroup = null;
        cri.Widgets.apply(this,arguments);
        this.$element.attr('data-role','numberInput');
    });

    $.extend(NumberInput.prototype,{
        _eventListen:function(){
            var that = this,
                op   = that.options,
                el = that.$element;
            this.$element.on("focus", function () {
                op.onFocus && op.onFocus.call(that);
                $(document).on("mousewheel DOMMouseScroll", function (e) {
                    var delta = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) ||  // chrome & ie
                        (e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1));              // firefox
                    if(delta > 0){
                        el.val(parseInt(el.val()) + op.step);
                        if(op.max !=null && parseInt(el.val()) > op.max){
                            el.val(op.max);
                        }
                    }else{
                        el.val(parseInt(el.val()) - op.step);
                        if(op.min != null && parseInt(el.val()) < op.min){
                            el.val(op.min);
                        }
                    }
                })
            }).on('blur',function () {
                $(document).off("mousewheel DOMMouseScroll");
                op.onBlur && op.onBlur.call(that);
                if(op.min != null){
                    var val = that.$element.val();
                    if(val == "" || val < op.min){
                        that.value(that.options.min);
                    }
                }
                if(that.options.max != null){
                    var val = that.$element.val();
                    if(val == "" || val > op.max){
                        that.value(that.options.max);
                    }
                }
            }).on("change",function(){
                op.onChange && op.onChange.call(that);
            }).on("keydown",function(e){
                var keycode = e.keyCode || e.which || e.charCode;
                return ((keycode>=48 && keycode<=57) || keycode == 8);
            });
        },

        _button:function($p){
            var that         = this,
                $plusButton  = $('<a href="javascript:void(0)" class="top"><i class="fa fa-sort-up plus-button"></i></a>'),
                $minusButton = $('<a href="javascript:void(0)" class="bottom"><i class="fa fa-sort-down minus-button"></i></a>');
            $p.addClass("input-group-addon").addClass('btn-group-vertical');
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
            $p.append($plusButton,$minusButton);
        },
        value:function(value){
            if(arguments.length>0){
                if(this.options.max != null && value > this.options.max){
                    value = this.options.max
                }
                if(this.options.min != null && value < this.options.min){
                    value = this.options.min
                }
                this._setValue(value)
            }
            else{
                return this._getValue();
            }
        }
    });
    cri.NumberInput = NumberInput;

    $.fn.numberInput = function(option) {
        var widget;
        this.each(function () {
            var $this   = $(this),
                options = typeof option == 'object' && option,
                role    = $this.attr("role");
            widget = $this.data('numberInput');
            if(widget != null && widget instanceof NumberInput){
                widget._destroy();
            }
            $this.data('numberInput', (widget = new NumberInput(this, options)));
        });
        return widget;
    };
}(window);
