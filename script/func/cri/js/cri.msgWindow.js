
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
