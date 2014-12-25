
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
