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

    var icons = {Minimize:"fa fa-minus",Maximize:"fa fa-expand","Close":"fa fa-close","Resume":"fa fa-compress"},
        HEAD_HEIGHT = 35,
        WINDOW_BODY_PADDING_X = 3,
        WINDOW_BODY_PADDING_Y = 4,
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
        this.windowStatus = "normal";
        cri.Widgets.apply(this,arguments);
        Window.prototype.windowStack.push(this);
    });

    Window.prototype.windowStack = [];

    /**
     * 初始化组件DOM结构
     * @private
     */
    Window.prototype._init = function(){
        this._createBody();
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
        this.$window
            .on("click",".buttons .button",function(){
                var action = that._actionForButton($(this));
                action && typeof that[action] === "function" && that[action]();
            })
            .on("click",".window-head",function(){
                that.toFront();
            })
            .on("mousedown",".window-head",function(e){
                var op = that.options;
                var position = op.position;
                var left = position.left;
                var top  = position.top;
                var startX = e.pageX;
                var startY = e.pageY;
                $("body").on("mousemove",function(e){
                    var currentX = e.pageX;
                    var currentY = e.pageY;
                    var X = currentX - startX;
                    var Y = currentY - startY;
                    left += X;
                    top += Y;
                    startX = currentX;
                    startY = currentY;
                    that.$window.css("left",left);
                    that.$window.css("top",top);
                    that.$window.css("bottom","auto");
                    that.$window.css("right","auto");
                    position.left = left;
                    position.top = top;
                });
            });
        $("body").on("mouseup",function(){
            $("body").off("mousemove");
        });
    };

    Window.prototype._createHead = function(){
        var $windowHead = $("<div></div>").addClass("window-head");
        $windowHead.append(this._createTitle()).append(this._createButtons());
        this.$window.prepend($windowHead);
        this.$windowHead = $windowHead;
    };

    Window.prototype._createBody = function(){
        var $element = this.$element;
        $element.detach();
        var $window = $('<div class="window"></div>');
        var $windowBody = $('<div class="window-content"></div>');
        var bodyWidth = this.options.width - 2 * WINDOW_BODY_PADDING_X;
        var bodyHeight = this.options.height - 2* WINDOW_BODY_PADDING_Y - HEAD_HEIGHT;
        $windowBody.css({height:bodyHeight,width:bodyWidth});
        $window.append($windowBody);
        $windowBody.append($element);
        this.$window = $window;
        $("body").append(this.$window);
    };

    Window.prototype._createTitle = function(){
        var title = this.options.title || "";
        var $title = $("<span></span>").addClass("title").text(title);
        return $title;
    };

    /**
     * 根据actions 按照（最小化，放大，关闭）顺序生成按钮
     * 模态窗口不生成最小化按钮
     * @returns {*}
     * @private
     */
    Window.prototype._createButtons = function(){
        var options = this.options;
        var $buttons = $("<div></div>").addClass("buttons");
        var defaultButtons = options.modal ? ["Maximize","Close"]:["Minimize","Maximize","Close"];

        for(var i = 0, len = defaultButtons.length; i<len; i++){
            var defBtn = defaultButtons[i];
            for(var j = 0,l = options.actions.length; j < l; j++){
                var action = options.actions[j];
                if(action == defBtn){
                    var $button = $("<span></span>").addClass("button").addClass(action.toLowerCase());
                    var $icon = $("<i></i>").attr("class",icons[action]);
                    $button.append($icon);
                    $buttons.append($button);
                }

            }
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
    Window.prototype._actionForButton = function(button) {
        var iconClass = /\bbutton \w+\b/.exec(button[0].className)[0];
        return {
            "button minimize": "minimize",
            "button maximize": "maximize",
            "button resume": "resume",
            "button close": "close"
        }[iconClass];
    };

    /**
     * 由最小化打开窗口
     */
    Window.prototype.open = function(){
        this._setStyleByStatus("normal");
        this.windowStatus = "normal";
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
        this.windowStatus = "close";
    };

    /**
     * 最大化窗口
     * 最大化后 复原、关闭
     */
    Window.prototype.maximize = function(){
        this._setStyleByStatus("maximize");
        this._setButtons("maximize");
        this.windowStatus = "maximize";
    };

    /**
     * 最小化窗口
     * 依次排放到左下侧
     * 模态窗口没有最小化按钮
     */
    Window.prototype.minimize = function(){
        this._setButtons("minimize");
        $(".window-content",this.$window).hide();
        var left = $(".mini-window").size() * MINI_WINDOW_WIDTH;
        this._setStyleByStatus("minimize");
        this.$window.css("left",left);
        this.windowStatus = "minimize";
    };

    /**
     * 复原窗口到初始(缩放、移动窗口会改变初始位置尺寸信息)尺寸、位置
     */
    Window.prototype.resume = function(){
        this._setButtons("normal");
        this._setStyleByStatus("normal");
        if(this.windowStatus == "minimize"){
            this.windowStatus = "normal";
            var i = 0;
            $.each(Window.prototype.windowStack,function(index,wnd){
                if(wnd.windowStatus == "minimize"){
                    wnd._moveLeft(i++);
                }
            });
        }
        this.windowStatus = "normal";
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
     * 根据当前窗口状态设置窗口按钮组
     * @param buttons
     * @private
     */
    Window.prototype._setButtons = function(status){
        var BUTTONS = {minimize:["resume","close"],maximize:["resume","close"],normal:["minimize","maximize","close"]};
        var $buttons = $(".buttons",this.$window);
        $(".button",$buttons).hide();

        if(status == "minimize"){
            var $btn = $(".maximize",$buttons).removeClass("maximize").addClass("resume");
            $("i",$btn).prop("class",icons["Maximize"]);
        }

        if(status == "maximize"){
            var $btn = $(".maximize",$buttons).removeClass("maximize").addClass("resume");
            $("i",$btn).prop("class",icons["Resume"]);
        }
        if(status == "normal"){
            var $btn = $(".resume",$buttons).removeClass("resume").addClass("maximize");
            $("i",$btn).prop("class",icons["Maximize"]);
        }
        $.each(BUTTONS[status],function(index,value){
            $("." + value,$buttons).show();
        });
    };

    /**
     * 当左侧最小化窗口复原后，右侧最小化窗口依次左移一个窗口位置
     */
    Window.prototype._moveLeft = function(index){
        this.$window.css("left",MINI_WINDOW_WIDTH * index);
    };

    /**
     * 把当前窗口顶至最前,与之前最上层窗口替换
     */
    Window.prototype.toFront = function(){
        //TODO:轮询窗口，取最大zindex,替换zindex
        var frontWnd = this._getFrontWindow();
        if(this.$window != frontWnd){
            var zIndex = +this.$window.css("zIndex");
            this.$window.css("zIndex",frontWnd.css("zIndex"));
            frontWnd.css("zIndex",zIndex);
        }
    };

    /**
     * 获取最上层窗口
     * @private
     */
    Window.prototype._getFrontWindow = function(){
        var zIndex = +this.$window.css("zIndex"),
            wnd = this.$window;
        $(".window").each(function(){
            var tempZIndex = +this.style.zIndex;
            if(tempZIndex  > zIndex){
                wnd = $(this);
                zIndex = tempZIndex;
            }
        });
        return wnd;
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