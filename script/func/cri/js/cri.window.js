/**
 * Author zhouzy
 * Date   2014/10/14
 * window 组件
 *
 * 依赖Widgets
 *
 */
!function(window){

    "use strict";

    var cri = window.cri,
        $   = window.jQuery;

    var icons = {Minimize:"fa fa-minus",Maximize:"fa fa-expand","Close":"fa fa-close","Restore":"fa fa-compress"};
    var ZINDEX = 10000;

    var _defaultOptions = {
        actions:["Close"],
        content:null,
        visible:true,
        modal:true,//模态窗口
        width:600,
        height:400,
        position:{top:null,left:null}
    };


    var Window = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        cri.Widgets.apply(this,arguments);
    });

    /**
     * 初始化组件DOM结构
     * @private
     */
    Window.prototype._init = function(){
         //TODO:1.包装window div
         //TODO:2.insert before window head
         //TODO:3.修改原dom对象
         //TODO:4.拖拽效果
         //TODO:5.resize 效果

        this.$element.wrap('<div class="window"></div>');

        this.$window = this.$element.parent();

        this.$window.css("zIndex",this._zIndex());

        this._overlay();

        this._createHead();

        this.$element.addClass("window-content");

    };

    /**
     * 初始化组件监听事件
     * @private
     */
    Window.prototype._eventListen = function(){
        var that = this;
        this.$window.on("click",".buttons .button i",function(){
            var action = that._actionForIcon($(this));
            action && typeof that[action] === "function" && that[action]();
        });
    };

    Window.prototype._createHead = function(){
        var $windowHead = $("<div></div>").addClass("window-head");
        $windowHead.append(this._createTitle()).append(this._createButtons());
        this.$window.prepend($windowHead);
        this.$windowHead = $windowHead;
    };

    Window.prototype._createTitle = function(){
        var title = this.options.title || "";
        var $title = $("<span></span>").addClass("title").text(title);
        return $title;
    };

    Window.prototype._createButtons = function(){
        var $buttons = $("<div></div>").addClass("buttons");
        for(var i = 0,len = this.options.actions.length; i < len; i++){
            var action = this.options.actions[i];
            var $button = $("<span></span>").addClass("button");
            var $icon = $("<i></i>").attr("class",icons[action]);
            $button.append($icon);
            $buttons.append($button);
        }
        return $buttons;
    };

    Window.prototype._overlay = function(){
        //TODO:当前窗口是否为模态窗口 是：不生成overlay
        //TODO:否：查看窗口组是否存在overlay 存在的话 提高overlay z-index 不存在 生成overlay
        if(this.options.modal){

            var $overlay = $.find(".overlay").length || $("<div></div>").addClass("overlay");
            $("body").append($overlay);
            var zIndex = +this.$window.css("zIndex");
            $overlay.css("zIndex",zIndex);
            this.$window.css("zIndex",(zIndex+1));
        }
    };

    Window.prototype._actionForIcon = function(icon) {
        var iconClass = /\bfa fa-\w+\b/.exec(icon[0].className)[0];
        return {
            "fa fa-minus": "minimize",
            "fa fa-expand": "maximize",
            "fa fa-compress": "resume",
            "fa fa-close": "close"
        }[iconClass];
    };

    Window.prototype.open = function(){
        console.log("open");
    };

    Window.prototype.close = function(){
        //TODO:当窗口为模态窗口时，调整overlay的z-index
        //TODO:销毁当前窗口

        this.$window.hide();
    };

    Window.prototype.maximize = function(){
        console.log("maximize");
    };

    Window.prototype.minimize = function(){
        console.log("minimize");
    };

    Window.prototype.resume = function(){
        console.log("resume");
    };

    Window.prototype._zIndex = function(){
        var zindex = ZINDEX;
        $(".window").each(function(i,element){
            zindex = Math.max(+this.style.zIndex,zindex);
        });
        return ++zindex;
    };

    Window.prototype.destory = function(){};

    cri.Window = Window;

    $.fn.window = function(option) {
        var wnd = null;
        this.each(function () {
            var $this   = $(this),
                wnd     = $this.data('window'),
                options = typeof option == 'object' && option;
            if(wnd != null){
                wnd.$window.before($this).remove();
            }
            $this.data('window', (wnd = new Window(this, options)));
        });
        return wnd;
    };

}(window);