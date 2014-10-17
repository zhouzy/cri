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

    var icons = {Minimize:"fa fa-minus",Maximize:"fa fa-expand","Close":"fa fa-close","Restore":"fa fa-compress"},
        HEAD_HEIGHT = 35,
        MINI_WINDOW_WIDTH = 140+10,
        ZINDEX = 10000;

    var _defaultOptions = {
        actions:["Close"],
        content:null,
        visible:true,
        modal:false,//模态窗口
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
        this.$element.detach().addClass("window-content");
        this.$element.wrap('<div class="window"></div>');
        this.$window = this.$element.parent();
        var op = this.options,
            position = op.position;
        this.$window.css({zIndex:this._zIndex(),left:position.left,top:position.top,width:this.options.width,height:this.options.height});
        this._overlay();
        this._createHead();
        $("body").append(this.$window);
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

    /**
     * 根据actions 生成按钮
     * 模态窗口不生成最小化按钮
     * @returns {*}
     * @private
     */
    Window.prototype._createButtons = function(){
        var $buttons = $("<div></div>").addClass("buttons");
        for(var i = 0,len = this.options.actions.length; i < len; i++){
            var action = this.options.actions[i];
            if(action == "Minimize" && this.options.modal){
                continue;
            }
            var $button = $("<span></span>").addClass("button");
            var $icon = $("<i></i>").attr("class",icons[action]);
            $button.append($icon);
            $buttons.append($button);
        }
        return $buttons;
    };

    /**
     * 生成模态窗口背景遮罩
     * @private
     */
    Window.prototype._overlay = function(){
        if(this.options.modal){
            var $overlay = $(".overlay")[0] || $("<div></div>").addClass("overlay")[0];
            $("body").append($overlay);
            var zIndex = +this.$window.css("zIndex");
            $overlay.style.zIndex = zIndex;
            this.$window.css("zIndex",(zIndex+1));
        }
    };

    /**
     * 根据icon类名返回对应的处理函数
     * @param icon
     * @returns {*}
     * @private
     */
    Window.prototype._actionForIcon = function(icon) {
        var iconClass = /\bfa fa-\w+\b/.exec(icon[0].className)[0];
        return {
            "fa fa-minus": "minimize",
            "fa fa-expand": "maximize",
            "fa fa-compress": "resume",
            "fa fa-close": "close"
        }[iconClass];
    };



    /**
     * 关闭当前窗口
     *
     * 隐藏并且放置到最底层
     */
    Window.prototype.close = function(){
        var max = ZINDEX;
        var frontWnd = null;
        this.$window.css("zIndex",ZINDEX).hide();
        $(".window").each(function(){
            var z = +this.style.zIndex + 1;
            this.style.zIndex = z;
            if(z >= max){
                max = z;
                frontWnd = this;
            }
        });
        frontWnd.style.zIndex = max+1;
        $(".window").is(":visible") ?
            $(".overlay").css("zIndex",max):
            $(".overlay").hide();

        this.$window.removeClass("mini-window");
    };

    /**
     * 最大化窗口
     */
    Window.prototype.maximize = function(){
        this._setStyleByStatus("maximize");
        $("i.fa-expand",this.$window).removeClass("fa-expand").addClass("fa-compress");
    };

    /**
     * 最小化窗口
     * 依次排放到左下侧
     * 模态窗口没有最小化按钮
     */
    Window.prototype.minimize = function(){
        $(".window-content",this.$window).hide();
        var left = $(".mini-window").size() * MINI_WINDOW_WIDTH;
        this._setStyleByStatus("minimize");
        this.$window.css("left",left)
    };

    /**
     * 由最小化打开窗口
     */
    Window.prototype.open = function(){
        this._setStyleByStatus("normal");
    };

    /**
     * 复原窗口到初始(缩放、移动窗口会改变初始位置尺寸信息)尺寸、位置
     */
    Window.prototype.resume = function(){
        this._setStyleByStatus("normal");
        $("i.fa-compress",this.$window).removeClass("fa-compress").addClass("fa-expand");
    };

    /**
     * 根据窗口的状态设置窗口样式
     * @private
     */
    Window.prototype._setStyleByStatus = function(status){
        var op    = this.options,
            pos   = op.position,
            KLASS = {minimize:"window mini-window",maximize:"window maxi-window",closed:"window",normal:"window"},
            style = {width:op.width,height:op.height,left:pos.left,top:pos.top,bottom:"auto",right:"auto"};
        this.$window.prop("class",KLASS[status]).css(style);
    };

    /**
     * 把当前窗口顶至最前
     */
    Window.prototype.toFront = function(){

    };

    Window.prototype._zIndex = function(){
        var zindex = ZINDEX;
        $(".window").each(function(i,element){
            zindex = Math.max(+this.style.zIndex,zindex);
        });
        return ++zindex;
    };

    Window.prototype.destory = function(){

    };

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