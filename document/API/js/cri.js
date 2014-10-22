/**
 * Author zhouzy
 * Date   2014/9/23
 *
 * 青牛软件成都研发中心
 * 前端框架 cri 基础类
 *
 * 版本 v 2.0
 *
 */

!function(window){
    window.cri = {};

    function Class(){}

    Class.extend = function(subType){
        var prototype = (function(prototype){
            function Prototype(){};
            Prototype.prototype = prototype;
            return new Prototype();
        }(this.prototype));

        prototype.constructor = subType;

        subType.prototype = prototype;

        subType.extend = this.extend;

        return subType;
    };

    cri.Class = Class;
}(window);

/*=====================================================================================
 * easy-bootstrap-公用方法 v2.0
 *
 * @author:niyq
 * @date:2013/09/05
 * @dependce:jquery
 *=====================================================================================*/
 function isArray(value){
	if (value instanceof Array ||
	(!(value instanceof Object) &&
	(Object.prototype.toString.call((value)) == '[object Array]') ||
	typeof value.length == 'number' &&
	typeof value.splice != 'undefined' &&
	typeof value.propertyIsEnumerable != 'undefined' &&
	!value.propertyIsEnumerable('splice'))) {
		return 'array';
	}else{
		return typeof value;
	}
 }
/**
 * Author zhouzy
 * Date   2014/10/14
 *
 * jQuery 插件基类
 * 继承自Class
 *
 */
!function(window){

    "use strict";

    var cri = window.cri,
        $   = window.jQuery;

    var Widgets = cri.Class.extend(function(element,options){
        this.$element = $(element);
        this._initOptions(options);
        this._init();
        this._eventListen();
    });

    /**
     * 初始化组件配置参数
     * @param options
     * @private
     */
    Widgets.prototype._initOptions = function(options) {
        this.options = $.extend({}, this.options, options);
    };

    /**
     * 初始化组件DOM结构
     * @private
     */
    Widgets.prototype._init = function(){};

    /**
     * 初始化组件监听事件
     * @private
     */
    Widgets.prototype._eventListen = function(){};

    cri.Widgets = Widgets;
}(window);
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
     * 定义表格标题，工具栏，分页高度
     */
    var _titleH       = 31, //标题高度
        _toolbarH     = 31, //工具栏高度
        _pagerH       = 41, //分页高度
        _gridHeadH    = 31, //表格头高度
        _cellMinW     = 5;  //单元格最小宽度

    /**
     * 计算表格高度
     * 1.若初始化时，定义了高度属性
     * 2.若设置了高度属性(height)
     * 3.若设置了高度样式
     * 4.都未定义 默认auto
     * @param $ele
     * @param height 初始化时指定的高度
     * @private
     */
    function _getElementHeight($ele,height){
        var styleHeight = $ele[0].style.height,
            propHeight  = $ele[0].height,
            calHeight   = height || styleHeight || propHeight;

        if(calHeight){
            var arr = ("" + calHeight).split("%");
            if(arr.length>1){
                calHeight = Math.floor($ele.parent().height() * arr[0] / 100);
            }
            calHeight = (""+calHeight).split("px")[0];
            if(calHeight){
                return parseInt(calHeight);
            }
        }
        else{
            return null;
        }
    }

    /**
     * 获取Grid每列信息
     * @param $table        原始 table jquery对象
     * @param optionColumns 使用 options.columns 初始化列属性
     * @returns {*}         处理后的列属性
     * @private
     */
    function _getColumnsDef($table,optionColumns){

        var columns = optionColumns || (function(){
            var fieldArr = "[";
            $("tr th,td", $table).each(function(){
                var data  = $(this).data("options"),
                    title = $(this).html();
                if(data){
                    fieldArr += "{title:\'" + title + "\'," + data + "},";
                }
                else{
                    fieldArr  += "{title:\'" + title + "\'},";
                }
            });
            fieldArr += "]";
            fieldArr = fieldArr.replace(/\},\]/g, "}]").replace(/\],\]/g, "]]");

            return (new Function("return " + fieldArr))();
        }());

        columns.map(function(column){
            if(column.field && column.width){
                column._width = column.width;
            }
            return column;
        });

        return columns;
    }

    /**
     * 表格默认属性
     * @type {{url: null, param: {}, title: null, toolbar: null, columns: null, rows: null, async: boolean, onClick: null, onDblClick: null, rowNum: boolean, checkBox: boolean, onChecked: null, changeRowCheck: null, pagination: boolean, page: number, pageSize: number, total: number, ajaxDone: null, ajaxError: null}}
     * @private
     */
    var _defaultOptions = {
        url:null,
        param:{},
        title:null,
        toolbar:null,
        columns:null,
        rows:null,
        async:false,
        onClick:null,
        onDblClick:null,
        rowNum:true,
        checkBox:false,
        onChecked:null,//每行checkbox被选中时触发回调函数,当该回调函数返回,参数row,rowid
        changeRowCheck:null,//使某行checkbox为选中或不选中,参数 rowid, isChecked
        pagination:true,
        page:1,
        pageSize:10,
        total:0,
        ajaxDone:null,
        ajaxError:null
    };

    var Grid = cri.Widgets.extend(function(element,options){
        this.options     = _defaultOptions;
        this.$element    = $(element);
        this.$grid       = null;
        this.$gridhead   = null;
        this.$gridbody   = null;
        this.$toolbar    = null;
        this.$page       = null;
        this.$title      = null;
        this._columns    = [];
        this.selectedRow = null;
        this._gridClassName = this._gridClassName || "datagrid";
        cri.Widgets.apply(this,arguments);
    });

    $.extend(Grid.prototype,{
        _eventListen:function(){
            var that = this;
            var op = this.options;
            var dragStartX = 0;

            this.$gridbody
                .on("scroll",function(e){
                    $(".grid-head-wrap",that.$gridhead).scrollLeft($(this).scrollLeft());
                })
                .on('click', "tr", function(e){
                    that.setSelected(e);
                })
                .on('dblclick', "tr", function(e){
                    that.onDblClickRow(e);
                })
                .on("change", "input[type=checkbox]",function(e){
                    var isChecked = $(e.target).prop("checked");
                    var rowid = $(e.target).closest("tr").data("rowid");
                    if(isChecked && op.onChecked){
                        op.onChecked(that.getRowDataById(rowid),rowid);
                    }
                });

            $("body").on("mouseup",function(e){
                that.$gridhead.css("cursor","");
                that.$gridhead.off("mousemove");
            });
            this.$gridhead
                .on('mousedown',".drag-line",function(e){
                    var dragLineIndex = 0;
                    op.rowNum && dragLineIndex++;
                    op.checkBox && dragLineIndex++;

                    dragLineIndex += $(this).data("drag");

                    var $col = $("col:eq("+ dragLineIndex +")",that.$gridhead);
                    that.$gridhead.css("cursor","e-resize");
                    dragStartX = e.pageX;

                    that.$gridhead.on("mousemove",function(e){
                        var px = e.pageX - dragStartX;
                        var width = $col.width() + px;
                        var tableWidth = $("table",that.$gridhead).width();

                        dragStartX = e.pageX;

                        if(width >= _cellMinW){
                            $("table",that.$gridbody).width(tableWidth + px);
                            $("table",that.$gridhead).width(tableWidth + px);
                            $col.width(width);
                            $("col:eq("+ dragLineIndex +")",that.$gridbody).width(width);
                        }
                    });

                })
                .on('click',"input[type=checkbox]",function(e){
                    var isChecked = $(e.target).prop("checked");
                    $("input[type=checkbox]",that.$gridbody).each(function(){
                        $(this).prop("checked",isChecked);
                    });
                    if(isChecked && op.onChecked){
                        for(var i=0;i<op.rows.length;i++){
                            op.onChecked(op.rows[i],i);
                        }
                    }
                });

            this.$toolbar && this.$toolbar
                .on('click',"li[data-toolbar]",function(e){that.clickToolbar(e);});

            this.$page && this.$page
                .on('click',"a[data-page]",function(e){
                    op.page = $(e.target).closest("a").data('page');
                    that.page();
                })
                .on('click','input.renovate',function(e){
                    var pagesize = $("input[name=pagesize]",that.$page).val();
                    var pagenum = $("input[name=pagenum]",that.$page).val();
                    op.page = pagenum;
                    op.pageSize = pagesize;
                    that.page();
                });
        },

        _init:function () {
            this._columns = _getColumnsDef(this.$element,this.options.columns);
            this._getData();
            this._createGrid();
        },

        _createGrid:function(){
            var height = _getElementHeight(this.$element,this.options.height);
            var $grid = $("<div></div>").addClass(this._gridClassName);
            $grid.attr("style",this.$element.attr("style")).show().css("height",height);
            this.$element.wrap($grid);
            this.$element.hide();

            this.$grid = this.$element.parent();
            this._createTitle(this.$grid);
            this._createToolbar(this.$grid);
            this._createGridView(this.$grid,height);
            this._createPage(this.$grid);
        },

        _createGridView:function($parent,height){
            this.$gridview = $("<div></div>").addClass("grid-view");
            this.$gridbody = $("<div></div>").addClass("grid-body");
            this.$gridhead = $("<div></div>").addClass("grid-head");
            $parent.append(this.$gridview.append(this.$gridhead).append(this.$gridbody));

            if(height){
                height -= _gridHeadH;
                this.options.title      && (height -= _titleH);
                this.options.toolbar    && (height -= _toolbarH);
                this.options.pagination && (height -= _pagerH);
                this.$gridbody.css("height",height);
            }

            this._createBody(this.$gridbody);
            this._createHead(this.$gridhead);
        },

        _createTitle:function($grid){
            if(this.options.title){
                this.$title = $('<div class="title"><span>' + this.options.title + '</span></div>');
                $grid.append(this.$title);
            }
        },

        _createHead:function($parent){
            var $headWrap = $("<div></div>").addClass("grid-head-wrap"),
                $table    = $("<table></table>"),
                $tr       = $("<tr></tr>"),
                op        = this.options,
                columns   = this._columns;

            $table.append($("colgroup",this.$gridbody).clone());
            $table.append($tr);

            if(op.checkBox){
                var $lineCheckbox = $("<td></td>").addClass("line-checkbox").append('<span class="td-content"><input type="checkbox"/></span>');
                $tr.append($lineCheckbox);
            }
            if(op.rowNum){
                var $lineNumber = $("<td></td>").addClass("line-number").append('<div class="td-content"></div>');
                $tr.append($lineNumber);
            }

            for(var i = 0,len = columns.length; i<len; i++){
                var $td        = $('<td></td>'),
                    $dragLine  = $('<div></div>').addClass('drag-line').data('drag',i),
                    $tdContent = $('<div></div>').addClass('td-content grid-header-text'),
                    column     = columns[i];
                for(var key in column){
                    var value = column[key];
                    if(key == 'title'){
                        $tdContent.prop('title',value).append(value);
                    }
                    else if(key !== 'field' && key !== 'width'){
                        $td.css(key,value);
                    }
                }
                $td.append($tdContent);
                i < (len - 1) && $td.append($dragLine);
                $tr.append($td);
            }
            $parent.html($headWrap.html($table));
        },

        _createBody:function($parent){
            var $table   = $('<table></table>'),
                op       = this.options,
                id       = 0,
                lineNum  = 1 + op.pageSize * (op.page - 1),
                columns  = this._columns;

            $table.append(this._createColGroup());

            for(var i = 0,len = op.rows.length; i<len; i++){
                var row = op.rows[i];
                var $tr  = $('<tr></tr>').data("rowid",id);

                if(op.checkBox){
                    $tr.append($("<td></td>").addClass("line-checkbox").append('<input type="checkbox"/>'));
                }
                if(op.rowNum){
                    $tr.append($("<td></td>").addClass("line-number").append(lineNum));
                }

                for(var j = 0,length = columns.length; j<length;j++){
                    var $td = $('<td></td>');
                    var $content = $('<div></div>').addClass('td-content');
                    var column = columns[j],
                        text   = row[column.field] || "",
                        _text  = ("" + text).replace(/<.\w+\s*[^<]+>/g,"");
                    $content.prop("title",_text).text(_text);
                    $td.append(_text);
                    $tr.append($td);
                }
                lineNum++;id++;
                $table.append($tr);
            }

            $parent.html($table);
        },

        _createColGroup:function(){
            var $colgroup= $("<colgroup></colgroup>"),
                op       = this.options,
                columns  = this._columns;
            op.checkBox && $colgroup.append($("<col/>").width(30));
            op.rowNum   && $colgroup.append($("<col/>").width(25));

            for(var i= 0,len=columns.length; i<len;i++){
                var $col = $("<col/>");
                columns[i]._width && $col.width(columns[i]._width);
                $colgroup.append($col);
            }
            return $colgroup;
        },
        _createToolbar:function($parent){
            if(this.options.toolbar){
                var $toolbar = $('<div class="toolbar"></div>');
                var html = "<ul>"
                $.each(this.options.toolbar,function(index,data){
                    html += "<li data-toolbar=\"" + index + "\">" + this.text + "</li>";
                });
                html += "</ul>";
                $toolbar.append(html);
                $parent.append($toolbar);
                this.$toolbar = this.$toolbar || $toolbar;
            }
        },

        _createPage:function($parent){
            if(this.options.pagination){
                var op        = this.options,
                    pageSize  = op.pageSize || 10,
                    total     = op.total || 0,
                    page      = parseInt(op.page) || 1,
                    totalPage = Math.ceil(total / pageSize),
                    lastPage  = page - 1,
                    nextPage  = page + 1;

                var $pagerNav   = $("<div></div>").addClass("pager-nav"),
                    $firstPage  = $("<a></a>").append('<span class="fa fa-angle-double-left"></span>'),
                    $lastPage   = $("<a></a>").append('<span class="fa fa-angle-left"></span>'),
                    $nextPage   = $("<a></a>").append('<span class="fa fa-angle-right"></span>'),
                    $totalPage  = $("<a></a>").append('<span class="fa fa-angle-double-right"></span>'),
                    $numberPage = $("<ul></ul>").addClass("pager-number"),
                    $pageInfo   = $("<div></div>").addClass("pager-info").text(((page-1) * pageSize + 1) + ' - ' + (page * pageSize) + ' of ' + total + ' items');

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

                if(page >= totalPage){
                    $nextPage.addClass("state-disabled");
                    $totalPage.addClass("state-disabled");
                }else{
                    $nextPage.data("page",nextPage);
                    $totalPage.data("page",totalPage);
                }

                if(this.$page){
                    this.$page.html($pagerNav);
                    this.$page.append($pageInfo);
                }
                else{
                    var $pager = this.$page = $("<div></div>").addClass("pager");
                    $pager.html($pagerNav);
                    $pager.append($pageInfo);
                    $parent.append($pager);
                }
            }
        },

        _refreshPage:function(){
            if(this.$page){
                var op        = this.options,
                    pageSize  = op.pageSize || 10,
                    total     = op.total || 0,
                    page      = parseInt(op.page) || 1,
                    totalPage = Math.ceil(total / pageSize),
                    lastPage  = page - 1,
                    nextPage  = page + 1;

                var $pagerNav  = $("<div></div>").addClass("pager-nav"),
                    $firstPage = $("<a></a>").addClass("pager-nav first-page").append('<span class="fa fa-angle-double-left"></span>'),
                    $lastPage  = $("<a></a>").addClass("pager-nav last-page").append('<span class="fa fa-angle-left"></span>'),
                    $nextPage  = $("<a></a>").addClass("pager-nav next-page").append('<span class="fa fa-angle-right"></span>'),
                    $totalPage = $("<a></a>").addClass("pager-nav totalPage").append('<span class="fa fa-angle-double-right"></span>'),
                    $pageInfo  = $("<div></div>").addClass("pager-info").text(((page-1) * pageSize + 1) + ' - ' + (page * pageSize) + ' of ' + total + ' items');

                $pagerNav.append($firstPage).append($lastPage);
                if(page <= 1){
                    $firstPage.addClass("state-disabled").data("page",null);
                    $lastPage.addClass("state-disabled").data("page",null);
                }
                else{
                    $firstPage.removeClass("state-disabled").data("page",1);
                    $lastPage.removeClass("state-disabled").data("page",lastPage);
                }
                if(page >= totalPage){
                    $nextPage.addClass("state-disabled").data("page",null);
                    $totalPage.addClass("state-disabled").data("page",null);
                }
                else{
                    $nextPage.removeClass("state-disabled").data("page",nextPage);
                    $totalPage.removeClass("state-disabled").data("page",totalPage);
                }

                for(var i=-2; i<3; i++){
                    var shiftPage = i + page;
                    if(shiftPage>0 && shiftPage<=totalPage){
                        var $numPage = $("<a>").addClass("pager-nav").text(shiftPage);
                        shiftPage != page ?
                            $numPage.addClass("pager-num"):
                            $numPage.addClass("state-selected");
                        $pagerNav.append($numPage);                    }
                }
            }
        },

        _getData:function(){
            var result = true,
                op = this.options;
            if(op.pagination){
                op.param.page = op.page;
                op.param.rows = op.pageSize;
            }
            $.ajax({
                type: "post",
                url: this.options.url,
                success: function(data){
                    if(op.ajaxDone){
                        op.ajaxDone(data);
                    }
                    op.rows = data.rows || [];
                    op.total = data.total || 0;
                },
                error: function(){
                    //TODO: warming developer
                    op.rows = [];
                    op.total = 0;
                },
                complete:function(){
                    //TODO:clear all resource if necessary
                },
                data:op.param,
                dataType:"JSON",
                async:false
            });
            return result;
        },

        _page:function(){
            this._getData();
            this.refreshGridView();
            this._createPage(this.$page);
        },

        refreshGridView:function(){
            this._createBody(this.$gridbody);
            this._createHead(this.$gridhead);
            this._createPage(this.$page);
        },

        reload:function(param){
            param && (this.options.param = param);
            this.selectedRow = null;
            this._getData();
            this.refreshGridView();
        },

        loadData:function(param){
            if(param.push){
                this.options.rows = param;
                this.refreshGridView();
            }
        },

        getMulSelected:function(){
            var mulSelectRow = [],
                that = this;
            $("tr[data-rowid] input[type='checkbox']:checked",this.$gridbody).each(function(){
                var rowid = $(this).closest("tr").data("rowid");
                mulSelectRow.push(that.getRowDataById(rowid));
            });
            return mulSelectRow;
        },

        getSelected:function(){
            return this.selectedRow;
        },

        setSelected:function(e){
            var item = $(e.target).closest("tr")
                ,rowid = item.data('rowid');
            $("tr",this.$gridbody).toggleClass("click",false);
            this.selectedRow = this.getRowDataById(rowid);
            item.toggleClass("click");
            if(this.options.onClick){
                this.options.onClick(this.selectedRow);
            }
        },

        getRowDataById:function(rowid){
            return this.options.rows[parseInt(rowid)];
        },

        onDblClickRow:function(e){
            var op = this.options
                ,item = $(e.target).closest("tr")
                ,rowid = item.data('rowid')
                ,that = this;
            this.selectedRow = this.getRowDataById(rowid);
            if(op.onDblClick){
                op.onDblClick(that.selectedRow);
            }
        },

        clickToolbar:function(e){
            var toolbar = $(e.target)
                ,index = toolbar.data('toolbar');
            this.options.toolbar[index].handler();
        },

        changeRowCheck:function(rowid,isChecked){
            this.options.checkBox &&
            $("tr:eq("+rowid+") input[type=checkbox]",this.$gridbody).prop("checked",isChecked);
        }
    });

    cri.Grid = Grid;
}(window);
/**
 * Author zhouzy
 * Date   2014/9/23
 *
 * DataGrid
 *
 * 依赖 Grid
 */
