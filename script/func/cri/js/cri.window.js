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

    var _defaultOptions = {
        actions:["Close"],
        content:null,
        visible:true,
        model:true,//模态窗口
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
        /**
         *
         * TODO:
         * 1.包装window div
         * 2.insert before window head
         * 3.修改原dom对象
         * 4.拖拽效果
         * 5.resize 效果
         */

        this.$element.wrap('<div class="window"></div>');

        this.$window = this.$element.parent();

        this._createHead();

        this.$element.addClass("window-content");

    };

    /**
     * 初始化组件监听事件
     * @private
     */
    Window.prototype._eventListen = function(){};

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

    Window.prototype.open = function(){};

    Window.prototype.close = function(){};

    Window.prototype.maximaze = function(){};

    Window.prototype.minimaze = function(){};

    Window.prototype.destory = function(){};

    cri.Window = Window;


    $.fn.window = function(option) {
        var wnd = null;
        this.each(function () {
            var $this   = $(this),
                wnd      = $this.data('window'),
                options = typeof option == 'object' && option;
            if(wnd != null){
                wnd.$window.before($this).remove();
            }
            $this.data('window', (wnd = new Window(this, options)));
        });
        return wnd;
    };

}(window);