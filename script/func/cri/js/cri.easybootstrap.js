/*=====================================================================================
 * easy-bootstrap-input v2.0
 * 
 * @author:niyq
 * @date:2013/08/19
 * @dependce:jquery
 *=====================================================================================*/
!function($){

    "use strict";

    var Input = function(element,dataOptions){
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
    };

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

    $.fn.input = function (option,param) {
        var result = null;
        var thisObj = this.each(function () {
            var $this = $(this)
                , thisObject = $this.data('input')
                , dataOptions = typeof option == 'object' && option;
            if(typeof option == 'string' ){
                result = thisObject[option](param);
            }else{
                $this.data('input', (thisObject = new Input(this, dataOptions)));
            }
        });
        if(typeof option == 'string' )return result;
        return thisObj;
    };

    $.fn.input.defaults = {
        required:false,
        dblclickTimeSpan:250,
        width:250,
        height:20,
        titleWidth:73,
        readonly:false
    };

    $(window).on('load', function(){
        $(".eb_input").each(function () {
            var thisObj = $(this)
                , dataOptionsStr = thisObj.data('options');
            if(!dataOptionsStr)
                thisObj.input($.fn.input.defaults);
            else
                thisObj.input((new Function("return {" + dataOptionsStr + "}"))());
        });
    });
}(window.jQuery);

/*=====================================================================================
 * easy-bootstrap-selectBox v2.0
 * 
 * @author:niyq
 * @date:2013/08/19
 * @dependce:jquery
 *=====================================================================================*/
