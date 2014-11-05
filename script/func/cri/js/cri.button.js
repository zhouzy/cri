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

