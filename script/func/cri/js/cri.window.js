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
        MINI_WINDOW_WIDTH = 140+10,
        ZINDEX = 10000;

    var _defaultOptions = {
        actions:["Close","Minimize","Maximize"],//Colse:关闭,Minimize:最下化,Maximize:最大化
        content:null,
        visible:true,
        modal:false,//模态窗口
        width:600,
        height:400,
        position:{top:0,left:0},
        center:true,//初始时是否居中
        resizable:true
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
        var op = this.options;
        var viewWidth = $(window).width();
        var viewHeight = $(window).height();

        this._createBody();
        if(op.center){
            op.position.left = (viewWidth - op.width) / 2;
            op.position.top  = (viewHeight - op.height) / 2;
        }
        this.$window.css($.extend({zIndex:this._zIndex()},op.position)).width(op.width).height(op.height);
        this._overlay();
        this._createHead();
        op.resizable && this._createResizeHandler();
        $("body").append(this.$window);
    };

    /**
     * 初始化组件监听事件
     * @private
     */
    Window.prototype._eventListen = function(){
        var that = this;
        this.$window
            .on("click",".action",function(){
                var action = that._actionForButton($(this));
                action && typeof that[action] === "function" && that[action]();
            })
            .on("click",".window-head",function(){
                that.toFront();
            })
            .on("mousedown",".window-head",function(e){
                var left     = +that.$window.css("left").split("px")[0],
                    top      = +that.$window.css("top").split("px")[0],
                    width    = +that.$window.width(),
                    height   = +that.$window.height(),
                    startX   = e.pageX,
                    startY   = e.pageY;
                $(document).on("mousemove",function(e){
                    var pageX  = e.pageX,
                        pageY  = e.pageY,
                        shiftX = pageX - startX,
                        shiftY = pageY - startY;
                    left += shiftX;
                    top  += shiftY;
                    startX = pageX;
                    startY = pageY;
                    that._setPosition({top:top,left:left,width:width,height:height});
                });
            })
            .on("mousedown",".window-resizer",function(e){
                var left     = +that.$window.css("left").split("px")[0],
                    top      = +that.$window.css("top").split("px")[0],
                    width    = +that.$window.width(),
                    height   = +that.$window.height(),
                    startX   = e.pageX,
                    startY   = e.pageY,
                    resizer  = /[ewsn]+$/.exec(this.className)[0];

                $(document).on("mousemove",function(e){
                    var pageX  = e.pageX,
                        pageY  = e.pageY,
                        shiftX = pageX - startX,
                        shiftY = pageY - startY;
                    startX = pageX;
                    startY = pageY;
                    if(resizer.indexOf("e") >= 0){
                        width += shiftX;
                    }
                    if(resizer.indexOf("w") >= 0){
                        left = pageX;
                        width -= shiftX;
                    }
                    if(resizer.indexOf("n") >= 0){
                        top = pageY;
                        height -= shiftY;
                    }
                    if(resizer.indexOf("s") >= 0){
                        height += shiftY;
                    }
                    that._setPosition({top:top,left:left,width:width,height:height});
                });
            });
        $(document).on("mouseup",function(){
            $(document).off("mousemove");
        });
    };

    /**
     * 生成window 头部
     * @private
     */
    Window.prototype._createHead = function(){
        var $windowHead = $("<div></div>").addClass("window-head");
        $windowHead.append(this._createTitle()).append(this._createActions());
        this.$window.prepend($windowHead);
        this.$windowHead = $windowHead;
    };

    /**
     * 包装window 内容部分
     * @private
     */
    Window.prototype._createBody = function(){
        var $element = this.$element;
        $element.detach();
        var $window = $('<div class="window"></div>');
        var $windowBody = $('<div class="window-content"></div>');
        $window.append($windowBody);
        $windowBody.append($element);
        this.$window = $window;
        if(this.options.content){
            $windowBody.load(this.options.content);
        }
        $("body").append(this.$window);

    };

    /**
     * 生成标题栏
     * @returns {*}
     * @private
     */
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
    Window.prototype._createActions = function(){
        var options = this.options;
        var $buttons = $("<div></div>").addClass("actions");
        var defaultButtons = options.modal ? ["Maximize","Close"]:["Minimize","Maximize","Close"];

        for(var i = 0, len = defaultButtons.length; i<len; i++){
            var defBtn = defaultButtons[i];
            for(var j = 0,l = options.actions.length; j < l; j++){
                var action = options.actions[j];
                if(action == defBtn){
                    var $button = $("<span></span>").addClass("action").addClass(action.toLowerCase());
                    var $icon = $("<i></i>").attr("class",icons[action]);
                    $button.append($icon);
                    $buttons.append($button);
                }
            }
        }
        return $buttons;
    };

    /**
     * 生成 8个方位的 resizeHandler
     * @private
     */
    Window.prototype._createResizeHandler = function(){
        var resizerHandler = [],
            resizer = "n e s w nw ne se sw";
        $.each(resizer.split(" "),function(index,value){
            resizerHandler.push('<div class="window-resizer window-resizer-' + value + '" style="display: block;"></div>');
        });
        this.$window.append(resizerHandler.join(""));
    };

    /**
     * 生成模态窗口背景遮罩
     * @private
     */
    Window.prototype._overlay = function(){
        if(this.options.modal){
            var zIndex = +this.$window.css("zIndex");
            this.$window.css("zIndex",(zIndex+1));
            var $overlay = $(".overlay");
            if($overlay.length == 0){
                $overlay = $("<div></div>").addClass("overlay");
                $("body").append($overlay);
            }
            $overlay.css("zIndex",zIndex).show();
        }
    };

    /**
     * 设置窗口位置
     * @param position {top:number,left:number,height:number,width:number}
     * @private
     */
    Window.prototype._setPosition = function(position){
        var $window = this.$window;
        $window.css(position);
        this.options.position = position;
    };

    /**
     * 根据icon类名返回对应的处理函数
     * @param icon
     * @returns {*}
     * @private
     */
    Window.prototype._actionForButton = function(button) {
        var iconClass = /\baction \w+\b/.exec(button[0].className)[0];
        return {
            "action minimize": "minimize",
            "action maximize": "maximize",
            "action resume": "resume",
            "action close": "close"
        }[iconClass];
    };

    Window.prototype._loadContent = function(){
        $.load();
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
     * @param index
     * @private
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

    /**
     * 获取最大zIndex
     * @returns {number}
     * @private
     */
    Window.prototype._zIndex = function(){
        var zindex = ZINDEX;
        $(".window").each(function(i,element){
            zindex = Math.max(+this.style.zIndex,zindex);
        });
        return ++zindex;
    };

    cri.Window = Window;

    $.fn.window = function(option) {
        var wnd = null;
        this.each(function () {
            var $this   = $(this),
                wnd     = $this.data('window'),
                options = typeof option == 'object' && option;
            if(wnd != null){
                wnd._destory();
            }
            $this.data('window', (wnd = new Window(this, options)));
        });
        return wnd;
    };
}(window);