!function($){

    "use strict";

    var SelectBox = function(element,dataOptions){
        var thisObject = this;
        this.$element = $(element);
        this.style = this.$element.attr("style");
        this.dataOptions = $.extend({}, $.fn.selectBox.defaults, dataOptions);
        this.name = this.$element.attr("name");
        this.value = "";
        this.title = "";
        if(this.$element.attr("title"))
            this.title = this.$element.attr("title");
        if(this.dataOptions.title)
            this.title = this.dataOptions.title;
        this.id = this.$element.attr("id");
        this.placeholder = this.$element.attr("placeholder");
        this.init();     //初始化selectBoxGroup组件
        this.inputObj.click(function(){
            $(".eb_timeInput.focus").removeClass("focus");
            $(".eb_timeBox.show").hide().removeClass("show");
            thisObject.toggleDropdownMenu();
        });
        this.blurAction();
        this.stopBubbleTransfer();
    };

    SelectBox.prototype.addOpts = function(param){
        var thisObject = this;
        if(this.dataOptions.multiple != true){
            for(var i in param){
                this.dropdownMenu.append($('<span class="eb_dropdownOption" value="'+i+'">'+param[i]+'</span>').width(thisObject.dropdownMenu.width()-2).mouseover(function(){
                    $(this).addClass("mouseover");
                }).mouseout(function(){
                    $(this).removeClass("mouseover");
                }).click(function(){
                    var value = $(this).attr("value");
                    thisObject.setValue(value);
                    thisObject.inputObj.focus();
                    thisObject.toggleDropdownMenu();
                }));
                this.optionArr["option_"+i] = {text:param[i],value:i};
                var length = this.dropdownMenu.find(".eb_dropdownOption").length;
                this.dropdownMenu.height(length*30);
            }
            if(this.dataOptions.onselectHandler){
                for(var i in param){
                    this.dropdownMenu.find(".eb_dropdownOption[value='"+i+"']").each(function(){
                        var oldValue;
                        $(this).mousedown(function(){
                            oldValue = thisObject.parent.attr("value");
                        });
                        $(this).click(function(){
                            var value = $(this).attr("value");
                            if(value != oldValue){
                                var func = thisObject.dataOptions.onselectHandler;
                                if(typeof func == "string")
                                    func = window[func];
                                func(thisObject.parent.get(0));
                            }
                        });
                    });
                }
            }
        }else{
            for(var i in param){
                this.displayAreaObj.append($('<span class="eb_dropdownOption" value="'+i+'"><input type="checkbox" value="'+i+'" class="eb_dropdownCheckbox" /><span>'+param[i]+'</span></span>').width(thisObject.dropdownMenu.width()-2).mouseover(function(){
                    $(this).addClass("mouseover");
                }).mouseout(function(){
                    $(this).removeClass("mouseover");
                }).click(function(){
                    var checked = $(this).children('.eb_dropdownCheckbox').get(0).checked;
                    if(checked == true){
                        $(this).children('.eb_dropdownCheckbox').get(0).checked = false;
                    }else if(checked == false){
                        $(this).children('.eb_dropdownCheckbox').get(0).checked = true;
                    }
                }).children('.eb_dropdownCheckbox').click(function(event){
                    event.stopPropagation();
                }).parent());
                this.optionArr["option_"+i] = {text:param[i],value:i};
                var length = this.dropdownMenu.find(".eb_dropdownOption").length;
                this.dropdownMenu.height(length*30 + 26);
                this.displayAreaObj.height(length*30);
            }
            /*if(this.dataOptions.onselectHandler){
             this.buttonOKObj.click(function(){
             thisObject.dataOptions.onselectHandler(thisObject.selectBoxObj);
             });
             }*/
        }
    };

    SelectBox.prototype.addOpt = function(text,value){
        var thisObject = this;
        if(this.dataOptions.multiple != true){
            this.dropdownMenu.append($('<span class="eb_dropdownOption" value="'+value+'">'+text+'</span>').width(thisObject.dropdownMenu.width()-2).mouseover(function(){
                $(this).addClass("mouseover");
            }).mouseout(function(){
                $(this).removeClass("mouseover");
            }).click(function(){
                var value = $(this).attr("value");
                thisObject.setValue(value);
                thisObject.inputObj.focus();
                thisObject.toggleDropdownMenu();
            }));
            this.optionArr["option_"+value] = {text:text,value:value};
            var length = this.dropdownMenu.find(".eb_dropdownOption").length;
            this.dropdownMenu.height(length*30);
            if(this.dataOptions.onselectHandler){
                this.dropdownMenu.find(".eb_dropdownOption[value='"+value+"']").each(function(){
                    var oldValue;
                    $(this).mousedown(function(){
                        oldValue = thisObject.parent.attr("value");
                    });
                    $(this).click(function(){
                        var value = $(this).attr("value");
                        if(value != oldValue){
                            var func = thisObject.dataOptions.onselectHandler;
                            if(typeof func == "string")
                                func = window[func];
                            func(thisObject.parent.get(0));
                        }
                    });
                });
            }
        }else{
            this.displayAreaObj.append($('<span class="eb_dropdownOption" value="'+value+'"><input type="checkbox" value="'+value+'" class="eb_dropdownCheckbox" /><span>'+text+'</span></span>').width(thisObject.dropdownMenu.width()-2).mouseover(function(){
                $(this).addClass("mouseover");
            }).mouseout(function(){
                $(this).removeClass("mouseover");
            }).click(function(){
                var checked = $(this).children('.eb_dropdownCheckbox').get(0).checked;
                if(checked == true){
                    $(this).children('.eb_dropdownCheckbox').get(0).checked = false;
                }else if(checked == false){
                    $(this).children('.eb_dropdownCheckbox').get(0).checked = true;
                }
            }).children('.eb_dropdownCheckbox').click(function(event){
                event.stopPropagation();
            }).parent());
            this.optionArr["option_"+value] = {text:text,value:value};
            var length = this.dropdownMenu.find(".eb_dropdownOption").length;
            this.dropdownMenu.height(length*30+26);
            this.displayAreaObj.height(length*30);
        }
    };

    SelectBox.prototype.clearOpts = function(){
        this.dropdownMenu.html("").height(30);
        this.setValue("");
    };

    SelectBox.prototype.setValueByIndex = function(index){
        var obj = this.dropdownMenu.find(".eb_dropdownOption").eq(index);
        var value = "";
        if(obj && obj.length>0)
            value = obj.attr("value");
        this.setValue(value);
    };

    SelectBox.prototype.setValue = function(valueParam){
        valueParam = "" + valueParam;
        var thisObject = this;
        var value = "";
        if(valueParam || valueParam == ""){
            value = valueParam;
        }else if(this.dataOptions.defaultVal){
            value = "" + this.dataOptions.defaultVal;
        }
        var valueArr = value.split(",");
        var textArr = [];
        for(var i=0;i<valueArr.length;i++){
            if(this.optionArr["option_"+valueArr[i]])
                textArr.push(this.optionArr["option_"+valueArr[i]].text);
            else
                textArr.push(valueArr[i]);
        }
        var text = "";
        for(var i=0;i<textArr.length;i++){
            if(i<textArr.length-1){
                text = text + textArr[i] + ",";
            }else{
                text = text + textArr[i];
            }
        }
        this.selectBoxObj.html(text);
        this.selectBoxObj.attr("value",value);
        this.parent.attr("value",value);
        if(this.dataOptions.multiple == true){
            var valueArr = value.split(",");
            thisObject.displayAreaObj.find('.eb_dropdownCheckbox').each(function(){
                $(this).get(0).checked = false;
            });
            for(var i=0;i<valueArr.length;i++){
                this.displayAreaObj.find('.eb_dropdownCheckbox[value="'+valueArr[i]+'"]').get(0).checked = true;
            }
        }
        return this.selectBoxObj;
    };

    SelectBox.prototype.getValue = function(){
        var value = this.parent.attr("value");
        return value;
    };

    SelectBox.prototype.getText = function(){
        var value = this.getValue();
        var text = value;
        var textArr = text.split(",");
        for(var i = 0;i<textArr.length;i++){
            if(this.optionArr["option_"+textArr[i]] && this.optionArr["option_"+textArr[i]].text){
                textArr[i] = this.optionArr["option_"+textArr[i]].text;
            }
        }
        /*if(this.optionArr["option_"+value] && this.optionArr["option_"+value].text){
         text = this.optionArr["option_"+value].text;
         }*/
        text = textArr[0];
        for(var j = 1;j<textArr.length;j++){
            text = ","+textArr[j];
        }
        return text;
    }

    SelectBox.prototype.clearValue = function(){
        var thisObject = this;
        if(thisObject.dataOptions.defaultVal)
            this.setValue(thisObject.dataOptions.defaultVal);
        else
            this.setValue("");
    };

    SelectBox.prototype.blurAction = function(){
        var thisObject = this;
        $("body").click(function(){
            $(".eb_show").hide().removeClass('eb_show');
        });
    };

    SelectBox.prototype.stopBubbleTransfer = function(){
        $(".eb_dropdownMenu,.eb_selectBox_hide").each(function(){
            $(this).click(function(event){
                event.stopPropagation();
            });
        });
    };

    SelectBox.prototype.init = function(){
        var thisObject = this;
        this.optionObjArr = this.$element.get(0).getElementsByTagName("option");      //optionObjArr
        this.optionArr = {};
        for(var i=0;i<this.optionObjArr.length;i++){
            this.optionArr["option_"+$(thisObject.optionObjArr[i]).attr("value")] = {text:$(thisObject.optionObjArr[i]).html(),value:$(thisObject.optionObjArr[i]).attr("value")};
        }
        this.dropdownArea = $(".eb_dropdownArea");                            //dropdownArea
        if(this.dropdownArea.length <= 0)      //检查在窗口中有没有 .dropdownArea 如果没有，则添加一个
            $("body").prepend('<div class="eb_dropdownArea"></div>');
        this.dropdownArea = $(".eb_dropdownArea");
        this.$element.wrap('<div class="eb_selectBoxGroup" id="'+thisObject.id+'_subgroup" name="'+thisObject.name+'" value="'+thisObject.value+'" data-options="'+thisObject.$element.data('options')+'" ></div>');
        this.parent = this.$element.parent();                                   //parent
        this.parent.data('selectBox',thisObject);
        this.parent.data('selectBox',thisObject.$element.data('selectBox'));
        var html = "";
        html = html + '<span class="eb_title">'+thisObject.title+'</span>';
        if((this.dataOptions.defaultVal || this.dataOptions.defaultVal == '') && this.optionArr["option_"+this.dataOptions.defaultVal] && this.optionArr["option_"+this.dataOptions.defaultVal].text)
            this.dataOptions.defaultText = this.optionArr["option_"+this.dataOptions.defaultVal].text;
        else if(this.dataOptions.defaultVal || this.dataOptions.defaultVal == '')
            this.dataOptions.defaultText = this.dataOptions.defaultVal;
        else
            this.dataOptions.defaultText = "";
        html = html + '<span class="eb_selectBox" id="'+thisObject.id+'" name="'+thisObject.name+'" value="'+thisObject.value+'" placeholder="'+thisObject.placeholder+'">'+this.dataOptions.defaultText+'</span>';
        html = html + '<span class="eb_selectBoxButton"><span class="eb_selectBoxButtonIcon"></span></span>';
        if(this.dataOptions.required == true)
            html = html + '<span class="redStar" style="color:red;">*</span>';
        this.parent.html(html);
        this.selectBoxObj = this.parent.find(".eb_selectBox");                 //selectBoxObj
        this.selectBoxObj.data("selectBox",thisObject);
        this.selectBoxObj.attr("style",thisObject.style);
        this.titleObj = this.parent.find(".eb_title");                         //titleObj
        this.buttonObj = this.parent.find(".eb_selectBoxButton");              //buttonObj
        //this.$element.attr("class","eb_selectBox_hide");
        this.parent.prepend('<input class="eb_selectBox_hide" />');
        this.inputObj = this.parent.children("input");                         //inputObj
        this.setWidth();
        this.setHeight();
        if(this.dataOptions.multiple == true){
            this.initMultipleDropdownMenu();                                    //初始化为多选下拉框
        }else{
            this.initSingleDropdownMenu();                                      //初始化为单选下拉框
        }
        if(this.dataOptions.defaultVal || this.dataOptions.defaultVal == ''){
            this.setValue(this.dataOptions.defaultVal);
        }
        this.setStyle();                                                       //设置组件样式变化
        this.setEvent();														//绑定事件
    };

    SelectBox.prototype.setWidth = function(){
        if(this.dataOptions.width){
            var width = this.dataOptions.width;
            if(typeof width == "string")
                width = width.split("px")[0];
            this.parent.width(width);
            this.selectBoxObj.width(width-84);
            this.inputObj.width(width-80);
        }
        if(this.dataOptions.titleWidth || this.dataOptions.titleWidth == 0){
            var width = this.dataOptions.width;
            var titleWidth = this.dataOptions.titleWidth;
            if(typeof titleWidth == "string")
                titleWidth = titleWidth.split("px")[0];
            titleWidth = titleWidth + 7;
            var inputWidth = width - titleWidth;
            this.inputObj.width(inputWidth);
            this.selectBoxObj.width(inputWidth-4);
        }
    };

    SelectBox.prototype.setHeight = function(){
        if(this.dataOptions.height){
            var height = this.dataOptions.height;
            if(typeof height == "string")
                height = height.split("px")[0];
            this.parent.height(height);
            this.parent.css("line-height",height+"px");
            this.selectBoxObj.height(height);
            this.selectBoxObj.css("line-height",height+"px");
            this.inputObj.height(height);
            this.buttonObj.height(height-2);
            this.buttonObj.css("line-height",height-2+"px");
        }
    };

    SelectBox.prototype.initSingleDropdownMenu = function(){
        var thisObject = this;
        this.dropdownArea.append('<div class="eb_dropdownMenu" id="eb_dropdownMenu_'+thisObject.id+'"></div>');
        this.dropdownMenu = this.dropdownArea.children("#eb_dropdownMenu_"+thisObject.id);     //dropdownMenu
        var width = this.selectBoxObj.width() + 2;

        for(var i in this.optionArr){
            this.dropdownMenu.append('<span class="eb_dropdownOption" value="'+thisObject.optionArr[i].value+'">'+thisObject.optionArr[i].text+'</span>');
        }
        var height = this.dropdownMenu.find(".eb_dropdownOption").length*30;
        this.dropdownMenu.width(width);
        this.dropdownMenu.height(height);
        this.dropdownMenu.find(".eb_dropdownOption").width(width-2);
        this.dropdownMenu.find(".eb_dropdownOption").each(function(){
            $(this).click(function(){
                var value = $(this).attr("value");
                thisObject.setValue(value);
                thisObject.inputObj.focus();
                thisObject.toggleDropdownMenu();
            });
        });
    };

    SelectBox.prototype.initMultipleDropdownMenu = function(){
        var thisObject = this;
        this.dropdownArea.append('<div class="eb_dropdownMenu" id="eb_dropdownMenu_'+thisObject.id+'"></div>');
        this.dropdownMenu = this.dropdownArea.children("#eb_dropdownMenu_"+thisObject.id);     //dropdownMenu
        var width = this.selectBoxObj.width() + 2;
        this.dropdownMenu.html('<div class="eb_displayArea"></div>');
        this.displayAreaObj = this.dropdownMenu.children('.eb_displayArea');                  //displayAreaObj
        this.dropdownMenu.css('overflow-y','hidden');
        for(var i in this.optionArr){
            this.displayAreaObj.append('<span class="eb_dropdownOption" value="'+thisObject.optionArr[i].value+'"><input type="checkbox" value="'+thisObject.optionArr[i].value+'" class="eb_dropdownCheckbox" /><span>'+thisObject.optionArr[i].text+'</span></span>');
        }
        if(this.dataOptions.defaultVal){
            var defaultVal = this.dataOptions.defaultVal;
            defaultVal = defaultVal.split(",");
            for(var i=0;i<defaultVal.length;i++){
                this.displayAreaObj.find(".eb_dropdownCheckbox[value='"+defaultVal[i]+"']").get(0).checked = true;
            }
        }
        var height = this.dropdownMenu.find(".eb_dropdownOption").length*30;
        this.dropdownMenu.width(width);
        this.dropdownMenu.height(height+26);
        this.displayAreaObj.width(width);
        this.displayAreaObj.height(height);
        this.dropdownMenu.find(".eb_dropdownOption").width(width-2);
        this.dropdownMenu.find(".eb_dropdownCheckbox").click(function(event){
            event.stopPropagation();
        });
        this.dropdownMenu.find(".eb_dropdownOption").each(function(){
            $(this).click(function(){
                var check = $(this).children(".eb_dropdownCheckbox").get(0).checked;
                if(check == true){
                    $(this).children(".eb_dropdownCheckbox").get(0).checked = false;
                }else{
                    $(this).children(".eb_dropdownCheckbox").get(0).checked = true;
                }
            });
        });
        this.dropdownMenu.append($('<div class="eb_dropdownButtonsBar"><div class="eb_buttonOK">确定</div><div class="eb_buttonCancel">取消</div></div>'));
        this.buttonsBarObj = this.dropdownMenu.children('.eb_dropdownButtonsBar');                               //buttonsBarObj
        this.buttonOKObj = this.buttonsBarObj.children('.eb_buttonOK');                                             //buttonOKObj
        this.buttonCancelObj = this.buttonsBarObj.children('.eb_buttonCancel');                                             //buttonCancelObj
        this.buttonsBarObj.width(width-2);
        this.buttonOKObj.width((width-2)/2);
        this.buttonCancelObj.width((width-2)/2).css('left',(width-2)/2+'px');
        this.buttonsBarObj.children('div').each(function(){
            $(this).mouseover(function(){
                $(this).addClass('mouseover');
            }).mouseout(function(){
                $(this).removeClass('mouseover');
            });
        });
        this.buttonCancelObj.click(function(){
            thisObject.dropdownMenu.hide().removeClass('eb_show');
        });

        this.buttonOKObj.click(function(){
            var valueArr = [];
            var textArr = [];
            thisObject.dropdownMenu.find(".eb_dropdownCheckbox").each(function(){
                if($(this).get(0).checked == true){
                    valueArr.push($(this).attr("value"));
                    textArr.push($(this).next().html());
                }
            });
            var value = "";
            var text = '<span style="display:inline-block;max-height:21px;max-width:'+(thisObject.selectBoxObj.width()-40)+'px;overflow:hidden;word-break:break-all;">';
            for(var i=0;i<valueArr.length;i++){
                if(i<valueArr.length-1){
                    value = value + valueArr[i] + ",";
                    text = text + textArr[i] + ",";
                }else{
                    value = value + valueArr[i];
                    text = text + textArr[i] + '</span>';
                }
            }
            thisObject.parent.attr('value',value);
            thisObject.selectBoxObj.attr('value',value).html(text);
            if(thisObject.selectBoxObj.children('span').get(0).offsetHeight>20){
                thisObject.selectBoxObj.append('<span style="position:relative;top:-6px;">...</span>');
            };
            thisObject.inputObj.focus();
            thisObject.toggleDropdownMenu();
        });
        this.buttonsBarObj.width(thisObject.dropdownMenu.get(0).clientWidth-2);
    }

    SelectBox.prototype.toggleDropdownMenu = function(){
        if(this.dropdownMenu.attr("class").indexOf("eb_show")>=0){
            this.hideDropdownMenu();
        }else{
            this.showDropdownMenu();
        }
    };

    SelectBox.prototype.showDropdownMenu = function(){
        this.locatDropdownMenu();
        $(".eb_dropdownMenu.eb_show").hide().removeClass("eb_show");
        this.dropdownMenu.slideDown('fast').addClass("eb_show");
    };

    SelectBox.prototype.hideDropdownMenu = function(){
        this.dropdownMenu.hide().removeClass("eb_show");
    };

    SelectBox.prototype.locatDropdownMenu = function(){
        var top = this.selectBoxObj.offset().top;
        var left = this.selectBoxObj.offset().left;
        var scrollTop = $(window).scrollTop();
        var scrollLeft = $(window).scrollLeft();
        top = top + this.selectBoxObj.height();
        if(navigator.userAgent.indexOf("Firefox")>=0)
            top = top + 4;
        left = left + 1;
        $(this.dropdownMenu).css("left",left).css("top",top+this.$element.height()+3);
    };

    SelectBox.prototype.setStyle = function(){
        var thisObject = this;
        this.inputObj.focus(function(){
            thisObject.selectBoxObj.addClass("focus");
            thisObject.buttonObj.addClass("focus");
        }).blur(function(){
            thisObject.selectBoxObj.removeClass("focus");
            thisObject.buttonObj.removeClass("focus");
        });
        this.dropdownMenu.click(function(){
            thisObject.selectBoxObj.addClass("focus");
            thisObject.buttonObj.addClass("focus");
        }).find(".eb_dropdownOption").each(function(){
            $(this).mouseover(function(){
                $(this).addClass("mouseover");
            }).mouseout(function(){
                $(this).removeClass("mouseover");
            });
        });
    };

    SelectBox.prototype.check = function(){
        var thisObject = this;
        var result = {length:0,result:true};
        var val = this.getValue();
        if(this.dataOptions.required == true){
            if(!val && val!=""){
                result['required'] = 'fail';
                result.result = false;
                result.length++;
            }
        }
        return result;
    };

    SelectBox.prototype.setEvent = function(){
        var thisObject = this;
        if(this.dataOptions.onclickHandler){
            this.selectBoxObj.click(function(){
                var func = thisObject.dataOptions.onclickHandler;
                if(typeof func == "string"){
                    func = window[func];
                }
                func(thisObject.parent.get(0));
            });
        }
        if(this.dataOptions.onselectHandler){
            if(this.dataOptions.multiple != true){
                this.dropdownMenu.find(".eb_dropdownOption").each(function(){
                    var oldValue;
                    $(this).mousedown(function(){
                        oldValue = thisObject.parent.attr("value");
                    });
                    $(this).click(function(){
                        var value = $(this).attr("value");
                        if(value != oldValue){
                            var func = thisObject.dataOptions.onselectHandler;
                            if(typeof func == "string")
                                func = window[func];
                            func(thisObject.parent.get(0));
                        }
                    });
                });
            }else{
                this.buttonOKObj.click(function(){
                    this.dataOptions.onselectHandler(thisObject.selectBoxObj);
                });
            }
        }
    };

    $.fn.selectBox = function (option,param,param1) {
        var result = null;
        var thisObj = this.each(function () {
            var $this = $(this)
                , thisObject = $this.data('selectBox')
                , dataOptions = typeof option == 'object' && option;
            if(typeof option == 'string' ){
                result = thisObject[option](param,param1);
            }else{
                $this.data('selectBox', (thisObject = new SelectBox(this, dataOptions)));
            }
        });
        if(typeof option == 'string' )return result;
        return thisObj;
    };

    $.fn.selectBox.defaults = {
        required:false,
        dblclickTimeSpan:250,
        multiple:false,
        width:250,
        height:20,
        titleWidth:73
    };

    $(window).on('load', function(){
        $(".eb_selectBox").each(function () {
            var thisObj = $(this)
                , dataOptionsStr = thisObj.data('options');
            if(!dataOptionsStr)
                thisObj.selectBox($.fn.selectBox.defaults);
            else
                thisObj.selectBox((new Function("return {" + dataOptionsStr + "}"))());
        });
    });
}(window.jQuery);
/*=====================================================================================
 * easy-bootstrap-fileUpload v2.0
 * 
 * @author:niyq
 * @date:2013/08/22
 * @dependce:jquery
 *=====================================================================================*/