!function(window){

    var $   = window.jQuery,
        cri = window.cri;

    var DataGrid = cri.DataGrid = cri.Grid.extend(function(element,options){
        cri.Grid.apply(this,arguments);
    });

    $.fn.datagrid = function(option) {
        var datagrid = null;
        this.each(function () {
            var $this   = $(this),
                dg      = $this.data('datagrid'),
            options = typeof option == 'object' && option;
            if(dg != null){
                dg.$grid.before($this).remove();
            }
            $this.data('datagrid', (datagrid = new DataGrid(this, options)));
        });
        return datagrid;
    };

}(window);

/*=====================================================================================
 * easy-bootstrap-popoutWindow v2.0
 *
 * @author:niyq
 * @date:2013/08/22
 * @dependce:jquery
 *=====================================================================================*/
 !function($){

	"use strict";

	var PopoutWindow = function(element,dataOptions){
		var thisObject = this;
		this.$element = $(element);
		this.dataOptions = $.extend({}, $.fn.popoutWindow.defaults, dataOptions);
		this.title = this.$element.attr("title");
		if(this.dataOptions.title)
			this.title = this.dataOptions.title;
		this.id = this.$element.attr("id");
		this.funcArr = {};
		this.init();     //初始化popoutWindowGroup组件
		//this.setStyle();
		/*this.$element.focus(function(){
			var result = thisObject.check();
			if(result == false)
				return false;
			else
				return true;
		});*/
	};

	PopoutWindow.prototype.init = function(){
		var thisObject = this;
		this.$element.wrap('<div class="eb_popoutWindowGroup" id="'+thisObject.id+'_subgroup"></div>');
		this.parent = this.$element.parent();      //parent
		this.parent.data("popoutWindow",thisObject);
		if(thisObject.$element.data("form"))
			this.parent.data("form",thisObject.$element.data("form"));
		this.popoutWindowObj = this.$element;     //popoutWindowObj
		//this.popoutWindowObj.attr("id","");
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

	PopoutWindow.prototype.show = function(url){
		var thisObject = this;
		if(this.parent.css("display") == 'none'){
			if(this.popoutWindowObj.children("iframe.eb_iframe").length<=0 && (url || this.dataOptions.url || this.popoutWindowObj.attr("url") || this.popoutWindowObj.children("div.eb_iframe").length>0)){
				this.src = "";
				if(this.popoutWindowObj.children("div.eb_iframe").length>0)
					this.src = this.popoutWindowObj.children("div.eb_iframe").attr("src");
				if(this.popoutWindowObj.attr("url"))
					this.src = this.popoutWindowObj.attr("url");
				if(this.dataOptions.url)
					this.src = this.dataOptions.url;
				if(url)
					this.src = url;
				var html = '<iframe id="eb_iframe_'+this.id+'" class="eb_iframe" src="'+this.src+'" style="margin:auto" ></iframe>';
				this.popoutWindowObj.html(html);
				this.iframeObj = this.popoutWindowObj.children("iframe.eb_iframe");      //iframeObj
				this.iframeObj.width(thisObject.popoutWindowObj.width()-5).height(thisObject.popoutWindowObj.height()-5);
			}else if(this.popoutWindowObj.children("iframe.eb_iframe").length>0){
				if(url)
					this.src = url;
				var html = '<iframe id="eb_iframe_'+this.id+'" class="eb_iframe" src="'+this.src+'" style="margin:auto" ></iframe>';
				this.popoutWindowObj.html(html);
				this.iframeObj = this.popoutWindowObj.children("iframe.eb_iframe");      //iframeObj
				this.iframeObj.width(thisObject.popoutWindowObj.width()-5).height(thisObject.popoutWindowObj.height()-5);
			}
			this.parent.parent().prepend('<div id="maskX" style="display: none"></div>');
			$("#maskX").css({"opacity":"0.3", "display":"block", "position":"absolute", "background-color":"#fff", "z-index":11})
				.width(document.body.clientWidth)
				.height(document.body.clientHeight);
			this.setPosition();
			this.parent.show();
			}
	};

	PopoutWindow.prototype.hide = function(){
		this.parent.hide();
		$("#maskX").remove();
	};

	PopoutWindow.prototype.setPosition = function(param){
		if(this.dataOptions.fullScreen != true){
			var top = $.fn.popoutWindow.defaults.top;
			var left = $.fn.popoutWindow.defaults.left;
			if(this.dataOptions.top)
				top = this.dataOptions.top;
			if(typeof top == "string")
				top = top.split("px")[0];
			top = top + $(window).scrollTop();
			if(this.dataOptions.left)
				left = this.dataOptions.left;
			if(typeof left == "string")
				left = left.split("px")[0];
			if(param){
				if(param.top){
					if(typeof param.top == "string")
						top = param.top.split("px")[0];
					else
						top = param.top;
				}
				if(param.left){
					if(typeof param.left == "string")
						left = param.left.split("px")[0];
					else
						left = param.left;
				}
			}
			this.parent.css("top",top+"px").css("left",left+"px");
		}
	};

	PopoutWindow.prototype.setFullScreen = function(){
		var width = $(window).width();
		if(typeof width == "string")
			width = width.split("px")[0];
		var height = $(window).height();
		if(typeof height == "string")
			height = height.split("px")[0];
		this.parent.css("top",0).css("left",0);
		this.setWidth(width);
		this.setHeight(height);
		this.parent.css("border-radius","0");
	};

	PopoutWindow.prototype.setWidth = function(widthParam){
		if(this.dataOptions.width){
			var width = this.dataOptions.width;
			if(widthParam)
				width = widthParam;
			if(typeof width == "string")
				width = width.split("px")[0];
			this.parent.width(width);
			this.titleObj.width(width);
			this.popoutWindowObj.width(width);
			this.buttonsBar.width(width);
		}
	};

	PopoutWindow.prototype.setHeight = function(heightParam){
		if(this.dataOptions.height){
			var height = this.dataOptions.height;
			if(heightParam)
				height = heightParam;
			if(typeof height == "string")
				height = height.split("px")[0];
			this.parent.height(height);
			this.popoutWindowObj.height(height-61);
			this.buttonsBar.css("top",height-30+"px");
		}
	};

	PopoutWindow.prototype.setStyle = function(){
		var thisObject = this;
		this.buttonsObj.each(function(){
			$(this).mouseover(function(){
				$(this).addClass("mouseover");
			}).mouseout(function(){
				$(this).removeClass("mouseover");
			}).mousedown(function(){
				$(this).addClass("mousedown");
			}).mouseup(function(){
				$(this).removeClass("mousedown");
			});
		});
		this.titleObj.find(".eb_closeWindowButton").mouseover(function(){
			$(this).addClass("mouseover");
		}).mouseout(function(){
			$(this).removeClass("mouseover");
		}).click(function(){
			thisObject.parent.hide();
			$("#maskX").remove();
		});
	};

	$.fn.popoutWindow = function (option,param) {
		var result = null;
	    var thisObj = this.each(function () {
	    	var $this = $(this)
	        	, thisObject = $this.data('popoutWindow')
	        	, dataOptions = typeof option == 'object' && option;
	    	if(typeof option == 'string' ){
	    		result = thisObject[option](param);
	    	}else{
	    		if(thisObject){

	    		}else{
	    			$this.data('popoutWindow', (thisObject = new PopoutWindow(this, dataOptions)));
	    		}
	    	}
	    });
	    if(typeof option == 'string' )return result;
	    return thisObj;
	};

	$.fn.popoutWindow.defaults = {
		required:false,
		dblclickTimeSpan:250,
		top:30,
		left:60
	};

	$(window).on('load', function(){
		$(".eb_popoutWindow").each(function () {
			var thisObj = $(this)
			, dataOptionsStr = thisObj.data('options');
			if(!dataOptionsStr)
				thisObj.popoutWindow($.fn.popoutWindow.defaults);
			else
				thisObj.popoutWindow((new Function("return {" + dataOptionsStr + "}"))());
		});
	});
}(window.jQuery);

/*=====================================================================================
 * easy-bootstrap-selectBox v2.0
 *
 * @author:niyq
 * @date:2013/08/19
 * @dependce:jquery
 *=====================================================================================*/
 !function($){

	"use strict";

	var SelectBox = function(element,dataOptions){
		var thisObject = this;
		this.$element = $(element);
		this.style = this.$element.attr("style");
		this.dataOptions = $.extend({}, $.fn.selectBox.defaults, dataOptions);
		this.name = this.$element.attr("name");
		this.value = "";
		this.title = "";
		if(this.$element.attr("title"))
			this.title = this.$element.attr("title");
		if(this.dataOptions.title)
			this.title = this.dataOptions.title;
		this.id = this.$element.attr("id");
		this.placeholder = this.$element.attr("placeholder");
		this.init();     //初始化selectBoxGroup组件
		this.inputObj.click(function(){
			$(".eb_timeInput.focus").removeClass("focus");
			$(".eb_timeBox.show").hide().removeClass("show");
			thisObject.toggleDropdownMenu();
		});
		this.blurAction();
		this.stopBubbleTransfer();
	};

	SelectBox.prototype.addOpts = function(param){
		var thisObject = this;
		if(this.dataOptions.multiple != true){
			for(var i in param){
				this.dropdownMenu.append($('<span class="eb_dropdownOption" value="'+i+'">'+param[i]+'</span>').width(thisObject.dropdownMenu.width()-2).mouseover(function(){
					$(this).addClass("mouseover");
				}).mouseout(function(){
					$(this).removeClass("mouseover");
				}).click(function(){
					var value = $(this).attr("value");
					thisObject.setValue(value);
					thisObject.inputObj.focus();
					thisObject.toggleDropdownMenu();
				}));
				this.optionArr["option_"+i] = {text:param[i],value:i};
				var length = this.dropdownMenu.find(".eb_dropdownOption").length;
				this.dropdownMenu.height(length*30);
			}
			if(this.dataOptions.onselectHandler){
				for(var i in param){
					this.dropdownMenu.find(".eb_dropdownOption[value='"+i+"']").each(function(){
						var oldValue;
						$(this).mousedown(function(){
							oldValue = thisObject.parent.attr("value");
						});
						$(this).click(function(){
							var value = $(this).attr("value");
							if(value != oldValue){
								var func = thisObject.dataOptions.onselectHandler;
								if(typeof func == "string")
									func = window[func];
								func(thisObject.parent.get(0));
							}
						});
					});
				}
			}
		}else{
			for(var i in param){
				this.displayAreaObj.append($('<span class="eb_dropdownOption" value="'+i+'"><input type="checkbox" value="'+i+'" class="eb_dropdownCheckbox" /><span>'+param[i]+'</span></span>').width(thisObject.dropdownMenu.width()-2).mouseover(function(){
					$(this).addClass("mouseover");
				}).mouseout(function(){
					$(this).removeClass("mouseover");
				}).click(function(){
					var checked = $(this).children('.eb_dropdownCheckbox').get(0).checked;
					if(checked == true){
						$(this).children('.eb_dropdownCheckbox').get(0).checked = false;
					}else if(checked == false){
						$(this).children('.eb_dropdownCheckbox').get(0).checked = true;
					}
				}).children('.eb_dropdownCheckbox').click(function(event){
					event.stopPropagation();
				}).parent());
				this.optionArr["option_"+i] = {text:param[i],value:i};
				var length = this.dropdownMenu.find(".eb_dropdownOption").length;
				this.dropdownMenu.height(length*30 + 26);
				this.displayAreaObj.height(length*30);
			}
			/*if(this.dataOptions.onselectHandler){
				this.buttonOKObj.click(function(){
					thisObject.dataOptions.onselectHandler(thisObject.selectBoxObj);
				});
			}*/
		}
	};

	SelectBox.prototype.addOpt = function(text,value){
		var thisObject = this;
		if(this.dataOptions.multiple != true){
			this.dropdownMenu.append($('<span class="eb_dropdownOption" value="'+value+'">'+text+'</span>').width(thisObject.dropdownMenu.width()-2).mouseover(function(){
					$(this).addClass("mouseover");
				}).mouseout(function(){
					$(this).removeClass("mouseover");
				}).click(function(){
					var value = $(this).attr("value");
					thisObject.setValue(value);
					thisObject.inputObj.focus();
					thisObject.toggleDropdownMenu();
				}));
			this.optionArr["option_"+value] = {text:text,value:value};
			var length = this.dropdownMenu.find(".eb_dropdownOption").length;
			this.dropdownMenu.height(length*30);
			if(this.dataOptions.onselectHandler){
				this.dropdownMenu.find(".eb_dropdownOption[value='"+value+"']").each(function(){
					var oldValue;
					$(this).mousedown(function(){
						oldValue = thisObject.parent.attr("value");
					});
					$(this).click(function(){
						var value = $(this).attr("value");
						if(value != oldValue){
							var func = thisObject.dataOptions.onselectHandler;
							if(typeof func == "string")
								func = window[func];
							func(thisObject.parent.get(0));
						}
					});
				});
			}
		}else{
			this.displayAreaObj.append($('<span class="eb_dropdownOption" value="'+value+'"><input type="checkbox" value="'+value+'" class="eb_dropdownCheckbox" /><span>'+text+'</span></span>').width(thisObject.dropdownMenu.width()-2).mouseover(function(){
					$(this).addClass("mouseover");
				}).mouseout(function(){
					$(this).removeClass("mouseover");
				}).click(function(){
					var checked = $(this).children('.eb_dropdownCheckbox').get(0).checked;
					if(checked == true){
						$(this).children('.eb_dropdownCheckbox').get(0).checked = false;
					}else if(checked == false){
						$(this).children('.eb_dropdownCheckbox').get(0).checked = true;
					}
				}).children('.eb_dropdownCheckbox').click(function(event){
					event.stopPropagation();
				}).parent());
			this.optionArr["option_"+value] = {text:text,value:value};
			var length = this.dropdownMenu.find(".eb_dropdownOption").length;
			this.dropdownMenu.height(length*30+26);
			this.displayAreaObj.height(length*30);
		}
	};

	SelectBox.prototype.clearOpts = function(){
		this.dropdownMenu.html("").height(30);
		this.setValue("");
	};

	SelectBox.prototype.setValueByIndex = function(index){
		var obj = this.dropdownMenu.find(".eb_dropdownOption").eq(index);
		var value = "";
		if(obj && obj.length>0)
			value = obj.attr("value");
		this.setValue(value);
	};

	SelectBox.prototype.setValue = function(valueParam){
		valueParam = "" + valueParam;
		var thisObject = this;
		var value = "";
		if(valueParam || valueParam == ""){
			value = valueParam;
		}else if(this.dataOptions.defaultVal){
			value = "" + this.dataOptions.defaultVal;
		}
		var valueArr = value.split(",");
		var textArr = [];
		for(var i=0;i<valueArr.length;i++){
			if(this.optionArr["option_"+valueArr[i]])
				textArr.push(this.optionArr["option_"+valueArr[i]].text);
			else
				textArr.push(valueArr[i]);
		}
		var text = "";
		for(var i=0;i<textArr.length;i++){
			if(i<textArr.length-1){
				text = text + textArr[i] + ",";
			}else{
				text = text + textArr[i];
			}
		}
		this.selectBoxObj.html(text);
		this.selectBoxObj.attr("value",value);
		this.parent.attr("value",value);
		if(this.dataOptions.multiple == true){
			var valueArr = value.split(",");
			thisObject.displayAreaObj.find('.eb_dropdownCheckbox').each(function(){
				$(this).get(0).checked = false;
			});
			for(var i=0;i<valueArr.length;i++){
				this.displayAreaObj.find('.eb_dropdownCheckbox[value="'+valueArr[i]+'"]').get(0).checked = true;
			}
		}
		return this.selectBoxObj;
	};

	SelectBox.prototype.getValue = function(){
		var value = this.parent.attr("value");
		return value;
	};

	SelectBox.prototype.getText = function(){
		var value = this.getValue();
		var text = value;
		var textArr = text.split(",");
		for(var i = 0;i<textArr.length;i++){
			if(this.optionArr["option_"+textArr[i]] && this.optionArr["option_"+textArr[i]].text){
				textArr[i] = this.optionArr["option_"+textArr[i]].text;
			}
		}
		/*if(this.optionArr["option_"+value] && this.optionArr["option_"+value].text){
			text = this.optionArr["option_"+value].text;
		}*/
		text = textArr[0];
		for(var j = 1;j<textArr.length;j++){
			text = ","+textArr[j];
		}
		return text;
	}

	SelectBox.prototype.clearValue = function(){
		var thisObject = this;
		if(thisObject.dataOptions.defaultVal)
			this.setValue(thisObject.dataOptions.defaultVal);
		else
			this.setValue("");
	};

	SelectBox.prototype.blurAction = function(){
		var thisObject = this;
		$("body").click(function(){
			$(".eb_show").hide().removeClass('eb_show');
		});
	};

	SelectBox.prototype.stopBubbleTransfer = function(){
		$(".eb_dropdownMenu,.eb_selectBox_hide").each(function(){
			$(this).click(function(event){
				event.stopPropagation();
			});
		});
	};

	SelectBox.prototype.init = function(){
		var thisObject = this;
		this.optionObjArr = this.$element.get(0).getElementsByTagName("option");      //optionObjArr
		this.optionArr = {};
		for(var i=0;i<this.optionObjArr.length;i++){
			this.optionArr["option_"+$(thisObject.optionObjArr[i]).attr("value")] = {text:$(thisObject.optionObjArr[i]).html(),value:$(thisObject.optionObjArr[i]).attr("value")};
		}
		this.dropdownArea = $(".eb_dropdownArea");                            //dropdownArea
		if(this.dropdownArea.length <= 0)      //检查在窗口中有没有 .dropdownArea 如果没有，则添加一个
			$("body").prepend('<div class="eb_dropdownArea"></div>');
		this.dropdownArea = $(".eb_dropdownArea");
		this.$element.wrap('<div class="eb_selectBoxGroup" id="'+thisObject.id+'_subgroup" name="'+thisObject.name+'" value="'+thisObject.value+'" data-options="'+thisObject.$element.data('options')+'" ></div>');
		this.parent = this.$element.parent();                                   //parent
		this.parent.data('selectBox',thisObject);
		this.parent.data('selectBox',thisObject.$element.data('selectBox'));
		var html = "";
		html = html + '<span class="eb_title">'+thisObject.title+'</span>';
		if((this.dataOptions.defaultVal || this.dataOptions.defaultVal == '') && this.optionArr["option_"+this.dataOptions.defaultVal] && this.optionArr["option_"+this.dataOptions.defaultVal].text)
			this.dataOptions.defaultText = this.optionArr["option_"+this.dataOptions.defaultVal].text;
		else if(this.dataOptions.defaultVal || this.dataOptions.defaultVal == '')
			this.dataOptions.defaultText = this.dataOptions.defaultVal;
		else
			this.dataOptions.defaultText = "";
		html = html + '<span class="eb_selectBox" id="'+thisObject.id+'" name="'+thisObject.name+'" value="'+thisObject.value+'" placeholder="'+thisObject.placeholder+'">'+this.dataOptions.defaultText+'</span>';
		html = html + '<span class="eb_selectBoxButton"><span class="eb_selectBoxButtonIcon"></span></span>';
		if(this.dataOptions.required == true)
			html = html + '<span class="redStar" style="color:red;">*</span>';
		this.parent.html(html);
		this.selectBoxObj = this.parent.find(".eb_selectBox");                 //selectBoxObj
		this.selectBoxObj.data("selectBox",thisObject);
		this.selectBoxObj.attr("style",thisObject.style);
		this.titleObj = this.parent.find(".eb_title");                         //titleObj
		this.buttonObj = this.parent.find(".eb_selectBoxButton");              //buttonObj
		//this.$element.attr("class","eb_selectBox_hide");
		this.parent.prepend('<input class="eb_selectBox_hide" />');
		this.inputObj = this.parent.children("input");                         //inputObj
		this.setWidth();
		this.setHeight();
		if(this.dataOptions.multiple == true){
			this.initMultipleDropdownMenu();                                    //初始化为多选下拉框
		}else{
			this.initSingleDropdownMenu();                                      //初始化为单选下拉框
		}
		if(this.dataOptions.defaultVal || this.dataOptions.defaultVal == ''){
			this.setValue(this.dataOptions.defaultVal);
		}
		this.setStyle();                                                       //设置组件样式变化
		this.setEvent();														//绑定事件
	};

	SelectBox.prototype.setWidth = function(){
		if(this.dataOptions.width){
			var width = this.dataOptions.width;
			if(typeof width == "string")
				width = width.split("px")[0];
			this.parent.width(width);
			this.selectBoxObj.width(width-84);
			this.inputObj.width(width-80);
		}
		if(this.dataOptions.titleWidth || this.dataOptions.titleWidth == 0){
			var width = this.dataOptions.width;
			var titleWidth = this.dataOptions.titleWidth;
			if(typeof titleWidth == "string")
				titleWidth = titleWidth.split("px")[0];
			titleWidth = titleWidth + 7;
			var inputWidth = width - titleWidth;
			this.inputObj.width(inputWidth);
			this.selectBoxObj.width(inputWidth-4);
		}
	};

	SelectBox.prototype.setHeight = function(){
		if(this.dataOptions.height){
			var height = this.dataOptions.height;
			if(typeof height == "string")
				height = height.split("px")[0];
			this.parent.height(height);
			this.parent.css("line-height",height+"px");
			this.selectBoxObj.height(height);
			this.selectBoxObj.css("line-height",height+"px");
			this.inputObj.height(height);
			this.buttonObj.height(height-2);
			this.buttonObj.css("line-height",height-2+"px");
		}
	};

	SelectBox.prototype.initSingleDropdownMenu = function(){
		var thisObject = this;
		this.dropdownArea.append('<div class="eb_dropdownMenu" id="eb_dropdownMenu_'+thisObject.id+'"></div>');
		this.dropdownMenu = this.dropdownArea.children("#eb_dropdownMenu_"+thisObject.id);     //dropdownMenu
		var width = this.selectBoxObj.width() + 2;

		for(var i in this.optionArr){
			this.dropdownMenu.append('<span class="eb_dropdownOption" value="'+thisObject.optionArr[i].value+'">'+thisObject.optionArr[i].text+'</span>');
		}
		var height = this.dropdownMenu.find(".eb_dropdownOption").length*30;
		this.dropdownMenu.width(width);
		this.dropdownMenu.height(height);
		this.dropdownMenu.find(".eb_dropdownOption").width(width-2);
		this.dropdownMenu.find(".eb_dropdownOption").each(function(){
			$(this).click(function(){
				var value = $(this).attr("value");
				thisObject.setValue(value);
				thisObject.inputObj.focus();
				thisObject.toggleDropdownMenu();
			});
		});
	};

	SelectBox.prototype.initMultipleDropdownMenu = function(){
		var thisObject = this;
		this.dropdownArea.append('<div class="eb_dropdownMenu" id="eb_dropdownMenu_'+thisObject.id+'"></div>');
		this.dropdownMenu = this.dropdownArea.children("#eb_dropdownMenu_"+thisObject.id);     //dropdownMenu
		var width = this.selectBoxObj.width() + 2;
		this.dropdownMenu.html('<div class="eb_displayArea"></div>');
		this.displayAreaObj = this.dropdownMenu.children('.eb_displayArea');                  //displayAreaObj
		this.dropdownMenu.css('overflow-y','hidden');
		for(var i in this.optionArr){
			this.displayAreaObj.append('<span class="eb_dropdownOption" value="'+thisObject.optionArr[i].value+'"><input type="checkbox" value="'+thisObject.optionArr[i].value+'" class="eb_dropdownCheckbox" /><span>'+thisObject.optionArr[i].text+'</span></span>');
		}
		if(this.dataOptions.defaultVal){
			var defaultVal = this.dataOptions.defaultVal;
			defaultVal = defaultVal.split(",");
			for(var i=0;i<defaultVal.length;i++){
				this.displayAreaObj.find(".eb_dropdownCheckbox[value='"+defaultVal[i]+"']").get(0).checked = true;
			}
		}
		var height = this.dropdownMenu.find(".eb_dropdownOption").length*30;
		this.dropdownMenu.width(width);
		this.dropdownMenu.height(height+26);
		this.displayAreaObj.width(width);
		this.displayAreaObj.height(height);
		this.dropdownMenu.find(".eb_dropdownOption").width(width-2);
		this.dropdownMenu.find(".eb_dropdownCheckbox").click(function(event){
			event.stopPropagation();
		});
		this.dropdownMenu.find(".eb_dropdownOption").each(function(){
			$(this).click(function(){
				var check = $(this).children(".eb_dropdownCheckbox").get(0).checked;
				if(check == true){
					$(this).children(".eb_dropdownCheckbox").get(0).checked = false;
				}else{
					$(this).children(".eb_dropdownCheckbox").get(0).checked = true;
				}
			});
		});
		this.dropdownMenu.append($('<div class="eb_dropdownButtonsBar"><div class="eb_buttonOK">确定</div><div class="eb_buttonCancel">取消</div></div>'));
		this.buttonsBarObj = this.dropdownMenu.children('.eb_dropdownButtonsBar');                               //buttonsBarObj
		this.buttonOKObj = this.buttonsBarObj.children('.eb_buttonOK');                                             //buttonOKObj
		this.buttonCancelObj = this.buttonsBarObj.children('.eb_buttonCancel');                                             //buttonCancelObj
		this.buttonsBarObj.width(width-2);
		this.buttonOKObj.width((width-2)/2);
		this.buttonCancelObj.width((width-2)/2).css('left',(width-2)/2+'px');
		this.buttonsBarObj.children('div').each(function(){
			$(this).mouseover(function(){
				$(this).addClass('mouseover');
			}).mouseout(function(){
				$(this).removeClass('mouseover');
			});
		});
		this.buttonCancelObj.click(function(){
			thisObject.dropdownMenu.hide().removeClass('eb_show');
		});

		this.buttonOKObj.click(function(){
			var valueArr = [];
			var textArr = [];
			thisObject.dropdownMenu.find(".eb_dropdownCheckbox").each(function(){
				if($(this).get(0).checked == true){
					valueArr.push($(this).attr("value"));
					textArr.push($(this).next().html());
				}
			});
			var value = "";
			var text = '<span style="display:inline-block;max-height:21px;max-width:'+(thisObject.selectBoxObj.width()-40)+'px;overflow:hidden;word-break:break-all;">';
			for(var i=0;i<valueArr.length;i++){
				if(i<valueArr.length-1){
					value = value + valueArr[i] + ",";
					text = text + textArr[i] + ",";
				}else{
					value = value + valueArr[i];
					text = text + textArr[i] + '</span>';
				}
			}
			thisObject.parent.attr('value',value);
			thisObject.selectBoxObj.attr('value',value).html(text);
			if(thisObject.selectBoxObj.children('span').get(0).offsetHeight>20){
				thisObject.selectBoxObj.append('<span style="position:relative;top:-6px;">...</span>');
			};
			thisObject.inputObj.focus();
			thisObject.toggleDropdownMenu();
		});
		this.buttonsBarObj.width(thisObject.dropdownMenu.get(0).clientWidth-2);
	}

	SelectBox.prototype.toggleDropdownMenu = function(){
		if(this.dropdownMenu.attr("class").indexOf("eb_show")>=0){
			this.hideDropdownMenu();
		}else{
			this.showDropdownMenu();
		}
	};

	SelectBox.prototype.showDropdownMenu = function(){
		this.locatDropdownMenu();
		$(".eb_dropdownMenu.eb_show").hide().removeClass("eb_show");
		this.dropdownMenu.slideDown('fast').addClass("eb_show");
	};

	SelectBox.prototype.hideDropdownMenu = function(){
		this.dropdownMenu.hide().removeClass("eb_show");
	};

	SelectBox.prototype.locatDropdownMenu = function(){
		var top = this.selectBoxObj.offset().top;
		var left = this.selectBoxObj.offset().left;
		var scrollTop = $(window).scrollTop();
		var scrollLeft = $(window).scrollLeft();
		top = top + this.selectBoxObj.height();
		if(navigator.userAgent.indexOf("Firefox")>=0)
			top = top + 4;
		left = left + 1;
		$(this.dropdownMenu).css("left",left).css("top",top+this.$element.height()+3);
	};

	SelectBox.prototype.setStyle = function(){
		var thisObject = this;
		this.inputObj.focus(function(){
			thisObject.selectBoxObj.addClass("focus");
			thisObject.buttonObj.addClass("focus");
		}).blur(function(){
			thisObject.selectBoxObj.removeClass("focus");
			thisObject.buttonObj.removeClass("focus");
		});
		this.dropdownMenu.click(function(){
			thisObject.selectBoxObj.addClass("focus");
			thisObject.buttonObj.addClass("focus");
		}).find(".eb_dropdownOption").each(function(){
			$(this).mouseover(function(){
				$(this).addClass("mouseover");
			}).mouseout(function(){
				$(this).removeClass("mouseover");
			});
		});
	};

	SelectBox.prototype.check = function(){
		var thisObject = this;
		var result = {length:0,result:true};
		var val = this.getValue();
		if(this.dataOptions.required == true){
			if(!val && val!=""){
				result['required'] = 'fail';
				result.result = false;
				result.length++;
			}
		}
		return result;
	};

	SelectBox.prototype.setEvent = function(){
		var thisObject = this;
		if(this.dataOptions.onclickHandler){
			this.selectBoxObj.click(function(){
				var func = thisObject.dataOptions.onclickHandler;
				if(typeof func == "string"){
					func = window[func];
				}
				func(thisObject.parent.get(0));
			});
		}
		if(this.dataOptions.onselectHandler){
			if(this.dataOptions.multiple != true){
				this.dropdownMenu.find(".eb_dropdownOption").each(function(){
					var oldValue;
					$(this).mousedown(function(){
						oldValue = thisObject.parent.attr("value");
					});
					$(this).click(function(){
						var value = $(this).attr("value");
						if(value != oldValue){
							var func = thisObject.dataOptions.onselectHandler;
							if(typeof func == "string")
								func = window[func];
							func(thisObject.parent.get(0));
						}
					});
				});
			}else{
				this.buttonOKObj.click(function(){
					this.dataOptions.onselectHandler(thisObject.selectBoxObj);
				});
			}
		}
	};

	$.fn.selectBox = function (option,param,param1) {
		var result = null;
	    var thisObj = this.each(function () {
	    	var $this = $(this)
	        	, thisObject = $this.data('selectBox')
	        	, dataOptions = typeof option == 'object' && option;
	    	if(typeof option == 'string' ){
	    		result = thisObject[option](param,param1);
	    	}else{
	    		$this.data('selectBox', (thisObject = new SelectBox(this, dataOptions)));
	    	}
	    });
	    if(typeof option == 'string' )return result;
	    return thisObj;
	};

	$.fn.selectBox.defaults = {
		required:false,
		dblclickTimeSpan:250,
		multiple:false,
		width:250,
		height:20,
		titleWidth:73
	};

	$(window).on('load', function(){
		$(".eb_selectBox").each(function () {
			var thisObj = $(this)
			, dataOptionsStr = thisObj.data('options');
			if(!dataOptionsStr)
				thisObj.selectBox($.fn.selectBox.defaults);
			else
				thisObj.selectBox((new Function("return {" + dataOptionsStr + "}"))());
		});
	});
}(window.jQuery);
/*=====================================================================================
 * easy-bootstrap-tabPage v2.0
 *
 * @author:niyq
 * @date:2013/09/04
 * @dependce:jquery
 *=====================================================================================*/
 !function($){

	"use strict";

	var TabPage = function(element,dataOptions){
		var thisObject = this;
		this.$element = $(element);
		this.dataOptions = $.extend({}, $.fn.tabPage.defaults, dataOptions);
		this.title = this.$element.attr("title");
		this.id = this.$element.attr("id");
		this.init();
	};

	TabPage.prototype.setHeadBarView = function(myObj){
		var thisObject = this;
		var obj = this.headBarObj.children('.eb_tabPageHead.on');
		if(myObj)
			obj = myObj;
		var objLeft = obj.offset().left;
		var objRight = obj.offset().left + obj.width() + 61;
		var headBarPanelLeft = this.headBarPanelObj.offset().left;
		var headBarPanelRight = this.headBarPanelObj.offset().left + this.headBarPanelObj.width();
		if(objLeft < headBarPanelLeft){
			this.headMoveLeft(obj);
		}else if(objRight > headBarPanelRight){
			this.headMoveRight(obj);
		}
	};

	TabPage.prototype.headMoveLeft = function(givenObj){
		var thisObject = this;
		var headBarPanelLeft = this.headBarPanelObj.offset().left;
		var headBarLILeft = null;
		var headBarLeftOffset = this.headBarObj.offset().left;
		var headBarLeft = this.headBarObj.css("left");
		if(typeof headBarLeft == "string")
			headBarLeft = headBarLeft.split("px")[0];
		var distance;
		if(givenObj){
			headBarLILeft = givenObj.offset().left;
		}else{
			this.headBarObj.children('.eb_tabPageHead').each(function(){
				var left = $(this).offset().left;
				if((left-headBarPanelLeft)<-25){
					headBarLILeft = left;
				}
			});
			if(headBarLILeft == null)
				headBarLILeft = this.headBarObj.children('.eb_tabPageHead').first().offset().left;
		}
		var distance = headBarPanelLeft - headBarLILeft;
		var newLeft =  parseInt(headBarLeft) + parseInt(distance);
		this.headBarObj.animate({left:newLeft},200,'',function(){
			if(thisObject.headBarObj.offset().left >= thisObject.headBarPanelObj.offset().left){
				thisObject.leftBtnObj.children('.eb_arrow02L').hide();
			}else{
				thisObject.leftBtnObj.children('.eb_arrow02L').show();
			}
			if(thisObject.headBarObj.offset().left + thisObject.headBarObj.width() <= thisObject.headBarPanelObj.offset().left + thisObject.headBarPanelObj.width()){
				thisObject.rightBtnObj.children('.eb_arrow02R').hide();
			}else{
				thisObject.rightBtnObj.children('.eb_arrow02R').show();
			}
		});
	};

	TabPage.prototype.headMoveRight = function(givenObj){
		var thisObject = this;
		var headBarPanelRight = this.headBarPanelObj.offset().left + this.headBarPanelObj.width();
		var headBarLIleft = headBarPanelRight;
		var headBarLIRight;
		var headBarLeft = parseInt(this.headBarObj.css("left"));
		var obj;
		this.headBarObj.children('.eb_tabPageHead').each(function(){
			var left = $(this).offset().left;
			if(left <= headBarPanelRight+25){
				headBarLIleft = left;
				obj = $(this);
			}
		});
		if(obj.length<=0)
			obj = this.headBarObj.children('.eb_tabPageHead').last();
		if(givenObj){
			obj = givenObj;
			headBarLIleft = givenObj.offset().left;
		}
		headBarLIRight = headBarLIleft + (obj.width()+61);
		var distance = headBarLIRight - headBarPanelRight;
		var newLeft = headBarLeft - distance;
		this.headBarObj.animate({left:newLeft},200,'',function(){
			if(thisObject.headBarObj.offset().left >= thisObject.headBarPanelObj.offset().left){
				thisObject.leftBtnObj.children('.eb_arrow02L').hide();
			}else{
				thisObject.leftBtnObj.children('.eb_arrow02L').show();
			}
			if(thisObject.headBarObj.offset().left + thisObject.countWidth() <= thisObject.headBarPanelObj.offset().left + thisObject.headBarPanelObj.width()){
				thisObject.rightBtnObj.children('.eb_arrow02R').hide();
			}else{
				thisObject.rightBtnObj.children('.eb_arrow02R').show();
			}
		});
	}

	TabPage.prototype.toggleHeadBtn = function(){
		var thisObject = this;
		var parentWidth = this.parent.width();
		var pageHeadTotalWidth = this.countWidth();
		//alert("parentWidth="+parentWidth+",pageHeadTotalWidth="+pageHeadTotalWidth+",typeof parentWidth="+(typeof pageHeadTotalWidth));
		if(pageHeadTotalWidth > (parentWidth-14)){
			this.headBarPanelObj.width(parentWidth-16).css("left","8px");
			this.leftBtnObj.show();
			this.rightBtnObj.show();
		}else{
			this.headBarPanelObj.width(parentWidth-2).css("left","0");
			this.leftBtnObj.hide();
			this.rightBtnObj.hide();
			this.headBarObj.css("left","0");
		}
	}

	TabPage.prototype.countWidth = function(){
		var thisObject = this;
		var parentWidth = this.parent.width();
		var pageHeadTotalWidth = 0;
		this.headBarObj.children('.eb_tabPageHead').each(function(){
			pageHeadTotalWidth = pageHeadTotalWidth + $(this).width() + 61;
		});
		return pageHeadTotalWidth;
	}

	TabPage.prototype.setWidth = function(widthNum){
		var thisObject = this;
		var width;
		if(this.dataOptions.width)
			width = this.dataOptions.width;
		if(widthNum)
			width = widthNum;
		if(typeof width == "string")
			width = width.split("px")[0];
		this.parent.width(width);
		//this.headBarObj.width(width-2);
		this.headBarPanelObj.width(width-2);
		this.headBarBGObj.width(width-2);
		this.parent.children('.eb_tabPageBody').each(function(){
			$(this).width(width-2);
		});
		this.parent.children('.eb_tabPageBody').children('.eb_iframe').each(function(){
			$(this).width(width-2);
		});
		this.toggleHeadBtn();
	};

	TabPage.prototype.setHeight = function(heightNum){
		var thisObject = this;
		var height;
		if(this.dataOptions.height)
			height = this.dataOptions.height;
		if(heightNum)
			height = heightNum;
		if(typeof height == "string")
			height = height.split("px")[0];
		this.parent.height(height);
		this.parent.children('.eb_tabPageBody').each(function(){
			$(this).height(height-37);
		});
		this.parent.children('.eb_tabPageBody').children('.eb_iframe').each(function(){
			$(this).height(height-37);
		});
	};

	TabPage.prototype.remove = function(name){
		var thisObject = this;
		var cls = this.headBarObj.children('.eb_tabPageHead[name="'+name+'"]').attr("class");
		var next = this.parent.children('.eb_tabPageBody[name="'+name+'"]').next();
		this.parent.children('.eb_tabPageBody[name="'+name+'"]').remove();
		this.headBarObj.children('.eb_tabPageHead[name="'+name+'"]').remove();
		if(cls.indexOf(' on')>=0){
			var name = '';
			if(next.length>0){
				name = next.attr("name");
			}else{
				var objArr = thisObject.headBarObj.get(0).getElementsByTagName('span');
				var obj = objArr[objArr.length-1];
				name = $(obj).attr('name');
			}
			this.select(name);
		}
		var lastObj = this.headBarObj.children('.eb_tabPageHead').last();
		if(lastObj.length>0 && (lastObj.offset().left + lastObj.width() < this.headBarPanelObj.offset().left + this.headBarPanelObj.width() && this.countWidth() > this.headBarPanelObj.width()-14)){
			this.headMoveRight(lastObj);
		}
		this.toggleHeadBtn();
	};

	TabPage.prototype.removeByNum = function(num){
		var thisObject = this;
		var objArr = thisObject.headBarObj.get(0).getElementsByTagName('span');
		if(num < 0 || num > objArr.length-1){
			alert('$(selecter).tabPage("remove",num) 方法输入的数字超出范围！');
			return false;
		}
		var obj = objArr[num];
		var name = $(obj).attr('name');
		this.remove(name);
	};

	TabPage.prototype.select = function(name){
		var thisObject = this;
		if(this.headBarObj.children('.eb_tabPageHead[name="'+name+'"]').length>0 && this.headBarObj.children('.eb_tabPageHead[name="'+name+'"]').attr("class").indexOf(" on")<0){
			var thisObj = this.headBarObj.children('.eb_tabPageHead[name="'+name+'"]');
			thisObject.headBarObj.find('.on').removeClass('on');
			$(thisObj).addClass("on");
			thisObject.parent.find(".eb_tabPageBody").hide();
			var bodyObj = thisObject.getBody($(thisObj));
			if(bodyObj.children('div.eb_iframe').length>0){
				var src = '';
				var html = '';
				src = bodyObj.children('.eb_iframe').attr('src');
				html = html + '<iframe src="'+src+'" class="eb_iframe"></iframe>';
				bodyObj.html(html);
			}
			bodyObj.show();
			this.setHeadBarView();
		}
	};

	TabPage.prototype.selectByNum = function(num){
		var thisObject = this;
		var objArr = thisObject.headBarObj.get(0).getElementsByTagName('span');
		if(num < 0 || num > objArr.length-1){
			alert('$(selecter).tabPage("remove",num) 方法输入的数字超出范围！');
			return false;
		}
		var obj = objArr[num];
		var name = $(obj).attr('name');
		this.select(name);
	};

	TabPage.prototype.add = function(param){
		var thisObject = this;
		var arr = [];
		if(isArray(param) == 'array')
			arr = param;
		else if(isArray(param) == "object")
			arr[0] = param;
		else
			alert("$(selecter).tabPage('add',param) 方法传入参数错误！");
		for(var i = 0;i<arr.length;i++){
			var obj = arr[i];
			if(this.headBarObj.children('.eb_tabPageHead[name="'+obj.name+'"]').length>0){
				thisObject.select(obj.name);
			}else{
				this.parent.append($('<div class="eb_tabPageBody" style="display:none" name="'+obj.name+'"><iframe src="'+obj.src+'" class="eb_iframe"></iframe></div>'));
				this.headBarObj.append($('<span class="eb_tabPageHead" name="'+obj.name+'">'+obj.title+'</span>').click(function(){
					var thisObj = this;
					if($(this).attr("class").indexOf(" on")<0){
						thisObject.headBarObj.find('.on').removeClass('on');
						$(this).addClass("on");
						thisObject.parent.find(".eb_tabPageBody").hide();
						thisObject.getBody($(thisObj)).show();
					}
					thisObject.setHeadBarView();
				}).append($('<div class="eb_tabPageCloseBtn">x</div>').click(function(){
					var name = $(this).parent().attr("name");
					thisObject.remove(name);
				}).mouseover(function(){
					$(this).addClass("mouseover");
				}).mouseout(function(){
					$(this).removeClass("mouseover");
				})).mouseover(function(){
					$(this).children('.eb_tabPageCloseBtn').show();
				}).mouseout(function(){
					$(this).children('.eb_tabPageCloseBtn').hide();
				}));
				if(this.countWidth()>this.headBarPanelObj.width()-14){
				givenObj = this.headBarObj.children('.eb_tabPageHead').last();
				this.headMoveRight(givenObj);
		}
			}
		}
		var showPageName = arr[arr.length-1].name;
		this.select(showPageName);
		this.setWidth(thisObject.parent.width());
		this.setHeight(thisObject.parent.height());
		this.toggleHeadBtn();
		var givenObj = null;

	};

	TabPage.prototype.init = function(){
		var thisObject = this;
		this.parent = this.$element;          //parent
		this.parent.children('div').each(function(){
			$(this).addClass('eb_tabPageBody');
		});
		this.parent.prepend($('<div class="eb_headBar"></div>'));
		this.headBarObj = this.parent.children('.eb_headBar');                //headBarObj
		this.headBarObj.wrap($('<div class="eb_headBarPanel"></div>'));
		this.headBarPanelObj = this.headBarObj.parent();                      //headBarPanelObj
		this.headBarPanelObj.wrap($('<div class="eb_headBarBG"></div>'));
		this.headBarBGObj = this.headBarPanelObj.parent();                    //headBarBGObj
		this.headBarBGObj.prepend($('<div class="eb_headBarLeftBtn"><div class="eb_arrow02L"></div></div>').mouseover(function(){
			$(this).addClass('mouseover');
		}).mouseout(function(){
			$(this).removeClass('mouseover');
		}).mousedown(function(){
			$(this).addClass('mousedown');
		}).mouseup(function(){
			$(this).removeClass('mousedown');
		}).click(function(){
			thisObject.headMoveLeft();
		})).append($('<div class="eb_headBarRightBtn"><div class="eb_arrow02R"></div></div>').mouseover(function(){
			$(this).addClass('mouseover');
		}).mouseout(function(){
			$(this).removeClass('mouseover');
		}).mousedown(function(){
			$(this).addClass('mousedown');
		}).mouseup(function(){
			$(this).removeClass('mousedown');
		}).click(function(){
			thisObject.headMoveRight();
		}));
		this.leftBtnObj = this.headBarBGObj.children('.eb_headBarLeftBtn');   //leftBtnObj
		this.rightBtnObj = this.headBarBGObj.children('.eb_headBarRightBtn');  //rightBtnObj
		this.bodyObjArr = {};                                                //bodyObjArr
		this.parent.children('.eb_tabPageBody').each(function(){
			var thisObj = this;
			thisObject.bodyObjArr[$(thisObj).attr('name')] = $(this);
		});
		for(var i in this.bodyObjArr){
			var title = '';
			var dataOptions = null;
			if(this.bodyObjArr[i].attr('title'))
				title = this.bodyObjArr[i].attr('title');
			if(this.bodyObjArr[i].data('options') && (dataOptions = (new Function('return {'+this.bodyObjArr[i].data('options')+'}'))()) && dataOptions.title)
				title = dataOptions.title;
			this.headBarObj.append($('<span class="eb_tabPageHead" name="'+i+'">'+title+'</span>').click(function(){
				var thisObj = this;
				if($(this).attr("class").indexOf(" on")<0){
					var name = $(this).attr("name");
					thisObject.select(name);
				}
				thisObject.setHeadBarView();
			}).append($('<div class="eb_tabPageCloseBtn">x</div>').click(function(){
				var name = $(this).parent().attr("name");
				thisObject.remove(name);
			}).mouseover(function(){
				$(this).addClass("mouseover");
			}).mouseout(function(){
				$(this).removeClass("mouseover");
			})).mouseover(function(){
				$(this).children('.eb_tabPageCloseBtn').show();
			}).mouseout(function(){
				$(this).children('.eb_tabPageCloseBtn').hide();
			}));
		}
		this.headObjArr = {};                                                 //headObjArr
		this.headBarObj.children(".eb_tabPageHead").each(function(){
			var thisObj = this;
			thisObject.headObjArr[$(thisObj).attr('name')] = $(this);
		});
		this.headBarObj.children(".eb_tabPageHead").first().addClass("on");    //将第一项设置为显示状态
		this.getBody(thisObject.headBarObj.children(".eb_tabPageHead").first()).show();           //将第一项设置为显示状态
		/*this.parent.children('.eb_tabPageBody').each(function(){
			var thisObj = this;
			if($(this).children('.eb_iframe').length>0){
				var src = '';
				var html = '';
				src = $(this).children('.eb_iframe').attr('src');
				html = html + '<iframe src="'+src+'" class="eb_iframe"></iframe>';
				$(this).html(html);
			}
		});*/
		this.setWidth();
		this.setHeight();
		this.toggleHeadBtn();
	};

	TabPage.prototype.getBody = function(headObj){
		var name = headObj.attr("name");
		var bodyObj = this.parent.children(".eb_tabPageBody[name='"+name+"']");
		return bodyObj;
	};

	TabPage.prototype.getBodyByNum = function(num){
		var thisObject = this;
		var length = thisObject.headBarObj.get(0).getElementsByTagName('span').length;
		if(num >= length)
			num = length-1;
		else if(num<0)
			num = 0;
		var name = $(thisObject.headBarObj.get(0).getElementsByTagName('span')[num]).attr("name");
		var bodyObj = this.parent.children(".eb_tabPageBody[name='"+name+"']");
		return bodyObj;
	};

	TabPage.prototype.setAction = function(){

	};

	$.fn.tabPage = function (option,param) {
		var result = null;
	    var thisObj = this.each(function () {
	    	var $this = $(this)
	        	, thisObject = $this.data('tabPage')
	        	, dataOptions = typeof option == 'object' && option;
	    	if(typeof option == 'string' ){
	    		result = thisObject[option](param);
	    	}else{
	    		$this.data('tabPage', (thisObject = new TabPage(this, dataOptions)));
	    	}
	    });
	    if(typeof option == 'string' )return result;
	    return thisObj;
	};

	$.fn.tabPage.defaults = {

	};

	$(window).on('load', function(){
		$(".eb_tabPage").each(function () {
			var thisObj = $(this)
			, dataOptionsStr = thisObj.data('options');
			if(!dataOptionsStr)
				thisObj.tabPage($.fn.tabPage.defaults);
			else
				thisObj.tabPage((new Function("return {" + dataOptionsStr + "}"))());
		});
	});
}(window.jQuery);
/*=====================================================================================
 * easy-bootstrap-timeInput v2.0
 *
 * @author:niyq
 * @date:2013/09/05
 * @dependce:jquery
 *=====================================================================================*/
 !function($){

	"use strict";

	var TimeInput = function(element,dataOptions){
		this.$element = $(element);
		this.$element.keypress(function(){
			return false;
		}).val("");
		this.dataOptions = $.extend({}, $.fn.timeInput.defaults, dataOptions);
		this.name = this.$element.attr("name");
		this.id = this.$element.attr("id");
		this.thisYear = new Date().getFullYear();
		this.thisMonth = new Date().getMonth()+1;
		if(this.thisMonth<10)
			this.thisMonth = "0"+this.thisMonth;
		this.today = new Date().getDate();
		this.year = new Date().getFullYear();
		this.month = new Date().getMonth()+1;
		if(this.month<10)
			this.month = "0"+this.month;
		this.monthArr = new Array();
		this.ifEnable = true;
		this.value = "";
		this.id = this.$element.attr("id");
		this.timeBoxId = "timeBox_"+this.id;
		this.title = "时间";
		if(this.$element.attr("title"))
			this.title = this.$element.attr("title");
		if(this.dataOptions.title)
			this.title = this.dataOptions.title;
		this.init();

	};//Timeinput

	TimeInput.prototype.enabled = function(){
		this.ifEnable = true;
	};

	TimeInput.prototype.disabled = function(){
		this.ifEnable = false;
	};

	TimeInput.prototype.setWidth = function(widthParam){
		var width = this.dataOptions.width;
		if(widthParam)
			width = widthParam;
		if(typeof width == "string")
			width = width.split("px")[0];
		this.parent.width(width);
		this.inputObj.width(width-85);
		if(this.dataOptions.titleWidth || this.dataOptions.titleWidth == 0){
			var titleWidth = this.dataOptions.titleWidth;
			if(typeof titleWidth == "string")
				titleWidth = titleWidth.split("px")[0];
			titleWidth = titleWidth - 1;
			var inputWidth = width - titleWidth - 13;
			this.inputObj.width(inputWidth);
			this.titleObj.width(titleWidth);
		}
	};

	TimeInput.prototype.setHeight = function(heightParam){
		var height = this.dataOptions.height;
		if(heightParam)
			height = heightParam;
		if(typeof height == "string")
			height = height.split("px")[0];
		this.parent.height(height);
		this.parent.css("line-height",height+"px");
		this.inputObj.height(height-2);
		this.inputObj.css("line-height",(height-2)+"px");
		this.titleObj.height(height);
		this.titleObj.css("line-height",height+"px");
	};

	TimeInput.prototype.init = function(){
		var thisObject = this;
		if(this.dataOptions.required == true){
			this.$element.attr("placeholder",thisObject.$element.attr("placeholder")+" (必填)");
		}
		this.inputObj = this.$element;                 //inputObj

		this.inputObj.wrap($("<div class=\"eb_timeInputGroup\"></div>"));
		this.parent = this.inputObj.parent();                       //parent
		this.parent.data("timeInput",thisObject);
		this.parent.attr("name",thisObject.name).attr("id",thisObject.id + "_subgroup");
		this.parent.data("options",thisObject.$element.data("options"));
		if(this.dataOptions && this.dataOptions.defaultVal){
			this.inputObj.val(thisObject.dataOptions.defaultVal);
			this.parent.attr("value",thisObject.dataOptions.defaultVal);
		}
		this.parent.prepend($('<span class="eb_title">'+thisObject.title+'</span>'));
		this.titleObj = this.parent.children(".eb_title");        //titleObj
		if(this.dataOptions && this.dataOptions.required == true){
			this.parent.append('<span class="redStar" style="color:red;">*</span>');
		}
		this.setWidth();
		this.setHeight();
		var html = "";
		html = html + '<div class="eb_timeBox" id="'+this.timeBoxId+'"></div>';
		var timeBoxArea = $(".eb_timeBoxArea");               //timeBoxArea
		if(timeBoxArea.length <= 0){
			$("body").prepend('<div class="eb_timeBoxArea"></div>');
			timeBoxArea = $(".eb_timeBoxArea");
		}
		timeBoxArea.append(html);
		this.timeBoxObj = $("#" + thisObject.timeBoxId);
		$("#"+this.timeBoxId).append('<div class="eb_titleBar"></div>');
		this.titleBarObj = this.timeBoxObj.find(".eb_titleBar");
		html = "";
		html = html + '<div class="eb_yearSelecter"><span class="eb_toLastYear eb_yearButton">－</span><span class="eb_year">'+this.year+'</span>&nbsp;年<span class="eb_toNextYear eb_yearButton">＋</span></div>';
		$("#"+this.timeBoxId).find(".eb_titleBar").append(html); //写入年份选择组件
		$("#"+this.timeBoxId).find(".eb_yearButton").each(function(){ //年份增减按钮样式控制
			var thisObj = this;
			$(thisObj).mouseover(function(){
				$(thisObj).addClass("mouseover");
			}).mouseout(function(){
				$(thisObj).removeClass("mouseover");
			}).mousedown(function(){
				$(thisObj).addClass("mousedown");
			}).mouseup(function(){
				$(thisObj).removeClass("mousedown");
			});
		});
		$("#"+this.timeBoxId).find(".eb_toLastYear").click(function(){ //年份向前翻页
			thisObject.year--;
			$("#"+thisObject.timeBoxId).find(".eb_year").html(thisObject.year);
			thisObject.refreshDate();
		});
		$("#"+this.timeBoxId).find(".eb_toNextYear").click(function(){ //年份向后翻页
			thisObject.year++;
			$("#"+thisObject.timeBoxId).find(".eb_year").html(thisObject.year);
			thisObject.refreshDate();
		});
		html = '';
		html = html + '<select name="month" class="eb_monthSelect">';
		html = html + '<option value="01">01</option>';
		html = html + '<option value="02">02</option>';
		html = html + '<option value="03">03</option>';
		html = html + '<option value="04">04</option>';
		html = html + '<option value="05">05</option>';
		html = html + '<option value="06">06</option>';
		html = html + '<option value="07">07</option>';
		html = html + '<option value="08">08</option>';
		html = html + '<option value="09">09</option>';
		html = html + '<option value="10">10</option>';
		html = html + '<option value="11">11</option>';
		html = html + '<option value="12">12</option>';
		html = html + '</select>';
		this.titleBarObj.append($(html));
		this.titleBarObj.append('<span style="position:absolute;top:5px;right:23px;">月</span>');
		this.monthSelectObj = this.titleBarObj.find(".eb_monthSelect");                      //monthSelectObj
		this.monthSelectObj.val(thisObject.thisMonth);
		this.monthSelectObj.change(function(){
			thisObject.refreshDate();
		});
		html = "";
		html = html + '<table>';
		html = html + '<tr>';
		html = html + '<th class="eb_Sunday eb_red">日</th>';
		html = html + '<th class="eb_Monday">一</th>';
		html = html + '<th class="eb_Tuesday">二</th>';
		html = html + '<th class="eb_Wednesday">三</th>';
		html = html + '<th class="eb_Thursday">四</th>';
		html = html + '<th class="eb_Friday">五</th>';
		html = html + '<th class="eb_Saturday red">六</th>';
		html = html + '</tr>';
		html = html + '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
		html = html + '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
		html = html + '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
		html = html + '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
		html = html + '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
		html = html + '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
		html = html + '</table>';
		$("#"+this.timeBoxId).append(html);
		$("#"+this.timeBoxId).find("table td").each(function(){
			var thisObj = this;
			$(thisObj).mouseover(function(){
				$(thisObj).addClass("eb_dateMouseover");
			}).mouseout(function(){
				$(thisObj).removeClass("eb_dateMouseover");
			});
		});
		this.$element.click(function(){
			$(".eb_dropdownMenu.eb_show").hide().removeClass("eb_show");
			$(".eb_timeInput.focus").not(thisObject.$element).removeClass('focus');
			thisObject.toggleBox();
		});
		this.$element.focus(function(){
			thisObject.$element.addClass("focus");
		});
		this.refreshDate();
		if(this.dataOptions.HMS == true){                      //HMS == true
			this.timeBoxObj.height(thisObject.timeBoxObj.height()+30);
			var html = "";
			html = html + '<div class="eb_HMSBar">';
			html = html + '<input class="eb_HMSInput eb_Hour" value="00" />&nbsp;时&nbsp;';
			html = html + '<input class="eb_HMSInput eb_minute"  value="00" />&nbsp;分&nbsp;';
			html = html + '<input class="eb_HMSInput eb_second"  value="00" />&nbsp;秒';
			html = html + '</div>';
			this.timeBoxObj.append(html);
			this.timeBoxObj.find(".eb_HMSInput").focus(function(){
				$(this).addClass("focus");
			}).blur(function(){
				$(this).removeClass("focus");
			}).focus(function(){
				$(this).select();
			});
			this.timeBoxObj.find(".eb_HMSInput").keydown(function(e){
				var keycode=e.keyCode||e.which||e.charCode;
				var thisObj = this;
				var value = $(this).val();
				if((keycode>=48 && keycode<=57) || keycode == 8){
					return true;
				}else{
					return false;
				}
			});
			this.timeBoxObj.find(".eb_Hour").change(function(){
				var value = $(this).val();
				if(value>23){
					$(this).val("23");
				}else if(value<0){
					$(this).val("00");
				}
			});
			this.timeBoxObj.find(".eb_minute,.eb_second").change(function(){
				var value = $(this).val();
				if(value>59){
					$(this).val("59");
				}else if(value<0){
					$(this).val("00");
				}
			});
			this.timeBoxObj.append($('<div class="timeInputOK">确定</div>').mouseover(function(){
				$(this).addClass("mouseover");
			}).mouseout(function(){
				$(this).removeClass("mouseover");
			}).click(function(){
				var date = thisObject.timeBoxObj.find(".choosed").html();
				if(!date)
					date = "1";
				if(date<10 && date.length == 1)
					date = "0"+date;
				var YMD = thisObject.year + "-" + thisObject.month + "-" + date;
				var hour = thisObject.timeBoxObj.find(".eb_Hour").val();
				if(hour<10 && hour.length == 1)
					hour = "0" + hour;
				var min = thisObject.timeBoxObj.find(".eb_minute").val();
				if(min<10 && min.length == 1)
					min = "0" + min;
				var second = thisObject.timeBoxObj.find(".eb_second").val();
				if(second<10 && second.length == 1)
					second = "0" + second;
				var HMS = hour + ":" + min + ":" + second;
				var result = YMD + "  " + HMS;
				thisObject.setValue(result);
				thisObject.timeBoxObj.hide().removeClass("show");
				thisObject.$element.change();
			})).append($('<div class="timeInputCancel">取消</div>').mouseover(function(){
				$(this).addClass("mouseover");
			}).mouseout(function(){
				$(this).removeClass("mouseover");
			}).click(function(){
				thisObject.timeBoxObj.hide().removeClass("show");
			}));
		}
		$(window).click(function(){
			//thisObject.check();
			thisObject.$element.removeClass("focus");
			$("#"+thisObject.timeBoxId).removeClass("show").hide();
		});
		this.$element.each(function(){
			$(this).click(function(event){
				event.stopPropagation();
			});
		});
		$("#"+this.timeBoxId).each(function(){
			$(this).click(function(event){
				event.stopPropagation();
			});
		});
	};

	TimeInput.prototype.refreshDate = function(){
		var thisObject = this;
		this.timeBoxObj.find(".choosed").removeClass("choosed");
		$("#"+this.timeBoxId).find("table td").html("").unbind("click");
		this.month = this.monthSelectObj.val();
		var maxDay = this.getMonthArr(this.year)[this.month-1];
		var firstDay = new Date(this.year,this.month-1,1).getDay();
		var index = firstDay%7;
		for(var i=0;i<maxDay;i++){
			$("#"+this.timeBoxId).find("table td").eq(index).html(i+1);
			if(this.dataOptions.defaultVal){
				var value = this.dataOptions.defaultVal;
				if(this.inputObj.val())
					value = this.inputObj.val();
				var YMD = value.split(" ")[0];
				var Y = YMD.split("-")[0];
				var M = YMD.split("-")[1];
				var D = YMD.split("-")[2];
				if(D.indexOf("0") == 0)
					D = D.split("0")[1];
				if(this.year == Y && this.month == M && i+1 == D){
					$("#"+this.timeBoxId).find(".choosed").removeClass("choosed");
					$("#"+this.timeBoxId).find("table td").eq(index).addClass('choosed');
				}
			}else if(this.year == this.thisYear && this.month == this.thisMonth && i+1 == thisObject.today){
				$("#"+this.timeBoxId).find(".choosed").removeClass("choosed");
				$("#"+this.timeBoxId).find("table td").eq(index).addClass('choosed');
			}
			if(thisObject.dataOptions.HMS != true){
				$("#"+this.timeBoxId).find("table td").eq(index).click(function(){
					$("#"+thisObject.timeBoxId).find(".choosed").removeClass("choosed");
					$(this).addClass("choosed");
					thisObject.date = $(this).html();
					if(thisObject.date<10)
						thisObject.date = "0" + thisObject.date;
					var data = thisObject.year + "-" + thisObject.month + "-" + thisObject.date;
					thisObject.setValue(data);
					thisObject.timeBoxObj.hide().removeClass("show");
					thisObject.$element.change();
				});
			}else{
				$("#"+this.timeBoxId).find("table td").eq(index).click(function(){
					thisObject.date = $(this).html();
					if(thisObject.date<10)
						thisObject.date = "0" + thisObject.date;
					var data = thisObject.year + "-" + thisObject.month + "-" + thisObject.date;
					//thisObject.inputObj.val(data);
					//thisObject.timeBoxObj.hide();
					thisObject.timeBoxObj.find(".choosed").removeClass("choosed");
					$(this).addClass("choosed");
				});
			}
			index++;
		}
	};
	TimeInput.prototype.isLeapYear = function(year){
		if(year%4==0 && (year%100!= 0 || year%400 == 0))
			return true;
		else
			return false;
	};

	TimeInput.prototype.getMonthArr = function(year){
		if(this.isLeapYear(year))
			return [31,29,31,30,31,30,31,31,30,31,30,31];
		else
			return [31,28,31,30,31,30,31,31,30,31,30,31];
	};

	TimeInput.prototype.toggleBox = function(){
		this.locatBox();
		var display = $("#"+this.timeBoxId).attr("class");
		if(display.indexOf("show")>=0){
			$("#"+this.timeBoxId).removeClass("show").hide();
		}else{
			$(".eb_timeBoxArea .show").hide().removeClass("show");
			if(this.ifEnable == true){
				$("#"+this.timeBoxId).slideDown('fast').addClass("show");
			}
		}
	};

	TimeInput.prototype.getValue = function(){
		return this.inputObj.val();
	};

	TimeInput.prototype.setValue = function(value){
		this.inputObj.val(value);
		this.parent.attr("value",value);
	};

	TimeInput.prototype.clearValue = function(){
		this.setValue("");
	};

	TimeInput.prototype.check = function(){
		var thisObject = this;
		var result = {length:0,result:true};
		var val = this.$element.val();
		if(this.dataOptions.required == true){
			if(!val){
				result['required'] = 'fail';
				result.result = false;
				result.length++;
			}
		}
		return result;
	};

	TimeInput.prototype.locatBox = function(){
		var top = this.$element.offset().top;
		var left = this.$element.offset().left;
		var scrollTop = $(window).scrollTop();
		var scrollLeft = $(window).scrollLeft();
		top = top;
		left = left;
		$("#"+this.timeBoxId).css("left",left).css("top",top+this.$element.height()+3);
	}

	$.fn.timeInput = function (option,param) {
		var result = null;
	    var thisObj = this.each(function () {
	    	var $this = $(this)
	        	, thisObject = $this.data('timeInput')
	        	, dataOptions = typeof option == 'object' && option;
	    	if(typeof option == 'string' ){
	    		result = thisObject[option](param);
	    	}else{
	    		$this.data('timeInput', (thisObject = new TimeInput(this, dataOptions)));
	    	}
	    });
	    if(typeof option == 'string' )return result;
	    return thisObj;
	};

	$.fn.timeInput.defaults = {
		required:false,
		width:250,
		height:20,
		titleWidth:73
	};

	$(window).on('load', function(){
		$(".eb_timeInput").each(function () {
			var thisObj = $(this)
			, dataOptionsStr = thisObj.data('options');
			if(!dataOptionsStr)
				thisObj.timeInput($.fn.timeInput.defaults);
			else
				thisObj.timeInput((new Function("return {" + dataOptionsStr + "}"))());
		});
	});
}(window.jQuery);
/**
 * Author zhouzy
 * Date   2014/9/23
 *
 * Tree
 *
 * 依赖 Class
 */

!function(window){

    "use strict";


    var $   = window.jQuery,
        cri = window.cri;

    /**
     * 定义表格标题，工具栏，分页高度
     */
    var _titleH    = 31, //标题高度
        _toolbarH  = 31, //工具栏高度
        _iconWidth = 12; //

    /**
     * 计算原始元素高度
     * 1.若初始化时，定义了高度属性
     * 2.若设置了高度属性(height)
     * 3.若设置了高度样式
     * 4.都未定义 默认auto
     * @param $ele
     * @param height 初始化时指定的高度
     * @private
     */
    function _getElementHeight($ele,height){
        var styleHeight = $ele[0].style.height,
            propHeight  = $ele[0].height,
            calHeight   = height || styleHeight || propHeight;

        if(calHeight){
            var arr = ("" + calHeight).split("%");
            if(arr.length>1){
                calHeight = Math.floor($ele.parent().height() * arr[0] / 100);
            }
            calHeight = (""+calHeight).split("px")[0];
            if(calHeight){
                return parseInt(calHeight);
            }
        }
        else{
            return null;
        }
    }

    /**
     * 1.如果组件初始化时,定义了高宽属性
     * 2.如果table设置了高宽(style)
     * 3.如果table设置了高宽属性
     * 4.都未定义 默认为100%
     * @private
     */
    function _getElementWidth($ele,width){
        var styleWidth = $ele[0].style.width,
            propWidth  = $ele[0].width,
            calWidth   = width || styleWidth || propWidth || "100%";

        var arr = ("" + calWidth).split("%");
        if(arr.length>1){
            return Math.floor($ele.parent().width() * arr[0] / 100);
        }
        calWidth = calWidth.split("px")[0];
        return parseInt(calWidth);
    }


    var Tree = cri.Tree = function (element, options) {
        this.options = $.extend({}, $.fn.tree.defaults, options);
        this.$element = $(element);
        this.$tree = null;
        this.$treebody = null;
        this.selectedRow = null;
        this._className = "tree";
        this._init();
        this._eventListen();
    };

    Tree.prototype = {
        _init:function () {
            this._getData();
            this._createTree();
        },
        _eventListen:function(){
            var that = this;
            this.$treebody
                .on('click',"div.li-content",function(e){that._setSelected(e);})
                .on('click', "li i.icon", function(e){that._fold(e);})
                .on('dblclick', "div.li-content", function(e){
                    that._onDblClickRow(e);
                });
            this.$toolbar && this.$toolbar
                .on('click',"a[data-toolbar]",function(e){that._clickToolbar(e);});
        },

        _fold:function(e){
            var op = this.options,
                item = $(e.target).closest("div"),
                id = item.data('uid'),
                $li = $(e.target).closest("li"),
                $icon = $("i",item);

            $icon.is(".fa-folder")?
                $icon.removeClass("fa-folder").addClass("fa-folder-open"):
                $icon.removeClass("fa-folder-open").addClass("fa-folder");

            this._getDataById(id);

            if(op.async){
                var pa = {};
                $.each(op.selectedRow,function(index,data){index != "childrenList" && (pa[index] = data);});
                op.selectedRow.childrenList || $.ajax({
                    type: "get",
                    url: op.asyncUrl,
                    success: function(data){
                        op.selectedRow.childrenList = data.rows;
                        this._appendChildren($li,data.rows);
                    },
                    data:pa,
                    dataType:"JSON",
                    async:false
                });
            }
            else{
                $("ul li",$li).toggle();
            }
        },

        _getData:function(){
            var tree = this;
            $.ajax({
                type: "get",
                url: this.options.url,
                success:function(data, textStatus){
                    tree.options.rows = data.rows;
                },
                data:this.options.param,
                dataType:"JSON",
                async:false
            });
            return true;
        },

        _createTree:function(){
            var op      = this.options,
                height  = _getElementHeight(this.$element,op.height),
                width   = _getElementWidth(this.$element,op.width),
                $tree   = $("<div></div>").addClass(this._className).width(width),

                $treeview = this.$treeview = $("<div></div>").addClass("tree-view"),
                $treebody = this.$treebody = $("<ul></ul>").addClass("tree-body");
            $tree.attr("style",this.$element.attr("style")).show().height(height);
            $treeview.append($treebody);
            if(height){
                this.options.title   && (height -= _titleH);
                this.options.toolbar && (height -= _toolbarH);
                this.$treeview.css("height",height);
            }
            this.$element.wrap($tree);
            this.$element.hide();
            this.$tree = this.$element.parent();
            this._createTitle(this.$tree);
            this._createToolbar(this.$tree);

            this._eachNode($treebody,op.rows,"show",0,0);

            this.$tree.append($treeview);
        },

        _appendChildren:function($li,children){
            var $ul = $("<ul></ul>");
            var indent = $(i,$li).attr("marginLeft");
            this._eachNode($ul,children,"show",0,indent);
            $li.append($ul);
        },

        _eachNode:function($ul,data,isShow,id,indent){
            var fileIcons = {"file":"icon fa fa-file","folderOpen":"icon fa fa-folder-open","folderClose":"icon fa fa-folder"};
            for(var i = 0,len=data.length; i<len; i++){
                var row      = data[i],
                    $li      = $("<li></li>"),
                    $text    = $("<span></span>").addClass("li-text").text(row.text),
                    $icon    = $("<i></i>").attr("class",fileIcons.file).css("marginLeft",indent),
                    $content = $("<div></div>").addClass("li-content").data("uid",++id);

                $ul.append($li.append($content.append($icon).append($text)));
                isShow == "hide" && $li.hide();

                if(row.children && row.children.length > 0){
                    var $parent = $("<ul></ul>");
                    if(row.hasChildren || (row.children && row.children.length)){
                        row.state == "open" ? $icon.attr("class",fileIcons.folderOpen):$icon.attr("class",fileIcons.folderClose);
                    }
                    $li.append($parent);
                    indent += _iconWidth;
                    row.state && row.state == "closed"
                        ? this._eachNode($parent,row.children,"hide",id*1000,indent)
                        : this._eachNode($parent,row.children,isShow,id*1000,indent);
                    indent -= _iconWidth;
                }
            }
        },

        _createTitle:function($parent){
            if(this.options.title){
                this.$title = $('<div class="title"><span>' + this.options.title + '</span></div>');
                $parent.append(this.$title);
            }
        },

        _createToolbar:function($parent){
            if(this.options.toolbar){
                var $toolbar = $('<div class="toolbar"></div>');
                var html = "<ul>"
                $.each(this.options.toolbar,function(index,data){
                    html += "<li data-toolbar=\"" + index + "\">" + this.text + "</li>";
                });
                html += "</ul>";
                $toolbar.append(html);
                $parent.append($toolbar);
                this.$toolbar = this.$toolbar || $toolbar;
            }
        },

        _setSelected:function(e){
            var item = $(e.target).closest("div")
                ,id = item.data('uid')
                ,op = this.options;
            this._getDataById(id);
            if(op.onClick){
                op.onClick(op.selectedRow);
            }
        },

        _clickToolbar:function(e){
            var toolbar = $(e.target)
                ,index = toolbar.data('toolbar');
            this.options.toolbar[index].handler();
        },

        _getDataById:function(id){
            var op = this.options
                ,rowdata = null;

            !function getRow(data){
                var arr = [];
                while(id >= 1){
                    var t = id%1000;
                    arr.push(t);
                    id = Math.floor(id/1000);
                }
                for(var i = arr.length - 1; i >= 0 ; i--){
                    var k = arr[i] - 1;
                    data[k]&&(rowdata = data[k])&&(data = data[k].children);
                }
            }(op.rows);

            op.selectedRow = rowdata;
        },

        _onDblClickRow:function(e){
            var item = $(e.target).closest("div")
                ,id = item.data('uid')
                ,op = this.options;
            this._getDataById(id);
            if(op.onDblClick){
                op.onDblClick(op.selectedRow);
            }
            return false;
        },

        getSelected:function(){
            return this.options.selectedRow;
        },

        reload:function(param){
            param && (this.options.param = param);
            this._init();
        }
    };

    $.fn.tree = function (option,param) {
        var tree = null;
        this.each(function () {
            var $this   = $(this),
                options = typeof option == 'object' && option;
            $this.data('tree', (tree = new Tree(this, options)));
        });
        return tree;
    };

    $.fn.tree.defaults = {
        url:"",
        title:null,
        param:null,
        rows:[],
        selectedRow:null,
        onDblClick:null,
        page:true,
        async:false,
        asyncUrl:null
    };

}(window);
/**
 * Author zhouzy
 * Date   2014/9/23
 *
 * TreeGrid
 *
 * 依赖 Grid
 */
!function(window){

    var $   = window.jQuery,
        cri = window.cri;

    var TreeGrid = cri.TreeGrid = cri.Grid.extend(function(element,options){
        this._gridClassName = "treegrid";
        cri.Grid.apply(this,arguments);
        this._selfEvent();
    });

    TreeGrid.prototype._selfEvent = function(){
        var that = this;
        this.$gridbody
            .on('click', "tr td.line-file-icon i", function(e){
                that._fold(e);e.preventDefault();
            });
    };

    TreeGrid.prototype._createBody = function($parent){
        var $table = $("<table></table>"),
            op = this.options,
            columns = this._columns,
            lineNum = 1,
            paddingLeft = 1,
            iconWidth = 6;
        $table.append(this._createColGroup());
        /**
         * 拼装每行HTML
         */
        !function getRowHtml(rows,isShow,id){
            for(var i = 0,len = rows.length; i<len; i++){
                var $tr = $("<tr></tr>").data("rowid",++id);
                var row = rows[i];

                isShow == "show" || $tr.hide();

                if(op.checkBox){
                    $tr.append($("<td></td>").addClass("line-checkbox").append('<input type="checkbox"/>'));
                }
                if(op.rowNum){
                    $tr.append($("<td></td>").addClass("line-number").append(lineNum++));
                }

                getColHtml($tr,columns,row,paddingLeft);
                $table.append($tr);

                if(row.children && row.children.length > 0){
                    row.hasChildren = true;
                    paddingLeft += iconWidth;
                    row.state && row.state == "closed" ?
                        getRowHtml(row.children,"hide",id*1000) :
                        getRowHtml(row.children,isShow,id*1000);
                    paddingLeft -= iconWidth;
                }
            }
        }(op.rows,"show",0);

        /**
         * 拼装列HTML
         * @param colDef     列定义
         * @param colData    列数据
         * @param textIndent 文件图标缩进
         * @param nodeId     id
         * @returns {Array}
         */
        function getColHtml($tr,colDef,colData,textIndent){
            var fileIcons = {"file":"fa fa-file","folderOpen":"fa fa-folder-open","folderClose":"fa fa-folder"};

            $.each(colDef,function(index){
                var $td = $("<td></td>");
                var text  = colData[this.field] || "";

                if(this.field == "text"){
                    var $icon = $("<i></i>").attr("class",fileIcons.file);
                    if(colData.hasChildren || (colData.children && colData.children.length)){
                        colData.state == "open" ? $icon.attr("class",fileIcons.folderOpen):$icon.attr("class",fileIcons.folderClose);
                    }
                    $td.css("text-indent",textIndent).addClass("line-file-icon").append($icon).append(text);
                }
                else{
                    $td.text(text);
                }
                $tr.append($td);
            });
        }

       $parent.html($table);
    }

    TreeGrid.prototype._fold = function(e){
        var op = this.options,
            item = $(e.target).closest("tr"),
            rowid = item.data('rowid'),
            that = this;
        this.selectedRow = this.getRowDataById(rowid);
        if(this.selectedRow.state == "open") {
            this.selectedRow.state = "closed";
        }
        else if(this.selectedRow.state == "closed"){
            this.selectedRow.state = "open";
            if(op.async && !this.selectedRow.children){
                var pa = {};
                $.each(this.selectedRow,function(index,data){index != "children" && (pa[index] = data);});
                this.selectedRow.childrenList || $.ajax({
                    type: "post",
                    url: op.asyncUrl,
                    success: function(data, textStatus){
                        that.selectedRow.children = data.rows;
                    },
                    data:pa,
                    dataType:"JSON",
                    async:false
                });
            }
        }
        this.refreshGridView();
    };

    TreeGrid.prototype.getRowDataById = function(rowid){
        var op = this.options
            ,rowdata = null;
        rowid = parseInt(rowid);

        !function getRow(data){
            var arr = [];
            while(rowid >= 1){
                var t = rowid%1000;
                arr.push(t);
                rowid = Math.floor(rowid/1000);
            }
            for(var i = arr.length - 1; i >= 0 ; i--){
                var k = arr[i] - 1;
                data[k]&&(rowdata = data[k])&&(data = data[k].children);
            }
        }(op.rows);
        return rowdata;
    };

    $.fn.treegrid = function(option) {
        var treeGrid = null;
        this.each(function () {
            var $this    = $(this),
                options  = typeof option == 'object' && option;
            treeGrid = $this.data('treegrid');
            treeGrid && treeGrid.$grid.before($this).remove();
            $this.data('treegrid', (treeGrid = new TreeGrid(this, options)));
        });
        return treeGrid;
    };
}(window);

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

    var icons = {Minimize:"fa fa-minus",Maximize:"fa fa-expand","Close":"fa fa-close","Resume":"fa fa-compress"},
        HEAD_HEIGHT = 35,
        WINDOW_BODY_PADDING_X = 3,
        WINDOW_BODY_PADDING_Y = 4,
        MINI_WINDOW_WIDTH = 140+10,
        ZINDEX = 10000;

    var _defaultOptions = {
        actions:["Close"],
        content:null,
        visible:true,
        modal:false,//模态窗口
        width:600,
        height:400,
        position:{top:null,left:null}
    };

    var Window = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        this.windowStatus = "normal";
        cri.Widgets.apply(this,arguments);
        Window.prototype.windowStack.push(this);
    });

    Window.prototype.windowStack = [];

    /**
     * 初始化组件DOM结构
     * @private
     */
    Window.prototype._init = function(){
        this._createBody();
        var op = this.options,
            position = op.position;
        this.$window.css({zIndex:this._zIndex(),left:position.left,top:position.top,width:this.options.width,height:this.options.height});
        this._overlay();
        this._createHead();
        $("body").append(this.$window);
    };

    /**
     * 初始化组件监听事件
     * @private
     */
    Window.prototype._eventListen = function(){
        var that = this;
        this.$window
            .on("click",".buttons .button",function(){
                var action = that._actionForButton($(this));
                action && typeof that[action] === "function" && that[action]();
            })
            .on("click",".window-head",function(){
                that.toFront();
            })
            .on("mousedown",".window-head",function(e){
                var op = that.options;
                var position = op.position;
                var left = position.left;
                var top  = position.top;
                var startX = e.pageX;
                var startY = e.pageY;
                $("body").on("mousemove",function(e){
                    var currentX = e.pageX;
                    var currentY = e.pageY;
                    var X = currentX - startX;
                    var Y = currentY - startY;
                    left += X;
                    top += Y;
                    startX = currentX;
                    startY = currentY;
                    that.$window.css("left",left);
                    that.$window.css("top",top);
                    that.$window.css("bottom","auto");
                    that.$window.css("right","auto");
                    position.left = left;
                    position.top = top;
                });
            });
        $("body").on("mouseup",function(){
            $("body").off("mousemove");
        });
    };

    Window.prototype._createHead = function(){
        var $windowHead = $("<div></div>").addClass("window-head");
        $windowHead.append(this._createTitle()).append(this._createButtons());
        this.$window.prepend($windowHead);
        this.$windowHead = $windowHead;
    };

    Window.prototype._createBody = function(){
        var $element = this.$element;
        $element.detach();
        var $window = $('<div class="window"></div>');
        var $windowBody = $('<div class="window-content"></div>');
        var bodyWidth = this.options.width - 2 * WINDOW_BODY_PADDING_X;
        var bodyHeight = this.options.height - 2* WINDOW_BODY_PADDING_Y - HEAD_HEIGHT;
        $windowBody.css({height:bodyHeight,width:bodyWidth});
        $window.append($windowBody);
        $windowBody.append($element);
        this.$window = $window;
        $("body").append(this.$window);
    };

    Window.prototype._createTitle = function(){
        var title = this.options.title || "";
        var $title = $("<span></span>").addClass("title").text(title);
        return $title;
    };

    /**
     * 根据actions 按照（最小化，放大，关闭）顺序生成按钮
     * 模态窗口不生成最小化按钮
     * @returns {*}
     * @private
     */
    Window.prototype._createButtons = function(){
        var options = this.options;
        var $buttons = $("<div></div>").addClass("buttons");
        var defaultButtons = options.modal ? ["Maximize","Close"]:["Minimize","Maximize","Close"];

        for(var i = 0, len = defaultButtons.length; i<len; i++){
            var defBtn = defaultButtons[i];
            for(var j = 0,l = options.actions.length; j < l; j++){
                var action = options.actions[j];
                if(action == defBtn){
                    var $button = $("<span></span>").addClass("button").addClass(action.toLowerCase());
                    var $icon = $("<i></i>").attr("class",icons[action]);
                    $button.append($icon);
                    $buttons.append($button);
                }

            }
        }
        return $buttons;
    };

    /**
     * 生成模态窗口背景遮罩
     * @private
     */
    Window.prototype._overlay = function(){
        if(this.options.modal){
            var $overlay = $(".overlay")[0] || $("<div></div>").addClass("overlay")[0];
            $("body").append($overlay);
            var zIndex = +this.$window.css("zIndex");
            $overlay.style.zIndex = zIndex;
            this.$window.css("zIndex",(zIndex+1));
        }
    };

    /**
     * 根据icon类名返回对应的处理函数
     * @param icon
     * @returns {*}
     * @private
     */
    Window.prototype._actionForButton = function(button) {
        var iconClass = /\bbutton \w+\b/.exec(button[0].className)[0];
        return {
            "button minimize": "minimize",
            "button maximize": "maximize",
            "button resume": "resume",
            "button close": "close"
        }[iconClass];
    };

    /**
     * 由最小化打开窗口
     */
    Window.prototype.open = function(){
        this._setStyleByStatus("normal");
        this.windowStatus = "normal";
    };

    /**
     * 关闭当前窗口
     *
     * 隐藏并且放置到最底层
     */
    Window.prototype.close = function(){
        var max = ZINDEX;
        var frontWnd = null;
        this.$window.css("zIndex",ZINDEX).hide();
        $(".window").each(function(){
            var z = +this.style.zIndex + 1;
            this.style.zIndex = z;
            if(z >= max){
                max = z;
                frontWnd = this;
            }
        });
        frontWnd.style.zIndex = max+1;
        $(".window").is(":visible") ?
            $(".overlay").css("zIndex",max):
            $(".overlay").hide();

        this.$window.removeClass("mini-window");
        this.windowStatus = "close";
    };

    /**
     * 最大化窗口
     * 最大化后 复原、关闭
     */
    Window.prototype.maximize = function(){
        this._setStyleByStatus("maximize");
        this._setButtons("maximize");
        this.windowStatus = "maximize";
    };

    /**
     * 最小化窗口
     * 依次排放到左下侧
     * 模态窗口没有最小化按钮
     */
    Window.prototype.minimize = function(){
        this._setButtons("minimize");
        $(".window-content",this.$window).hide();
        var left = $(".mini-window").size() * MINI_WINDOW_WIDTH;
        this._setStyleByStatus("minimize");
        this.$window.css("left",left);
        this.windowStatus = "minimize";
    };

    /**
     * 复原窗口到初始(缩放、移动窗口会改变初始位置尺寸信息)尺寸、位置
     */
    Window.prototype.resume = function(){
        this._setButtons("normal");
        this._setStyleByStatus("normal");
        if(this.windowStatus == "minimize"){
            this.windowStatus = "normal";
            var i = 0;
            $.each(Window.prototype.windowStack,function(index,wnd){
                if(wnd.windowStatus == "minimize"){
                    wnd._moveLeft(i++);
                }
            });
        }
        this.windowStatus = "normal";
    };

    /**
     * 根据窗口的状态设置窗口样式
     * @private
     */
    Window.prototype._setStyleByStatus = function(status){
        var op    = this.options,
            pos   = op.position,
            KLASS = {minimize:"window mini-window",maximize:"window maxi-window",closed:"window",normal:"window"},
            style = {width:op.width,height:op.height,left:pos.left,top:pos.top,bottom:"auto",right:"auto"};
        this.$window.prop("class",KLASS[status]).css(style);
    };

    /**
     * 根据当前窗口状态设置窗口按钮组
     * @param buttons
     * @private
     */
    Window.prototype._setButtons = function(status){
        var BUTTONS = {minimize:["resume","close"],maximize:["resume","close"],normal:["minimize","maximize","close"]};
        var $buttons = $(".buttons",this.$window);
        $(".button",$buttons).hide();

        if(status == "minimize"){
            var $btn = $(".maximize",$buttons).removeClass("maximize").addClass("resume");
            $("i",$btn).prop("class",icons["Maximize"]);
        }

        if(status == "maximize"){
            var $btn = $(".maximize",$buttons).removeClass("maximize").addClass("resume");
            $("i",$btn).prop("class",icons["Resume"]);
        }
        if(status == "normal"){
            var $btn = $(".resume",$buttons).removeClass("resume").addClass("maximize");
            $("i",$btn).prop("class",icons["Maximize"]);
        }
        $.each(BUTTONS[status],function(index,value){
            $("." + value,$buttons).show();
        });
    };

    /**
     * 当左侧最小化窗口复原后，右侧最小化窗口依次左移一个窗口位置
     */
    Window.prototype._moveLeft = function(index){
        this.$window.css("left",MINI_WINDOW_WIDTH * index);
    };

    /**
     * 把当前窗口顶至最前,与之前最上层窗口替换
     */
    Window.prototype.toFront = function(){
        //TODO:轮询窗口，取最大zindex,替换zindex
        var frontWnd = this._getFrontWindow();
        if(this.$window != frontWnd){
            var zIndex = +this.$window.css("zIndex");
            this.$window.css("zIndex",frontWnd.css("zIndex"));
            frontWnd.css("zIndex",zIndex);
        }
    };

    /**
     * 获取最上层窗口
     * @private
     */
    Window.prototype._getFrontWindow = function(){
        var zIndex = +this.$window.css("zIndex"),
            wnd = this.$window;
        $(".window").each(function(){
            var tempZIndex = +this.style.zIndex;
            if(tempZIndex  > zIndex){
                wnd = $(this);
                zIndex = tempZIndex;
            }
        });
        return wnd;
    };

    Window.prototype._zIndex = function(){
        var zindex = ZINDEX;
        $(".window").each(function(i,element){
            zindex = Math.max(+this.style.zIndex,zindex);
        });
        return ++zindex;
    };

    Window.prototype.destory = function(){

    };

    cri.Window = Window;

    $.fn.window = function(option) {
        var wnd = null;
        this.each(function () {
            var $this   = $(this),
                wnd     = $this.data('window'),
                options = typeof option == 'object' && option;
            if(wnd != null){
                wnd.$window.before($this).remove();
            }
            $this.data('window', (wnd = new Window(this, options)));
        });
        return wnd;
    };
}(window);