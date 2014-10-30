/**
 * Author zhouzy
 * Date   2014/9/18
 * Pager 组件
 *
 */
!function(window){

    "use strict";

    var cri = window.cri,
        $   = window.jQuery;

    /**
     * 默认属性
     * @type {{page: number, pageSize: number, total: number}}
     * @private
     */
    var _defaultOptions = {
        page:1,      //当前页数
        pageSize:10, //每页条数
        total:0,     //总条数
        rowsLen:0,   //实际数据length
        onPage:null,  //当用户点击翻页按钮时触发
        onUpdate:null //更新翻页信息结束触发
    };

    var FIRST = ".first-page",
        PREV  = ".prev-page",
        NEXT  = ".next-page",
        LAST  = ".last-page",
        PAGENUMBER = ".pager-number",
        PAGEBTN    = ".pager-nav",
        PAGEINFO   = ".pager-info";

    var Pager = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        this.pager = null;
        cri.Widgets.apply(this,arguments);
    });

    $.extend(Pager.prototype,{
        _eventListen:function(){
            var that = this;
            this.$pager.on("click","a:not('.state-disabled')",function(e){
                var $a = $(e.target).closest("a");
                var page = $a.data("page");
                that._page(page);
            });
        },

        _init:function () {
            this._createPager(this.$element);
        },

        _createPager:function($parent){
            var $pager = this.$pager = $("<div></div>").addClass("pager");
            $pager.append(this._createPagerBtn()).append(this._createPagerInfo());
            $parent.append($pager);
        },

        _createPagerBtn: function(){
            var op        = this.options,
                pageSize  = op.pageSize || 10,
                total     = op.total || 0,
                page      = parseInt(op.page) || 1,
                lastPage  = Math.ceil(total / pageSize);

            var $pagerBtn   = $("<div></div>").addClass("pager-nav"),
                $firstPage  = $('<a class="first-page"></a>').append('<span class="fa fa-angle-double-left"></span>'),
                $prevPage   = $('<a class="prev-page"></a>').append('<span class="fa fa-angle-left"></span>'),
                $nextPage   = $('<a class="next-page"></a>').append('<span class="fa fa-angle-right"></span>'),
                $lastPage   = $('<a class="last-page"></a>').append('<span class="fa fa-angle-double-right"></span>'),
                $numberPage = $("<ul></ul>").addClass("pager-number");

            this._fourBtn($firstPage,$prevPage,$nextPage,$lastPage,page,lastPage);
            this._numberPage($numberPage,page,lastPage);

            $pagerBtn.append($firstPage).append($prevPage).append($numberPage).append($nextPage).append($lastPage);
            return $pagerBtn;
        },

        _updatePagerBtn:function(){
            var op       = this.options,
                pageSize = op.pageSize || 10,
                total    = op.total || 0,
                page     = parseInt(op.page) || 1,
                lastPage = Math.ceil(total / pageSize),

                $pagerBtn   = $(PAGEBTN,this.$pager),
                $firstPage  = $(FIRST,$pagerBtn),
                $prevPage   = $(PREV,$pagerBtn),
                $nextPage   = $(NEXT,$pagerBtn),
                $lastPage   = $(LAST,$pagerBtn),
                $numberPage = $(PAGENUMBER,$pagerBtn);

            this._fourBtn($firstPage,$prevPage,$nextPage,$lastPage,page,lastPage);
            $numberPage.empty();
            this._numberPage($numberPage,page,lastPage);
        },

        _fourBtn:function($firstPage,$prevPage,$nextPage,$lastPage,page,lastPage){
            console.log(page +":"+ lastPage);
            var nextPage = page + 1,
                prevPage = page - 1;
            if(page <= 1){
                $firstPage.addClass("state-disabled");
                $prevPage.addClass("state-disabled");
            }
            else{
                $firstPage.removeClass("state-disabled").data("page",1).attr("data-page",1);
                $prevPage.removeClass("state-disabled").data("page",prevPage).attr("data-page",prevPage);
            }

            if(page >= lastPage){
                $nextPage.addClass("state-disabled");
                $lastPage.addClass("state-disabled");
            }else{
                $nextPage.removeClass("state-disabled").data("page",nextPage).attr("data-page",nextPage);
                $lastPage.removeClass("state-disabled").data("page",lastPage).attr("data-page",lastPage);
            }
        },

        _numberPage:function($numberPage,page,lastPage){
            for(var i=-2; i<3; i++){
                var shiftPage = i + page;
                if(shiftPage>0 && shiftPage <= lastPage){
                    var $li = $("<li></li>"),
                        $a  = $("<a></a>").data("page",shiftPage).text(shiftPage);
                    shiftPage != page ?
                        $a.addClass("pager-num"):
                        $a.addClass("state-selected");
                    $numberPage.append($li.append($a));                    }
            }
        },

        _updatePagerInfo:function(){
            var op       = this.options,
                pageSize = op.pageSize || 10,
                total    = op.total || 0,
                page     = parseInt(op.page) || 1,
                numStart = (page-1) * pageSize + 1,
                numEnd   = (page-1) * pageSize + op.rowsLen,

                $pager     = this.$pager,
                $pagerInfo = $(PAGEINFO,$pager);

            $pagerInfo.text(numStart + ' - ' + numEnd + ' of ' + total + ' items');
        },

        _createPagerInfo:function(){
            var op  = this.options,
                pageSize  = op.pageSize || 10,
                total     = op.total || 0,
                page      = parseInt(op.page) || 1,
                numStart  = (page-1) * pageSize + 1,
                numEnd    = (page-1) * pageSize + op.rowsLen;

            return $("<div></div>").addClass("pager-info").text(numStart + ' - ' + numEnd + ' of ' + total + ' items');
        },

        _page:function(page){
            var op = this.options;
            op.page = page;
            this.options.onPage.call(this,op.page,op.pageSize);
        },

        update:function(page,pageSize,total,rowsLen){
            var op = this.options;
            op.total = total;
            op.rowsLen = rowsLen;
            op.page = page;
            op.pageSize = pageSize;
            this._updatePagerBtn();
            this._updatePagerInfo();
            this.options.onUpdate(this);
        }
    });
    cri.Pager = Pager;
}(window);