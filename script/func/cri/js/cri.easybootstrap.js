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
