/**
 * Author zhouzy
 * Date   2014/9/18
 * grid 组件
 *
 */
!function(window){

    "use strict";

    var cri = window.cri,
        $   = window.jQuery;

    /**
     * 定义分页高度
     */
    var _titleH       = 31, //标题高度
        _toolbarH     = 31, //工具栏高度
        _pagerH       = 41, //分页高度
        _gridHeadH    = 31, //表格头高度
        _cellMinW     = 5;  //单元格最小宽度

    var FIRST = ".fa-angle-double-left",
        PREV  = ".fa-angle-left",
        NEXT  = ".fa-angle-right",
        LAST  = ".fa-angle-double-right";


    /**
     * 默认属性
     * @type {{page: number, pageSize: number, total: number}}
     * @private
     */
    var _defaultOptions = {
        page:1,
        pageSize:10,
        total:0,
        number:0
    };

    var Pager = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        this.pager = null;
        cri.Widgets.apply(this,arguments);
    });

    $.extend(Pager.prototype,{
        _eventListen:function(){
           this.$pager.on("click",FIRST,function(){});
           this.$pager.on("click",FIRST,function(){});
           this.$pager.on("click",FIRST,function(){});
           this.$pager.on("click",FIRST,function(){});
        },

        _init:function () {
            this._createPager(this.$element);
        },

        _createPager:function($parent){
            var op  = this.options,
                pageSize  = op.pageSize || 10,
                total     = op.total || 0,
                page      = parseInt(op.page) || 1,
                firstPage = 1,
                prevPage  = page - 1,
                nextPage  = page + 1,
                lastPage  = Math.ceil(total / pageSize),
                rowLen    = op.rows.length,
                numStart  = (page-1) * pageSize + 1,
                numEnd    = (page-1) * pageSize + rowLen;

            var $pagerNav   = $("<div></div>").addClass("pager-nav"),
                $firstPage  = $("<a></a>").append('<span class="fa fa-angle-double-left"></span>'),
                $lastPage   = $("<a></a>").append('<span class="fa fa-angle-left"></span>'),
                $nextPage   = $("<a></a>").append('<span class="fa fa-angle-right"></span>'),
                $totalPage  = $("<a></a>").append('<span class="fa fa-angle-double-right"></span>'),
                $numberPage = $("<ul></ul>").addClass("pager-number"),
                $pageInfo  = $("<div></div>").addClass("pager-info").text(numStart + ' - ' + numEnd + ' of ' + total + ' items');

            if(page <= 1){
                $firstPage.addClass("state-disabled");
                $lastPage.addClass("state-disabled");
            }
            else{
                $firstPage.data("page",1);
                $lastPage.data("page",lastPage);
            }

            for(var i=-2; i<3; i++){
                var shiftPage = i + page;
                if(shiftPage>0 && shiftPage<=totalPage){
                    var $li = $("<li></li>"),
                        $a  = $("<a></a>").text(shiftPage);
                    shiftPage != page ?
                        $a.addClass("pager-num"):
                        $a.addClass("state-selected");
                    $numberPage.append($li.append($a));                    }
            }

            $pagerNav.append($firstPage).append($lastPage).append($numberPage).append($nextPage).append($totalPage);

            if(page >= lastPage){
                $nextPage.addClass("state-disabled");
                $totalPage.addClass("state-disabled");
            }else{
                $nextPage.data("page",nextPage);
                $totalPage.data("page",lastPage);
            }

            if(this.$pager){
                this.$pager.html($pagerNav);
                this.$pager.append($pageInfo);
            }

            else{
                var $pager = this.$pager = $("<div></div>").addClass("pager");
                $pager.html($pagerNav);
                $pager.append($pageInfo);
                $parent.append($pager);
            }
        },

        _page:function(page){

        },

        _first:function(){
        },

        _prev:function(){
        },

        _next:function(){
        },

        _last:function(){
        }
    });

    cri.Pager = Pager;
}(window);