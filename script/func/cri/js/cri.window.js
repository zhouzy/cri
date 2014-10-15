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

    var _defaultOptions = {
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

        var thisObject = this;
        this.$element.wrap('<div class="eb_popoutWindowGroup" id="'+thisObject.id+'_subgroup"></div>');
        this.parent = this.$element.parent();      //parent
        this.parent.data("popoutWindow",thisObject);
        if(thisObject.$element.data("form"))
            this.parent.data("form",thisObject.$element.data("form"));
        this.popoutWindowObj = this.$element;     //popoutWindowObj
        this.parent.prepend('<div class="eb_title">'+thisObject.title+'<span class="eb_closeWindowButton">x</span></div>');
        this.titleObj = this.parent.children('.eb_title');    //titleObj
        if(this.dataOptions.closeHandler){
            var func = this.dataOptions.closeHandler;
            if(typeof func == "string")
                func = window[func];
            thisObject.titleObj.find('.eb_closeWindowButton').click(function(){
                func();
            });
        }
        this.parent.append('<div class="eb_buttonsBar"></div>');
        this.buttonsBar = this.parent.children('.eb_buttonsBar');       //buttonsBar
        this.buttonsArr = this.dataOptions.buttons;

        if(typeof this.buttonsArr == "string"){
            this.buttonsArr = window[thisObject.buttonsArr];
        }                                                   //buttonsArr
        if(thisObject.buttonsArr){
            for(var i=0;i<thisObject.buttonsArr.length;i++){
                var func = thisObject.buttonsArr[i].handler;
                if(typeof func == "string")
                    func = window[func];
                thisObject.funcArr[i]=func;
                this.buttonsBar.prepend($('<span class="eb_buttons" funcIndex="'+i+'"><span class="eb_icon '+thisObject.buttonsArr[i].icon+'"></span>'+thisObject.buttonsArr[i].text+'</span>').click(function(){
                    var thisObj = this;
                    thisObject.funcArr[$(thisObj).attr("funcIndex")]();
                }));
            }
        }
        this.buttonsObj = this.buttonsBar.children('.eb_buttons');     //buttonsObj
        if(this.dataOptions.fullScreen == true){
            this.setFullScreen();
        }else{
            this.setWidth();
            this.setHeight();
        }
        this.setPosition();
        this.setStyle();
    };

    /**
     * 初始化组件监听事件
     * @private
     */
    Window.prototype._eventListen = function(){};

    Window.prototype._createTitle = function(){};

    Window.prototype._createContent = function(){};

    Window.prototype._createButtons = function(){};

    Window.prototype.open = function(){};

    Window.prototype.close = function(){};

    Window.prototype.maximaze = function(){};

    Window.prototype.minimaze = function(){};

    Window.prototype.destory = function(){};

    cri.Window = Window;
}(window);