!function($){

    "use strict";

    var FileUpload = function(element,dataOptions){
        var thisObject = this;
        this.$element = $(element);
        this.dataOptions = $.extend({}, $.fn.fileUpload.defaults, dataOptions);
        this.title = "";
        if(this.$element.attr("title"))
            this.title = this.$element.attr("title");
        if(this.dataOptions.title)
            this.title = this.dataOptions.title;
        this.id = this.$element.attr("id");
        this.name = this.$element.attr("name");
        this.init();
    };

    FileUpload.prototype.init = function(){
        var thisObject = this;
        this.fileUploadObj = this.$element;                                                     //fileUploadObj
        this.fileUploadObj.wrap($('<div class="eb_fileUploadGroup"></div>'));
        this.parent = this.fileUploadObj.parent();                                              //parent
        this.parent.data('fileUpload',thisObject);
        this.fileUploadObj.after($('<input class="eb_fileUploadInput" name="'+thisObject.name+'" id="eb_fileUploadInput_'+thisObject.id+'" />'));
        this.inputObj = this.parent.children('.eb_fileUploadInput');                             //inputObj
        this.inputObj.data('fileUpload',thisObject);
        this.inputObj.before($('<span class="eb_title">'+thisObject.title+'</span>'));
        this.titleObj = this.parent.children('.eb_title');                                       //titleObj
        this.inputObj.after($('<div class="eb_button">浏览</div>'));
        this.buttonObj = this.parent.children('.eb_button');                                    //buttonObj
        this.fileUploadObj.change(function(){
            var value = thisObject.fileUploadObj.val();
            thisObject.inputObj.val(value);
            thisObject.parent.attr('value',value);
        });
        this.buttonObj.click(function(){
            thisObject.fileUploadObj.trigger('click');
            thisObject.fileUploadObj.get(0).focus();
        }).mousedown(function(){
            setTimeout(function(){
                thisObject.inputObj.addClass('focus');
                thisObject.buttonObj.addClass('focus');
            },1);
        });
        this.setWidth();
        this.setHeight();
        this.setStyle();
    };

    FileUpload.prototype.setValue = function(value){
        this.inputObj.val(value);
        this.fileUploadObj.val(value);
        if(this.fileUploadObjClone)
            his.fileUploadObjClone.val(value);
        this.parent.attr('value',value);
    };

    FileUpload.prototype.getValue = function(){
        var value = this.fileUploadObj.val();
        if(this.fileUploadObjClone)
            value = this.fileUploadObjClone.val();
        return value;
    };

    FileUpload.prototype.clearValue = function(){
        this.setValue('');
    }

    FileUpload.prototype.initInForm = function(formObj){
        var thisObject = this;
        formObj.append(thisObject.fileUploadObjClone = thisObject.fileUploadObj.clone().css('display','none').addClass('clone'));              //fileUploadObjClone
        this.fileUploadObj.click(function(){
            thisObject.fileUploadObjClone.trigger('click');
            return false;
        });
        this.fileUploadObjClone.change(function(){
            var value = $(this).val();
            thisObject.setValue(value);
        });
        return thisObject.fileUploadObjClone;
    };

    FileUpload.prototype.setWidth = function(widthParam){
        var thisObject = this;
        var width = $.fn.fileUpload.defaults.width;
        if(this.dataOptions.width)
            width = this.dataOptions.width;
        if(widthParam)
            width = widthParam;
        if(typeof width == 'string')
            width = width.split("px")[0];
        this.parent.width(width);
        this.inputObj.width(thisObject.parent.width()-140);
        this.fileUploadObj.width(thisObject.parent.width()-75);
        if(this.dataOptions.titleWidth || this.dataOptions.titleWidth == 0){
            var width = this.dataOptions.titleWidth;
            this.titleObj.width(width);
            this.inputObj.width(thisObject.parent.width()-width-67);
            this.fileUploadObj.width(thisObject.parent.width()-width-2);
        }
    };

    FileUpload.prototype.setHeight = function(heightParam){
        var thisObject = this;
        var height = $.fn.fileUpload.defaults.height;
        if(this.dataOptions.height)
            height = this.dataOptions.height;
        if(heightParam)
            height = heightParam;
        if(typeof height == "string")
            height = height.dplit("px")[0];
        this.parent.height(height);
        this.inputObj.height(height-2);
        this.inputObj.css('line-height',(height-2)+'px');
        this.fileUploadObj.height(height);
        this.titleObj.height(height);
        this.titleObj.css('line-height',(height+2)+'px');
        this.buttonObj.height(height);
        this.buttonObj.css('line-height',height+'px');
    };

    FileUpload.prototype.setStyle = function(){
        var thisObject = this;
        this.buttonObj.mouseover(function(){
            $(this).addClass('mouseover');
        }).mouseout(function(){
            $(this).removeClass('mouseover');
        }).mousedown(function(){
            $(this).addClass("mousedown");
        }).mouseup(function(){
            $(this).removeClass("mousedown");
        });
        this.fileUploadObj.focus(function(){
            thisObject.inputObj.addClass('focus');
            thisObject.buttonObj.addClass('focus');
        }).blur(function(){
            thisObject.inputObj.removeClass('focus');
            thisObject.buttonObj.removeClass('focus');
        });
    };

    $.fn.fileUpload = function (option,param) {
        var result = null;
        var thisObj = this.each(function () {
            var $this = $(this)
                , thisObject = $this.data('fileUpload')
                , dataOptions = typeof option == 'object' && option;
            if(typeof option == 'string' ){
                result = thisObject[option](param);
            }else{
                $this.data('fileUpload', (thisObject = new FileUpload(this, dataOptions)));
            }
        });
        if(typeof option == 'string' )return result;
        return thisObj;
    };

    $.fn.fileUpload.defaults = {
        width:250,
        height:20
    };

    $(window).on('load', function(){
        $(".eb_fileUpload").not('.clone').each(function () {
            var thisObj = $(this)
                , dataOptionsStr = thisObj.data('options');
            if(!dataOptionsStr)
                thisObj.fileUpload($.fn.fileUpload.defaults);
            else
                thisObj.fileUpload((new Function("return {" + dataOptionsStr + "}"))());
        });
    });
}(window.jQuery);


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
/*=====================================================================================
 * easy-bootstrap-form v2.0
 * 
 * @author:niyq
 * @date:2013/08/22
 * @dependce:jquery
 *=====================================================================================*/
!function($){

    "use strict";

    var Form = function(element,dataOptions){
        var thisObject = this;
        this.$element = $(element);
        this.dataOptions = $.extend({}, $.fn.form.defaults, dataOptions);
        this.title = this.$element.attr("title");
        this.id = this.$element.attr("id");
        this.init();
    };

    Form.prototype.init = function(){
        var thisObject = this;
        var formPanel = $('body').get(0);
        if(this.dataOptions.ajax == true){//----------------------------------------------------------ajax-----------------------------------------------------------
            $('body').append(formPanel = $('<iframe src="ajaxFileUpload.html" id="ajaxFileUploadTest"></iframe>'));
            var myWindow = formPanel.get(0).contentWindow;
            myWindow.onload = function(){
                formPanel = myWindow.$('#eb_ajaxFileUploadFormPanel').get(0);
                $(formPanel).append(thisObject.realFormObj = $('<form class="eb_realForm" style="display:none" id="eb_form_'+thisObject.id+'"></form>'));                   //realFormObj
                thisObject.realFormObj.attr('action',thisObject.dataOptions.action).attr('method',thisObject.dataOptions.method);
                var fileUploadArr = thisObject.$element.find('.eb_fileUpload');
                if(fileUploadArr.length > 0){
                    fileUploadArr.each(function(){
                        $(this).fileUpload('initInForm',thisObject.realFormObj);
                    });
                    thisObject.realFormObj.attr('enctype','multipart/form-data');
                }
                var nameValueArr = {};
                thisObject.$element.find('[name]').each(function(){
                    var name = $(this).attr('name');
                    var value = $(this).attr('value');
                    if($(this).val())
                        value = $(this).val();
                    if(!nameValueArr[name]){
                        nameValueArr[name] = value;
                    }else{
                        nameValueArr[name] = nameValueArr[name] + "," + value;
                    }
                });
                for(var index in nameValueArr){
                    if(thisObject.realFormObj.find('[name="'+index+'"]').length<=0){
                        thisObject.realFormObj.append($('<input type="hidden" name="'+index+'" value="'+nameValueArr[index]+'" />'));
                    }
                }
            };
            //formPanel = myWindow.document.getElementById('eb_ajaxFileUploadFormPanel');
        }else{ //-------------------------------------------------------------------------------------------------------------------------------------------------------------
            $(formPanel).append(thisObject.realFormObj = $('<form class="eb_realForm" style="display:none" id="eb_form_'+thisObject.id+'"></form>'));                   //realFormObj
            this.realFormObj.attr('action',thisObject.dataOptions.action).attr('method',thisObject.dataOptions.method);
            var fileUploadArr = this.$element.find('.eb_fileUpload');
            if(fileUploadArr.length > 0){
                fileUploadArr.each(function(){
                    $(this).fileUpload('initInForm',thisObject.realFormObj);
                });
                thisObject.realFormObj.attr('enctype','multipart/form-data');
            }
            var nameValueArr = {};
            this.$element.find('[name]').each(function(){
                var name = $(this).attr('name');
                var value = $(this).attr('value');
                if($(this).val())
                    value = $(this).val();
                if(!nameValueArr[name]){
                    nameValueArr[name] = value;
                }else{
                    nameValueArr[name] = nameValueArr[name] + "," + value;
                }
            });
            for(var index in nameValueArr){
                if(thisObject.realFormObj.find('[name="'+index+'"]').length<=0){
                    thisObject.realFormObj.append($('<input type="hidden" name="'+index+'" value="'+nameValueArr[index]+'" />'));
                }
            }
        }
    };

    Form.prototype.submit = function(param){
        var thisObject = this;
        if(param && param.type && (param.type == "get" || param.type == "post")){
            this.realFormObj.attr("action",type);
        }
        var valueArr = this.getValue();
        for(var index in valueArr){
            var value = valueArr[index];
            if(value && isArray(value)=="array"){
                var newValue = value[0];
                for(var i = 1;i<value.length;i++){
                    newValue = newValue + "," + value[i];
                }
                value = newValue;
            }
            thisObject.realFormObj.find('[name="'+index+'"]').each(function(){
                $(this).val(value);
            });
        }
        if(param && param.action){
            this.realFormObj.attr("action",param.action);
        }
        this.realFormObj.submit();
    }

    Form.prototype.getValue = function(){
        var result = {};
        var requiredFailArr = [];
        this.$element.find("div[name]").each(function(){
            var thisObj = this;
            if($(this).attr("class") == "eb_inputGroup"){
                var checkResult = $(this).input('check');
                if(checkResult.result == true){
                    if(!result[$(thisObj).attr("name")] && result[$(thisObj).attr("name")]!=""){
                        result[$(thisObj).attr("name")] = $(thisObj).input("getValue");
                    }else if(isArray(result[$(thisObj).attr("name")])!='array'){
                        var value1 = result[$(thisObj).attr("name")];
                        result[$(thisObj).attr("name")] = [];
                        result[$(thisObj).attr("name")].push(value1);
                        result[$(thisObj).attr("name")].push($(thisObj).input("getValue"));
                    }else if(isArray(result[$(thisObj).attr("name")])=='array'){
                        result[$(thisObj).attr("name")].push($(thisObj).input("getValue"));
                    }
                }else{
                    if(checkResult.required == 'fail'){
                        requiredFailArr.push($(thisObj).find('.eb_title').html());
                    }
                }
            }else if($(this).attr("class") == "eb_timeInputGroup"){
                var checkResult = $(this).timeInput('check');
                if(checkResult.result == true){
                    if(!result[$(thisObj).attr("name")] && result[$(thisObj).attr("name")]!=""){
                        result[$(thisObj).attr("name")] = $(thisObj).timeInput("getValue");
                    }else if(isArray(result[$(thisObj).attr("name")])!='array'){
                        var value1 = result[$(thisObj).attr("name")];
                        result[$(thisObj).attr("name")] = [];
                        result[$(thisObj).attr("name")].push(value1);
                        result[$(thisObj).attr("name")].push($(thisObj).timeInput("getValue"));
                    }else if(isArray(result[$(thisObj).attr("name")])=='array'){
                        result[$(thisObj).attr("name")].push($(thisObj).timeInput("getValue"));
                    }
                }else{
                    if(checkResult.required == 'fail'){
                        requiredFailArr.push($(thisObj).find('.eb_title').html());
                    }
                }
            }else if($(this).attr("class") == "eb_selectBoxGroup"){
                //result[$(thisObj).attr("name")] = $(thisObj).selectBox("getValue");
                var checkResult = $(this).selectBox('check');
                if(checkResult.result == true){
                    if(!result[$(thisObj).attr("name")] && result[$(thisObj).attr("name")]!=""){
                        result[$(thisObj).attr("name")] = $(thisObj).selectBox("getValue");
                    }else if(isArray(result[$(thisObj).attr("name")])!='array'){
                        var value1 = result[$(thisObj).attr("name")];
                        result[$(thisObj).attr("name")] = [];
                        result[$(thisObj).attr("name")].push(value1);
                        result[$(thisObj).attr("name")].push($(thisObj).selectBox("getValue"));
                    }else if(isArray(result[$(thisObj).attr("name")])=='array'){
                        result[$(thisObj).attr("name")].push($(thisObj).selectBox("getValue"));
                    }
                }else{
                    if(checkResult.required == 'fail'){
                        requiredFailArr.push($(thisObj).find('.eb_title').html());
                    }
                }
            }else if($(this).attr("class") == "eb_textareaGroup"){
                //result[$(thisObj).attr("name")] = $(thisObj).textarea("getValue");
                var checkResult = $(this).textarea('check');
                if(checkResult.result == true){
                    if(!result[$(thisObj).attr("name")] && result[$(thisObj).attr("name")]!=""){
                        result[$(thisObj).attr("name")] = $(thisObj).textarea("getValue");
                    }else if(isArray(result[$(thisObj).attr("name")])!='array'){
                        var value1 = result[$(thisObj).attr("name")];
                        result[$(thisObj).attr("name")] = [];
                        result[$(thisObj).attr("name")].push(value1);
                        result[$(thisObj).attr("name")].push($(thisObj).textarea("getValue"));
                    }else if(isArray(result[$(thisObj).attr("name")])=='array'){
                        result[$(thisObj).attr("name")].push($(thisObj).textarea("getValue"));
                    }
                }else{
                    if(checkResult.required == 'fail'){
                        requiredFailArr.push($(thisObj).find('.eb_title').html());
                    }
                }
            }
        });
        this.$element.find("input[type='text'],select,textarea,input[type='hidden'],input[type='password']").not(".eb_input,.eb_selectBox,.eb_timeInput,.eb_textarea,.eb_selectBox_hide").each(function(){
            var thisObj = this;
            if(!result[$(thisObj).attr("name")] && result[$(thisObj).attr("name")]!=""){
                result[$(thisObj).attr("name")] = $(thisObj).val();
            }else if(isArray(result[$(thisObj).attr("name")])!='array'){
                var value1 = result[$(thisObj).attr("name")];
                result[$(thisObj).attr("name")] = [];
                result[$(thisObj).attr("name")].push(value1);
                result[$(thisObj).attr("name")].push($(thisObj).val());
            }else if(isArray(result[$(thisObj).attr("name")])=='array'){
                result[$(thisObj).attr("name")].push($(thisObj).val());
            }
        });
        if(requiredFailArr.length > 0){
            var msg = '"';
            for(var i=0;i<requiredFailArr.length;i++){
                if(i<requiredFailArr.length-1){
                    msg = msg + requiredFailArr[i] + ",";
                }else{
                    msg = msg + requiredFailArr[i] + '"为必填项，请完成填写！';
                }
            }
            alert(msg);
            return false;
        }else{
            return result;
        }
    };

    Form.prototype.setValue = function(param){
        var thisObject = this;
        for(var i in param){
            thisObject.$element.find("div[name='"+i+"']").each(function(){
                var thisObj = this;
                if($(this).attr("class") == "eb_inputGroup"){
                    $(thisObj).input("setValue",param[i]);
                }else if($(this).attr("class") == "eb_selectBoxGroup"){
                    if(param[i]==""){
                        $(thisObj).selectBox("clearValue");
                    }else{
                        $(thisObj).selectBox("setValue",param[i]);
                    }
                }else if($(this).attr("class") == "eb_textareaGroup"){
                    $(thisObj).textarea("setValue",param[i]);
                }else if($(this).attr("class") == "eb_timeInputGroup"){
                    $(thisObj).timeInput("setValue",param[i]);
                }
            });
            thisObject.$element.find("input[name='"+i+"'],select[name='"+i+"'],textarea[name='"+i+"']").each(function(){
                $(this).val(param[i]);
            });
        }
    };

    Form.prototype.clearValue = function(){
        var thisObject = this;
        var param = {};
        this.$element.find('[name]').each(function(){
            var thisObj = this;
            param[$(thisObj).attr("name")] = "";
        });
        this.setValue(param);
    };

    $.fn.form = function (option,param) {
        var result = null;
        var thisObj = this.each(function () {
            var $this = $(this)
                , thisObject = $this.data('form')
                , dataOptions = typeof option == 'object' && option;
            if(typeof option == 'string' ){
                result = thisObject[option](param);
            }else{
                $this.data('form', (thisObject = new Form(this, dataOptions)));
            }
        });
        if(typeof option == 'string' )return result;
        return thisObj;
    };

    $.fn.form.defaults = {
        method:'post',
        action:'',
        ajax:false
    };

    $(window).on('load', function(){
        $(".eb_form").each(function () {
            var thisObj = $(this)
                , dataOptionsStr = thisObj.data('options');
            if(!dataOptionsStr)
                thisObj.form($.fn.form.defaults);
            else
                thisObj.form((new Function("return {" + dataOptionsStr + "}"))());
        });
    });
}(window.jQuery);

