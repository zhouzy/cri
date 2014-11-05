
/*=====================================================================================
 * easy-bootstrap-textarea v2.0
 *
 * @author:niyq
 * @date:2013/08/22
 * @dependce:jquery
 *=====================================================================================*/
!function($){

    "use strict";

    var Textarea = function(element,dataOptions){
        var thisObject = this;
        this.$element = $(element);
        this.dataOptions = $.extend({}, $.fn.textarea.defaults, dataOptions);
        this.value = this.$element.val();
        this.title="";
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
        this.init();     //初始化textareaGroup组件
        this.setStyle();
        this.$element.change(function(){
            thisObject.check();
        });
    };

    Textarea.prototype.check = function(){
        var thisObject = this;
        var result = {length:0,result:true};
        var val = this.$element.val();
        if(this.dataOptions.required == true){
            if(!val){
                result['required'] = 'fail';
                result.result = false;
                result.length++;
            }
        }
        return result;
    };

    Textarea.prototype.init = function(){
        var thisObject = this;
        this.$element.wrap($('<div class="eb_textareaGroup" name="'+thisObject.name+'" value="'+thisObject.value+'" data-options="'+thisObject.$element.data('options')+'" id="'+thisObject.id+'_subgroup"></div>'));
        this.parent = this.$element.parent();                 //parent
        this.parent.data('textarea',thisObject);
        this.parent.prepend('<div class="eb_title">'+this.title+'</div>');
        this.titleObj = this.parent.children('.eb_title');          //titleObj
        this.textareaObj = this.$element;                             //textareaObj
        if(this.dataOptions.defaultVal)
            this.textareaObj.val(thisObject.dataOptions.defaultVal);
        //this.textareaObj.attr("id","");
        if(this.dataOptions.required == true){
            this.textareaObj.attr('placeholder',thisObject.placeholder+'（必填）');
            this.parent.append('<span class="redStar">*</span>');
        }
        this.style = this.textareaObj.attr("style");
        this.parent.attr("style",thisObject.style);
        this.setWidth();
        this.setHeight();
        this.setEvent();
    };

    Textarea.prototype.setWidth = function(){
        if(this.dataOptions.width){
            var width = this.dataOptions.width;
            if(typeof width == "string")
                width = width.split("px")[0];
            this.parent.width(width);
            this.textareaObj.width(width-86);
        }
        if(this.dataOptions.titleWidth || this.dataOptions.titleWidth == 0){
            var titleWidth = this.dataOptions.titleWidth;
            if(typeof titleWidth == "string")
                titleWidth = titleWidth.split("px")[0];
            var width = this.parent.width();
            var textareaWidth = width - titleWidth - 13;
            this.textareaObj.width(textareaWidth);
            this.titleObj.width(titleWidth);
        }
    };

    Textarea.prototype.setValue = function(value){
        this.textareaObj.val(value);
        this.parent.attr("value",value);
    };

    Textarea.prototype.getValue = function(){
        return this.textareaObj.val();
    };

    Textarea.prototype.clearValue = function(){
        this.setValue("");
    };

    Textarea.prototype.setHeight = function(){
        if(this.dataOptions.height){
            var height = this.dataOptions.height;
            if(typeof height == "string")
                height = height.split("px")[0];
            this.parent.height(height);
            this.textareaObj.height(height-6);
        }
    };

    Textarea.prototype.setStyle = function(){
        var thisObject = this;
        this.textareaObj.focus(function(){
            thisObject.textareaObj.addClass("focus");
        }).blur(function(){
            thisObject.textareaObj.removeClass("focus");
        });
    };

    Textarea.prototype.check = function(){
        var thisObject = this;
        var result = {length:0,result:true};
        var val = this.$element.val();
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

    Textarea.prototype.setEvent = function(){          //处理绑定事件的方法，包括：onclick,onmousedown,onmouseup,ondblclick,onfocus,onblur,onkeypress,onkeydown,onkeyup,onchange
        var TIMEOUT = 250;
        if(this.dataOptions.dblclickTimeSpan)
            TIMEOUT = this.dataOptions.dblclickTimeSpan;
        var thisObject = this;
        var clickTimeoutId = null,mousedownTimeoutId = null,mouseupTimeoutId = null;
        var clickLock = false,mousedownLock = false,mouseupLock = false;
        if(this.dataOptions.onclickHandler){             //onclick
            if(this.dataOptions.ondblclickHandler){
                if(typeof this.dataOptions.onclickHandler == "string"){
                    this.textareaObj.get(0).onclick = function(){
                        if(!clickLock){
                            clickTimeoutId = setTimeout(window[this.dataOptions.onclickHandler],TIMEOUT);
                            clickLock = true;
                            setTimeout(function(){clickLock=false;},TIMEOUT);
                        }
                    };
                }else{
                    this.textareaObj.get(0).onclick = function(){
                        if(!clickLock){
                            clickTimeoutId = setTimeout(thisObject.dataOptions.onclickHandler,TIMEOUT);
                            clickLock = true;
                            setTimeout(function(){clickLock=false;},TIMEOUT);
                        }
                    };
                }
            }else{
                if(typeof this.dataOptions.onclickHandler == "string"){
                    this.textareaObj.get(0).onclick = window[this.dataOptions.onclickHandler];
                }else{
                    this.textareaObj.get(0).onclick = thisObject.dataOptions.onclickHandler;
                }
            }
        }
        if(this.dataOptions.onmousedownHandler){             //onmousedown
            if(this.dataOptions.ondblclickHandler){
                if(typeof this.dataOptions.onmousedownHandler == "string"){
                    this.textareaObj.get(0).onmousedown = function(){
                        if(!mousedownLock){
                            mousedownTimeoutId = setTimeout(window[this.dataOptions.onmousedownHandler],TIMEOUT);
                            mousedownLock = true;
                            setTimeout(function(){mousedownLock=false;},TIMEOUT);
                        }
                    };
                }else{
                    this.textareaObj.get(0).onmousedown = function(){
                        if(!mousedownLock){
                            mousedownTimeoutId = setTimeout(thisObject.dataOptions.onmousedownHandler,TIMEOUT);
                            mousedownLock = true;
                            setTimeout(function(){mousedownLock=false;},TIMEOUT);
                        }
                    };
                }
            }else{
                if(typeof this.dataOptions.onmousedownHandler == "string"){
                    this.textareaObj.get(0).onmousedown = window[this.dataOptions.onmousedownHandler];
                }else{
                    this.textareaObj.get(0).onmousedown = thisObject.dataOptions.onmousedownHandler;
                }
            }
        }
        if(this.dataOptions.onmouseupHandler){             //onmouseup
            if(this.dataOptions.ondblclickHandler){
                if(typeof this.dataOptions.onmouseupHandler == "string"){
                    this.textareaObj.get(0).onmouseup = function(){
                        if(!mouseupLock){
                            mouseupTimeoutId = setTimeout(window[this.dataOptions.onmouseupHandler],TIMEOUT);
                            mouseupLock = true;
                            setTimeout(function(){mouseupLock=false;},TIMEOUT);
                        }
                    };
                }else{
                    this.textareaObj.get(0).onmouseup = function(){
                        if(!mouseupLock){
                            mouseupTimeoutId = setTimeout(thisObject.dataOptions.onmouseupHandler,TIMEOUT);
                            mouseupLock = true;
                            setTimeout(function(){mouseupLock=false;},TIMEOUT);
                        }
                    };
                }
            }else{
                if(typeof this.dataOptions.onmouseupHandler == "string"){
                    this.textareaObj.get(0).onmouseup = window[this.dataOptions.onmouseupHandler];
                }else{
                    this.textareaObj.get(0).onmouseup = thisObject.dataOptions.onmouseupHandler;
                }
            }
        }
        if(this.dataOptions.ondblclickHandler){             //ondblclick
            if(typeof this.dataOptions.ondblclickHandler == "string"){
                this.textareaObj.get(0).ondblclick = function(){
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
                this.textareaObj.get(0).ondblclick = function(){
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
                this.textareaObj.get(0).onfocus = window[this.dataOptions.onfocusHandler];
            }else{
                this.textareaObj.get(0).onfocus = this.dataOptions.onfocusHandler;
            }
        }
        if(this.dataOptions.onblurHandler){                //onblur
            if(typeof this.dataOptions.onblurHandler == "string"){
                this.textareaObj.get(0).onblur = window[this.dataOptions.onblurHandler];
            }else{
                this.textareaObj.get(0).onblur = this.dataOptions.onblurHandler;
            }
        }
        if(this.dataOptions.onkeypressHandler){                //onkeypress
            if(typeof this.dataOptions.onkeypressHandler == "string"){
                this.textareaObj.get(0).onkeypress = window[this.dataOptions.onkeypressHandler];
            }else{
                this.textareaObj.get(0).onkeypress = this.dataOptions.onkeypressHandler;
            }
        }
        if(this.dataOptions.onkeydownHandler){                //onkeydown
            if(typeof this.dataOptions.onkeydownHandler == "string"){
                this.textareaObj.get(0).onkeydown = window[this.dataOptions.onkeydownHandler];
            }else{
                this.textareaObj.get(0).onkeydown = this.dataOptions.onkeydownHandler;
            }
        }
        if(this.dataOptions.onkeyupHandler){                //onkeyup
            if(typeof this.dataOptions.onkeyupHandler == "string"){
                this.textareaObj.get(0).onkeyup = window[this.dataOptions.onkeyupHandler];
            }else{
                this.textareaObj.get(0).onkeyup = this.dataOptions.onkeyupHandler;
            }
        }
        if(this.dataOptions.onchangeHandler){                //onchange
            if(typeof this.dataOptions.onchangeHandler == "string"){
                this.textareaObj.get(0).onchange = window[this.dataOptions.onchangeHandler];
            }else{
                this.textareaObj.get(0).onchange = this.dataOptions.onchangeHandler;
            }
        }
    };

    $.fn.textarea = function (option,param) {
        var result = null;
        var thisObj = this.each(function () {
            var $this = $(this)
                , thisObject = $this.data('textarea')
                , dataOptions = typeof option == 'object' && option;
            if(typeof option == 'string' ){
                result = thisObject[option](param);
            }else{
                $this.data('textarea', (thisObject = new Textarea(this, dataOptions)));
            }
        });
        if(typeof option == 'string' )return result;
        return thisObj;
    };

    $.fn.textarea.defaults = {
        required:false,
        dblclickTimeSpan:250,
        width:250,
        height:90,
        titleWidth:73
    };

    $(window).on('load', function(){
        $(".eb_textarea").each(function () {
            var thisObj = $(this)
                , dataOptionsStr = thisObj.data('options');
            if(!dataOptionsStr)
                thisObj.textarea($.fn.textarea.defaults);
            else
                thisObj.textarea((new Function("return {" + dataOptionsStr + "}"))());
        });
    });
}(window.jQuery);
