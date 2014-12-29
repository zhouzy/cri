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

    var TABPAGE_GROUP  = "tabPage-group",
        TABPAGE_HEADER = "tabPage-header",
        TABPAGE_HEADER_LB = "tabPage-header-leftBtn",
        TABPAGE_HEADER_RB = "tabPage-header-rightBtn",
        TABPAGE_TABS_WRAP = "tabPage-header-tabs-wrap",
        TABPAGE_TABS      = "tabPage-header-tabs",
        TABPAGE_TAB       = "tabPage-header-tab",
        TABPAGE_TAB_CLOSE = "tabPage-header-tab-close",
        TABPAGE_BODY      = "tabPage-body",
        TAB_WIDTH         = 100;

    var _defaultOptions = {
        label:'',
        data:null,  //Array [{value:"",text:""},{value:"",text:""}]
        change:null //Function: call back after select option
    };

    var TabPage = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        this.$tabPageGroup = null;
        this.$tabs = null;
        this._pageBodyQueue = [];
        cri.Widgets.apply(this,arguments);
    });

    $.extend(TabPage.prototype,{
        _eventListen:function(){
        },

        _init:function(){
            this._create();
        },

        _create:function(){
            this.$tabPageGroup = this.$element.addClass(TABPAGE_GROUP);
            this._createHeader();
        },

        _createHeader:function(){
            var that = this,
                $pageHeader = $('<div class="' + TABPAGE_HEADER + '"></div>'),
                $leftBtn    = $('<i class="fa fa-angle-double-left ' + TABPAGE_HEADER_LB + '"></i>'),
                $rightBtn   = $('<i class="fa fa-angle-double-right ' + TABPAGE_HEADER_RB + '"></i>'),
                $tabsWrap   = this.$tabsWrap = $('<div class="' + TABPAGE_TABS_WRAP + '"></div>');
            $leftBtn.click(function(){
                that._offsetL();
            });
            $rightBtn.click(function(){
                that._offsetR();
            });
            $pageHeader.append($leftBtn,$rightBtn,$tabsWrap);
            $tabsWrap.append(this._createTabs());
            this.$tabPageGroup.append($pageHeader);
        },

        _offsetL:function(){
            var left = this.$tabs.position().left,
                width = this.$tabs.width(),
                containerWidth = this.$tabsWrap.width();
            if(left+width > containerWidth){
                this.$tabs.velocity({left:"-=100px"});
            }
        },
        _offsetR:function(){
            var left = this.$tabs.position().left;
            if(left < 0){
                this.$tabs.velocity({left:"+=100px"});
            }
        },
        _createTabs:function(){
            var $tabs = this.$tabs = $('<ul class="' + TABPAGE_TABS + '"></ul>');
            return $tabs;
        },

        _fouceTab:function($tab){
            var $tabs = this.$tabs,
                index = $(".selected",$tabs).removeClass("selected").data("for");
            index != null && this._pageBodyQueue[index].hide();
            $tab.addClass("selected");
            this._pageBodyQueue[$tab.data("for")].show();
        },

        _closeTab:function($tab){
            var index = $tab.data('for');
            if(index != undefined && index != null){
                this._pageBodyQueue[index]._destory();
                this._pageBodyQueue = this._pageBodyQueue.splice(index-1,1);
                $('li:gt('+ index +')',this.$tabs).each(function(){
                    var index = +$(this).data("for");
                    $(this).data("for",index-1);
                });
                $tab.remove();
                if($(".selected",this.$tabs).length == 0){
                    if(index >= this._pageBodyQueue.length){
                        index -= 1;
                    }
                    this._fouceTab(this._getTab(index));
                }
            }

        },

        _getTab:function(index){
            return $('li:eq('+index+')',this.$tabs);
        },

        /**
         * 增加Tab
         * @param content : html字符串、url、jquery对象
         * @param title : tab name
         */
        addTab:function(content,title){
            title = title || 'New Tab';
            var that = this,
                $tabs = this.$tabs,
                $tab = $('<li class="' + TABPAGE_TAB + '">' + title + '</li>').data("for",this._pageBodyQueue.length),
                $closeBtn = $('<i class="fa fa-close ' + TABPAGE_TAB_CLOSE + '"></i>');
            $closeBtn.click(function(){
                that._closeTab($tab);
            });
            $tab.append($closeBtn);
            $tab.click(function(){
                that._fouceTab($(this));
            });
            $tabs.width(this._pageBodyQueue.length*TAB_WIDTH);
            $tabs.append($tab);
            var tabPageBody = new TabPageBody(this.$tabPageGroup,{
                content:content
            });
            this._pageBodyQueue.push(tabPageBody);
            this._fouceTab($tab);
            $tabs.width(this._pageBodyQueue.length*TAB_WIDTH);
            this._offsetL();
        },

        closeTab:function($tab){
            this._closeTab($('li:eq('+index+')',this.$tabs));
        }
    });

    var TabPageBody = function($parent,options){
        this.$parent = $parent;
        this.options = $.extend({
            content:null
        },options);
        this.$body = null;
        this._init();
    };

    $.extend(TabPageBody.prototype,{
        _init:function(){
            this._createBody();
        },
        _createBody:function(){
            this.$body = $('<div class="' + TABPAGE_BODY + '"></div>');
            this.$parent.append(this.$body);
            this._load();
        },
        _load:function(){
            var $iframe = $('<iframe src="'+this.options.content+'"></iframe>');
            this.$body.append($iframe);
        },
        _destory:function(){
            this.$body.remove();
        },
        show:function(){
            this.$body.show();
        },
        hide:function(){
            this.$body.hide();
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
                o._destory();
            }
            $this.data('tabPage', (o = new TabPage(this,options)));
        });
        return o;
    };
}(window);