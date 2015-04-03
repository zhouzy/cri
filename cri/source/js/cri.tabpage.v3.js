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
        TABPAGE_BODY      = "tabPage-body",
        TAB_WIDTH         = 150;

    var _defaultOptions = {
        onFouce:null,
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
            var bodys = [];
            this.$element.children().each(function(){
                bodys.push($(this).detach());
            });
            this._createHeader();
            if(bodys.length>0){
                for(var i=0; i<bodys.length; i++){
                    this.addTab(bodys[i],(bodys[i].data("title")|| ""),bodys[i].data("close"));
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
                viewWidth = width + left - this.$tabs.css("marginLeft").split("px")[0];
            if(viewWidth > containerWidth){
                if(viewWidth%150>0){
                    this.$tabs.animate({left:"-="+(viewWidth%150)+"px"});
                }else{
                    this.$tabs.animate({left:"-=150px"});
                }
            }
        },

        _offsetR:function(){
            var left  = this.$tabs.position().left,
                width = this.$tabs.width(),
                containerWidth = this.$tabsWrap.width();
            if(left <= 0){
                var viewWidth = width + left - this.$tabs.css("marginLeft").split("px")[0];
                var right = containerWidth-viewWidth;
                if(right > 0){
                    this.$tabs.animate({left:"+="+(right%150)+"px"});
                }
                else{
                    this.$tabs.animate({left:"+=150px"});
                }
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
         * @param closeAble: 是否在该tab上提供关闭按钮
         */
        addTab:function(content,title,closeAble,iframe,callback){

            title = title || 'New Tab';

            if(closeAble == undefined || closeAble == null || closeAble == "null"){
                closeAble = true;
            }

            var that = this,
                $tabs = this.$tabs,
                $tab = $('<li class="' + TABPAGE_TAB + '">' + title + '</li>').data("for",this._pageBodyQueue.length).click(function(){
                    that.focusTab($(this));
                }),
                $closeBtn = $('<i class="fa fa-close ' + TABPAGE_TAB_CLOSE + '"></i>').click(function(){
                    that._closeTab($tab);
                });
            closeAble && $tab.append($closeBtn);
            $tabs.append($tab);

            var tabPageBody = new TabPageBody(this.$tabPageGroup,{
                content:content,
                iframe:iframe,
                callback:callback
            });

            this._pageBodyQueue.push(tabPageBody);
            $tabs.width(this._pageBodyQueue.length*TAB_WIDTH);
            this._offsetL();
            this.focusTab($tab);
            this._leftrightBtn();
            return tabPageBody;
        },

        focusTab:function($tab){
            var $tabs = this.$tabs,
                index = $(".selected",$tabs).removeClass("selected").data("for");
            index != null && this._pageBodyQueue[index].hide();
            $tab.addClass("selected");
            this._pageBodyQueue[$tab.data("for")].show();
            this.options.onFouce && this.options.onFouce.call(this,$tab.data("for"));
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

    var TabPageBody = function($parent,options){
        this.$parent = $parent;
        this.options = $.extend({
            content:null,
            iframe:true,
            callback:null
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
            var iframe = true,
                that = this;
            //jQuery
            if(this.options.content instanceof jQuery){
                iframe = false;
            }
            //HTML
            else if(/^<\w+>.*/g.test(this.options.content)){
                iframe = false;
            }
            if(iframe){
                if(this.options.iframe){
                    var iframeNode = document.createElement("iframe");
                    var shame = +new Date();
                    iframeNode.src = this.options.content;
                    iframeNode.id = 'id_' + shame;
                    iframeNode.name = 'name_' + shame;
                    if (iframeNode.attachEvent){
                        iframeNode.attachEvent("onload", function(){
                            that.options.callback && that.options.callback.call();
                        });
                    }
                    else {
                        iframeNode.onload = function(){
                            that.options.callback && that.options.callback.call();
                        };
                    }
                    this.$body.append(iframeNode);
                }
                else{
                    this.$body.load(this.options.content,function(){
                        that.options.callback && that.options.callback.call();
                    });
                }
            }
            else{
                this.$body.append(this.options.content);
                this.options.callback && this.options.callback.call();
            }
        },
        _destroy:function(){
            this.$body.remove();
        },

        getContent:function(){
            return this.$body;
        },

        show:function(){
            this.$body.show();
        },

        hide:function(){
            this.$body.hide();
        },

        reload:function(c,callback){
            c && (this.options.content = c);
            callback && (this.options.callback = callback);
            this.$body.empty();
            this._load();
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