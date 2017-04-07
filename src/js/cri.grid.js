/**
 * Author zhouzy
 * Date   2014/9/18
 * grid 组件
 * include Pager
 */
!function(){

    "use strict";

    var cri = window.cri,
        $   = window.jQuery;

    /**
     * 定义表格标题，工具栏，分页高度
     */
    var _titleH       = 41, //标题高度
        _toolbarH     = 40, //工具栏高度
        _pagerH       = 50, //分页高度
        _gridHeadH    = 41, //表格头高度
        _cellMinW     = 5;  //单元格最小宽度

    function _getPlainText(text){
        text = ("" + text).replace(/(<.*?>)|(<\/.*?>)/g,"");
        return text;
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
            var columns = [];
            $("tr th,td", $table).each(function(){
                var options = '{' + $(this).data("options") + '}';
                columns.push($.extend({title:$(this).html()},cri.parseJSON(options)));
            });
            return columns;
        }());
        $.map(columns,function(column){
            if(column.title && column.width){
                column._width = column.width;
            }
            return column;
        });
        return columns;
    }

    /**
     * 表格默认属性
     * @private
     */
    var _defaultOptions = {
        title:null,
        height:null,
        width:null,
        toolbar:null,
        url:null,
        param:{},
        checkBox:false,
        rowNum:true,
        columns:null,
        pagination:true,
        page:1,
        pageSize:10,
        filter:false,

        onChange:null,   //行点击时触发
        onSelected:null, //当选择一行或者多行时触发
        onDblClick:null, //双击行时触发
        onLoad:null,     //构造表格结束时触发
        ajaxDone:null    //当AJAX请求成功后触发
    };

    var Grid = cri.Widgets.extend(function(element,options){
        this.options        = _defaultOptions;
        this.$element       = $(element);
        this.$grid          = null;
        this.$gridhead      = null;
        this.$gridbody      = null;
        this.toolbar        = null;
        this.pager          = null;
        this.$title         = null;
        this._rows          = null;
        this._columns       = [];
        this._selectedId    = [];
        this._gridClassName = this._gridClassName || "datagrid";
        cri.Widgets.apply(this,arguments);
    });

    $.extend(Grid.prototype,{
        /**
         * 监听用户事件
         * @private
         */
        _eventListen:function(){
            var that       = this,
                op         = this.options,
                dragStartX = 0,
                clickTimer = null;

            this.$gridbody
                .on("scroll",function(){
                    $(".grid-head-wrap",that.$gridhead).scrollLeft($(this).scrollLeft());
                })
                .on('click', "tr", function(e){
                    if(clickTimer != null){
                        clearTimeout(clickTimer);
                    }
                    clickTimer = window.setTimeout(function(){
                        $("input[type=checkbox]",that.$gridhead).prop("checked",false);
                        that._setSelected(e);
                        var item  = $(e.target).closest("tr"),
                            rowId = item.data('rowid'),
                            row = that._getRowDataById(rowId);
                        that.options.onChange && that.options.onChange.call(that,row);
                    },300);
                })
                .on('dblclick', "tr", function(e){
                    clearTimeout(clickTimer);
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
                    if(isChecked){
                        that._selectedId = [];
                        $("tr",that.$gridbody).each(function(){
                            var $tr = $(this);
                            that._selectedId.push($tr.data("rowid"));
                            $tr.addClass("selected");
                            $('input[type=checkbox]',$tr).prop("checked",isChecked);
                        });
                    }else{
                        that._selectedId = [];
                        $("tr",that.$gridbody).removeClass("selected");
                    }
                    $("input[type=checkbox]",that.$gridbody).each(function(){
                        $(this).prop("checked",isChecked);
                    });
                    op.onChange && op.onChange.call(that);
                });
        },

        /**
         * 初始化组件HTML结构
         * @private
         */
        _init:function() {
            this._columns = _getColumnsDef(this.$element,this.options.columns);
            this._createGrid();
            this._createPage();
            this._getData();

        },

        /**
         * 初始化表格HTML结构
         * @private
         */
        _createGrid:function(){
            var height = this.$element._getHeightPixelValue(this.options.height);
            var width  = this.$element._getWidthPixelValue(this.options.width);
            //var $grid  = $("<div></div>").addClass("grid").addClass(this._gridClassName).addClass('panel panel-default');
            var $grid  = $("<div></div>").addClass("grid").addClass(this._gridClassName);

            $grid.attr("style",this.$element.attr("style")).css({width:width,height:height,display:'block'});

            this.$element.wrap($grid);
            this.$element.hide();
            this.$grid = this.$element.parent();
            this._createTitle(this.$grid);
            this._createToolbar(this.$grid);
            this._createGridView(this.$grid,height);
        },

        /**
         * 初始化表格 View HTML 结构
         * @param $parent
         * @param height
         * @private
         */
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

        /**
         * 初始化表格标题 HTML 结构
         * @param $grid
         * @private
         */
        _createTitle:function($grid){
            if(this.options.title){
                this.$title = $('<div class="panel-heading"><span>' + this.options.title + '</span></div>');
                $grid.append(this.$title);
            }
        },

        /**
         * 初始化表格头 HTML 结构
         * @param $parent
         * @private
         */
        _createHead:function($parent){
            var $headWrap = $("<div></div>").addClass("grid-head-wrap"),
                //tableStyle = 'table table-bordered',
                tableStyle = 'table',
                $table    = $('<table class="'+tableStyle+'"></table>'),
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
                var that = this,
                    $td        = $('<td></td>'),
                    $dragLine  = $('<div></div>').addClass('drag-line').data('drag',i),
                    $tdContent = $('<div></div>').addClass('td-content grid-header-text'),
                    column     = columns[i];
                for(var key in column){
                    var value = column[key];
                    if(key == 'title'){
                        $tdContent.prop('title',value).append(value);
                        if(op.filter){
                            var $filterIcon = $('<span data-for="'+column.field+'" class="fa fa-filter filter-icon"></span>');
                            $filterIcon.click(function(e){
                                var gridHeadOffset = that.$grid.offset();
                                var iconOffset = $(this).offset();
                                var offset = {
                                    left:iconOffset.left-gridHeadOffset.left+10,
                                    top:iconOffset.top-gridHeadOffset.top
                                };
                                var key = $(e.target).data('for');
                                that._toggle(that.$grid.find('ul[data-for='+key+']'),offset);
                            });
                            $tdContent.append($filterIcon);
                        }
                    }
                    else if(key == 'style'){
                        $td.css(value);
                    }
                }

                $td.append($tdContent);
                i < (len - 1) && $td.append($dragLine);
                $tr.append($td);
            }
            $table.append($tr);
            $parent.html($headWrap.html($table));
        },

        /**
         * 初始化表格数据部分 HTML 结构
         * @param gridBodyHeight
         * @returns {*|HTMLElement}
         * @private
         */
        _createBody:function(gridBodyHeight){
            var $gridbody    = $('<div class="grid-body loading"></div>'),
                $loadingIcon = $('<i class="fa fa-spinner fa-pulse fa-spin"></i>').addClass("loadingIcon");
            if(gridBodyHeight){
                $gridbody.height(gridBodyHeight);
            }
            $gridbody.append($loadingIcon);
            return $gridbody;
        },

        /**
         * 刷新Grid Body数据行
         * @private
         */
        _refreshBody:function(rows){
            var self     = this,
                //tableStyle = 'table table-striped table-hover table-bordered',
                tableStyle = 'table table-striped table-hover',
                $table   = $('<table class="'+tableStyle+'"></table>'),
                op       = this.options,
                id       = 0,
                lineNum  = 1 + op.pageSize * (op.page - 1),
                columns  = this._columns;
            rows = rows || this._rows;
            this._selectedId = [];

            $table.append($("colgroup",this.$gridhead).clone());
            for(var i = 0,len = rows.length; i<len; i++){
                var row = rows[i],
                    $tr = $('<tr></tr>').data("rowid",id);
                if(op.checkBox){
                    var $checkBoxTd = $('<td class="line-checkbox"></td>');
                    if(row.check){
                        $tr.append($checkBoxTd.append('<input type="checkbox" checked/>'));
                        this._selectedId.push(id);
                    }
                    else{
                        $tr.append($checkBoxTd.append('<input type="checkbox"/>'));
                    }
                }
                if(op.rowNum){
                    $tr.append($("<td></td>").addClass("line-number").append(lineNum));
                }
                for(var j = 0,length = columns.length; j<length;j++){
                    var $td      = $('<td></td>'),
                        $content = $('<div></div>').addClass('td-content'),
                        column   = columns[j],
                        text     = row[column.field]==null ? "" : row[column.field],
                        _text    = ("" + text).replace(/(<([^a\/]).*?>)|(<\/[^a].*?>)/g,""),
						_title   = ("" + text).replace(/(<.*?>)|(<\/.*?>)/g,""),
                    	button   = column['button'];
                    if(button){
                        if(!cri.isArray(button)){
                            button = [button];
                        }
                        var $button = button.map(function(button){
                            var $btn = $('<button class="btn btn-sm"></button>');
                            $btn.btn({
                                text:button.text, iconCls:button.iconCls,
                                handler:function(id){ return function(){ button.handler && button.handler(self._getRowDataById(id)); }; }(id)
                            });
                            return $btn;
                        });
                        $content.append($button);
                    }
                    else{
                        $content.prop("title",_title).append(_text);
                    }
                    $tr.append($td.append($content));
                }
                lineNum++;id++;
                $table.append($tr);
            }
            this.$gridbody.removeClass("loading").html($table);

            var $temp = this.$grid.clone();
            $temp.css({position:'fixed',left:'-10000px'});
            $('body').append($temp);
            var clientWidth = $temp.find('.grid-body').prop("clientWidth");
            if(clientWidth){
                var scrollBarW = $temp.find('.grid-body').width()-clientWidth;
                this.$gridhead.parent().css({"paddingRight":scrollBarW});
            }
            $temp.remove();
        },

        /**
         * 生成 cols HTML 结构
         * @param parentWidth
         * @returns {*|HTMLElement}
         * @private
         */
        _createColGroup:function(parentWidth){
            var $cols   = [],
                op      = this.options,
                columns = this._columns;
            op.checkBox && $cols.push($("<col/>").css('width',30));
            op.rowNum   && $cols.push($("<col/>").css('width',30));
            for(var i = 0,len = columns.length; i<len; i++){
                var $col = $("<col/>");
                columns[i]._width && $col.width(columns[i]._width);
                $cols.push($col);
            }
            return $("<colgroup></colgroup>").append($cols);
        },

        /**
         * 生成工具栏 HTML 结构
         * @param $parent
         * @private
         */
        _createToolbar:function($parent){
            if(this.options.toolbar) {
                this.toolbar = new cri.ToolBar($parent, {
                    buttons: this.options.toolbar
                });
            }
        },

        /**
         * 初始化表头过滤器
         * @returns {{}}
         * @private
         */
        _initFilter:function(){
            var rows = this._rows;
            var column = this._columns;
            var keysMap = {};
            this._filters = this._filters || {};

            for(var i in column){
                var field = column[i].field;
                var keys = {};
                for(var j=0,len=rows.length;j<len;j++){
                    var row = rows[j];
                    var value = row[field];
                    if(keys[value] == undefined){
                        keys[value] = true;
                    }
                }
                keysMap[field] = keys;
            }
            this._createFilterLists(keysMap);
        },

        _createFilterLists:function(keysMap){
            var that =this;
            for(var key in keysMap){
                var gridHeadOffset = this.$grid.offset();
                var filterIconOffset = this.$gridhead.find('span[data-for='+key+'].filter-icon').offset();
                var offset = {
                    left:filterIconOffset.left-gridHeadOffset.left+10,
                    top:filterIconOffset.top-gridHeadOffset.top
                };
                var $ul = that.$grid.find('ul[data-for='+key+']');
                $ul.length ? $ul.empty() : ($ul=$('<ul class="grid-filter" data-for="'+key+'"></ul>'));

                var $all = $('<input type="checkbox" name="all"/>').click(function(e){
                    var $ul = $(e.target).closest('ul');
                    if($(e.target).prop('checked')){
                        $ul.find('input[type=checkbox]').prop("checked",true);
                    }
                    else{
                        $ul.find('input[type=checkbox]').prop("checked",false);
                    }
                });
                $ul.append($('<li></li>').append($all,'全部'));

                var map = keysMap[key];
                for(var i in map){
                    var plainText = _getPlainText(i);
                    plainText=='null' && (plainText = '');
                    var $checkbox = $('<input type="checkbox" name="'+plainText+'"/>').data("value",i);
                    $ul.append($('<li class="filter-value"></li>').append($checkbox,plainText));
                }
                var $footer = $('<li class="footer"><button class="cancel">过滤</button></li>');
                $ul.append($footer);
                $ul.css(offset);
                $footer.find('button').button({
                    handler:(function($ul){
                        return function(){
                            var field = $ul.attr('data-for');
                            var values = [];
                            $ul.find('li.filter-value input[type=checkbox]').each(function(){
                                if($(this).prop('checked')){
                                    values.push($(this).data('value'));
                                }
                            });
                            that._filters[field] = values;
                            that._filter();
                            that._toggle($ul);
                        }
                    }($ul))
                });

                this.$grid.append($ul);

                $ul.find('li.filter-value input[type=checkbox]').click(function($all){
                    return function(){
                        $all.prop('checked',false)
                    };
                }($all));
            }
        },

        /**
         * 显示隐藏过滤器下拉选择框
         * @param $filterList
         * @private
         */
        _toggle:function($filterList,offset){
            var that = this;
            if($filterList.is(":hidden")){
                $filterList.css(offset).slideDown(200, function(){
                    $(document).mouseup(function(e) {
                        var _con = $filterList;
                        if (!_con.is(e.target) && _con.has(e.target).length === 0) {
                            $filterList.slideUp(200);
                        }
                    });
                });
            }
            else{
                $filterList.slideUp(200);
            }
        },

        /**
         * 执行过滤
         * @private
         */
        _filter:function(){
            var filters = this._filters;
            var rows = this._rows;

            for(var field in filters){
                var values = filters[field];
                var tempRows = [];
                for(var i= 0,len=values.length; i<len; i++){
                    var value = values[i];
                    for(var j=0,jLen = rows.length;j<jLen;j++){
                        if(("" + rows[j][field]) == value){
                            tempRows.push(rows[j]);
                        }
                    }
                }
                rows = tempRows;
            }
            this._refreshBody(rows);
        },

        /**
         * 生成翻页 HTML 结构
         * @private
         */
        _createPage:function(){
            var op = this.options;
            var grid = this;
            if(this.options.pagination){
                this.$pager = $('<div class="panel-footer"></div>');
                this.pager = new cri.Pager(this.$pager,{
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
                this.$grid.append(this.$pager);
            }
        },

        /**
         * 获取数据
         * @returns {boolean}
         * @private
         */
        _getData:function(){
            var result = true,
                op     = this.options,
                that   = this;
            if(op.pagination){
                op.param.page = op.page;
                op.param.rows = op.pageSize;
            }
            if(this.options.url){
                $.ajax({
                    type: "post",
                    url: this.options.url,
                    success: function(data){
                        if(op.ajaxDone){
                            var re = op.ajaxDone.call(that,data);
                            re && (data = re);
                        }
                        that._rows = data.rows || [];
                        op.total = data.total || 0;
                        that.pager && that.pager.update(op.page,op.pageSize,op.total,that._rows.length);
                        $('input[type=checkbox]',that.$gridhead).prop("checked",false);
                        that._refreshBody();
                        if(op.filter){
                            that._initFilter();
                        }
                        if(op.onLoad && typeof(op.onLoad) === 'function'){
                			op.onLoad.call(this);
            			}
                    },
                    error: function(){
                        that._rows = [];
                        op.total = 0;
                        that.pager && that.pager.update(op.page,op.pageSize,op.total,that._rows.length);
                        that._refreshBody();
                    },
                    data:op.param,
                    dataType:"JSON",
                    async:true
                });
            }
            return result;
        },

        /**
         * 当用户点击选中行时触发onSelected事件
         * 当options.checkbox=true为多选,否则为单选
         * @param e
         * @private
         */
        _setSelected:function(e){
            var that  = this,
                item  = $(e.target).closest("tr"),
                rowId = item.data('rowid');

            if(this.options.checkBox){
                var $checkbox = item.find('input:checkbox');
                var isSelected = $checkbox.prop("checked");
                var selected = [];
                if(!$(e.target).is("input:checkbox")){
                    $checkbox.prop("checked",!isSelected);
                }
                this.$gridbody.find('tr').each(function(){
                    var $tr = $(this);
                    if($(this).find('input:checkbox').prop('checked')){
                        selected.push($tr.data('rowid'));
                    }
                    that._selectedId = selected;
                });
            }
            else{
                if(item.hasClass("selected")){
                    item.removeClass("selected");
                    this._selectedId = [];
                }
                else{
                    $("tr.selected",this.$gridbody).removeClass("selected");
                    item.addClass("selected");
                    this._selectedId = [rowId];
                }
            }
            if(this._selectedId && this._selectedId.length){
                this.options.onSelected && this.options.onSelected.call(this);
            }
        },

        /**
         * 根据td计算col的宽度
         * @private
         */
        _colsWidth:function(){
            var that = this;
            $("tr:eq(0) td",this.$gridhead).each(function(index){
                $('col:eq('+ index +')',that.$gridbody).width($(this).width() + 2*4);
                $('col:eq('+ index +')',that.$gridhead).width($(this).width() + 2*4);
            });
        },

        /**
         * 根据 id 获取某一行的数据
         * @param _uid
         * @returns {*}
         * @private
         */
        _getRowDataById:function(_uid){
            return this._rows[parseInt(_uid)];
        },

        /**
         * 当用户双击某一行触发
         * @param e
         * @private
         */
        _onDblClickRow:function(e){
            var that  = this,
                op    = this.options,
                item  = $(e.target).closest("tr"),
                rowid = item.data('rowid');
            this._selectedId = [rowid];
            $("tr.selected",this.$gridbody).removeClass("selected");
            item.addClass("selected");
            if(this.options.checkBox){
                $("input[type=checkbox]",this.$gridbody).prop("checked",false);
                $("input[type=checkbox]",item).prop("checked",true);
            }
            op.onDblClick && op.onDblClick.call(that,that._getRowDataById(rowid));
        },

        /**
         * 根据 param 重新加载表格
         * @param param
         */
        reload:function(param){
            param && (this.options.param = param);
            this.options.page = 1;
            this._selectedId = [];
            this._getData();
        },

        /**
         * 根据 param 指定的数据加载表格
         * @param param
         */
        loadData:function(param){
            if(cri.isArray(param)){
                this._rows = param;
                this._refreshBody();
                this.options.filter && this._initFilter();
            }
        },

        /**
         * 获取用户选择的数据
         * @returns {Array}
         */
        getSelected:function(){
            var selected = [],
                selectedId = this._selectedId;
            for(var i=0; i<selectedId.length;i++){
                selected.push(this._getRowDataById(selectedId[i]));
            }
            return selected;
        },

        /**
         * 清空用户选择
         */
        clearSelected : function(){
            if(this.options.checkBox){
                this.$gridbody.find('input:checkbox').prop("checked",false);
                this.$gridhead.find('input:checkbox').prop("checked",false);
            }
            else{
                this.$gridbody.find('tr.selected').removeClass("selected");
            }
            this._selectedId = [];
        }
    });

    cri.Grid = Grid;
}();
