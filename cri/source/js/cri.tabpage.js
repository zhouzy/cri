/**
 * Author zhouzy
 * Date   2014/12/26
 *
 * TabPage
 */

!function(window){

    "use strict";

    var cri = window.cri,
        $   = window.jQuery;

    var TABPAGE_GROUP     = "tabPage-group",
        TABPAGE_HEADER    = "tabPage-header",
        TABPAGE_HEADER_LB = "tabPage-header-leftBtn",
        TABPAGE_HEADER_RB = "tabPage-header-rightBtn",
        TABPAGE_TABS_WRAP = "tabPage-header-tabs-wrap",
        TABPAGE_TABS      = "tabPage-header-tabs",
        TABPAGE_TAB       = "tabPage-header-tab",
        TABPAGE_TAB_CLOSE = "tabPage-header-tab-close",
        TAB_WIDTH         = 150;

    var _defaultOptions = {
        onFocus:null,
        onCloseTab:null
    };

    var TabPage = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        this.$tabPageGroup = null;
        this.$tabs = null;
        this._pageBodyQueue = [];
        cri.Widgets.apply(this,arguments);
        this.$element.attr('data-role','tabpage');
    });

    $.extend(TabPage.prototype,{

        _init:function(){
            this._create();
        },

        _create:function(){
            this.$tabPageGroup = this.$element.addClass(TABPAGE_GROUP);
            var contents = [];
            this.$element.children().each(function(){
                contents.push($(this).detach());
            });
            this._createHeader();
            if(contents.length>0){
                for(var i=0; i<contents.length; i++){
                    this.addTab(contents[i],(contents[i].data("title")|| ""),contents[i].data("close"));
                }
            }
        },

        _createHeader:function(){
            var that = this,
                $pageHeader = this.$pageHeader = $('<div class="' + TABPAGE_HEADER + '"></div>'),
                $leftBtn    = this.$leftBtn = $('<i class="fa fa-angle-double-left ' + TABPAGE_HEADER_LB + '"></i>').hide(),
                $rightBtn   = this.$rightBtn = $('<i class="fa fa-angle-double-right ' + TABPAGE_HEADER_RB + '"></i>').hide(),
                $tabsWrap   = this.$tabsWrap = $('<div class="' + TABPAGE_TABS_WRAP + '"></div>');
            $leftBtn.click(function(){
                that._offsetL();
            });
            $rightBtn.click(function(){
                that._offsetR();
            });
            $pageHeader.append($leftBtn,$rightBtn);
            $pageHeader.append($tabsWrap);
            $tabsWrap.append(this._createTabs());
            this.$tabPageGroup.append($pageHeader);
        },

        _offsetL:function(){
            var left = this.$tabs.position().left,
                width = this.$tabs.width(),
                containerWidth = this.$tabsWrap.width();
            if(width+left > containerWidth){
                this.$tabs.animate({left:"-=150px"});
            }
        },

        _offsetR:function(){
            var left  = this.$tabs.position().left;
            if(left < 0){
                this.$tabs.animate({left:"+=150px"});
            }
        },

        _createTabs:function(){
            this.$tabs = $('<ul class="' + TABPAGE_TABS + '"></ul>');
            return this.$tabs;
        },

        _closeTab:function($tab){
            var index = $tab.data('for');
            if(index != undefined && index != null){
                this._pageBodyQueue[index]._destroy();
                if(this.options.onCloseTab){
                    this.options.onCloseTab && this.options.onCloseTab.call(this,this._pageBodyQueue[index]);
                }
                this._pageBodyQueue[index]=null;
                this._pageBodyQueue.splice(index,1);
                $('li:gt('+ index +')',this.$tabs).each(function(){
                    var index = +$(this).data("for");
                    $(this).data("for",index-1);
                });
                $tab.remove();
                if($(".selected",this.$tabs).length == 0){
                    if(index == this._pageBodyQueue.length){
                        index -= 1;
                    }
                    index >= 0 && this.focusTab(this._getTab(index));
                }
                this._offsetR();
                this._leftRightBtn();
            }
        },

        _leftRightBtn:function(){
            var $tabs = this.$tabs;
            var tabsW = this._pageBodyQueue.length * TAB_WIDTH;
            var tabpageHeaderW = this.$pageHeader.width();

            $tabs.width(this._pageBodyQueue.length*TAB_WIDTH);

            if(tabsW > tabpageHeaderW){
                this.$leftBtn.show();
                this.$rightBtn.show();
                this.$pageHeader.addClass("shift");
            }
            else{
                this.$leftBtn.hide();
                this.$rightBtn.hide();
                this.$pageHeader.removeClass("shift");
            }
        },

        _getTab:function(index){
            return $('li:eq('+index+')',this.$tabs);
        },

        addNewTab:function(content,title,closeAble,isIframe,callBack){
            title = title || 'New Tab';
            if(closeAble == undefined || closeAble == null || closeAble == "null"){
                closeAble = true;
            }
            var that = this,
                $tabs = this.$tabs,
                $tab = $('<li class="' + TABPAGE_TAB + '">' + title + '</li>')
                    .data("for",this._pageBodyQueue.length)
                    .click(function(){
                        that.focusTab($(this));
                    }
                ),
                $closeBtn = $('<i class="fa fa-close ' + TABPAGE_TAB_CLOSE + '"></i>').click(function(){
                    that._closeTab($tab);
                });
            closeAble && $tab.append($closeBtn);
            $tabs.append($tab);
            var tabPageBody = new cri.ContentLoader(this.$tabPageGroup,{
                content:content,
                isIframe:isIframe,
                onReady:callBack
            });

            this._pageBodyQueue.push(tabPageBody);

            this._leftRightBtn();
            this.focusTab($tab);
            this._offsetL();
            return tabPageBody;
        },

        /**
         * 增加Tab
         * @param content : html字符串、url、jquery对象
         * @param title : tab name
         * @param closeAble: 是否在该tab上提供关闭按钮
         */
        addTab:function(content,title,closeAble,isIframe,callBack){
            var index = this.getIndexByContent(content);
            if(index>-1){
                this.select(index);
                return this.getTabBody(index);
            }else{
                return this.addNewTab(content,title,closeAble,isIframe,callBack);
            }
        },

        /**
         * 根据content判断是否已经打开该TAB
         * @param content
         */
        getIndexByContent:function(content){
            var _pageBodyQueue = this._pageBodyQueue;
            for(var i= 0,len=_pageBodyQueue.length;i<len;i++){
                if(content == _pageBodyQueue[i].options.content){
                    return i;
                }
            }
            return -1;
        },

        focusTab:function($tab){
            var $tabs = this.$tabs,
                index = $(".selected",$tabs).removeClass("selected").data("for");
            index != null && this._pageBodyQueue[index].hide();
            $tab.addClass("selected");
            this._pageBodyQueue[$tab.data("for")].show();
            this.options.onFocus && this.options.onFocus.call(this,$tab.data("for"));
        },

        closeTab:function(index){
            this._closeTab(this._getTab(index));
        },

        /**
         * 选择tab并给与焦点
         */
        select:function(index){
            this.focusTab(this._getTab(index))
        },

        /**
         * 根据索引获取tabBody
         */
        getTabBody:function(index){
            return this._pageBodyQueue[index];
        },

        /**
         * 获取TabBody的索引
         */
        getTabBodyIndex:function(tabBody){
            var re = -1;
            $.each(this._pageBodyQueue,function(index){
                if(tabBody == this){
                    re = index;
                    return false;
                }
            });
            return re;
        }
    });

    cri.TabPage = TabPage;

    $.fn.tabPage = function(option) {
        var o = null;
        this.each(function () {
            var $this = $(this),
                options = typeof option == 'object' && option;
            o = $this.data('tabPage');
            if(o != null){
                o._destroy();
            }
            $this.data('tabPage', (o = new TabPage(this,options)));
        });
        return o;
    };
}(window);
