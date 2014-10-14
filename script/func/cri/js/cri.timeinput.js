/**
 * Author zhouzy
 * Date   2014/10/14
 * input 组件
 *
 */
!function(window){

    "use strict";

    var cri = window.cri,
        $   = window.jQuery;

    /**
     * 组件默认属性
     * @type {{required: boolean, dblclickTimeSpan: number, width: number, height: number, titleWidth: number, readonly: boolean}}
     * @private
     */
    var _defaultOptions = {
        required:false,
        dblclickTimeSpan:250,
        width:250,
        height:20,
        titleWidth:73,
        readonly:false
    };

    var Input = cri.Class.extend(function(element,options){
        var thisObject = this;
        this.$element = $(element);
        this.style = this.$element.attr("style");
        this.dataOptions = $.extend({}, $.fn.input.defaults, dataOptions);
        this.value = "";
        if(this.dataOptions.defaultVal)
            this.value = this.dataOptions.defaultVal;
        this.title = "";
        if(this.$element.attr("title"))
            this.title = this.$element.attr("title");
        if(this.dataOptions.title)
            this.title = this.dataOptions.title;
        this.id = this.$element.attr("id");
        this.name = this.$element.attr("name");
        if(this.$element.attr("placeholder"))
            this.placeholder = this.$element.attr("placeholder");
        else
            this.placeholder = "";
        this.init();     //初始化inputGroup组件
        this.setStyle();
        this.$element.change(function(){
            thisObject.check();
        });
    });

    Input.prototype.hide = function(){
        this.parentObj.hide();
    };

    Input.prototype.show = function(){
        this.parentObj.show();
    };

    Input.prototype.lengthLimit = function(lengthParam){
        var thisObject = this;
        var obj = this.inputObj.get(0);
        var value;
        this.inputObj.keypress(function(e){
            var str = $(this).val();
            var key = e.which;
            if(str.length >= lengthParam && key != 8 && key != 0){
                return false;
            }else{
                value = $(this).val();
            }
        }).get(0).onpaste=function(e){
            var str = $(this).val();
            var key = e.which;
            if(str.length >= lengthParam && key != 8 && key != 0){
                return false;
            }else{
                value = $(this).val();
            }
        };
        if(typeof obj.oninput != 'undefined'){
            obj.oninput = function(e){
                var str = $(this).val();
                var key = e.which;
                //alert(str.length);
                if(str.length > lengthParam){
                    $(this).val(value);
                }else{
                    value = $(this).val();
                }
            };
        }
        if(typeof obj.onpropertychange != 'undefined'){
            obj.oninput = function(e){
                var str = $(this).val();
                var key = e.which;
                //alert(str.length);
                if(str.length > lengthParam){
                    $(this).val(value);
                }else{
                    value = $(this).val();
                }
            };
        }
    };

    Input.prototype.check = function(){
        var thisObject = this;
        var result = {length:0,result:true};
        var val;
        if(this.inputObj.is('input'))
            val = this.inputObj.val();
        else if(this.inputObj.is('span'))
            val = this.inputObj.attr("value");
        if(this.dataOptions.required == true){
            if(!val){
                result['required'] = 'fail';
                result.result = false;
                result.length++;
            }
        }
        if(this.dataOptions.validtype == 'numOnly'){
            if(!this.setNumOnly()){
                result['numOnly'] = 'fail';
                result.result = false;
                result.length++;
                thisObject.setValue(thisObject.value);
            }else{
                thisObject.value = thisObject.getValue();
            }
        }
        return result;
    };

    Input.prototype.setNumOnly = function(){
        var thisObject = this;
        if(this.inputObj.is('input')){
            var reg = new RegExp("^[0-9]*$");
            if(!reg.test(thisObject.inputObj.val()))
                return false;
            else
                return true;
        }
        return true;
    };

    Input.prototype.getValue = function(){
        var value = "";
        if(this.inputObj.is('input')){
            value = this.inputObj.val();
        }else if(this.inputObj.is('span')){
            value = this.inputObj.attr("value");
        }
        return value;
    };

    Input.prototype.setValue = function(value){
        if(this.inputObj.is("input"))
            this.inputObj.val(value);
        else
            this.inputObj.attr("value",value).html(value);
        this.parentObj.attr("value",value);
        if(this.check())
            this.value = value;
    };

    Input.prototype.clearValue = function(){
        this.setValue("");
    };

    Input.prototype.setStyle = function(){
        var thisObject = this;
        this.inputObj.focus(function(){
            $(this).addClass("focus");
            if(thisObject.dataOptions.button){
                thisObject.buttonObj.addClass("focus");
            }
        }).blur(function(){
            $(this).removeClass("focus");
            if(thisObject.dataOptions.button){
                thisObject.buttonObj.removeClass("focus");
            }
        });
        if(this.dataOptions.button){
            this.buttonObj.mouseover(function(){
                $(this).addClass("mouseover");
            }).mouseout(function(){
                $(this).removeClass("mouseover");
            }).mousedown(function(){
                $(this).addClass("mousedown");
            }).mouseup(function(){
                $(this).removeClass("mousedown");
            });
        }
    };

    Input.prototype.init = function(){
        var thisObject = this;
        //this.$element.attr("id","");
        this.$element.wrap($('<div class="eb_inputGroup" id="'+this.id+'_subgroup" name="'+thisObject.name+'" value="'+thisObject.value+'" data-options="'+thisObject.$element.data("options")+'"></div>'));
        this.$element.before('<span class="eb_title">'+this.title+'</span>');
        this.parentObj = this.$element.parent();               //parentObj
        this.inputObj = this.$element;                //inputObj
        this.inputObj.val(thisObject.value);
        if(this.dataOptions.readonly == true){
            this.inputObj.after($('<span class="eb_input eb_readonly" id="'+thisObject.id+'" name="'+thisObject.name+'" value="'+thisObject.value+'" data-options="'+thisObject.$element.data("options")+'">'+thisObject.value+'</span>'));
            this.inputObj.remove();
            this.$element = this.parentObj.children(".eb_input");
            this.inputObj = this.parentObj.children(".eb_input");           //inputObj
            this.inputObj.data("input",thisObject);
        }
        this.parentObj.data("input",thisObject);
        this.inputObj.attr("style",thisObject.style);
        this.titleObj = this.parentObj.find(".eb_title");           //titleObj
        if(this.dataOptions.required == true){ //如果设定为必填，则显示相应样式
            this.inputObj.attr("placeholder",thisObject.placeholder+"(必填)");
            this.parentObj.append('<span class="redStar" style="color:red;">*</span>');
        }
        if(this.dataOptions.button){
            this.button = this.dataOptions.button;
            if(typeof this.button == "string")
                this.button = window[thisObject.button];
            if(typeof thisObject.button.handler == "string")
                thisObject.button.handler = window[thisObject.button.handler];
            this.inputObj.before($('<span class="eb_button">'+thisObject.button.text+'</span>').click(thisObject.button.handler));
            this.buttonObj = this.parentObj.children(".eb_button");        //buttonObj
            this.buttonObj.mousedown(function(){
                setTimeout(function(){thisObject.inputObj.get(0).focus();},1);
            }).click(function(){
                thisObject.inputObj.get(0).focus();
            });
            this.inputObj.css({position:'relative',right:'-1px'});
        }
        if(this.dataOptions.lengthLimit){
            this.lengthLimit(thisObject.dataOptions.lengthLimit);
        }
        this.setWidth();
        this.setHeight();
        this.setEvent();
    };

    Input.prototype.setEvent = function(){          //处理绑定事件的方法，包括：onclick,onmousedown,onmouseup,ondblclick,onfocus,onblur,onkeypress,onkeydown,onkeyup,onchange
        var TIMEOUT = 250;
        if(this.dataOptions.dblclickTimeSpan)
            TIMEOUT = this.dataOptions.dblclickTimeSpan;
        var thisObject = this;
        var clickTimeoutId = null,mousedownTimeoutId = null,mouseupTimeoutId = null;
        var clickLock = false,mousedownLock = false,mouseupLock = false;
        if(this.dataOptions.onclickHandler){             //onclick
            if(this.dataOptions.ondblclickHandler){
                if(typeof this.dataOptions.onclickHandler == "string"){
                    this.inputObj.get(0).onclick = function(){
                        if(!clickLock){
                            clickTimeoutId = setTimeout(window[this.dataOptions.onclickHandler],TIMEOUT);
                            clickLock = true;
                            setTimeout(function(){clickLock=false;},TIMEOUT);
                        }
                    };
                }else{
                    this.inputObj.get(0).onclick = function(){
                        if(!clickLock){
                            clickTimeoutId = setTimeout(thisObject.dataOptions.onclickHandler,TIMEOUT);
                            clickLock = true;
                            setTimeout(function(){clickLock=false;},TIMEOUT);
                        }
                    };
                }
            }else{
                if(typeof this.dataOptions.onclickHandler == "string"){
                    this.inputObj.get(0).onclick = window[this.dataOptions.onclickHandler];
                }else{
                    this.inputObj.get(0).onclick = thisObject.dataOptions.onclickHandler;
                }
            }
        }
        if(this.dataOptions.onmousedownHandler){             //onmousedown
            if(this.dataOptions.ondblclickHandler){
                if(typeof this.dataOptions.onmousedownHandler == "string"){
                    this.inputObj.get(0).onmousedown = function(){
                        if(!mousedownLock){
                            mousedownTimeoutId = setTimeout(window[this.dataOptions.onmousedownHandler],TIMEOUT);
                            mousedownLock = true;
                            setTimeout(function(){mousedownLock=false;},TIMEOUT);
                        }
                    };
                }else{
                    this.inputObj.get(0).onmousedown = function(){
                        if(!mousedownLock){
                            mousedownTimeoutId = setTimeout(thisObject.dataOptions.onmousedownHandler,TIMEOUT);
                            mousedownLock = true;
                            setTimeout(function(){mousedownLock=false;},TIMEOUT);
                        }
                    };
                }
            }else{
                if(typeof this.dataOptions.onmousedownHandler == "string"){
                    this.inputObj.get(0).onmousedown = window[this.dataOptions.onmousedownHandler];
                }else{
                    this.inputObj.get(0).onmousedown = thisObject.dataOptions.onmousedownHandler;
                }
            }
        }
        if(this.dataOptions.onmouseupHandler){             //onmouseup
            if(this.dataOptions.ondblclickHandler){
                if(typeof this.dataOptions.onmouseupHandler == "string"){
                    this.inputObj.get(0).onmouseup = function(){
                        if(!mouseupLock){
                            mouseupTimeoutId = setTimeout(window[this.dataOptions.onmouseupHandler],TIMEOUT);
                            mouseupLock = true;
                            setTimeout(function(){mouseupLock=false;},TIMEOUT);
                        }
                    };
                }else{
                    this.inputObj.get(0).onmouseup = function(){
                        if(!mouseupLock){
                            mouseupTimeoutId = setTimeout(thisObject.dataOptions.onmouseupHandler,TIMEOUT);
                            mouseupLock = true;
                            setTimeout(function(){mouseupLock=false;},TIMEOUT);
                        }
                    };
                }
            }else{
                if(typeof this.dataOptions.onmouseupHandler == "string"){
                    this.inputObj.get(0).onmouseup = window[this.dataOptions.onmouseupHandler];
                }else{
                    this.inputObj.get(0).onmouseup = thisObject.dataOptions.onmouseupHandler;
                }
            }
        }
        if(this.dataOptions.ondblclickHandler){             //ondblclick
            if(typeof this.dataOptions.ondblclickHandler == "string"){
                this.inputObj.get(0).ondblclick = function(){
                    if(clickTimeoutId){
                        clearTimeout(clickTimeoutId);
                        clickTimeoutId = null;
                    }
                    if(mousedownTimeoutId){
                        clearTimeout(mousedownTimeoutId);
                        mousedownTimeoutId = null;
                    }
                    if(mouseupTimeoutId){
                        clearTimeout(mouseupTimeoutId);
                        mouseupTimeoutId = null;
                    }
                    window[thisObject.dataOptions.ondblclickHandler]();
                };
            }else{
                this.inputObj.get(0).ondblclick = function(){
                    if(clickTimeoutId){
                        clearTimeout(clickTimeoutId);
                        clickTimeoutId = null;
                    }
                    if(mousedownTimeoutId){
                        clearTimeout(mousedownTimeoutId);
                        mousedownTimeoutId = null;
                    }
                    if(mouseupTimeoutId){
                        clearTimeout(mouseupTimeoutId);
                        mouseupTimeoutId = null;
                    }
                    thisObject.dataOptions.ondblclickHandler();
                };
            }
        }
        if(this.dataOptions.onfocusHandler){                //onfocus
            if(typeof this.dataOptions.onfocusHandler == "string"){
                this.inputObj.get(0).onfocus = window[this.dataOptions.onfocusHandler];
            }else{
                this.inputObj.get(0).onfocus = this.dataOptions.onfocusHandler;
            }
        }
        if(this.dataOptions.onblurHandler){                //onblur
            if(typeof this.dataOptions.onblurHandler == "string"){
                this.inputObj.get(0).onblur = window[this.dataOptions.onblurHandler];
            }else{
                this.inputObj.get(0).onblur = this.dataOptions.onblurHandler;
            }
        }
        if(this.dataOptions.onkeypressHandler){                //onkeypress
            if(typeof this.dataOptions.onkeypressHandler == "string"){
                this.inputObj.get(0).onkeypress = window[this.dataOptions.onkeypressHandler];
            }else{
                this.inputObj.get(0).onkeypress = this.dataOptions.onkeypressHandler;
            }
        }
        if(this.dataOptions.onkeydownHandler){                //onkeydown
            if(typeof this.dataOptions.onkeydownHandler == "string"){
                this.inputObj.get(0).onkeydown = window[this.dataOptions.onkeydownHandler];
            }else{
                this.inputObj.get(0).onkeydown = this.dataOptions.onkeydownHandler;
            }
        }
        if(this.dataOptions.onkeyupHandler){                //onkeyup
            if(typeof this.dataOptions.onkeyupHandler == "string"){
                this.inputObj.get(0).onkeyup = window[this.dataOptions.onkeyupHandler];
            }else{
                this.inputObj.get(0).onkeyup = this.dataOptions.onkeyupHandler;
            }
        }
        if(this.dataOptions.onchangeHandler){                //onchange
            if(typeof this.dataOptions.onchangeHandler == "string"){
                this.inputObj.get(0).onchange = window[this.dataOptions.onchangeHandler];
            }else{
                this.inputObj.get(0).onchange = this.dataOptions.onchangeHandler;
            }
        }
    };

    Input.prototype.setWidth = function(){
        if(this.dataOptions.width){ //宽度
            var width = null;
            if(isNaN(this.dataOptions.width))
                width = this.dataOptions.width.split("px")[0];
            else
                width = this.dataOptions.width;
            this.parentObj.css("width",width);
            if(this.dataOptions.button)
                this.inputObj.width(width-140);
            else
                this.inputObj.width(width-80);
        }
        if(this.dataOptions.titleWidth || this.dataOptions.titleWidt == 0){
            var titleWidth = this.dataOptions.titleWidth;
            if(typeof titleWidth == "string")
                titleWidth = titleWidth.split("px")[0];
            var width = this.parentObj.width();
            var inputWidth = width - titleWidth - 7;
            if(this.dataOptions.button)
                inputWidth = inputWidth - 60;
            this.titleObj.width(titleWidth);
            this.inputObj.width(inputWidth);
        }
    };

    Input.prototype.setHeight = function(){
        if(this.dataOptions.height){ //高度
            var height = null;
            if(isNaN(this.dataOptions.height))
                height = this.dataOptions.height.split("px")[0];
            else
                height = this.dataOptions.height;
            this.parentObj.css("height",height);
            this.inputObj.css("height",height-2);
            this.titleObj.height(height+2).css("line-height",(height+2)+"px");
            if(this.inputObj.is('span')){
                this.inputObj.height(height).css("line-height",(height)+"px");
            }
            if(this.buttonObj)
                this.buttonObj.height(height).css("line-height",(height)+"px");
        }
    };


    cri.Input = Input;
}(window);