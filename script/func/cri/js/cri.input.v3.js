/**
 * Author zhouzy
 * Date   2014/9/18
 * Input 组件
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

    var FIRSTPAGE = "first-page",
        PREVPAGE  = "prev-page",
        NEXTPAGE  = "next-page",
        LASTPAGE  = "last-page",
        PAGENUMBER    = "pager-number",
        PAGENAV       = "pager-nav",
        PAGEINFO      = "pager-info",
        STATEDISABLED = "state-disabled",
        STATEDSTATE   = "state-selected";

    var Input = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        this.pager = null;
        cri.Widgets.apply(this,arguments);
    });

    $.extend(Input.prototype,{
        _eventListen:function(){

        },

        _init:function () {
        },

        _createInput:function($parent){
            var $inputGroup = $('<div class="input-group"></div>'),
                $label = $('<label></label>').text();
        }
    });
    cri.Input = Input;
}(window);