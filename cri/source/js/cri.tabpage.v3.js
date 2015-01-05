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
            var bodys = [];
            this.$element.children().each(function(){
                bodys.push($(this).detach());
            });
            this._createHeader();
            if(bodys.length>0){
                for(var i=0; i<bodys.length; i++){
                    this.addTab(bodys[i],(bodys[i].data("title")|| ""));
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
                containerWidth = this.$tabsWrap.width(),
                viewWidth = width + left - 25;
            if(viewWidth > containerWidth){
                if(viewWidth%100>0){
                    this.$tabs.velocity({left:"-="+(viewWidth%100)+"px"});
                }else{
                    this.$tabs.velocity({left:"-=100px"});
                }
            }
        },
        _offsetR:function(){
            var left  = this.$tabs.position().left,
                width = this.$tabs.width(),
                containerWidth = this.$tabsWrap.width();

            if(left <= 0){
                var viewWidth = width + left - 25;
                var right = containerWidth-viewWidth;
                if(right > 0){
                    this.$tabs.velocity({left:"+="+(right%100)+"px"});
                }
                else{
                    this.$tabs.velocity({left:"+=100px"});
                }
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
        _leftrightBtn:function(){
            var $tabs = this.$tabs;
            var tabsW = $tabs.width();
            var tabpageHeaderW = this.$pageHeader.width();

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

            $tabs.append($tab);
            var tabPageBody = new TabPageBody(this.$tabPageGroup,{
                content:content
            });
            this._pageBodyQueue.push(tabPageBody);
            this._fouceTab($tab);
            $tabs.width(this._pageBodyQueue.length*TAB_WIDTH);
            this._offsetL();
            this._leftrightBtn();
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
            var iframe = true;
            //jQuery
            if(this.options.content instanceof jQuery){
                iframe = false;
            }
            //HTML
            else if(/^<\w+>.*/g.test(this.options.content)){
                iframe = false;
            }
            if(iframe){
                var $iframe = $('<iframe src="'+this.options.content+'"></iframe>');
                this.$body.append($iframe);
            }
            else{
                this.$body.append(this.options.content);
            }
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