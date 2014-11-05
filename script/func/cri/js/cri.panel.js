
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