/*=====================================================================================
 * easy-bootstrap-floatContainer01 v2.0
 * 
 * @author:niyq
 * @date:2013/08/22
 * @dependce:jquery
 *=====================================================================================*/
!function($){

    "use strict";

    var FloatContainer01 = function(element,dataOptions){
        var thisObject = this;
        this.$element = $(element);
        this.dataOptions = $.extend({}, $.fn.floatContainer01.defaults, dataOptions);
        this.title = this.$element.attr("title");
        this.id = this.$element.attr("id");
        this.init();
    };

    FloatContainer01.prototype.init = function(){
        var thisObject = this;
        thisObject.$element.append('<div style="clear:both"></div>');
    };

    $.fn.floatContainer01 = function (option,param) {
        var result = null;
        var thisObj = this.each(function () {
            var $this = $(this)
                , thisObject = $this.data('floatContainer01')
                , dataOptions = typeof option == 'object' && option;
            if(typeof option == 'string' ){
                result = thisObject[option](param);
            }else{
                $this.data('floatContainer01', (thisObject = new FloatContainer01(this, dataOptions)));
            }
        });
        if(typeof option == 'string' )return result;
        return thisObj;
    };

    $.fn.floatContainer01.defaults = {

    };

    $(window).on('load', function(){
        $(".eb_floatContainer01").each(function () {
            var thisObj = $(this)
                , dataOptionsStr = thisObj.data('options');
            if(!dataOptionsStr)
                thisObj.floatContainer01($.fn.floatContainer01.defaults);
            else
                thisObj.floatContainer01((new Function("return {" + dataOptionsStr + "}"))());
        });
    });
}(window.jQuery);

/*=====================================================================================
 * easy-bootstrap-floatContainer02 v2.0
 * 
 * @author:niyq
 * @date:2013/08/22
 * @dependce:jquery
 *=====================================================================================*/
!function($){

    "use strict";

    var FloatContainer02 = function(element,dataOptions){
        var thisObject = this;
        this.$element = $(element);
        this.dataOptions = $.extend({}, $.fn.floatContainer02.defaults, dataOptions);
        this.title = this.$element.attr("title");
        this.id = this.$element.attr("id");
        this.init();
    };

    FloatContainer02.prototype.init = function(){
        var thisObject = this;
        thisObject.$element.append('<div style="clear:both"></div>');
    };

    $.fn.floatContainer02 = function (option,param) {
        var result = null;
        var thisObj = this.each(function () {
            var $this = $(this)
                , thisObject = $this.data('floatContainer02')
                , dataOptions = typeof option == 'object' && option;
            if(typeof option == 'string' ){
                result = thisObject[option](param);
            }else{
                $this.data('floatContainer02', (thisObject = new FloatContainer02(this, dataOptions)));
            }
        });
        if(typeof option == 'string' )return result;
        return thisObj;
    };

    $.fn.floatContainer02.defaults = {

    };

    $(window).on('load', function(){
        $(".eb_floatContainer02").each(function () {
            var thisObj = $(this)
                , dataOptionsStr = thisObj.data('options');
            if(!dataOptionsStr)
                thisObj.floatContainer02($.fn.floatContainer02.defaults);
            else
                thisObj.floatContainer02((new Function("return {" + dataOptionsStr + "}"))());
        });
    });
}(window.jQuery);


/*=====================================================================================
 * easy-bootstrap-popoutWindow v2.0
 * 
 * @author:niyq
 * @date:2013/08/22
 * @dependce:jquery
 *=====================================================================================*/
