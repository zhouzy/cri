/**
 * Author zhouzy
 * Date   2014/10/14
 * window 组件
 *
 * 继承 Widgets
 *
 */
!function(window){

    "use strict";

    var cri = window.cri,
        $   = window.jQuery;

    var WINDOW_HEAD = "window-head";

    var icons = {Minimize:"fa fa-minus",Maximize:"fa fa-expand","Close":"fa fa-close","Resume":"fa fa-compress"},
        MINI_WINDOW_WIDTH = 140+10,
        ZINDEX = 10000;

    var _defaultOptions = {
        title:"",
        actions:["Close","Minimize","Maximize"],//Colse:关闭,Minimize:最下化,Maximize:最大化
        content:null,
        visible:true,
        modal:false,//模态窗口
        width:600,
        height:400,
        position:{top:0,left:0},
        center:true,//初始时是否居中
        resizable:true,
        onReady:null//当窗口初始化完成时触发
    };

    var Window = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        this.windowStatus = "normal";
        cri.Widgets.apply(this,arguments);
        Window.prototype.windowStack.push(this);
    });

    $.extend(Window.prototype,{

        windowStack : [],

        _initOptions:function(options) {
            this.options = $.extend(true,{}, this.options, options);
            if(options.actions && options.actions.length){
                this.options.actions = options.actions;
            }
        },

        /**
         * 初始化组件监听事件
         * @private
         */
        _eventListen : function(){
            var that = this;
            this.$window
                .on("click",".action",function(){
                    var action = that._actionForButton($(this));
                    action && typeof that[action] === "function" && that[action]();
                    return false;
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
        },

        /**
         * 初始化组件DOM结构
         * @private
         */
        _init : function(){
            var op = this.options;
            this._createBody();
            this._overlay();
            this._createHead();
            op.resizable && this._createResizeHandler();
            $("body").append(this.$window);
            if(op.visible){
                this.$window.show();
            }else{
                this.$window.hide();
            }
        },

        /**
         * 生成window 头部
         * @private
         */
        _createHead : function(){
            var $windowHead = $('<div class="' + WINDOW_HEAD + '"></div>');
            $windowHead.append(this._createTitle()).append(this._createActions());
            this.$window.prepend($windowHead);
            this.$windowHead = $windowHead;
        },

        /**
         * 包装window 内容部分
         * @private
         */
        _createBody : function(){
            var that     = this,
                op       = this.options,
                viewWidth = $(window).width(),
                viewHeight = $(window).height(),
                $element = this.$element,
                $window  = $('<div class="window"></div>'),
                $windowBody = $('<div class="window-content"></div>');
            $element.detach();
            this.$window = $window;
            if(op.center){
                op.position.left = (viewWidth - op.width) / 2;
                op.position.top  = (viewHeight - op.height) / 2;
            }
            $window.css({zIndex:this._zIndex()});

            this._setPosition({top:op.position.top,left:op.position.left,width:op.width,height:op.height});

            $window.append($windowBody);

            $windowBody.append($element);

            this.load(this.options.content);

            $("body").append(this.$window);
        },

        /**
         * 生成标题栏
         * @returns {*}
         * @private
         */
        _createTitle : function(){
            var title = this.options.title || "";
            var $title = $("<span></span>").addClass("title").text(title);
            return $title;
        },

        /**
         * 根据actions 按照（最小化，放大，关闭）顺序生成按钮
         * 模态窗口不生成最小化按钮
         * @returns {*}
         * @private
         */
        _createActions : function(){
            var options = this.options,
                $buttons = $("<div></div>").addClass("actions"),
                defaultButtons = options.modal ? ["Maximize","Close"]:["Minimize","Maximize","Close"];

            for(var i = 0, len = defaultButtons.length; i<len; i++){
                var defBtn = defaultButtons[i];
                for(var j = 0,l = options.actions.length; j < l; j++){
                    var action = options.actions[j];
                    if(action == defBtn){
                        var $button = $('<span class="action"></span>').addClass(action.toLowerCase()),
                            $icon   = $('<i class="' + icons[action] + '"></i>');
                        $buttons.append($button);
                        $button.append($icon);
                    }
                }
            }
            return $buttons;
        },

        /**
         * 生成 8个方位的 resizeHandler
         * @private
         */
        _createResizeHandler : function(){
            var resizerHandler = [],
                resizer = "n e s w nw ne se sw";
            $.each(resizer.split(" "),function(index,value){
                resizerHandler.push('<div class="window-resizer window-resizer-' + value + '" style="display: block;"></div>');
            });
            this.$window.append(resizerHandler.join(""));
        },

        /**
         * 生成模态窗口背景遮罩
         * @private
         */
        _overlay : function(){
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
        },

        /**
         * 设置窗口位置
         * @param position {top:number,left:number,height:number,width:number}
         * @private
         */
        _setPosition : function(position){
            var $window = this.$window;
            $window.css(position);
            this.options.position = position;
        },

        /**
         * 根据icon类名返回对应的处理函数
         * @param icon
         * @returns {*}
         * @private
         */
        _actionForButton : function(button) {
            var iconClass = /\baction \w+\b/.exec(button[0].className)[0];
            return {
                "action minimize": "minimize",
                "action maximize": "maximize",
                "action resume": "resume",
                "action close": "close"
            }[iconClass];
        },

        /**
         * 由最小化打开窗口
         */
        open : function(){
            this._setStyleByStatus("normal");
            $(".window-content",this.$window).show();
            this.windowStatus = "normal";
        },

        /**
         * 关闭当前窗口
         *
         * 隐藏并且放置到最底层
         */
        close : function(){
            var max      = ZINDEX,
                frontWnd = null,
                $windows = $(".window"),
                $overlay = $(".overlay");

            this.$window.css("zIndex",ZINDEX).hide();
            $windows.each(function(){
                var z = +this.style.zIndex + 1;
                this.style.zIndex = z;
                if(z >= max){
                    max = z;
                    frontWnd = this;
                }
            });
            frontWnd.style.zIndex = max+1;
            $windows.is(":visible") ? $overlay.css("zIndex",max) : $overlay.hide();

            this.$window.removeClass("mini-window");
            this.windowStatus = "close";
        },

        /**
         * 最大化窗口
         * 最大化后 复原、关闭
         */
        maximize : function(){
            this._setStyleByStatus("maximize");
            this._setButtons("maximize");
            this.windowStatus = "maximize";
        },

        /**
         * 最小化窗口
         * 依次排放到左下侧
         * 模态窗口没有最小化按钮
         */
        minimize : function(){
            this._setButtons("minimize");
            $(".window-content",this.$window).hide();
            var left = $(".mini-window").size() * MINI_WINDOW_WIDTH;
            this._setStyleByStatus("minimize");
            this.$window.css("left",left);
            this.windowStatus = "minimize";
        },

        /**
         * 复原窗口到初始(缩放、移动窗口会改变初始位置尺寸信息)尺寸、位置
         */
        resume : function(){
            this._setButtons("normal");
            this._setStyleByStatus("normal");
            $(".window-content",this.$window).show();
            if(this.windowStatus == "minimize"){
                var i = 0;
                this.windowStatus = "normal";
                $.each(Window.prototype.windowStack,function(index,wnd){
                    if(wnd.windowStatus == "minimize"){
                        wnd._moveLeft(i++);
                    }
                });
            }
            this.windowStatus = "normal";
        },

        /**
         * 根据窗口的状态设置窗口样式
         * @private
         */
        _setStyleByStatus : function(status){
            var op    = this.options,
                pos   = op.position,
                KLASS = {minimize:"window mini-window",maximize:"window maxi-window",closed:"window",normal:"window"},
                style = {width:op.width,height:op.height,left:pos.left,top:pos.top,bottom:"auto",right:"auto"};
            this.$window.prop("class",KLASS[status]).css(style);
        },

        /**
         * 根据当前窗口状态设置窗口按钮组
         * @param buttons
         * @private
         */
        _setButtons : function(status){
            var BUTTONS = {minimize:["resume","close"],maximize:["resume","close"],normal:["minimize","maximize","close"]};
            var $actions = $(".actions",this.$window);
            $(".action",$actions).hide();

            if(status == "minimize"){
                var $btn = $(".maximize",$actions).removeClass("maximize").addClass("resume");
                $("i",$btn).prop("class",icons["Maximize"]);
            }

            if(status == "maximize"){
                var $btn = $(".maximize",$actions).removeClass("maximize").addClass("resume");
                $("i",$btn).prop("class",icons["Resume"]);
            }
            if(status == "normal"){
                var $btn = $(".resume",$actions).removeClass("resume").addClass("maximize");
                $("i",$btn).prop("class",icons["Maximize"]);
            }
            $.each(BUTTONS[status],function(index,value){
                $("." + value,$actions).show();
            });
        },

        /**
         * 当左侧最小化窗口复原后，右侧最小化窗口依次左移一个窗口位置
         * @param index
         * @private
         */
        _moveLeft : function(index){
            this.$window.css("left",MINI_WINDOW_WIDTH * index);
        },

        /**
         * 把当前窗口顶至最前,与之前最上层窗口替换
         */
        toFront : function(){
            /**
             * 轮询窗口，取最大zindex,替换zindex
             */
            var frontWnd = this._getFrontWindow();
            if(this.$window != frontWnd){
                var zIndex = +this.$window.css("zIndex");
                this.$window.css("zIndex",frontWnd.css("zIndex"));
                frontWnd.css("zIndex",zIndex);
            }
        },

        /**
         * 获取最上层窗口
         * @private
         */
        _getFrontWindow : function(){
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
        },

        load:function(content){
            var $element = this.$element,
                that = this,
                op = this.options,
                $loadingIcon = $('<i class="fa fa-spinner fa-spin"></i>').addClass("loadingIcon");
            if(content){
                $element.addClass("loading").html($loadingIcon);
                $element.load(content,function(response,status){
                    $element.removeClass("loading");
                    $loadingIcon.remove();
                    op.onReady && op.onReady.call(that,that.$window);
                });
            }else{
                op.onReady && op.onReady.call(that,that.$window);
            }
        },

        /**
         * 获取最大zIndex
         * @returns {number}
         * @private
         */
        _zIndex : function(){
            var zindex = ZINDEX;
            $(".window").each(function(i,element){
                zindex = Math.max(+this.style.zIndex,zindex);
            });
            return ++zindex;
        },

        _destory : function(){
            var $element = this.$element,
                $warpper = $element.parents(".window");
            $warpper.after($element).remove();
        }
    });
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