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
        onPage:null,  //当用户点击翻页按钮时触发
        onUpdate:null //更新翻页信息结束触发
    };

    var FIRSTPAGE = "first-page",
        PREVPAGE  = "prev-page",
        NEXTPAGE  = "next-page",
        LASTPAGE  = "last-page",
        STATEDISABLED = "disabled",
        ACTIVE   = "active";

    var Pager = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        this.pager = null;
        cri.Widgets.apply(this,arguments);
    });

    $.extend(Pager.prototype,{
        _eventListen:function(){
            var that = this;
            this.$pager.find('li').off('click');
            this.$pager.find('li:not(.'+STATEDISABLED+')').on("click",function(e){
                var $li = $(e.target).closest("li");
                var page = $li.data("page");
                that._page(page);
            });
        },

        _init:function () {
            this._createPager(this.$element);
        },

        _createPager:function($parent){
            var $pager   = this.$pager = $("<ul></ul>").addClass("pagination"),
                op       = this.options,
                pageSize = op.pageSize || 10,
                total    = op.total || 0,
                page     = parseInt(op.page) || 1,
                lastPage = Math.ceil(total / pageSize),

                $firstPage  = $('<li></li>').addClass(FIRSTPAGE).append('<a href="#"><span class="fa fa-angle-double-left"></span></a>'),
                $prevPage   = $('<li></li>').addClass(PREVPAGE).append('<a href="#"><span class="fa fa-angle-left"></span></a>'),
                $nextPage   = $('<li></li>').addClass(NEXTPAGE).append('<a href="#"><span class="fa fa-angle-right"></span></a>'),
                $lastPage   = $('<li></li>').addClass(LASTPAGE).append('<a href="#"><span class="fa fa-angle-double-right"></span></a>');

            lastPage = lastPage>0?lastPage:page;
            this._fourBtn($firstPage,$prevPage,$nextPage,$lastPage,page,lastPage);
            $pager.append($firstPage,$prevPage,$nextPage,$lastPage);
            $prevPage.after(this._numberPage(page,lastPage));
            $parent.append($pager);
        },

        _updatePagerBtn:function(){
            var op       = this.options,
                pageSize = op.pageSize || 10,
                total    = op.total || 0,
                page     = parseInt(op.page) || 1,
                lastPage = Math.ceil(total / pageSize),

                $firstPage  = $("." + FIRSTPAGE,this.$pager),
                $prevPage   = $("." + PREVPAGE,this.$pager),
                $nextPage   = $("." + NEXTPAGE,this.$pager),
                $lastPage   = $("." + LASTPAGE,this.$pager),

                $numberPage = $(".number",this.$pager);

            this._fourBtn($firstPage,$prevPage,$nextPage,$lastPage,page,lastPage);
            $numberPage.remove();
            $prevPage.after(this._numberPage(page,lastPage));
        },

        _fourBtn:function($firstPage,$prevPage,$nextPage,$lastPage,page,lastPage){
            var nextPage = page + 1,
                prevPage = page - 1;
            if(page <= 1){
                $firstPage.addClass(STATEDISABLED);
                $prevPage.addClass(STATEDISABLED);
            }
            else{
                $firstPage.removeClass(STATEDISABLED).data("page",1);
                $prevPage.removeClass(STATEDISABLED).data("page",prevPage);
            }

            if(page >= lastPage){
                $nextPage.addClass(STATEDISABLED);
                $lastPage.addClass(STATEDISABLED);
            }else{
                $nextPage.removeClass(STATEDISABLED).data("page",nextPage);
                $lastPage.removeClass(STATEDISABLED).data("page",lastPage);
            }
        },

        _numberPage:function(page,lastPage){
            var start = page > 2 ? page-2:1,
                end   = start + 4,
                numberPage = [];
            start = lastPage > 4 ? (end > lastPage ? lastPage - 4:start):start;
            for(var i=start; i<=end && i<=lastPage; i++){
                var $li = $('<li class="number"></li>').data("page",i),
                    $a  = $('<a href="javascript:void(0);"></a>').text(i);
                i != page ? $li.addClass("pager-num"): $li.addClass(ACTIVE);
                numberPage.push($li.append($a));
            }
            return numberPage;
        },

        _page:function(page){
            var op = this.options;
            op.page = page;
            this.options.onPage.call(this,op.page,op.pageSize);
        },

        update:function(page,pageSize,total){
            var op = this.options;
            if(total !== undefined || total !== null){
                op.total = total;
            }
            op.page = page || op.page;
            op.pageSize = pageSize || op.pageSize;
            this._updatePagerBtn();
            this._eventListen();
            op.onUpdate && op.onUpdate(this);
        }
    });
    cri.Pager = Pager;
}(window);