!function($){

    "use strict";

    var PopoutWindow = function(element,dataOptions){
        var thisObject = this;
        this.$element = $(element);
        this.dataOptions = $.extend({}, $.fn.popoutWindow.defaults, dataOptions);
        this.title = this.dataOptions.title || this.$element.attr("title") || "";
        this.id = this.$element.attr("id");
        this.funcArr = {};
        this.init();     //初始化popoutWindowGroup组件
    };

    PopoutWindow.prototype.init = function(){
        var thisObject = this;
        this.$element.wrap('<div class="eb_popoutWindowGroup" id="'+thisObject.id+'_subgroup"></div>');
        this.parent = this.$element.parent();      //parent
        this.parent.data("popoutWindow",thisObject);
        if(thisObject.$element.data("form"))
            this.parent.data("form",thisObject.$element.data("form"));
        this.popoutWindowObj = this.$element;     //popoutWindowObj
        this.parent.prepend('<div class="eb_title">'+thisObject.title+'<span class="eb_closeWindowButton">x</span></div>');
        this.titleObj = this.parent.children('.eb_title');    //titleObj
        if(this.dataOptions.closeHandler){
            var func = this.dataOptions.closeHandler;
            if(typeof func == "string")
                func = window[func];
            thisObject.titleObj.find('.eb_closeWindowButton').click(function(){
                func();
            });
        }
        this.parent.append('<div class="eb_buttonsBar"></div>');
        this.buttonsBar = this.parent.children('.eb_buttonsBar');       //buttonsBar
        this.buttonsArr = this.dataOptions.buttons;
        if(typeof this.buttonsArr == "string"){
            this.buttonsArr = window[thisObject.buttonsArr];
        }                                                   //buttonsArr
        if(thisObject.buttonsArr){
            for(var i=0;i<thisObject.buttonsArr.length;i++){
                var button = thisObject.buttonsArr[i];
                var func = button.handler;
                typeof func == "string" && (func = window[func]);
                thisObject.funcArr[i] = func;
                var $button = $('<span class="eb_buttons" funcIndex="'+i+'"></span>');
                button.icon && $button.append('<i class="eb_icon '+button.icon+'"></i>');
                $button.append(button.text);
                $button.on("click",function(){
                    var thisObj = this;
                    thisObject.funcArr[$(thisObj).attr("funcIndex")]();
                });
                this.buttonsBar.prepend($button);
            }
        }
        this.buttonsObj = this.buttonsBar.children('.eb_buttons');     //buttonsObj
        if(this.dataOptions.fullScreen){
            this.setFullScreen();
        }else{
            this.setWidth();
            this.setHeight();
        }
        this.setPosition();
        this.setStyle();
    };

    PopoutWindow.prototype.show = function(url){
        var thisObject = this;
        if(this.parent.css("display") == 'none'){
            if(this.popoutWindowObj.children("iframe.eb_iframe").length<=0 && (url || this.dataOptions.url || this.popoutWindowObj.attr("url") || this.popoutWindowObj.children("div.eb_iframe").length>0)){
                this.src = "";
                if(this.popoutWindowObj.children("div.eb_iframe").length>0)
                    this.src = this.popoutWindowObj.children("div.eb_iframe").attr("src");
                if(this.popoutWindowObj.attr("url"))
                    this.src = this.popoutWindowObj.attr("url");
                if(this.dataOptions.url)
                    this.src = this.dataOptions.url;
                if(url)
                    this.src = url;
                var html = '<iframe id="eb_iframe_'+this.id+'" class="eb_iframe" src="'+this.src+'" style="margin:auto" ></iframe>';
                this.popoutWindowObj.html(html);
                this.iframeObj = this.popoutWindowObj.children("iframe.eb_iframe");      //iframeObj
                this.iframeObj.width(thisObject.popoutWindowObj.width()-5).height(thisObject.popoutWindowObj.height()-5);
            }else if(this.popoutWindowObj.children("iframe.eb_iframe").length>0){
                if(url)
                    this.src = url;
                var html = '<iframe id="eb_iframe_'+this.id+'" class="eb_iframe" src="'+this.src+'" style="margin:auto" ></iframe>';
                this.popoutWindowObj.html(html);
                this.iframeObj = this.popoutWindowObj.children("iframe.eb_iframe");      //iframeObj
                this.iframeObj.width(thisObject.popoutWindowObj.width()-5).height(thisObject.popoutWindowObj.height()-5);
            }
            this.parent.parent().prepend('<div id="maskX" style="display: none"></div>');
            $("#maskX").css({"opacity":"0.3", "display":"block", "position":"absolute", "background-color":"#fff", "z-index":11})
                .width(document.body.clientWidth)
                .height(document.body.clientHeight);
            this.setPosition();
            this.parent.show();
        }
    };

    PopoutWindow.prototype.hide = function(){
        this.parent.hide();
        $("#maskX").remove();
    };

    PopoutWindow.prototype.setPosition = function(param){
        if(this.dataOptions.fullScreen != true){
            var top = $.fn.popoutWindow.defaults.top;
            var left = $.fn.popoutWindow.defaults.left;
            if(this.dataOptions.top)
                top = this.dataOptions.top;
            if(typeof top == "string")
                top = top.split("px")[0];
            top = top + $(window).scrollTop();
            if(this.dataOptions.left)
                left = this.dataOptions.left;
            if(typeof left == "string")
                left = left.split("px")[0];
            if(param){
                if(param.top){
                    if(typeof param.top == "string")
                        top = param.top.split("px")[0];
                    else
                        top = param.top;
                }
                if(param.left){
                    if(typeof param.left == "string")
                        left = param.left.split("px")[0];
                    else
                        left = param.left;
                }
            }
            this.parent.css("top",top+"px").css("left",left+"px");
        }
    };

    PopoutWindow.prototype.setFullScreen = function(){
        var width = $(window).width();
        if(typeof width == "string")
            width = width.split("px")[0];
        var height = $(window).height();
        if(typeof height == "string")
            height = height.split("px")[0];
        this.parent.css("top",0).css("left",0);
        this.setWidth(width);
        this.setHeight(height);
        this.parent.css("border-radius","0");
    };

    PopoutWindow.prototype.setWidth = function(widthParam){
        if(this.dataOptions.width){
            var width = this.dataOptions.width;
            if(widthParam)
                width = widthParam;
            if(typeof width == "string")
                width = width.split("px")[0];
            this.parent.width(width);
            this.titleObj.width(width);
            this.popoutWindowObj.width(width);
            this.buttonsBar.width(width);
        }
    };

    PopoutWindow.prototype.setHeight = function(heightParam){
        if(this.dataOptions.height){
            var height = this.dataOptions.height;
            if(heightParam)
                height = heightParam;
            if(typeof height == "string")
                height = height.split("px")[0];
            this.parent.height(height);
            this.popoutWindowObj.height(height-61);
            this.buttonsBar.css("top",height-30+"px");
        }
    };

    PopoutWindow.prototype.setStyle = function(){
        var thisObject = this;
        this.buttonsObj.each(function(){
            $(this).mouseover(function(){
                $(this).addClass("mouseover");
            }).mouseout(function(){
                $(this).removeClass("mouseover");
            }).mousedown(function(){
                $(this).addClass("mousedown");
            }).mouseup(function(){
                $(this).removeClass("mousedown");
            });
        });
        this.titleObj.find(".eb_closeWindowButton").mouseover(function(){
            $(this).addClass("mouseover");
        }).mouseout(function(){
            $(this).removeClass("mouseover");
        }).click(function(){
            thisObject.parent.hide();
            $("#maskX").remove();
        });
    };

    $.fn.popoutWindow = function (option,param) {
        var result = null;
        var thisObj = this.each(function () {
            var $this = $(this)
                , thisObject = $this.data('popoutWindow')
                , dataOptions = typeof option == 'object' && option;
            if(typeof option == 'string' ){
                result = thisObject[option](param);
            }else{
                if(thisObject){

                }else{
                    $this.data('popoutWindow', (thisObject = new PopoutWindow(this, dataOptions)));
                }
            }
        });
        if(typeof option == 'string' )return result;
        return thisObj;
    };

    $.fn.popoutWindow.defaults = {
        required:false,
        dblclickTimeSpan:250,
        top:30,
        left:60
    };

    $(window).on('load', function(){
        $(".eb_popoutWindow").each(function () {
            var thisObj = $(this)
                , dataOptionsStr = thisObj.data('options');
            if(!dataOptionsStr)
                thisObj.popoutWindow($.fn.popoutWindow.defaults);
            else
                thisObj.popoutWindow((new Function("return {" + dataOptionsStr + "}"))());
        });
    });
}(window.jQuery);

/*=====================================================================================
 * easy-bootstrap-tabPage v2.0
 * 
 * @author:niyq
 * @date:2013/09/04
 * @dependce:jquery
 *=====================================================================================*/
