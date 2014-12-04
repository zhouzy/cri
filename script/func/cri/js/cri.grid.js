/**
 * Author zhouzy
 * Date   2014/9/18
 * grid 组件
 * dependens Pager
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

        $.map(columns,function(column){
            if(column.field && column.width){
                column._width = column.width;
            }
            return column;
        });

        return columns;
    }

    /**
     * 表格默认属性
     * @type {{url: null, param: {}, title: null, toolbar: null, columns: null, rows: null, onClick: null, onDblClick: null, rowNum: boolean, checkBox: boolean, onChecked: null, pagination: boolean, page: number, pageSize: number, total: number, ajaxDone: null, ajaxError: null}}
     * @private
     */
    var _defaultOptions = {
        url:null,
        param:{},
        title:null,
        toolbar:null,
        columns:null,
        rows:null,
        rowNum:true,
        checkBox:false,
        pagination:true,
        page:1,
        pageSize:10,

        ajaxDone:null,
        ajaxError:null,
        onChecked:null, //每行checkbox被选中时触发回调函数,当该回调函数返回,参数row,rowid
        onClick:null,   //行点击时触发
        onDblClick:null,
        onLoad:null     //构造表格结束时触发
    };

    var Grid = cri.Widgets.extend(function(element,options){
        this.options     = _defaultOptions;
        this.$element    = $(element);
        this.$grid       = null;
        this.$gridhead   = null;
        this.$gridbody   = null;
        this.$toolbar    = null;
        this.pager       = null;
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
                    that._setSelected(e);
                })
                .on('dblclick', "tr", function(e){
                    that._onDblClickRow(e);
                })
                .on("change", "input[type=checkbox]",function(e){
                    that._checkbox(e);

                });
            $(document).on("mouseup",function(e){
                that.$gridhead.css("cursor","");
                $(document).off("mousemove");
            });

            this.$gridhead
                .on('mousedown',".drag-line",function(e){
                    that.$gridhead.css("cursor","e-resize");
                    var dragLineIndex = 0;
                    op.rowNum && dragLineIndex++;
                    op.checkBox && dragLineIndex++;
                    dragLineIndex += $(this).data("drag");
                    var $col = $("col:eq("+ dragLineIndex +")",that.$gridhead);
                    dragStartX = e.pageX;
                    $(document).on("mousemove",function(e){
                        var px = e.pageX - dragStartX;
                        var width = +$col.width() + px;
                        var tableWidth = $("table",that.$gridhead).width();
                        dragStartX = e.pageX;
                        console.log(width);
                        if(width >= _cellMinW){
                            $("table",that.$gridbody).width(tableWidth + px);
                            $("table",that.$gridhead).width(tableWidth + px);
                            $("col:eq("+ dragLineIndex +")",that.$gridhead).width(width);
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
        },

        _init:function() {
            this._columns = _getColumnsDef(this.$element,this.options.columns);
            this._createGrid();
            this._createPage();
            this._getData();
            if(this.options.onLoad && typeof(this.options.onLoad) === 'function'){
                this.options.onLoad.call(this);
            }
            this._colswidth();
        },

        _createGrid:function(){
            var height = _getElementHeight(this.$element,this.options.height);
            var $grid = $("<div></div>").addClass("grid").addClass(this._gridClassName);
            $grid.attr("style",this.$element.attr("style")).show().css("height",height);
            this.$element.wrap($grid);
            this.$element.hide();
            this.$grid = this.$element.parent();
            this._createTitle(this.$grid);
            this._createToolbar(this.$grid);
            this._createGridView(this.$grid,height);
        },

        _createGridView:function($parent,height){
            this.$gridview = $("<div></div>").addClass("grid-view");
            this.$gridhead = $("<div></div>").addClass("grid-head");
            $parent.append(this.$gridview.append(this.$gridhead).append(this.$gridbody));
            if(height){
                height -= _gridHeadH;
                this.options.title      && (height -= _titleH);
                this.options.toolbar    && (height -= _toolbarH);
                this.options.pagination && (height -= _pagerH);
            }
            this._createHead(this.$gridhead);
            this.$gridbody = this._createBody(height);
            this.$grid.append(this.$gridbody);
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

            $table.append(this._createColGroup($parent.width()));

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
            $table.append($tr);
            $parent.html($headWrap.html($table));
        },

        _createBody:function(gridBodyHeight){
            var $gridbody = $('<div class="grid-body loading"></div>'),
                $loadingIcon = $('<i class="fa fa-spinner fa-spin"></i>').addClass("loadingIcon");
            gridBodyHeight && $gridbody.height(gridBodyHeight);
            $gridbody.append($loadingIcon);
            return $gridbody;
        },

        /**
         * 刷新Grid Body数据行
         * @private
         */
        _refreshBody:function(){
            var $table   = $('<table></table>'),
                op       = this.options,
                id       = 0,
                lineNum  = 1 + op.pageSize * (op.page - 1),
                columns  = this._columns;

            $table.append($("colgroup",this.$gridhead).clone());

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
            this.$gridbody.removeClass("loading").html($table);
            /**
             *fixed IE8 do not support nth-child selector;
             */
            $("tr:nth-child(odd)",$table).css("background","#FFF");
            /**
             *根据gird-body纵向滚动条宽度决定headWrap rightPadding
             */
            var scrollBarW = this.$gridbody.width()-this.$gridbody.prop("clientWidth");
            this.$gridhead.css("paddingRight",scrollBarW);
        },

        _createColGroup:function(parentWidth){
            var $colgroup= $("<colgroup></colgroup>"),
                op       = this.options,
                columns  = this._columns,
                width    = 0;
            op.checkBox && $colgroup.append($("<col/>").width(30)) && (width+=30);
            op.rowNum   && $colgroup.append($("<col/>").width(25)) && (width+=20);
            /**
             * 当表格列宽总长度小于table宽度，设置最后一列宽度为auto,避免checkBox与rowNum列自动计算宽度
             */
            for(var i= 0,len=columns.length; i<len;i++){
                var $col = $("<col/>");
                var columnWidth = columns[i]._width;
                columnWidth && $col.width(columnWidth) && (width+=columnWidth);
                if(width < parentWidth){
                    $col.width("auto");
                }
                $colgroup.append($col);
            }
            return $colgroup;
        },

        _createToolbar:function($parent){
            if(this.options.toolbar) {
                this.toolbar = new cri.ToolBar($parent, {
                    buttons: this.options.toolbar
                });
            }
        },

        _createPage:function(){
            var op = this.options;
            var grid = this;
            if(this.options.pagination){
                this.pager = new cri.Pager(this.$grid,{
                    page:op.page,
                    pageSize:op.pageSize,
                    total:0,
                    rowsLen:0,
                    onPage:function(page,pageSize){
                        op.page = page;
                        op.pageSize = pageSize;
                        grid._getData();
                    }
                });
            }
        },

        _getData:function(){
            var result = true,
                op     = this.options,
                that   = this;
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
                    that.pager && that.pager.update(op.page,op.pageSize,op.total,op.rows.length);
                    that._refreshBody(that.$gridbody);
                },
                error: function(XMLHttpRequest, textStatus, errorThrown){
                    op.rows = [];
                    op.total = 0;
                    that.pager && that.pager.update(op.page,op.pageSize,op.total,op.rows.length);
                    that._refreshBody(that.$gridbody);
                },
                data:op.param,
                dataType:"JSON",
                async:false
            });
            return result;
        },

        _checkbox:function(e){
            var op = this.options;
            var isChecked = $(e.target).prop("checked");
            var rowid = $(e.target).closest("tr").data("rowid");
            if(isChecked && op.onChecked){
                op.onChecked(this._getRowDataById(rowid),rowid);
            }
        },

        _setSelected:function(e){
            var item = $(e.target).closest("tr"),
                rowid = item.data('rowid');
            $("tr",this.$gridbody).toggleClass("selected",false);
            this.selectedRow = this._getRowDataById(rowid);
            item.toggleClass("selected");
            if(this.options.onClick){
                this.options.onClick.call(this,this.selectedRow);
            }
        },

        /**
         * 根据td计算col的宽度
         * @private
         */
        _colswidth:function(){
            var that = this;
            $("tr:eq(0) td",this.$gridhead).each(function(index){
                $('col:eq('+ index +')',that.$gridbody).width($(this).width() + 2*4);
                $('col:eq('+ index +')',that.$gridhead).width($(this).width() + 2*4);
            });
        },

        _getRowDataById:function(rowid){
            return this.options.rows[parseInt(rowid)];
        },

        _onDblClickRow:function(e){
            var op = this.options
                ,item = $(e.target).closest("tr")
                ,rowid = item.data('rowid')
                ,that = this;
            this.selectedRow = this._getRowDataById(rowid);
            if(op.onDblClick){
                op.onDblClick(that.selectedRow);
            }
        },

        reload:function(param){
            param && (this.options.param = param);
            this.selectedRow = null;
            this._getData();
        },

        loadData:function(param){
            if(param.push){
                this.options.rows = param;
                this._refreshBody();
            }
        },

        getMulSelected:function(){
            var mulSelectRow = [],
                that = this;
            $("tr input[type='checkbox']:checked",this.$gridbody).each(function(){
                var rowid = $(this).closest("tr").data("rowid");
                mulSelectRow.push(that._getRowDataById(rowid));
            });
            return mulSelectRow;
        },

        getSelected:function(){
            return this.selectedRow;
        }

    });

    cri.Grid = Grid;
}(window);