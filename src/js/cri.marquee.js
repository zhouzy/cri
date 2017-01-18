/*=====================================================================================
 * easy-bootstrap-marquee v1.0
 *
 * @author:zhouzy
 * @date:2013/09/16
 * @dependce:jquery
 *=====================================================================================*/
!function($){
    "use strict";

    var Marquee = function (element, options) {
        this.options = $.extend({}, $.fn.marquee.defaults, options);
        this.$element = $(element);
        this.scrollInterval = null;
        this.contentInterval = null;
        this.$one = null;
        this.$two = null;
        this.ita = 0;
        this.init();
    };

    Marquee.prototype = {
        eventListen:function(){
            var that = this;
            this.$element.on("mouseenter",function(){
                clearInterval(that.scrollInterval);
            }).on("mouseleave",function(){
                that.start();
            });
        },

        init:function () {
            var that = this;
            this.ita = 0;
            if(this.options.content.length > 0){
                this.createEle();
                this.contentInterval = window.setInterval(function(){
                    that.start();
                },3000);
                this.eventListen();
            }
        },

        createEle:function(){
            this.$one || this.$element.append("<div class=\"contentOne\"></div>");
            this.$two || this.$element.append("<div class=\"contentTwo\"></div>");
            this.$one = $(".contentOne",this.$element);
            this.$two = $(".contentTwo",this.$element);
            if(this.options.content){
                this.$one.html("<span>" + this.options.content[0].text + "</span>");
                this.$two.html("<span>" + this.options.content[0].text + "</span>");
            }
        },
        start:function(){
            this.ita++;
            this.ita>=this.options.content.length && (this.ita=0);
            this.$two.html("<span>" + this.options.content[this.ita].text + "</span>");
            this.$element.scrollTop(0);
            clearInterval(this.scrollInterval);
            var that = this;
            this.scrollInterval = window.setInterval(function(){
                that.scroll();
            },20);
        },
        stop:function(){
            clearInterval(this.contentInterval);
        },
        scroll:function(){
            this.$element.scrollTop(this.$element.scrollTop() + 1);
            if(this.$element.scrollTop % 20 == 20){
                clearInterval(this.scrollInterval);
            }
        },

        refreshContent:function(param){
            this.options.content = param;
            this.init();
        }
    };

    $.fn.marquee = function (option,param) {
        var result = null;
        var $marquee = this.each(function () {
            var $this = $(this)
                , data = $this.data('marquee')
                , options = typeof option == 'object' && option;
            if(typeof option == 'string' ){
                result = data[option](param);
            }else{
                $this.data('marquee', (data = new Marquee(this, options)));
            }
        });
        if(typeof option == 'string')return result;
        return $marquee;
    };

    $.fn.marquee.defaults = {
        content:[],
        delayTime:3000,
        height:20
    };

    $(window).on('load', function(){
        $("[class='marquee']").each(function () {
            var $this = $(this)
                ,data = $this.data('options');
            if(!data) return;
            $this.marquee((new Function("return {" + data + "}"))());
        });
    });

}(window.jQuery);