!function($){

    "use strict";

    var TabPage = function(element,dataOptions){
        var thisObject = this;
        this.$element = $(element);
        this.dataOptions = $.extend({}, $.fn.tabPage.defaults, dataOptions);
        this.title = this.$element.attr("title");
        this.id = this.$element.attr("id");
        this.init();
    };

    TabPage.prototype.setHeadBarView = function(myObj){
        var thisObject = this;
        var obj = this.headBarObj.children('.eb_tabPageHead.on');
        if(myObj)
            obj = myObj;
        var objLeft = obj.offset().left;
        var objRight = obj.offset().left + obj.width() + 61;
        var headBarPanelLeft = this.headBarPanelObj.offset().left;
        var headBarPanelRight = this.headBarPanelObj.offset().left + this.headBarPanelObj.width();
        if(objLeft < headBarPanelLeft){
            this.headMoveLeft(obj);
        }else if(objRight > headBarPanelRight){
            this.headMoveRight(obj);
        }
    };

    TabPage.prototype.headMoveLeft = function(givenObj){
        var thisObject = this;
        var headBarPanelLeft = this.headBarPanelObj.offset().left;
        var headBarLILeft = null;
        var headBarLeftOffset = this.headBarObj.offset().left;
        var headBarLeft = this.headBarObj.css("left");
        if(typeof headBarLeft == "string")
            headBarLeft = headBarLeft.split("px")[0];
        var distance;
        if(givenObj){
            headBarLILeft = givenObj.offset().left;
        }else{
            this.headBarObj.children('.eb_tabPageHead').each(function(){
                var left = $(this).offset().left;
                if((left-headBarPanelLeft)<-25){
                    headBarLILeft = left;
                }
            });
            if(headBarLILeft == null)
                headBarLILeft = this.headBarObj.children('.eb_tabPageHead').first().offset().left;
        }
        var distance = headBarPanelLeft - headBarLILeft;
        var newLeft =  parseInt(headBarLeft) + parseInt(distance);
        this.headBarObj.animate({left:newLeft},200,'',function(){
            if(thisObject.headBarObj.offset().left >= thisObject.headBarPanelObj.offset().left){
                thisObject.leftBtnObj.children('.eb_arrow02L').hide();
            }else{
                thisObject.leftBtnObj.children('.eb_arrow02L').show();
            }
            if(thisObject.headBarObj.offset().left + thisObject.headBarObj.width() <= thisObject.headBarPanelObj.offset().left + thisObject.headBarPanelObj.width()){
                thisObject.rightBtnObj.children('.eb_arrow02R').hide();
            }else{
                thisObject.rightBtnObj.children('.eb_arrow02R').show();
            }
        });
    };

    TabPage.prototype.headMoveRight = function(givenObj){
        var thisObject = this;
        var headBarPanelRight = this.headBarPanelObj.offset().left + this.headBarPanelObj.width();
        var headBarLIleft = headBarPanelRight;
        var headBarLIRight;
        var headBarLeft = parseInt(this.headBarObj.css("left"));
        var obj;
        this.headBarObj.children('.eb_tabPageHead').each(function(){
            var left = $(this).offset().left;
            if(left <= headBarPanelRight+25){
                headBarLIleft = left;
                obj = $(this);
            }
        });
        if(obj.length<=0)
            obj = this.headBarObj.children('.eb_tabPageHead').last();
        if(givenObj){
            obj = givenObj;
            headBarLIleft = givenObj.offset().left;
        }
        headBarLIRight = headBarLIleft + (obj.width()+61);
        var distance = headBarLIRight - headBarPanelRight;
        var newLeft = headBarLeft - distance;
        this.headBarObj.animate({left:newLeft},200,'',function(){
            if(thisObject.headBarObj.offset().left >= thisObject.headBarPanelObj.offset().left){
                thisObject.leftBtnObj.children('.eb_arrow02L').hide();
            }else{
                thisObject.leftBtnObj.children('.eb_arrow02L').show();
            }
            if(thisObject.headBarObj.offset().left + thisObject.countWidth() <= thisObject.headBarPanelObj.offset().left + thisObject.headBarPanelObj.width()){
                thisObject.rightBtnObj.children('.eb_arrow02R').hide();
            }else{
                thisObject.rightBtnObj.children('.eb_arrow02R').show();
            }
        });
    }

    TabPage.prototype.toggleHeadBtn = function(){
        var thisObject = this;
        var parentWidth = this.parent.width();
        var pageHeadTotalWidth = this.countWidth();
        //alert("parentWidth="+parentWidth+",pageHeadTotalWidth="+pageHeadTotalWidth+",typeof parentWidth="+(typeof pageHeadTotalWidth));
        if(pageHeadTotalWidth > (parentWidth-14)){
            this.headBarPanelObj.width(parentWidth-16).css("left","8px");
            this.leftBtnObj.show();
            this.rightBtnObj.show();
        }else{
            this.headBarPanelObj.width(parentWidth-2).css("left","0");
            this.leftBtnObj.hide();
            this.rightBtnObj.hide();
            this.headBarObj.css("left","0");
        }
    }

    TabPage.prototype.countWidth = function(){
        var thisObject = this;
        var parentWidth = this.parent.width();
        var pageHeadTotalWidth = 0;
        this.headBarObj.children('.eb_tabPageHead').each(function(){
            pageHeadTotalWidth = pageHeadTotalWidth + $(this).width() + 61;
        });
        return pageHeadTotalWidth;
    }

    TabPage.prototype.setWidth = function(widthNum){
        var thisObject = this;
        var width;
        if(this.dataOptions.width)
            width = this.dataOptions.width;
        if(widthNum)
            width = widthNum;
        if(typeof width == "string")
            width = width.split("px")[0];
        this.parent.width(width);
        //this.headBarObj.width(width-2);
        this.headBarPanelObj.width(width-2);
        this.headBarBGObj.width(width-2);
        this.parent.children('.eb_tabPageBody').each(function(){
            $(this).width(width-2);
        });
        this.parent.children('.eb_tabPageBody').children('.eb_iframe').each(function(){
            $(this).width(width-2);
        });
        this.toggleHeadBtn();
    };

    TabPage.prototype.setHeight = function(heightNum){
        var thisObject = this;
        var height;
        if(this.dataOptions.height)
            height = this.dataOptions.height;
        if(heightNum)
            height = heightNum;
        if(typeof height == "string")
            height = height.split("px")[0];
        this.parent.height(height);
        this.parent.children('.eb_tabPageBody').each(function(){
            $(this).height(height-37);
        });
        this.parent.children('.eb_tabPageBody').children('.eb_iframe').each(function(){
            $(this).height(height-37);
        });
    };

    TabPage.prototype.remove = function(name){
        var thisObject = this;
        var cls = this.headBarObj.children('.eb_tabPageHead[name="'+name+'"]').attr("class");
        var next = this.parent.children('.eb_tabPageBody[name="'+name+'"]').next();
        this.parent.children('.eb_tabPageBody[name="'+name+'"]').remove();
        this.headBarObj.children('.eb_tabPageHead[name="'+name+'"]').remove();
        if(cls.indexOf(' on')>=0){
            var name = '';
            if(next.length>0){
                name = next.attr("name");
            }else{
                var objArr = thisObject.headBarObj.get(0).getElementsByTagName('span');
                var obj = objArr[objArr.length-1];
                name = $(obj).attr('name');
            }
            this.select(name);
        }
        var lastObj = this.headBarObj.children('.eb_tabPageHead').last();
        if(lastObj.length>0 && (lastObj.offset().left + lastObj.width() < this.headBarPanelObj.offset().left + this.headBarPanelObj.width() && this.countWidth() > this.headBarPanelObj.width()-14)){
            this.headMoveRight(lastObj);
        }
        this.toggleHeadBtn();
    };

    TabPage.prototype.removeByNum = function(num){
        var thisObject = this;
        var objArr = thisObject.headBarObj.get(0).getElementsByTagName('span');
        if(num < 0 || num > objArr.length-1){
            alert('$(selecter).tabPage("remove",num) 方法输入的数字超出范围！');
            return false;
        }
        var obj = objArr[num];
        var name = $(obj).attr('name');
        this.remove(name);
    };

    TabPage.prototype.select = function(name){
        var thisObject = this;
        if(this.headBarObj.children('.eb_tabPageHead[name="'+name+'"]').length>0 && this.headBarObj.children('.eb_tabPageHead[name="'+name+'"]').attr("class").indexOf(" on")<0){
            var thisObj = this.headBarObj.children('.eb_tabPageHead[name="'+name+'"]');
            thisObject.headBarObj.find('.on').removeClass('on');
            $(thisObj).addClass("on");
            thisObject.parent.find(".eb_tabPageBody").hide();
            var bodyObj = thisObject.getBody($(thisObj));
            if(bodyObj.children('div.eb_iframe').length>0){
                var src = '';
                var html = '';
                src = bodyObj.children('.eb_iframe').attr('src');
                html = html + '<iframe src="'+src+'" class="eb_iframe"></iframe>';
                bodyObj.html(html);
            }
            bodyObj.show();
            this.setHeadBarView();
        }
    };

    TabPage.prototype.selectByNum = function(num){
        var thisObject = this;
        var objArr = thisObject.headBarObj.get(0).getElementsByTagName('span');
        if(num < 0 || num > objArr.length-1){
            alert('$(selecter).tabPage("remove",num) 方法输入的数字超出范围！');
            return false;
        }
        var obj = objArr[num];
        var name = $(obj).attr('name');
        this.select(name);
    };

    TabPage.prototype.add = function(param){
        var thisObject = this;
        var arr = [];
        if(isArray(param) == 'array')
            arr = param;
        else if(isArray(param) == "object")
            arr[0] = param;
        else
            alert("$(selecter).tabPage('add',param) 方法传入参数错误！");
        for(var i = 0;i<arr.length;i++){
            var obj = arr[i];
            if(this.headBarObj.children('.eb_tabPageHead[name="'+obj.name+'"]').length>0){
                thisObject.select(obj.name);
            }else{
                this.parent.append($('<div class="eb_tabPageBody" style="display:none" name="'+obj.name+'"><iframe src="'+obj.src+'" class="eb_iframe"></iframe></div>'));
                this.headBarObj.append($('<span class="eb_tabPageHead" name="'+obj.name+'">'+obj.title+'</span>').click(function(){
                    var thisObj = this;
                    if($(this).attr("class").indexOf(" on")<0){
                        thisObject.headBarObj.find('.on').removeClass('on');
                        $(this).addClass("on");
                        thisObject.parent.find(".eb_tabPageBody").hide();
                        thisObject.getBody($(thisObj)).show();
                    }
                    thisObject.setHeadBarView();
                }).append($('<div class="eb_tabPageCloseBtn">x</div>').click(function(){
                    var name = $(this).parent().attr("name");
                    thisObject.remove(name);
                }).mouseover(function(){
                    $(this).addClass("mouseover");
                }).mouseout(function(){
                    $(this).removeClass("mouseover");
                })).mouseover(function(){
                    $(this).children('.eb_tabPageCloseBtn').show();
                }).mouseout(function(){
                    $(this).children('.eb_tabPageCloseBtn').hide();
                }));
                if(this.countWidth()>this.headBarPanelObj.width()-14){
                    givenObj = this.headBarObj.children('.eb_tabPageHead').last();
                    this.headMoveRight(givenObj);
                }
            }
        }
        var showPageName = arr[arr.length-1].name;
        this.select(showPageName);
        this.setWidth(thisObject.parent.width());
        this.setHeight(thisObject.parent.height());
        this.toggleHeadBtn();
        var givenObj = null;

    };

    TabPage.prototype.init = function(){
        var thisObject = this;
        this.parent = this.$element;          //parent
        this.parent.children('div').each(function(){
            $(this).addClass('eb_tabPageBody');
        });
        this.parent.prepend($('<div class="eb_headBar"></div>'));
        this.headBarObj = this.parent.children('.eb_headBar');                //headBarObj
        this.headBarObj.wrap($('<div class="eb_headBarPanel"></div>'));
        this.headBarPanelObj = this.headBarObj.parent();                      //headBarPanelObj
        this.headBarPanelObj.wrap($('<div class="eb_headBarBG"></div>'));
        this.headBarBGObj = this.headBarPanelObj.parent();                    //headBarBGObj
        this.headBarBGObj.prepend($('<div class="eb_headBarLeftBtn"><div class="eb_arrow02L"></div></div>').mouseover(function(){
            $(this).addClass('mouseover');
        }).mouseout(function(){
            $(this).removeClass('mouseover');
        }).mousedown(function(){
            $(this).addClass('mousedown');
        }).mouseup(function(){
            $(this).removeClass('mousedown');
        }).click(function(){
            thisObject.headMoveLeft();
        })).append($('<div class="eb_headBarRightBtn"><div class="eb_arrow02R"></div></div>').mouseover(function(){
            $(this).addClass('mouseover');
        }).mouseout(function(){
            $(this).removeClass('mouseover');
        }).mousedown(function(){
            $(this).addClass('mousedown');
        }).mouseup(function(){
            $(this).removeClass('mousedown');
        }).click(function(){
            thisObject.headMoveRight();
        }));
        this.leftBtnObj = this.headBarBGObj.children('.eb_headBarLeftBtn');   //leftBtnObj
        this.rightBtnObj = this.headBarBGObj.children('.eb_headBarRightBtn');  //rightBtnObj
        this.bodyObjArr = {};                                                //bodyObjArr
        this.parent.children('.eb_tabPageBody').each(function(){
            var thisObj = this;
            thisObject.bodyObjArr[$(thisObj).attr('name')] = $(this);
        });
        for(var i in this.bodyObjArr){
            var title = '';
            var dataOptions = null;
            if(this.bodyObjArr[i].attr('title'))
                title = this.bodyObjArr[i].attr('title');
            if(this.bodyObjArr[i].data('options') && (dataOptions = (new Function('return {'+this.bodyObjArr[i].data('options')+'}'))()) && dataOptions.title)
                title = dataOptions.title;
            this.headBarObj.append($('<span class="eb_tabPageHead" name="'+i+'">'+title+'</span>').click(function(){
                var thisObj = this;
                if($(this).attr("class").indexOf(" on")<0){
                    var name = $(this).attr("name");
                    thisObject.select(name);
                }
                thisObject.setHeadBarView();
            }).append($('<div class="eb_tabPageCloseBtn">x</div>').click(function(){
                var name = $(this).parent().attr("name");
                thisObject.remove(name);
            }).mouseover(function(){
                $(this).addClass("mouseover");
            }).mouseout(function(){
                $(this).removeClass("mouseover");
            })).mouseover(function(){
                $(this).children('.eb_tabPageCloseBtn').show();
            }).mouseout(function(){
                $(this).children('.eb_tabPageCloseBtn').hide();
            }));
        }
        this.headObjArr = {};                                                 //headObjArr
        this.headBarObj.children(".eb_tabPageHead").each(function(){
            var thisObj = this;
            thisObject.headObjArr[$(thisObj).attr('name')] = $(this);
        });
        this.headBarObj.children(".eb_tabPageHead").first().addClass("on");    //将第一项设置为显示状态
        this.getBody(thisObject.headBarObj.children(".eb_tabPageHead").first()).show();           //将第一项设置为显示状态
        /*this.parent.children('.eb_tabPageBody').each(function(){
         var thisObj = this;
         if($(this).children('.eb_iframe').length>0){
         var src = '';
         var html = '';
         src = $(this).children('.eb_iframe').attr('src');
         html = html + '<iframe src="'+src+'" class="eb_iframe"></iframe>';
         $(this).html(html);
         }	
         });*/
        this.setWidth();
        this.setHeight();
        this.toggleHeadBtn();
    };

    TabPage.prototype.getBody = function(headObj){
        var name = headObj.attr("name");
        var bodyObj = this.parent.children(".eb_tabPageBody[name='"+name+"']");
        return bodyObj;
    };

    TabPage.prototype.getBodyByNum = function(num){
        var thisObject = this;
        var length = thisObject.headBarObj.get(0).getElementsByTagName('span').length;
        if(num >= length)
            num = length-1;
        else if(num<0)
            num = 0;
        var name = $(thisObject.headBarObj.get(0).getElementsByTagName('span')[num]).attr("name");
        var bodyObj = this.parent.children(".eb_tabPageBody[name='"+name+"']");
        return bodyObj;
    };

    TabPage.prototype.setAction = function(){

    };

    $.fn.tabPage = function (option,param) {
        var result = null;
        var thisObj = this.each(function () {
            var $this = $(this)
                , thisObject = $this.data('tabPage')
                , dataOptions = typeof option == 'object' && option;
            if(typeof option == 'string' ){
                result = thisObject[option](param);
            }else{
                $this.data('tabPage', (thisObject = new TabPage(this, dataOptions)));
            }
        });
        if(typeof option == 'string' )return result;
        return thisObj;
    };

    $.fn.tabPage.defaults = {

    };

    $(window).on('load', function(){
        $(".eb_tabPage").each(function () {
            var thisObj = $(this)
                , dataOptionsStr = thisObj.data('options');
            if(!dataOptionsStr)
                thisObj.tabPage($.fn.tabPage.defaults);
            else
                thisObj.tabPage((new Function("return {" + dataOptionsStr + "}"))());
        });
    });
}(window.jQuery);
/*=====================================================================================
 * easy-bootstrap-msgWindow v2.0
 * 
 * @author:niyq
 * @date:2013/09/05
 * @dependce:jquery
 *=====================================================================================*/
!function($){

    "use strict";

    var MsgWindow = function(element,dataOptions){
        var thisObject = this;
        this.$element = $(element);
        this.dataOptions = $.extend({}, $.fn.msgWindow.defaults, dataOptions);
        this.title = "系统消息";
        if(this.$element.attr("title"))
            this.title = this.$element.attr("title");
        if(this.dataOptions.title)
            this.title = this.dataOptions.title;
        this.id = this.$element.attr("id");
        if(!this.$element.attr("class") || this.$element.attr("class").indexOf("inited")<0){
            this.init();
        }
    };

    MsgWindow.prototype.refreshInit = function(param){
        var thisObject = this;
        this.dataOptions = $.extend(thisObject.dataOptions,param);
        if(param && param.html){
            this.html(param.html);
        }
        if(param && param.width){
            this.setWidth(param.width);
        }
        if(param && param.height){
            this.setHeight(param.height);
        }
    }

    MsgWindow.prototype.init = function(){
        var thisObject = this;
        this.windowObj = this.$element;                                 //windowObj
        if(!this.windowObj.attr("class") || this.windowObj.attr("class").indexOf("eb_msgWindow")<0){
            this.windowObj.addClass("eb_msgWindow");
        }
        this.windowObj.addClass('inited');
        this.windowObj.wrap($('<div class="eb_msgWindowGroup"></div>'));
        this.parent = this.windowObj.parent();                            //parent
        this.parent.prepend($('<span class="eb_title">'+thisObject.title+'</span><span class="eb_closeMsgWindowBtn">x</span>'));
        this.titleObj = this.parent.children(".eb_title");              //titleObj
        this.closeBtnObj = this.parent.children(".eb_closeMsgWindowBtn");     //closeBtnObj
        this.closeBtnObj.mouseover(function(){
            $(this).addClass("mouseover");
        }).mouseout(function(){
            $(this).removeClass("mouseover");
        }).click(function(){
            thisObject.hide();
        });
        if(this.dataOptions && this.dataOptions.html){
            this.windowObj.html(thisObject.dataOptions.html);
        }
        this.setWidth();
        this.setHeight();
    };

    MsgWindow.prototype.html = function(html){
        this.$element.html(html);
    }

    MsgWindow.prototype.show = function(){
        var thisObject = this;
        clearTimeout(thisObject.autoHideTimeoutId);
        this.parent.fadeIn(300);
        if(this.dataOptions.autoHide == true){
            var time = this.dataOptions.autoHideTime;
            this.autoHideTimeoutId = setTimeout(function(){thisObject.parent.fadeOut(300)},time);
        }
    }

    MsgWindow.prototype.hide = function(){
        this.parent.hide();
    }

    MsgWindow.prototype.remove = function(){
        this.parent.remove();
    }

    MsgWindow.prototype.setWidth = function(widthParam){
        var width = this.dataOptions.width;
        if(widthParam)
            width = widthParam;
        if(typeof width == "string")
            width = width.split("px")[0];
        this.parent.width(width);
        this.windowObj.width(width-22);
        this.titleObj.width(width-1);
    }

    MsgWindow.prototype.setHeight = function(heightParam){
        var height = this.dataOptions.height;
        if(heightParam)
            height = heightParam;
        if(typeof height == "string")
            height = height.split("px")[0];
        this.parent.height(height);
        this.windowObj.height(height-46);
    }

    $.msgWindow = function(msg,title,url,param){
        var obj;
        var result;
        if(!title)
            title = "系统消息";
        if(url)
            $('body').prepend(obj = $('<div class="eb_msgWindow" data-options="title:\''+title+'\'"><a href="'+url+'">'+msg+'</a></div>'));
        else
            $('body').prepend(obj = $('<div class="eb_msgWindow" data-options="title:\''+title+'\'">'+msg+'</div>'));
        var str = "title:'"+title+"',";
        var strArr = [];
        for(var i in param){
            strArr.push(i);
        }
        for(var i=0;i<strArr.length;i++){
            if(i<strArr.length-1){
                str = str + strArr[i] + ":" + param[strArr[i]] + ",";
            }else{
                str = str + strArr[i] + ":" + param[strArr[i]];
            }
        }
        obj.data("options",str);
        obj.each(function(){
            var thisObj = $(this)
                , dataOptionsStr = thisObj.data('options');
            if(!dataOptionsStr)
                result = thisObj.msgWindow($.fn.msgWindow.defaults);
            else
                result = thisObj.msgWindow((new Function("return {" + dataOptionsStr + "}"))());
        });
        obj.msgWindow('show');
        return result;
    };

    $.fn.msgWindow = function (option,param) {
        var result = null;
        var thisObj = this.each(function () {
            var $this = $(this)
                , thisObject = $this.data('msgWindow')
                , dataOptions = typeof option == 'object' && option;
            if(typeof option == 'string' ){
                result = thisObject[option](param);
            }else{
                if(!thisObject){
                    $this.data('msgWindow', (thisObject = new MsgWindow(this, dataOptions)));
                }else{
                    thisObject.refreshInit(option);
                }
            }
        });
        if(typeof option == 'string' )return result;
        return thisObj;
    };

    $.fn.msgWindow.defaults = {
        width:220,
        height:150,
        autoHide:false,
        autoHideTime:5000
    };

    $(window).on('load', function(){
        $(".eb_msgWindow").not(".inited").each(function () {
            var thisObj = $(this)
                , dataOptionsStr = thisObj.data('options');
            if(!dataOptionsStr)
                thisObj.msgWindow($.fn.msgWindow.defaults);
            else
                thisObj.msgWindow((new Function("return {" + dataOptionsStr + "}"))());
        });
    });
}(window.jQuery);
/*=====================================================================================
 * easy-bootstrap-timeInput v2.0
 * 
 * @author:niyq
 * @date:2013/09/05
 * @dependce:jquery
 *=====================================================================================*/
!function($){

    "use strict";

    var TimeInput = function(element,dataOptions){
        this.$element = $(element);
        this.$element.keypress(function(){
            return false;
        }).val("");
        this.dataOptions = $.extend({}, $.fn.timeInput.defaults, dataOptions);
        this.name = this.$element.attr("name");
        this.id = this.$element.attr("id");
        this.thisYear = new Date().getFullYear();
        this.thisMonth = new Date().getMonth()+1;
        if(this.thisMonth<10)
            this.thisMonth = "0"+this.thisMonth;
        this.today = new Date().getDate();
        this.year = new Date().getFullYear();
        this.month = new Date().getMonth()+1;
        if(this.month<10)
            this.month = "0"+this.month;
        this.monthArr = new Array();
        this.ifEnable = true;
        this.value = "";
        this.id = this.$element.attr("id");
        this.timeBoxId = "timeBox_"+this.id;
        this.title = "时间";
        if(this.$element.attr("title"))
            this.title = this.$element.attr("title");
        if(this.dataOptions.title)
            this.title = this.dataOptions.title;
        this.init();

    };//Timeinput

    TimeInput.prototype.enabled = function(){
        this.ifEnable = true;
    };

    TimeInput.prototype.disabled = function(){
        this.ifEnable = false;
    };

    TimeInput.prototype.setWidth = function(widthParam){
        var width = this.dataOptions.width;
        if(widthParam)
            width = widthParam;
        if(typeof width == "string")
            width = width.split("px")[0];
        this.parent.width(width);
        this.inputObj.width(width-85);
        if(this.dataOptions.titleWidth || this.dataOptions.titleWidth == 0){
            var titleWidth = this.dataOptions.titleWidth;
            if(typeof titleWidth == "string")
                titleWidth = titleWidth.split("px")[0];
            titleWidth = titleWidth - 1;
            var inputWidth = width - titleWidth - 13;
            this.inputObj.width(inputWidth);
            this.titleObj.width(titleWidth);
        }
    };

    TimeInput.prototype.setHeight = function(heightParam){
        var height = this.dataOptions.height;
        if(heightParam)
            height = heightParam;
        if(typeof height == "string")
            height = height.split("px")[0];
        this.parent.height(height);
        this.parent.css("line-height",height+"px");
        this.inputObj.height(height-2);
        this.inputObj.css("line-height",(height-2)+"px");
        this.titleObj.height(height);
        this.titleObj.css("line-height",height+"px");
    };

    TimeInput.prototype.init = function(){
        var thisObject = this;
        if(this.dataOptions.required == true){
            this.$element.attr("placeholder",thisObject.$element.attr("placeholder")+" (必填)");
        }
        this.inputObj = this.$element;                 //inputObj

        this.inputObj.wrap($("<div class=\"eb_timeInputGroup\"></div>"));
        this.parent = this.inputObj.parent();                       //parent
        this.parent.data("timeInput",thisObject);
        this.parent.attr("name",thisObject.name).attr("id",thisObject.id + "_subgroup");
        this.parent.data("options",thisObject.$element.data("options"));
        if(this.dataOptions && this.dataOptions.defaultVal){
            this.inputObj.val(thisObject.dataOptions.defaultVal);
            this.parent.attr("value",thisObject.dataOptions.defaultVal);
        }
        this.parent.prepend($('<span class="eb_title">'+thisObject.title+'</span>'));
        this.titleObj = this.parent.children(".eb_title");        //titleObj
        if(this.dataOptions && this.dataOptions.required == true){
            this.parent.append('<span class="redStar" style="color:red;">*</span>');
        }
        this.setWidth();
        this.setHeight();
        var html = "";
        html = html + '<div class="eb_timeBox" id="'+this.timeBoxId+'"></div>';
        var timeBoxArea = $(".eb_timeBoxArea");               //timeBoxArea
        if(timeBoxArea.length <= 0){
            $("body").prepend('<div class="eb_timeBoxArea"></div>');
            timeBoxArea = $(".eb_timeBoxArea");
        }
        timeBoxArea.append(html);
        this.timeBoxObj = $("#" + thisObject.timeBoxId);
        $("#"+this.timeBoxId).append('<div class="eb_titleBar"></div>');
        this.titleBarObj = this.timeBoxObj.find(".eb_titleBar");
        html = "";
        html = html + '<div class="eb_yearSelecter"><span class="eb_toLastYear eb_yearButton">－</span><span class="eb_year">'+this.year+'</span>&nbsp;年<span class="eb_toNextYear eb_yearButton">＋</span></div>';
        $("#"+this.timeBoxId).find(".eb_titleBar").append(html); //写入年份选择组件
        $("#"+this.timeBoxId).find(".eb_yearButton").each(function(){ //年份增减按钮样式控制
            var thisObj = this;
            $(thisObj).mouseover(function(){
                $(thisObj).addClass("mouseover");
            }).mouseout(function(){
                $(thisObj).removeClass("mouseover");
            }).mousedown(function(){
                $(thisObj).addClass("mousedown");
            }).mouseup(function(){
                $(thisObj).removeClass("mousedown");
            });
        });
        $("#"+this.timeBoxId).find(".eb_toLastYear").click(function(){ //年份向前翻页
            thisObject.year--;
            $("#"+thisObject.timeBoxId).find(".eb_year").html(thisObject.year);
            thisObject.refreshDate();
        });
        $("#"+this.timeBoxId).find(".eb_toNextYear").click(function(){ //年份向后翻页
            thisObject.year++;
            $("#"+thisObject.timeBoxId).find(".eb_year").html(thisObject.year);
            thisObject.refreshDate();
        });
        html = '';
        html = html + '<select name="month" class="eb_monthSelect">';
        html = html + '<option value="01">01</option>';
        html = html + '<option value="02">02</option>';
        html = html + '<option value="03">03</option>';
        html = html + '<option value="04">04</option>';
        html = html + '<option value="05">05</option>';
        html = html + '<option value="06">06</option>';
        html = html + '<option value="07">07</option>';
        html = html + '<option value="08">08</option>';
        html = html + '<option value="09">09</option>';
        html = html + '<option value="10">10</option>';
        html = html + '<option value="11">11</option>';
        html = html + '<option value="12">12</option>';
        html = html + '</select>';
        this.titleBarObj.append($(html));
        this.titleBarObj.append('<span style="position:absolute;top:5px;right:23px;">月</span>');
        this.monthSelectObj = this.titleBarObj.find(".eb_monthSelect");                      //monthSelectObj
        this.monthSelectObj.val(thisObject.thisMonth);
        this.monthSelectObj.change(function(){
            thisObject.refreshDate();
        });
        html = "";
        html = html + '<table>';
        html = html + '<tr>';
        html = html + '<th class="eb_Sunday eb_red">日</th>';
        html = html + '<th class="eb_Monday">一</th>';
        html = html + '<th class="eb_Tuesday">二</th>';
        html = html + '<th class="eb_Wednesday">三</th>';
        html = html + '<th class="eb_Thursday">四</th>';
        html = html + '<th class="eb_Friday">五</th>';
        html = html + '<th class="eb_Saturday red">六</th>';
        html = html + '</tr>';
        html = html + '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
        html = html + '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
        html = html + '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
        html = html + '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
        html = html + '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
        html = html + '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
        html = html + '</table>';
        $("#"+this.timeBoxId).append(html);
        $("#"+this.timeBoxId).find("table td").each(function(){
            var thisObj = this;
            $(thisObj).mouseover(function(){
                $(thisObj).addClass("eb_dateMouseover");
            }).mouseout(function(){
                $(thisObj).removeClass("eb_dateMouseover");
            });
        });
        this.$element.click(function(){
            $(".eb_dropdownMenu.eb_show").hide().removeClass("eb_show");
            $(".eb_timeInput.focus").not(thisObject.$element).removeClass('focus');
            thisObject.toggleBox();
        });
        this.$element.focus(function(){
            thisObject.$element.addClass("focus");
        });
        this.refreshDate();
        if(this.dataOptions.HMS == true){                      //HMS == true
            this.timeBoxObj.height(thisObject.timeBoxObj.height()+30);
            var html = "";
            html = html + '<div class="eb_HMSBar">';
            html = html + '<input class="eb_HMSInput eb_Hour" value="00" />&nbsp;时&nbsp;';
            html = html + '<input class="eb_HMSInput eb_minute"  value="00" />&nbsp;分&nbsp;';
            html = html + '<input class="eb_HMSInput eb_second"  value="00" />&nbsp;秒';
            html = html + '</div>';
            this.timeBoxObj.append(html);
            this.timeBoxObj.find(".eb_HMSInput").focus(function(){
                $(this).addClass("focus");
            }).blur(function(){
                $(this).removeClass("focus");
            }).focus(function(){
                $(this).select();
            });
            this.timeBoxObj.find(".eb_HMSInput").keydown(function(e){
                var keycode=e.keyCode||e.which||e.charCode;
                var thisObj = this;
                var value = $(this).val();
                if((keycode>=48 && keycode<=57) || keycode == 8){
                    return true;
                }else{
                    return false;
                }
            });
            this.timeBoxObj.find(".eb_Hour").change(function(){
                var value = $(this).val();
                if(value>23){
                    $(this).val("23");
                }else if(value<0){
                    $(this).val("00");
                }
            });
            this.timeBoxObj.find(".eb_minute,.eb_second").change(function(){
                var value = $(this).val();
                if(value>59){
                    $(this).val("59");
                }else if(value<0){
                    $(this).val("00");
                }
            });
            this.timeBoxObj.append($('<div class="timeInputOK">确定</div>').mouseover(function(){
                $(this).addClass("mouseover");
            }).mouseout(function(){
                $(this).removeClass("mouseover");
            }).click(function(){
                var date = thisObject.timeBoxObj.find(".choosed").html();
                if(!date)
                    date = "1";
                if(date<10 && date.length == 1)
                    date = "0"+date;
                var YMD = thisObject.year + "-" + thisObject.month + "-" + date;
                var hour = thisObject.timeBoxObj.find(".eb_Hour").val();
                if(hour<10 && hour.length == 1)
                    hour = "0" + hour;
                var min = thisObject.timeBoxObj.find(".eb_minute").val();
                if(min<10 && min.length == 1)
                    min = "0" + min;
                var second = thisObject.timeBoxObj.find(".eb_second").val();
                if(second<10 && second.length == 1)
                    second = "0" + second;
                var HMS = hour + ":" + min + ":" + second;
                var result = YMD + "  " + HMS;
                thisObject.setValue(result);
                thisObject.timeBoxObj.hide().removeClass("show");
                thisObject.$element.change();
            })).append($('<div class="timeInputCancel">取消</div>').mouseover(function(){
                $(this).addClass("mouseover");
            }).mouseout(function(){
                $(this).removeClass("mouseover");
            }).click(function(){
                thisObject.timeBoxObj.hide().removeClass("show");
            }));
        }
        $(window).click(function(){
            //thisObject.check();
            thisObject.$element.removeClass("focus");
            $("#"+thisObject.timeBoxId).removeClass("show").hide();
        });
        this.$element.each(function(){
            $(this).click(function(event){
                event.stopPropagation();
            });
        });
        $("#"+this.timeBoxId).each(function(){
            $(this).click(function(event){
                event.stopPropagation();
            });
        });
    };

    TimeInput.prototype.refreshDate = function(){
        var thisObject = this;
        this.timeBoxObj.find(".choosed").removeClass("choosed");
        $("#"+this.timeBoxId).find("table td").html("").unbind("click");
        this.month = this.monthSelectObj.val();
        var maxDay = this.getMonthArr(this.year)[this.month-1];
        var firstDay = new Date(this.year,this.month-1,1).getDay();
        var index = firstDay%7;
        for(var i=0;i<maxDay;i++){
            $("#"+this.timeBoxId).find("table td").eq(index).html(i+1);
            if(this.dataOptions.defaultVal){
                var value = this.dataOptions.defaultVal;
                if(this.inputObj.val())
                    value = this.inputObj.val();
                var YMD = value.split(" ")[0];
                var Y = YMD.split("-")[0];
                var M = YMD.split("-")[1];
                var D = YMD.split("-")[2];
                if(D.indexOf("0") == 0)
                    D = D.split("0")[1];
                if(this.year == Y && this.month == M && i+1 == D){
                    $("#"+this.timeBoxId).find(".choosed").removeClass("choosed");
                    $("#"+this.timeBoxId).find("table td").eq(index).addClass('choosed');
                }
            }else if(this.year == this.thisYear && this.month == this.thisMonth && i+1 == thisObject.today){
                $("#"+this.timeBoxId).find(".choosed").removeClass("choosed");
                $("#"+this.timeBoxId).find("table td").eq(index).addClass('choosed');
            }
            if(thisObject.dataOptions.HMS != true){
                $("#"+this.timeBoxId).find("table td").eq(index).click(function(){
                    $("#"+thisObject.timeBoxId).find(".choosed").removeClass("choosed");
                    $(this).addClass("choosed");
                    thisObject.date = $(this).html();
                    if(thisObject.date<10)
                        thisObject.date = "0" + thisObject.date;
                    var data = thisObject.year + "-" + thisObject.month + "-" + thisObject.date;
                    thisObject.setValue(data);
                    thisObject.timeBoxObj.hide().removeClass("show");
                    thisObject.$element.change();
                });
            }else{
                $("#"+this.timeBoxId).find("table td").eq(index).click(function(){
                    thisObject.date = $(this).html();
                    if(thisObject.date<10)
                        thisObject.date = "0" + thisObject.date;
                    var data = thisObject.year + "-" + thisObject.month + "-" + thisObject.date;
                    //thisObject.inputObj.val(data);
                    //thisObject.timeBoxObj.hide();
                    thisObject.timeBoxObj.find(".choosed").removeClass("choosed");
                    $(this).addClass("choosed");
                });
            }
            index++;
        }
    };
    TimeInput.prototype.isLeapYear = function(year){
        if(year%4==0 && (year%100!= 0 || year%400 == 0))
            return true;
        else
            return false;
    };

    TimeInput.prototype.getMonthArr = function(year){
        if(this.isLeapYear(year))
            return [31,29,31,30,31,30,31,31,30,31,30,31];
        else
            return [31,28,31,30,31,30,31,31,30,31,30,31];
    };

    TimeInput.prototype.toggleBox = function(){
        this.locatBox();
        var display = $("#"+this.timeBoxId).attr("class");
        if(display.indexOf("show")>=0){
            $("#"+this.timeBoxId).removeClass("show").hide();
        }else{
            $(".eb_timeBoxArea .show").hide().removeClass("show");
            if(this.ifEnable == true){
                $("#"+this.timeBoxId).slideDown('fast').addClass("show");
            }
        }
    };

    TimeInput.prototype.getValue = function(){
        return this.inputObj.val();
    };

    TimeInput.prototype.setValue = function(value){
        this.inputObj.val(value);
        this.parent.attr("value",value);
    };

    TimeInput.prototype.clearValue = function(){
        this.setValue("");
    };

    TimeInput.prototype.check = function(){
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

    TimeInput.prototype.locatBox = function(){
        var top = this.$element.offset().top;
        var left = this.$element.offset().left;
        var scrollTop = $(window).scrollTop();
        var scrollLeft = $(window).scrollLeft();
        top = top;
        left = left;
        $("#"+this.timeBoxId).css("left",left).css("top",top+this.$element.height()+3);
    }

    $.fn.timeInput = function (option,param) {
        var result = null;
        var thisObj = this.each(function () {
            var $this = $(this)
                , thisObject = $this.data('timeInput')
                , dataOptions = typeof option == 'object' && option;
            if(typeof option == 'string' ){
                result = thisObject[option](param);
            }else{
                $this.data('timeInput', (thisObject = new TimeInput(this, dataOptions)));
            }
        });
        if(typeof option == 'string' )return result;
        return thisObj;
    };

    $.fn.timeInput.defaults = {
        required:false,
        width:250,
        height:20,
        titleWidth:73
    };

    $(window).on('load', function(){
        $(".eb_timeInput").each(function () {
            var thisObj = $(this)
                , dataOptionsStr = thisObj.data('options');
            if(!dataOptionsStr)
                thisObj.timeInput($.fn.timeInput.defaults);
            else
                thisObj.timeInput((new Function("return {" + dataOptionsStr + "}"))());
        });
    });
}(window.jQuery);
/*=====================================================================================
 * easy-bootstrap-button v2.0
 * 
 * @author:niyq
 * @date:2013/08/22
 * @dependce:jquery
 *=====================================================================================*/
!function($){

    "use strict";

    var Button = function(element,dataOptions){
        var thisObject = this;
        this.$element = $(element);
        this.dataOptions = $.extend({}, $.fn.button.defaults, dataOptions);
        this.onclickHandler = null;
        if(this.dataOptions.onclickHandler)
            this.onclickHandler = this.dataOptions.onclickHandler;
        this.init();
    };

    Button.prototype.init = function(){
        var thisObject = this;
        var color = "";
        if(this.dataOptions.color)
            color = this.dataOptions.color;
        switch(color){
            case "red":
                this.$element.addClass("eb_red");
                break;
            case "green":
                this.$element.addClass("eb_green");
                break;
            case "blue":
                this.$element.addClass("eb_blue");
                break;
            case "yellow":
                this.$element.addClass("eb_yellow");
                break;
        }
        if(this.onclickHandler)
            this.$element.click(function(){
                thisObject.onclickHandler();
            });
    };

    Button.prototype.disabled = function(){
        var thisObject = this;
        this.$element.addClass("eb_disabled").get(0).disabled = true;
    };

    Button.prototype.enabled = function(){
        var thisObject = this;
        this.$element.removeClass("eb_disabled").get(0).disabled = false;
    };

    $.fn.button = function (option,param) {
        var result = null;
        var thisObj = this.each(function () {
            var $this = $(this)
                , thisObject = $this.data('button')
                , dataOptions = typeof option == 'object' && option;
            if(typeof option == 'string' ){
                result = thisObject[option](param);
            }else{
                $this.data('button', (thisObject = new Button(this, dataOptions)));
            }
        });
        if(typeof option == 'string' )return result;
        return thisObj;
    };

    $.fn.button.defaults = {

    };

    $(window).on('load', function(){
        $(".eb_button").each(function () {
            var thisObj = $(this)
                , dataOptionsStr = thisObj.data('options');
            if(!dataOptionsStr)
                thisObj.button($.fn.button.defaults);
            else
                thisObj.button((new Function("return {" + dataOptionsStr + "}"))());
        });
    });
}(window.jQuery);

/*=====================================================================================
 * easy-bootstrap-panel v2.0
 * 
 * @author:niyq
 * @date:2013/08/22
 * @dependce:jquery
 *=====================================================================================*/
!function($){

    "use strict";

    var Panel = function(element,dataOptions){
        var thisObject = this;
        this.$element = $(element);
        this.dataOptions = $.extend({}, $.fn.panel.defaults, dataOptions);
        this.title = '';
        if(this.$element.attr('title'))
            this.title = this.$element.attr("title");
        if(this.dataOptions.title)
            this.title = this.dataOptions.title;
        this.id = this.$element.attr("id");
        this.init();
    };

    Panel.prototype.init = function(){
        var thisObject = this;
        this.$element.wrap($('<div class="eb_panelGroup"></div>'));
        this.parent = this.$element.parent();                                                    //parent
        this.parent.data('panel',thisObject.$element.data('panel'));
        this.parent.data('options',thisObject.$element.data('options'));
        this.parent.prepend($('<div class="eb_panelTitleBar">'+thisObject.title+'</div>'));
        this.titleBarObj = this.parent.children('.eb_panelTitleBar');                             //titleBarObj
        this.setWidth();
        this.setHeight();
    };

    Panel.prototype.setWidth = function(widthParam){
        var width = 600;
        if(this.$element.css('width'))
            width = this.$element.css('width');
        if(this.dataOptions.width)
            width = this.dataOptions.width;
        if(widthParam)
            width = widthParam;
        if(typeof width == 'string')
            width = width.split('px')[0];
        this.parent.width(width);
        this.$element.width(width-2);
        this.titleBarObj.width(width-2);
    }

    Panel.prototype.setHeight = function(heightParam){
        var height = 80;
        if(this.$element.css('height'))
            height = this.$element.css('height');
        if(this.dataOptions.height)
            height = this.dataOptions.height;
        if(heightParam)
            height = heightParam;
        if(typeof height == 'string')
            height = height.split('px')[0];
        this.parent.height(height);
        this.$element.height(height-26);
    }

    $.fn.panel = function (option,param) {
        var result = null;
        var thisObj = this.each(function () {
            var $this = $(this)
                , thisObject = $this.data('panel')
                , dataOptions = typeof option == 'object' && option;
            if(typeof option == 'string' ){
                result = thisObject[option](param);
            }else{
                $this.data('panel', (thisObject = new Panel(this, dataOptions)));
            }
        });
        if(typeof option == 'string' )return result;
        return thisObj;
    };

    $.fn.panel.defaults = {
        width:600,
        height:80
    };

    $(window).on('load', function(){
        $(".eb_panel").each(function () {
            var thisObj = $(this)
                , dataOptionsStr = thisObj.data('options');
            if(!dataOptionsStr)
                thisObj.panel($.fn.panel.defaults);
            else
                thisObj.panel((new Function("return {" + dataOptionsStr + "}"))());
        });
    });
}(window.jQuery);

/*=====================================================================================
 * easy-bootstrap-公用方法 v2.0
 * 
 * @author:niyq
 * @date:2013/09/05
 * @dependce:jquery
 *=====================================================================================*/
function isArray(value){
    if (value instanceof Array ||
        (!(value instanceof Object) &&
            (Object.prototype.toString.call((value)) == '[object Array]') ||
            typeof value.length == 'number' &&
            typeof value.splice != 'undefined' &&
            typeof value.propertyIsEnumerable != 'undefined' &&
            !value.propertyIsEnumerable('splice'))) {
        return 'array';
    }else{
        return typeof value;
    }
}