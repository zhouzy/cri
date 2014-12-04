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

    cri.isArray = function(value){
        if(value instanceof Array ||
            (!(value instanceof Object) &&
                (Object.prototype.toString.call((value)) == '[object Array]') ||
                typeof value.length == 'number' &&
                typeof value.splice != 'undefined' &&
                typeof value.propertyIsEnumerable != 'undefined' &&
                !value.propertyIsEnumerable('splice'))) {
            return true;
        }else{
            return false;
        }
    };

    /**
     * 获取表单值
     * @param $form
     * @returns {{}}
     */
    cri.getFormValue = function($form){
        var nameValues = $form.serialize().split(/&/) || [],
            o = {};
        for(var i= 0,len=nameValues.length;i<len;i++){
            var nameValue = nameValues[i].split(/=/);
            var name = nameValue[0];
            var value = nameValue[1]
            o[name] = value;
        }
        return o;
    };

    /**
     * 设置表单值
     * @param $form
     * @param o
     */
    cri.setFormValue = function($form,o){
        for(var name in o){
            $("[name=" + name + "]",$form).val(o[name]);
        }
    };

    /**
     * 拓展 jquery formValue 方法
     *
     * @param o
     * @returns {{}}
     */
    $.fn.formValue = function(o){
        if(arguments.length>0){
            cri.setFormValue($(this),o);
        }
        else{
            return cri.getFormValue($(this));
        }
    };

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
                    var dragLineIndex = 0;
                    op.rowNum && dragLineIndex++;
                    op.checkBox && dragLineIndex++;
                    dragLineIndex += $(this).data("drag");
                    var $td = $("td:eq("+ dragLineIndex +")",that.$gridhead);
                    that.$gridhead.css("cursor","e-resize");
                    dragStartX = e.pageX;
                    $(document).on("mousemove",function(e){
                        var px = e.pageX - dragStartX;
                        var width = $td.width() + px;
                        var tableWidth = $("table",that.$gridhead).width();
                        dragStartX = e.pageX;
                        console.log(width);
                        if(width >= _cellMinW){
                            $("table",that.$gridbody).width(tableWidth + px);
                            $("table",that.$gridhead).width(tableWidth + px);
                            $td.width(width);
                            $("tr:eq(0) td:eq("+ dragLineIndex +")",that.$gridbody).width(width);
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
                    //TODO: warming developer
                    console && console.error(XMLHttpRequest.readyState + XMLHttpRequest.status + XMLHttpRequest.responseText);
                    op.rows = [];
                    op.total = 0;
                    that.pager && that.pager.update(op.page,op.pageSize,op.total,op.rows.length);
                    that._refreshBody(that.$gridbody);
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
//            var $checkbox = $("input[type=checkbox]",item);
//            $checkbox.prop("checked",true);
            if(this.options.onClick){
                this.options.onClick.call(this,this.selectedRow);
            }
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
/**
 * Author zhouzy
 * Date   2014/9/18
 * Button 组件
 *
 */
!function(window){

    "use strict";

    var cri = window.cri,
        $   = window.jQuery;

    var _defaultOptions = {
        iconCls:null,
        onClick:null,//button={iconCls:"",handler:""}
        enable:true
    };

    var BUTTON = "button";

    var Button = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        this.$inputGroup = null;
        cri.Widgets.apply(this,arguments);
    });

    $.extend(Button.prototype,{
        _eventListen:function(){

        },

        _init:function(){
            this._create();
        },

        _create:function(){
            var op = this.options,
                $e = this.$element.hide();

            $e.wrap('<div class="'+ BUTTON + '"></div>');

            var $button = this.$button = $e.parent();
            var $icon = $('<i class="' + op.iconCls + '"></i>');
            $button.append($icon, $e.text());
            $button.on("click",function(){
                op.onClick.call();
            });
        },

        _destory:function(){

        }
    });

    cri.Button = Button;

    $.fn.button = function(option) {
        var o = null;
        this.each(function () {
            var $this   = $(this),
                o   = $this.data('button'),
                options = typeof option == 'object' && option;
            if(o != null){
                o._destory();
            }
            $this.data('button', (o = new Button(this, options)));
        });
        return o;
    };
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
 * easy-bootstrap-floatContainer01 v2.0
 * 
 * @author:niyq
 * @date:2013/08/22
 * @dependce:jquery
 *=====================================================================================*/
!function($){

    "use strict";

    var FloatContainer01 = function(element,dataOptions){
        var thisObject = this;
        this.$element = $(element);
        this.dataOptions = $.extend({}, $.fn.floatContainer01.defaults, dataOptions);
        this.title = this.$element.attr("title");
        this.id = this.$element.attr("id");
        this.init();
    };

    FloatContainer01.prototype.init = function(){
        var thisObject = this;
        thisObject.$element.append('<div style="clear:both"></div>');
    };

    $.fn.floatContainer01 = function (option,param) {
        var result = null;
        var thisObj = this.each(function () {
            var $this = $(this)
                , thisObject = $this.data('floatContainer01')
                , dataOptions = typeof option == 'object' && option;
            if(typeof option == 'string' ){
                result = thisObject[option](param);
            }else{
                $this.data('floatContainer01', (thisObject = new FloatContainer01(this, dataOptions)));
            }
        });
        if(typeof option == 'string' )return result;
        return thisObj;
    };

    $.fn.floatContainer01.defaults = {

    };

    $(window).on('load', function(){
        $(".eb_floatContainer01").each(function () {
            var thisObj = $(this)
                , dataOptionsStr = thisObj.data('options');
            if(!dataOptionsStr)
                thisObj.floatContainer01($.fn.floatContainer01.defaults);
            else
                thisObj.floatContainer01((new Function("return {" + dataOptionsStr + "}"))());
        });
    });
}(window.jQuery);

/*=====================================================================================
 * easy-bootstrap-floatContainer02 v2.0
 * 
 * @author:niyq
 * @date:2013/08/22
 * @dependce:jquery
 *=====================================================================================*/
!function($){

    "use strict";

    var FloatContainer02 = function(element,dataOptions){
        var thisObject = this;
        this.$element = $(element);
        this.dataOptions = $.extend({}, $.fn.floatContainer02.defaults, dataOptions);
        this.title = this.$element.attr("title");
        this.id = this.$element.attr("id");
        this.init();
    };

    FloatContainer02.prototype.init = function(){
        var thisObject = this;
        thisObject.$element.append('<div style="clear:both"></div>');
    };

    $.fn.floatContainer02 = function (option,param) {
        var result = null;
        var thisObj = this.each(function () {
            var $this = $(this)
                , thisObject = $this.data('floatContainer02')
                , dataOptions = typeof option == 'object' && option;
            if(typeof option == 'string' ){
                result = thisObject[option](param);
            }else{
                $this.data('floatContainer02', (thisObject = new FloatContainer02(this, dataOptions)));
            }
        });
        if(typeof option == 'string' )return result;
        return thisObj;
    };

    $.fn.floatContainer02.defaults = {

    };

    $(window).on('load', function(){
        $(".eb_floatContainer02").each(function () {
            var thisObj = $(this)
                , dataOptionsStr = thisObj.data('options');
            if(!dataOptionsStr)
                thisObj.floatContainer02($.fn.floatContainer02.defaults);
            else
                thisObj.floatContainer02((new Function("return {" + dataOptionsStr + "}"))());
        });
    });
}(window.jQuery);


/*=====================================================================================
 * easy-bootstrap-fileUpload v2.0
 *
 * @author:niyq
 * @date:2013/08/22
 * @dependce:jquery
 *=====================================================================================*/
!function($){

    "use strict";

    var FileUpload = function(element,dataOptions){
        var thisObject = this;
        this.$element = $(element);
        this.dataOptions = $.extend({}, $.fn.fileUpload.defaults, dataOptions);
        this.title = "";
        if(this.$element.attr("title"))
            this.title = this.$element.attr("title");
        if(this.dataOptions.title)
            this.title = this.dataOptions.title;
        this.id = this.$element.attr("id");
        this.name = this.$element.attr("name");
        this.init();
    };

    FileUpload.prototype.init = function(){
        var thisObject = this;
        this.fileUploadObj = this.$element;                                                     //fileUploadObj
        this.fileUploadObj.wrap($('<div class="eb_fileUploadGroup"></div>'));
        this.parent = this.fileUploadObj.parent();                                              //parent
        this.parent.data('fileUpload',thisObject);
        this.fileUploadObj.after($('<input class="eb_fileUploadInput" name="'+thisObject.name+'" id="eb_fileUploadInput_'+thisObject.id+'" />'));
        this.inputObj = this.parent.children('.eb_fileUploadInput');                             //inputObj
        this.inputObj.data('fileUpload',thisObject);
        this.inputObj.before($('<span class="eb_title">'+thisObject.title+'</span>'));
        this.titleObj = this.parent.children('.eb_title');                                       //titleObj
        this.inputObj.after($('<div class="eb_button">浏览</div>'));
        this.buttonObj = this.parent.children('.eb_button');                                    //buttonObj
        this.fileUploadObj.change(function(){
            var value = thisObject.fileUploadObj.val();
            thisObject.inputObj.val(value);
            thisObject.parent.attr('value',value);
        });
        this.buttonObj.click(function(){
            thisObject.fileUploadObj.trigger('click');
            thisObject.fileUploadObj.get(0).focus();
        }).mousedown(function(){
            setTimeout(function(){
                thisObject.inputObj.addClass('focus');
                thisObject.buttonObj.addClass('focus');
            },1);
        });
        this.setWidth();
        this.setHeight();
        this.setStyle();
    };

    FileUpload.prototype.setValue = function(value){
        this.inputObj.val(value);
        this.fileUploadObj.val(value);
        if(this.fileUploadObjClone)
            his.fileUploadObjClone.val(value);
        this.parent.attr('value',value);
    };

    FileUpload.prototype.getValue = function(){
        var value = this.fileUploadObj.val();
        if(this.fileUploadObjClone)
            value = this.fileUploadObjClone.val();
        return value;
    };

    FileUpload.prototype.clearValue = function(){
        this.setValue('');
    }

    FileUpload.prototype.initInForm = function(formObj){
        var thisObject = this;
        formObj.append(thisObject.fileUploadObjClone = thisObject.fileUploadObj.clone().css('display','none').addClass('clone'));              //fileUploadObjClone
        this.fileUploadObj.click(function(){
            thisObject.fileUploadObjClone.trigger('click');
            return false;
        });
        this.fileUploadObjClone.change(function(){
            var value = $(this).val();
            thisObject.setValue(value);
        });
        return thisObject.fileUploadObjClone;
    };

    FileUpload.prototype.setWidth = function(widthParam){
        var thisObject = this;
        var width = $.fn.fileUpload.defaults.width;
        if(this.dataOptions.width)
            width = this.dataOptions.width;
        if(widthParam)
            width = widthParam;
        if(typeof width == 'string')
            width = width.split("px")[0];
        this.parent.width(width);
        this.inputObj.width(thisObject.parent.width()-140);
        this.fileUploadObj.width(thisObject.parent.width()-75);
        if(this.dataOptions.titleWidth || this.dataOptions.titleWidth == 0){
            var width = this.dataOptions.titleWidth;
            this.titleObj.width(width);
            this.inputObj.width(thisObject.parent.width()-width-67);
            this.fileUploadObj.width(thisObject.parent.width()-width-2);
        }
    };

    FileUpload.prototype.setHeight = function(heightParam){
        var thisObject = this;
        var height = $.fn.fileUpload.defaults.height;
        if(this.dataOptions.height)
            height = this.dataOptions.height;
        if(heightParam)
            height = heightParam;
        if(typeof height == "string")
            height = height.dplit("px")[0];
        this.parent.height(height);
        this.inputObj.height(height-2);
        this.inputObj.css('line-height',(height-2)+'px');
        this.fileUploadObj.height(height);
        this.titleObj.height(height);
        this.titleObj.css('line-height',(height+2)+'px');
        this.buttonObj.height(height);
        this.buttonObj.css('line-height',height+'px');
    };

    FileUpload.prototype.setStyle = function(){
        var thisObject = this;
        this.buttonObj.mouseover(function(){
            $(this).addClass('mouseover');
        }).mouseout(function(){
            $(this).removeClass('mouseover');
        }).mousedown(function(){
            $(this).addClass("mousedown");
        }).mouseup(function(){
            $(this).removeClass("mousedown");
        });
        this.fileUploadObj.focus(function(){
            thisObject.inputObj.addClass('focus');
            thisObject.buttonObj.addClass('focus');
        }).blur(function(){
            thisObject.inputObj.removeClass('focus');
            thisObject.buttonObj.removeClass('focus');
        });
    };

    $.fn.fileUpload = function (option,param) {
        var result = null;
        var thisObj = this.each(function () {
            var $this = $(this)
                , thisObject = $this.data('fileUpload')
                , dataOptions = typeof option == 'object' && option;
            if(typeof option == 'string' ){
                result = thisObject[option](param);
            }else{
                $this.data('fileUpload', (thisObject = new FileUpload(this, dataOptions)));
            }
        });
        if(typeof option == 'string' )return result;
        return thisObj;
    };

    $.fn.fileUpload.defaults = {
        width:250,
        height:20
    };

    $(window).on('load', function(){
        $(".eb_fileUpload").not('.clone').each(function () {
            var thisObj = $(this)
                , dataOptionsStr = thisObj.data('options');
            if(!dataOptionsStr)
                thisObj.fileUpload($.fn.fileUpload.defaults);
            else
                thisObj.fileUpload((new Function("return {" + dataOptionsStr + "}"))());
        });
    });
}(window.jQuery);


/*=====================================================================================
 * easy-bootstrap-form v2.0
 *
 * @author:niyq
 * @date:2013/08/22
 * @dependce:jquery
 *=====================================================================================*/
!function($){

    "use strict";

    var Form = function(element,dataOptions){
        var thisObject = this;
        this.$element = $(element);
        this.dataOptions = $.extend({}, $.fn.form.defaults, dataOptions);
        this.title = this.$element.attr("title");
        this.id = this.$element.attr("id");
        this.init();
    };

    Form.prototype.init = function(){
        var thisObject = this;
        var formPanel = $('body').get(0);
        if(this.dataOptions.ajax == true){//----------------------------------------------------------ajax-----------------------------------------------------------
            $('body').append(formPanel = $('<iframe src="ajaxFileUpload.html" id="ajaxFileUploadTest"></iframe>'));
            var myWindow = formPanel.get(0).contentWindow;
            myWindow.onload = function(){
                formPanel = myWindow.$('#eb_ajaxFileUploadFormPanel').get(0);
                $(formPanel).append(thisObject.realFormObj = $('<form class="eb_realForm" style="display:none" id="eb_form_'+thisObject.id+'"></form>'));                   //realFormObj
                thisObject.realFormObj.attr('action',thisObject.dataOptions.action).attr('method',thisObject.dataOptions.method);
                var fileUploadArr = thisObject.$element.find('.eb_fileUpload');
                if(fileUploadArr.length > 0){
                    fileUploadArr.each(function(){
                        $(this).fileUpload('initInForm',thisObject.realFormObj);
                    });
                    thisObject.realFormObj.attr('enctype','multipart/form-data');
                }
                var nameValueArr = {};
                thisObject.$element.find('[name]').each(function(){
                    var name = $(this).attr('name');
                    var value = $(this).attr('value');
                    if($(this).val())
                        value = $(this).val();
                    if(!nameValueArr[name]){
                        nameValueArr[name] = value;
                    }else{
                        nameValueArr[name] = nameValueArr[name] + "," + value;
                    }
                });
                for(var index in nameValueArr){
                    if(thisObject.realFormObj.find('[name="'+index+'"]').length<=0){
                        thisObject.realFormObj.append($('<input type="hidden" name="'+index+'" value="'+nameValueArr[index]+'" />'));
                    }
                }
            };
            //formPanel = myWindow.document.getElementById('eb_ajaxFileUploadFormPanel');
        }else{ //-------------------------------------------------------------------------------------------------------------------------------------------------------------
            $(formPanel).append(thisObject.realFormObj = $('<form class="eb_realForm" style="display:none" id="eb_form_'+thisObject.id+'"></form>'));                   //realFormObj
            this.realFormObj.attr('action',thisObject.dataOptions.action).attr('method',thisObject.dataOptions.method);
            var fileUploadArr = this.$element.find('.eb_fileUpload');
            if(fileUploadArr.length > 0){
                fileUploadArr.each(function(){
                    $(this).fileUpload('initInForm',thisObject.realFormObj);
                });
                thisObject.realFormObj.attr('enctype','multipart/form-data');
            }
            var nameValueArr = {};
            this.$element.find('[name]').each(function(){
                var name = $(this).attr('name');
                var value = $(this).attr('value');
                if($(this).val())
                    value = $(this).val();
                if(!nameValueArr[name]){
                    nameValueArr[name] = value;
                }else{
                    nameValueArr[name] = nameValueArr[name] + "," + value;
                }
            });
            for(var index in nameValueArr){
                if(thisObject.realFormObj.find('[name="'+index+'"]').length<=0){
                    thisObject.realFormObj.append($('<input type="hidden" name="'+index+'" value="'+nameValueArr[index]+'" />'));
                }
            }
        }
    };

    Form.prototype.submit = function(param){
        var thisObject = this;
        if(param && param.type && (param.type == "get" || param.type == "post")){
            this.realFormObj.attr("action",type);
        }
        var valueArr = this.getValue();
        for(var index in valueArr){
            var value = valueArr[index];
            if(value && isArray(value)=="array"){
                var newValue = value[0];
                for(var i = 1;i<value.length;i++){
                    newValue = newValue + "," + value[i];
                }
                value = newValue;
            }
            thisObject.realFormObj.find('[name="'+index+'"]').each(function(){
                $(this).val(value);
            });
        }
        if(param && param.action){
            this.realFormObj.attr("action",param.action);
        }
        this.realFormObj.submit();
    }

    Form.prototype.getValue = function(){
        var result = {};
        var requiredFailArr = [];
        this.$element.find("div[name]").each(function(){
            var thisObj = this;
            if($(this).attr("class") == "eb_inputGroup"){
                var checkResult = $(this).input('check');
                if(checkResult.result == true){
                    if(!result[$(thisObj).attr("name")] && result[$(thisObj).attr("name")]!=""){
                        result[$(thisObj).attr("name")] = $(thisObj).input("getValue");
                    }else if(isArray(result[$(thisObj).attr("name")])!='array'){
                        var value1 = result[$(thisObj).attr("name")];
                        result[$(thisObj).attr("name")] = [];
                        result[$(thisObj).attr("name")].push(value1);
                        result[$(thisObj).attr("name")].push($(thisObj).input("getValue"));
                    }else if(isArray(result[$(thisObj).attr("name")])=='array'){
                        result[$(thisObj).attr("name")].push($(thisObj).input("getValue"));
                    }
                }else{
                    if(checkResult.required == 'fail'){
                        requiredFailArr.push($(thisObj).find('.eb_title').html());
                    }
                }
            }else if($(this).attr("class") == "eb_timeInputGroup"){
                var checkResult = $(this).timeInput('check');
                if(checkResult.result == true){
                    if(!result[$(thisObj).attr("name")] && result[$(thisObj).attr("name")]!=""){
                        result[$(thisObj).attr("name")] = $(thisObj).timeInput("getValue");
                    }else if(isArray(result[$(thisObj).attr("name")])!='array'){
                        var value1 = result[$(thisObj).attr("name")];
                        result[$(thisObj).attr("name")] = [];
                        result[$(thisObj).attr("name")].push(value1);
                        result[$(thisObj).attr("name")].push($(thisObj).timeInput("getValue"));
                    }else if(isArray(result[$(thisObj).attr("name")])=='array'){
                        result[$(thisObj).attr("name")].push($(thisObj).timeInput("getValue"));
                    }
                }else{
                    if(checkResult.required == 'fail'){
                        requiredFailArr.push($(thisObj).find('.eb_title').html());
                    }
                }
            }else if($(this).attr("class") == "eb_selectBoxGroup"){
                //result[$(thisObj).attr("name")] = $(thisObj).selectBox("getValue");
                var checkResult = $(this).selectBox('check');
                if(checkResult.result == true){
                    if(!result[$(thisObj).attr("name")] && result[$(thisObj).attr("name")]!=""){
                        result[$(thisObj).attr("name")] = $(thisObj).selectBox("getValue");
                    }else if(isArray(result[$(thisObj).attr("name")])!='array'){
                        var value1 = result[$(thisObj).attr("name")];
                        result[$(thisObj).attr("name")] = [];
                        result[$(thisObj).attr("name")].push(value1);
                        result[$(thisObj).attr("name")].push($(thisObj).selectBox("getValue"));
                    }else if(isArray(result[$(thisObj).attr("name")])=='array'){
                        result[$(thisObj).attr("name")].push($(thisObj).selectBox("getValue"));
                    }
                }else{
                    if(checkResult.required == 'fail'){
                        requiredFailArr.push($(thisObj).find('.eb_title').html());
                    }
                }
            }else if($(this).attr("class") == "eb_textareaGroup"){
                //result[$(thisObj).attr("name")] = $(thisObj).textarea("getValue");
                var checkResult = $(this).textarea('check');
                if(checkResult.result == true){
                    if(!result[$(thisObj).attr("name")] && result[$(thisObj).attr("name")]!=""){
                        result[$(thisObj).attr("name")] = $(thisObj).textarea("getValue");
                    }else if(isArray(result[$(thisObj).attr("name")])!='array'){
                        var value1 = result[$(thisObj).attr("name")];
                        result[$(thisObj).attr("name")] = [];
                        result[$(thisObj).attr("name")].push(value1);
                        result[$(thisObj).attr("name")].push($(thisObj).textarea("getValue"));
                    }else if(isArray(result[$(thisObj).attr("name")])=='array'){
                        result[$(thisObj).attr("name")].push($(thisObj).textarea("getValue"));
                    }
                }else{
                    if(checkResult.required == 'fail'){
                        requiredFailArr.push($(thisObj).find('.eb_title').html());
                    }
                }
            }
        });
        this.$element.find("input[type='text'],select,textarea,input[type='hidden'],input[type='password']").not(".eb_input,.eb_selectBox,.eb_timeInput,.eb_textarea,.eb_selectBox_hide").each(function(){
            var thisObj = this;
            if(!result[$(thisObj).attr("name")] && result[$(thisObj).attr("name")]!=""){
                result[$(thisObj).attr("name")] = $(thisObj).val();
            }else if(isArray(result[$(thisObj).attr("name")])!='array'){
                var value1 = result[$(thisObj).attr("name")];
                result[$(thisObj).attr("name")] = [];
                result[$(thisObj).attr("name")].push(value1);
                result[$(thisObj).attr("name")].push($(thisObj).val());
            }else if(isArray(result[$(thisObj).attr("name")])=='array'){
                result[$(thisObj).attr("name")].push($(thisObj).val());
            }
        });
        if(requiredFailArr.length > 0){
            var msg = '"';
            for(var i=0;i<requiredFailArr.length;i++){
                if(i<requiredFailArr.length-1){
                    msg = msg + requiredFailArr[i] + ",";
                }else{
                    msg = msg + requiredFailArr[i] + '"为必填项，请完成填写！';
                }
            }
            alert(msg);
            return false;
        }else{
            return result;
        }
    };

    Form.prototype.setValue = function(param){
        var thisObject = this;
        for(var i in param){
            thisObject.$element.find("div[name='"+i+"']").each(function(){
                var thisObj = this;
                if($(this).attr("class") == "eb_inputGroup"){
                    $(thisObj).input("setValue",param[i]);
                }else if($(this).attr("class") == "eb_selectBoxGroup"){
                    if(param[i]==""){
                        $(thisObj).selectBox("clearValue");
                    }else{
                        $(thisObj).selectBox("setValue",param[i]);
                    }
                }else if($(this).attr("class") == "eb_textareaGroup"){
                    $(thisObj).textarea("setValue",param[i]);
                }else if($(this).attr("class") == "eb_timeInputGroup"){
                    $(thisObj).timeInput("setValue",param[i]);
                }
            });
            thisObject.$element.find("input[name='"+i+"'],select[name='"+i+"'],textarea[name='"+i+"']").each(function(){
                $(this).val(param[i]);
            });
        }
    };

    Form.prototype.clearValue = function(){
        var thisObject = this;
        var param = {};
        this.$element.find('[name]').each(function(){
            var thisObj = this;
            param[$(thisObj).attr("name")] = "";
        });
        this.setValue(param);
    };

    $.fn.form = function (option,param) {
        var result = null;
        var thisObj = this.each(function () {
            var $this = $(this)
                , thisObject = $this.data('form')
                , dataOptions = typeof option == 'object' && option;
            if(typeof option == 'string' ){
                result = thisObject[option](param);
            }else{
                $this.data('form', (thisObject = new Form(this, dataOptions)));
            }
        });
        if(typeof option == 'string' )return result;
        return thisObj;
    };

    $.fn.form.defaults = {
        method:'post',
        action:'',
        ajax:false
    };

    $(window).on('load', function(){
        $(".eb_form").each(function () {
            var thisObj = $(this)
                , dataOptionsStr = thisObj.data('options');
            if(!dataOptionsStr)
                thisObj.form($.fn.form.defaults);
            else
                thisObj.form((new Function("return {" + dataOptionsStr + "}"))());
        });
    });
}(window.jQuery);

/*=====================================================================================
 * easy-bootstrap-input v2.0
 *
 * @author:niyq
 * @date:2013/08/19
 * @dependce:jquery
 *=====================================================================================*/
!function($){

    "use strict";

    var Input = function(element,dataOptions){
        var thisObject = this;
        this.$element = $(element);
        this.style = this.$element.attr("style");
        this.dataOptions = $.extend({}, $.fn.input.defaults, dataOptions);
        this.value = "";
        if(this.dataOptions.defaultVal)
            this.value = this.dataOptions.defaultVal;
        this.title = "";
        if(this.$element.attr("title"))
            this.title = this.$element.attr("title");
        if(this.dataOptions.title)
            this.title = this.dataOptions.title;
        this.id = this.$element.attr("id");
        this.name = this.$element.attr("name");
        if(this.$element.attr("placeholder"))
            this.placeholder = this.$element.attr("placeholder");
        else
            this.placeholder = "";
        this.init();     //初始化inputGroup组件
        this.setStyle();
        this.$element.change(function(){
            thisObject.check();
        });
    };

    Input.prototype.hide = function(){
        this.parentObj.hide();
    };

    Input.prototype.show = function(){
        this.parentObj.show();
    };

    Input.prototype.lengthLimit = function(lengthParam){
        var thisObject = this;
        var obj = this.inputObj.get(0);
        var value;
        this.inputObj.keypress(function(e){
            var str = $(this).val();
            var key = e.which;
            if(str.length >= lengthParam && key != 8 && key != 0){
                return false;
            }else{
                value = $(this).val();
            }
        }).get(0).onpaste=function(e){
            var str = $(this).val();
            var key = e.which;
            if(str.length >= lengthParam && key != 8 && key != 0){
                return false;
            }else{
                value = $(this).val();
            }
        };
        if(typeof obj.oninput != 'undefined'){
            obj.oninput = function(e){
                var str = $(this).val();
                var key = e.which;
                //alert(str.length);
                if(str.length > lengthParam){
                    $(this).val(value);
                }else{
                    value = $(this).val();
                }
            };
        }
        if(typeof obj.onpropertychange != 'undefined'){
            obj.oninput = function(e){
                var str = $(this).val();
                var key = e.which;
                //alert(str.length);
                if(str.length > lengthParam){
                    $(this).val(value);
                }else{
                    value = $(this).val();
                }
            };
        }
    };

    Input.prototype.check = function(){
        var thisObject = this;
        var result = {length:0,result:true};
        var val;
        if(this.inputObj.is('input'))
            val = this.inputObj.val();
        else if(this.inputObj.is('span'))
            val = this.inputObj.attr("value");
        if(this.dataOptions.required == true){
            if(!val){
                result['required'] = 'fail';
                result.result = false;
                result.length++;
            }
        }
        if(this.dataOptions.validtype == 'numOnly'){
            if(!this.setNumOnly()){
                result['numOnly'] = 'fail';
                result.result = false;
                result.length++;
                thisObject.setValue(thisObject.value);
            }else{
                thisObject.value = thisObject.getValue();
            }
        }
        return result;
    };

    Input.prototype.setNumOnly = function(){
        var thisObject = this;
        if(this.inputObj.is('input')){
            var reg = new RegExp("^[0-9]*$");
            if(!reg.test(thisObject.inputObj.val()))
                return false;
            else
                return true;
        }
        return true;
    };

    Input.prototype.getValue = function(){
        var value = "";
        if(this.inputObj.is('input')){
            value = this.inputObj.val();
        }else if(this.inputObj.is('span')){
            value = this.inputObj.attr("value");
        }
        return value;
    };

    Input.prototype.setValue = function(value){
        if(this.inputObj.is("input"))
            this.inputObj.val(value);
        else
            this.inputObj.attr("value",value).html(value);
        this.parentObj.attr("value",value);
        if(this.check())
            this.value = value;
    };

    Input.prototype.clearValue = function(){
        this.setValue("");
    };

    Input.prototype.setStyle = function(){
        var thisObject = this;
        this.inputObj.focus(function(){
            $(this).addClass("focus");
            if(thisObject.dataOptions.button){
                thisObject.buttonObj.addClass("focus");
            }
        }).blur(function(){
            $(this).removeClass("focus");
            if(thisObject.dataOptions.button){
                thisObject.buttonObj.removeClass("focus");
            }
        });
        if(this.dataOptions.button){
            this.buttonObj.mouseover(function(){
                $(this).addClass("mouseover");
            }).mouseout(function(){
                $(this).removeClass("mouseover");
            }).mousedown(function(){
                $(this).addClass("mousedown");
            }).mouseup(function(){
                $(this).removeClass("mousedown");
            });
        }
    };

    Input.prototype.init = function(){
        var thisObject = this;
        //this.$element.attr("id","");
        this.$element.wrap($('<div class="eb_inputGroup" id="'+this.id+'_subgroup" name="'+thisObject.name+'" value="'+thisObject.value+'" data-options="'+thisObject.$element.data("options")+'"></div>'));
        this.$element.before('<span class="eb_title">'+this.title+'</span>');
        this.parentObj = this.$element.parent();               //parentObj
        this.inputObj = this.$element;                //inputObj
        this.inputObj.val(thisObject.value);
        if(this.dataOptions.readonly == true){
            this.inputObj.after($('<span class="eb_input eb_readonly" id="'+thisObject.id+'" name="'+thisObject.name+'" value="'+thisObject.value+'" data-options="'+thisObject.$element.data("options")+'">'+thisObject.value+'</span>'));
            this.inputObj.remove();
            this.$element = this.parentObj.children(".eb_input");
            this.inputObj = this.parentObj.children(".eb_input");           //inputObj
            this.inputObj.data("input",thisObject);
        }
        this.parentObj.data("input",thisObject);
        this.inputObj.attr("style",thisObject.style);
        this.titleObj = this.parentObj.find(".eb_title");           //titleObj
        if(this.dataOptions.required == true){ //如果设定为必填，则显示相应样式
            this.inputObj.attr("placeholder",thisObject.placeholder+"(必填)");
            this.parentObj.append('<span class="redStar" style="color:red;">*</span>');
        }
        if(this.dataOptions.button){
            this.button = this.dataOptions.button;
            if(typeof this.button == "string")
                this.button = window[thisObject.button];
            if(typeof thisObject.button.handler == "string")
                thisObject.button.handler = window[thisObject.button.handler];
            this.inputObj.before($('<span class="eb_button">'+thisObject.button.text+'</span>').click(thisObject.button.handler));
            this.buttonObj = this.parentObj.children(".eb_button");        //buttonObj
            this.buttonObj.mousedown(function(){
                setTimeout(function(){thisObject.inputObj.get(0).focus();},1);
            }).click(function(){
                thisObject.inputObj.get(0).focus();
            });
            this.inputObj.css({position:'relative',right:'-1px'});
        }
        if(this.dataOptions.lengthLimit){
            this.lengthLimit(thisObject.dataOptions.lengthLimit);
        }
        this.setWidth();
        this.setHeight();
        this.setEvent();
    };

    Input.prototype.setEvent = function(){          //处理绑定事件的方法，包括：onclick,onmousedown,onmouseup,ondblclick,onfocus,onblur,onkeypress,onkeydown,onkeyup,onchange
        var TIMEOUT = 250;
        if(this.dataOptions.dblclickTimeSpan)
            TIMEOUT = this.dataOptions.dblclickTimeSpan;
        var thisObject = this;
        var clickTimeoutId = null,mousedownTimeoutId = null,mouseupTimeoutId = null;
        var clickLock = false,mousedownLock = false,mouseupLock = false;
        if(this.dataOptions.onclickHandler){             //onclick
            if(this.dataOptions.ondblclickHandler){
                if(typeof this.dataOptions.onclickHandler == "string"){
                    this.inputObj.get(0).onclick = function(){
                        if(!clickLock){
                            clickTimeoutId = setTimeout(window[this.dataOptions.onclickHandler],TIMEOUT);
                            clickLock = true;
                            setTimeout(function(){clickLock=false;},TIMEOUT);
                        }
                    };
                }else{
                    this.inputObj.get(0).onclick = function(){
                        if(!clickLock){
                            clickTimeoutId = setTimeout(thisObject.dataOptions.onclickHandler,TIMEOUT);
                            clickLock = true;
                            setTimeout(function(){clickLock=false;},TIMEOUT);
                        }
                    };
                }
            }else{
                if(typeof this.dataOptions.onclickHandler == "string"){
                    this.inputObj.get(0).onclick = window[this.dataOptions.onclickHandler];
                }else{
                    this.inputObj.get(0).onclick = thisObject.dataOptions.onclickHandler;
                }
            }
        }
        if(this.dataOptions.onmousedownHandler){             //onmousedown
            if(this.dataOptions.ondblclickHandler){
                if(typeof this.dataOptions.onmousedownHandler == "string"){
                    this.inputObj.get(0).onmousedown = function(){
                        if(!mousedownLock){
                            mousedownTimeoutId = setTimeout(window[this.dataOptions.onmousedownHandler],TIMEOUT);
                            mousedownLock = true;
                            setTimeout(function(){mousedownLock=false;},TIMEOUT);
                        }
                    };
                }else{
                    this.inputObj.get(0).onmousedown = function(){
                        if(!mousedownLock){
                            mousedownTimeoutId = setTimeout(thisObject.dataOptions.onmousedownHandler,TIMEOUT);
                            mousedownLock = true;
                            setTimeout(function(){mousedownLock=false;},TIMEOUT);
                        }
                    };
                }
            }else{
                if(typeof this.dataOptions.onmousedownHandler == "string"){
                    this.inputObj.get(0).onmousedown = window[this.dataOptions.onmousedownHandler];
                }else{
                    this.inputObj.get(0).onmousedown = thisObject.dataOptions.onmousedownHandler;
                }
            }
        }
        if(this.dataOptions.onmouseupHandler){             //onmouseup
            if(this.dataOptions.ondblclickHandler){
                if(typeof this.dataOptions.onmouseupHandler == "string"){
                    this.inputObj.get(0).onmouseup = function(){
                        if(!mouseupLock){
                            mouseupTimeoutId = setTimeout(window[this.dataOptions.onmouseupHandler],TIMEOUT);
                            mouseupLock = true;
                            setTimeout(function(){mouseupLock=false;},TIMEOUT);
                        }
                    };
                }else{
                    this.inputObj.get(0).onmouseup = function(){
                        if(!mouseupLock){
                            mouseupTimeoutId = setTimeout(thisObject.dataOptions.onmouseupHandler,TIMEOUT);
                            mouseupLock = true;
                            setTimeout(function(){mouseupLock=false;},TIMEOUT);
                        }
                    };
                }
            }else{
                if(typeof this.dataOptions.onmouseupHandler == "string"){
                    this.inputObj.get(0).onmouseup = window[this.dataOptions.onmouseupHandler];
                }else{
                    this.inputObj.get(0).onmouseup = thisObject.dataOptions.onmouseupHandler;
                }
            }
        }
        if(this.dataOptions.ondblclickHandler){             //ondblclick
            if(typeof this.dataOptions.ondblclickHandler == "string"){
                this.inputObj.get(0).ondblclick = function(){
                    if(clickTimeoutId){
                        clearTimeout(clickTimeoutId);
                        clickTimeoutId = null;
                    }
                    if(mousedownTimeoutId){
                        clearTimeout(mousedownTimeoutId);
                        mousedownTimeoutId = null;
                    }
                    if(mouseupTimeoutId){
                        clearTimeout(mouseupTimeoutId);
                        mouseupTimeoutId = null;
                    }
                    window[thisObject.dataOptions.ondblclickHandler]();
                };
            }else{
                this.inputObj.get(0).ondblclick = function(){
                    if(clickTimeoutId){
                        clearTimeout(clickTimeoutId);
                        clickTimeoutId = null;
                    }
                    if(mousedownTimeoutId){
                        clearTimeout(mousedownTimeoutId);
                        mousedownTimeoutId = null;
                    }
                    if(mouseupTimeoutId){
                        clearTimeout(mouseupTimeoutId);
                        mouseupTimeoutId = null;
                    }
                    thisObject.dataOptions.ondblclickHandler();
                };
            }
        }
        if(this.dataOptions.onfocusHandler){                //onfocus
            if(typeof this.dataOptions.onfocusHandler == "string"){
                this.inputObj.get(0).onfocus = window[this.dataOptions.onfocusHandler];
            }else{
                this.inputObj.get(0).onfocus = this.dataOptions.onfocusHandler;
            }
        }
        if(this.dataOptions.onblurHandler){                //onblur
            if(typeof this.dataOptions.onblurHandler == "string"){
                this.inputObj.get(0).onblur = window[this.dataOptions.onblurHandler];
            }else{
                this.inputObj.get(0).onblur = this.dataOptions.onblurHandler;
            }
        }
        if(this.dataOptions.onkeypressHandler){                //onkeypress
            if(typeof this.dataOptions.onkeypressHandler == "string"){
                this.inputObj.get(0).onkeypress = window[this.dataOptions.onkeypressHandler];
            }else{
                this.inputObj.get(0).onkeypress = this.dataOptions.onkeypressHandler;
            }
        }
        if(this.dataOptions.onkeydownHandler){                //onkeydown
            if(typeof this.dataOptions.onkeydownHandler == "string"){
                this.inputObj.get(0).onkeydown = window[this.dataOptions.onkeydownHandler];
            }else{
                this.inputObj.get(0).onkeydown = this.dataOptions.onkeydownHandler;
            }
        }
        if(this.dataOptions.onkeyupHandler){                //onkeyup
            if(typeof this.dataOptions.onkeyupHandler == "string"){
                this.inputObj.get(0).onkeyup = window[this.dataOptions.onkeyupHandler];
            }else{
                this.inputObj.get(0).onkeyup = this.dataOptions.onkeyupHandler;
            }
        }
        if(this.dataOptions.onchangeHandler){                //onchange
            if(typeof this.dataOptions.onchangeHandler == "string"){
                this.inputObj.get(0).onchange = window[this.dataOptions.onchangeHandler];
            }else{
                this.inputObj.get(0).onchange = this.dataOptions.onchangeHandler;
            }
        }
    };

    Input.prototype.setWidth = function(){
        if(this.dataOptions.width){ //宽度
            var width = null;
            if(isNaN(this.dataOptions.width))
                width = this.dataOptions.width.split("px")[0];
            else
                width = this.dataOptions.width;
            this.parentObj.css("width",width);
            if(this.dataOptions.button)
                this.inputObj.width(width-140);
            else
                this.inputObj.width(width-80);
        }
        if(this.dataOptions.titleWidth || this.dataOptions.titleWidt == 0){
            var titleWidth = this.dataOptions.titleWidth;
            if(typeof titleWidth == "string")
                titleWidth = titleWidth.split("px")[0];
            var width = this.parentObj.width();
            var inputWidth = width - titleWidth - 7;
            if(this.dataOptions.button)
                inputWidth = inputWidth - 60;
            this.titleObj.width(titleWidth);
            this.inputObj.width(inputWidth);
        }
    };

    Input.prototype.setHeight = function(){
        if(this.dataOptions.height){ //高度
            var height = null;
            if(isNaN(this.dataOptions.height))
                height = this.dataOptions.height.split("px")[0];
            else
                height = this.dataOptions.height;
            this.parentObj.css("height",height);
            this.inputObj.css("height",height-2);
            this.titleObj.height(height+2).css("line-height",(height+2)+"px");
            if(this.inputObj.is('span')){
                this.inputObj.height(height).css("line-height",(height)+"px");
            }
            if(this.buttonObj)
                this.buttonObj.height(height).css("line-height",(height)+"px");
        }
    };

    $.fn.input = function (option,param) {
        var result = null;
        var thisObj = this.each(function () {
            var $this = $(this)
                , thisObject = $this.data('input')
                , dataOptions = typeof option == 'object' && option;
            if(typeof option == 'string' ){
                result = thisObject[option](param);
            }else{
                $this.data('input', (thisObject = new Input(this, dataOptions)));
            }
        });
        if(typeof option == 'string' )return result;
        return thisObj;
    };

    $.fn.input.defaults = {
        required:false,
        dblclickTimeSpan:250,
        width:250,
        height:20,
        titleWidth:73,
        readonly:false
    };

    $(window).on('load', function(){
        $(".eb_input").each(function () {
            var thisObj = $(this)
                , dataOptionsStr = thisObj.data('options');
            if(!dataOptionsStr)
                thisObj.input($.fn.input.defaults);
            else
                thisObj.input((new Function("return {" + dataOptionsStr + "}"))());
        });
    });
}(window.jQuery);


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

    var _defaultOptions = {
        label:null,
        button:null,//button={iconCls:"",handler:""}
        value:null
    };

    var INPUT_GROUP = "input-group",
        INPUT_BTN   = "input-btn",
        WITH_BTN    = "with-btn";

    var Input = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        this.$inputGroup = null;
        cri.Widgets.apply(this,arguments);
    });

    $.extend(Input.prototype,{
        _eventListen:function(){

        },

        _init:function(){
            this._createInputGroup();
        },

        _createInputGroup:function(){
            var op = this.options,
                label = op.label || "",
                $label = $('<label></label>').text(label),
                $input = this.$element;

            $input.wrap('<div class="'+ INPUT_GROUP + '"></div>');
            if(op.value != null){
                $input.val(op.value);
            }
            var $inputGroup = $input.parent();
            this.$inputGroup = $inputGroup;
            if(op.button){
                var $icon = $('<i class="' + INPUT_BTN + " " + op.button.iconCls + '"></i>').on("click",function(){
                    op.button.handler.call();
                });
                $inputGroup.append($icon);
                $input.addClass(WITH_BTN);
            }
            $inputGroup.prepend($label);
        },

        _destory:function(){
            var $input = this.$element;
            this.$inputGroup.replaceWith($input);
        }
    });
    cri.Input = Input;

    $.fn.input = function(option) {
        var input = null;
        this.each(function () {
            var $this   = $(this),
                input   = $this.data('input'),
                options = typeof option == 'object' && option;
            if(input != null){
                input._destory();
            }
            $this.data('input', (input = new Input(this, options)));
        });
        return input;
    };
}(window);
/*=====================================================================================
 * easy-bootstrap-marquee v1.0
 *
 * @author:zhouzy
 * @date:2013/09/16
 * @dependce:jquery
 *=====================================================================================*/
!function($){
    "use strict";

    var Marquee = function (element, options) {
        this.options = $.extend({}, $.fn.marquee.defaults, options);
        this.$element = $(element);
        this.scrollInterval = null;
        this.contentInterval = null;
        this.$one = null;
        this.$two = null;
        this.ita = 0;
        this.init();
    };

    Marquee.prototype = {
        eventListen:function(){
            var that = this;
            this.$element.on("mouseenter",function(){
                clearInterval(that.scrollInterval);
            }).on("mouseleave",function(){
                that.start();
            });
        },

        init:function () {
            var that = this;
            this.ita = 0;
            if(this.options.content.length > 0){
                this.createEle();
                this.contentInterval = window.setInterval(function(){
                    that.start();
                },3000);
                this.eventListen();
            }
        },

        createEle:function(){
            this.$one || this.$element.append("<div class=\"contentOne\"></div>");
            this.$two || this.$element.append("<div class=\"contentTwo\"></div>");
            this.$one = $(".contentOne",this.$element);
            this.$two = $(".contentTwo",this.$element);
            if(this.options.content){
                this.$one.html("<span>" + this.options.content[0].text + "</span>");
                this.$two.html("<span>" + this.options.content[0].text + "</span>");
            }
        },
        start:function(){
            this.ita++;
            this.ita>=this.options.content.length && (this.ita=0);
            this.$two.html("<span>" + this.options.content[this.ita].text + "</span>");
            this.$element.scrollTop(0);
            clearInterval(this.scrollInterval);
            var that = this;
            this.scrollInterval = window.setInterval(function(){
                that.scroll();
            },20);
        },
        stop:function(){
            clearInterval(this.contentInterval);
        },
        scroll:function(){
            this.$element.scrollTop(this.$element.scrollTop() + 1);
            if(this.$element.scrollTop % 20 == 20){
                clearInterval(this.scrollInterval);
            }
        },

        refreshContent:function(param){
            this.options.content = param;
            this.init();
        }
    };

    $.fn.marquee = function (option,param) {
        var result = null;
        var $marquee = this.each(function () {
            var $this = $(this)
                , data = $this.data('marquee')
                , options = typeof option == 'object' && option;
            if(typeof option == 'string' ){
                result = data[option](param);
            }else{
                $this.data('marquee', (data = new Marquee(this, options)));
            }
        });
        if(typeof option == 'string')return result;
        return $marquee;
    };

    $.fn.marquee.defaults = {
        content:[],
        delayTime:3000,
        height:20
    };

    $(window).on('load', function(){
        $("[class='marquee']").each(function () {
            var $this = $(this)
                ,data = $this.data('options');
            if(!data) return;
            $this.marquee((new Function("return {" + data + "}"))());
        });
    });

}(window.jQuery);


/*=====================================================================================
 * easy-bootstrap-messager v1.0
 *
 * @author:zhouzy
 * @date:2013/10/18
 * @dependce:jquery
 *=====================================================================================*/
!function($){
    var Messager = function(){
        this.messagerQueue = [];
        var that = this;
        window.MessagerOkBtn = function(){
            $("#EASYBOOTSTARPMSGWND").popoutWindow("hide");
            $("#EASYBOOTSTARPMSGWND").html("");
            var msg = that.messagerQueue.pop();
            if(msg.length == 3){
                msg[2](true);
            }
        };
        window.MessagerCancelBtn = function(){
            $("#EASYBOOTSTARPMSGWND").popoutWindow("hide");
            $("#EASYBOOTSTARPMSGWND").html("");
            var msg = that.messagerQueue.pop();
            if(msg.length == 3){
                msg[2](false);
            }
        };
        window.MessagerCloseBtn = function(){
            $("#EASYBOOTSTARPMSGWND").popoutWindow("hide");
            $("#EASYBOOTSTARPMSGWND").html("");
            var msg = that.messagerQueue.pop();
            if(msg.length == 3){
                msg[2](false);
            }
        };
    };
    Messager.prototype = {
        alert:function(title,content,iconSty){
            this.messagerQueue.push(arguments);
            var id = "EASYBOOTSTARPMSGWND";
            $("#EASYBOOTSTARPMSGWND").length > 0 || $("body").append("<div class=\"eb_popoutWindow\" id=\"" + id + "\"></div>");
            var $wnd = $("#EASYBOOTSTARPMSGWND");
            $wnd.html(content);
            $wnd.popoutWindow({
                title:title,
                buttons:[
                    {text:'确定',icon:'eb_iconOK',handler:'MessagerOkBtn'}
                ],
                width:500,
                height:300,
                left:440,
                top:100
            });
            $wnd.popoutWindow("show");
        },
        confirm:function(title,content,callBack){
            this.messagerQueue.push(arguments);
            var id = "EASYBOOTSTARPMSGWND";
            $("#EASYBOOTSTARPMSGWND").length > 0 || $("body").append("<div class=\"eb_popoutWindow\" id=\"" + id + "\"></div>");
            var $wnd = $("#EASYBOOTSTARPMSGWND");
            $wnd.html(content);
            $wnd.popoutWindow({
                title:title,
                buttons:[
                    {text:'确定',icon:'eb_iconOK',handler:'MessagerOkBtn'},
                    {text:'取消',icon:'eb_iconCancel',handler:'MessagerCancelBtn'}
                ],
                width:500,
                height:300,
                left:440,
                top:100
            });
            $wnd.popoutWindow("show");
        }
    };
    $.messager = new Messager();
}(jQuery);



/*=====================================================================================
 * easy-bootstrap-msgWindow v2.0
 *
 * @author:niyq
 * @date:2013/09/05
 * @dependce:jquery
 *=====================================================================================*/
!function($){

    "use strict";

    var MsgWindow = function(element,dataOptions){
        var thisObject = this;
        this.$element = $(element);
        this.dataOptions = $.extend({}, $.fn.msgWindow.defaults, dataOptions);
        this.title = "系统消息";
        if(this.$element.attr("title"))
            this.title = this.$element.attr("title");
        if(this.dataOptions.title)
            this.title = this.dataOptions.title;
        this.id = this.$element.attr("id");
        if(!this.$element.attr("class") || this.$element.attr("class").indexOf("inited")<0){
            this.init();
        }
    };

    MsgWindow.prototype.refreshInit = function(param){
        var thisObject = this;
        this.dataOptions = $.extend(thisObject.dataOptions,param);
        if(param && param.html){
            this.html(param.html);
        }
        if(param && param.width){
            this.setWidth(param.width);
        }
        if(param && param.height){
            this.setHeight(param.height);
        }
    }

    MsgWindow.prototype.init = function(){
        var thisObject = this;
        this.windowObj = this.$element;                                 //windowObj
        if(!this.windowObj.attr("class") || this.windowObj.attr("class").indexOf("eb_msgWindow")<0){
            this.windowObj.addClass("eb_msgWindow");
        }
        this.windowObj.addClass('inited');
        this.windowObj.wrap($('<div class="eb_msgWindowGroup"></div>'));
        this.parent = this.windowObj.parent();                            //parent
        this.parent.prepend($('<span class="eb_title">'+thisObject.title+'</span><span class="eb_closeMsgWindowBtn">x</span>'));
        this.titleObj = this.parent.children(".eb_title");              //titleObj
        this.closeBtnObj = this.parent.children(".eb_closeMsgWindowBtn");     //closeBtnObj
        this.closeBtnObj.mouseover(function(){
            $(this).addClass("mouseover");
        }).mouseout(function(){
            $(this).removeClass("mouseover");
        }).click(function(){
            thisObject.hide();
        });
        if(this.dataOptions && this.dataOptions.html){
            this.windowObj.html(thisObject.dataOptions.html);
        }
        this.setWidth();
        this.setHeight();
    };

    MsgWindow.prototype.html = function(html){
        this.$element.html(html);
    }

    MsgWindow.prototype.show = function(){
        var thisObject = this;
        clearTimeout(thisObject.autoHideTimeoutId);
        this.parent.fadeIn(300);
        if(this.dataOptions.autoHide == true){
            var time = this.dataOptions.autoHideTime;
            this.autoHideTimeoutId = setTimeout(function(){thisObject.parent.fadeOut(300)},time);
        }
    }

    MsgWindow.prototype.hide = function(){
        this.parent.hide();
    }

    MsgWindow.prototype.remove = function(){
        this.parent.remove();
    }

    MsgWindow.prototype.setWidth = function(widthParam){
        var width = this.dataOptions.width;
        if(widthParam)
            width = widthParam;
        if(typeof width == "string")
            width = width.split("px")[0];
        this.parent.width(width);
        this.windowObj.width(width-22);
        this.titleObj.width(width-1);
    }

    MsgWindow.prototype.setHeight = function(heightParam){
        var height = this.dataOptions.height;
        if(heightParam)
            height = heightParam;
        if(typeof height == "string")
            height = height.split("px")[0];
        this.parent.height(height);
        this.windowObj.height(height-46);
    }

    $.msgWindow = function(msg,title,url,param){
        var obj;
        var result;
        if(!title)
            title = "系统消息";
        if(url)
            $('body').prepend(obj = $('<div class="eb_msgWindow" data-options="title:\''+title+'\'"><a href="'+url+'">'+msg+'</a></div>'));
        else
            $('body').prepend(obj = $('<div class="eb_msgWindow" data-options="title:\''+title+'\'">'+msg+'</div>'));
        var str = "title:'"+title+"',";
        var strArr = [];
        for(var i in param){
            strArr.push(i);
        }
        for(var i=0;i<strArr.length;i++){
            if(i<strArr.length-1){
                str = str + strArr[i] + ":" + param[strArr[i]] + ",";
            }else{
                str = str + strArr[i] + ":" + param[strArr[i]];
            }
        }
        obj.data("options",str);
        obj.each(function(){
            var thisObj = $(this)
                , dataOptionsStr = thisObj.data('options');
            if(!dataOptionsStr)
                result = thisObj.msgWindow($.fn.msgWindow.defaults);
            else
                result = thisObj.msgWindow((new Function("return {" + dataOptionsStr + "}"))());
        });
        obj.msgWindow('show');
        return result;
    };

    $.fn.msgWindow = function (option,param) {
        var result = null;
        var thisObj = this.each(function () {
            var $this = $(this)
                , thisObject = $this.data('msgWindow')
                , dataOptions = typeof option == 'object' && option;
            if(typeof option == 'string' ){
                result = thisObject[option](param);
            }else{
                if(!thisObject){
                    $this.data('msgWindow', (thisObject = new MsgWindow(this, dataOptions)));
                }else{
                    thisObject.refreshInit(option);
                }
            }
        });
        if(typeof option == 'string' )return result;
        return thisObj;
    };

    $.fn.msgWindow.defaults = {
        width:220,
        height:150,
        autoHide:false,
        autoHideTime:5000
    };

    $(window).on('load', function(){
        $(".eb_msgWindow").not(".inited").each(function () {
            var thisObj = $(this)
                , dataOptionsStr = thisObj.data('options');
            if(!dataOptionsStr)
                thisObj.msgWindow($.fn.msgWindow.defaults);
            else
                thisObj.msgWindow((new Function("return {" + dataOptionsStr + "}"))());
        });
    });
}(window.jQuery);

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

    var FIRSTPAGE = "first-page",
        PREVPAGE  = "prev-page",
        NEXTPAGE  = "next-page",
        LASTPAGE  = "last-page",
        PAGENUMBER    = "pager-number",
        PAGENAV       = "pager-nav",
        PAGEINFO      = "pager-info",
        STATEDISABLED = "state-disabled",
        STATEDSTATE   = "state-selected";

    var Pager = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        this.pager = null;
        cri.Widgets.apply(this,arguments);
    });

    $.extend(Pager.prototype,{
        _eventListen:function(){
            var that = this;
            this.$pager.on("click","a:not('."+STATEDISABLED+"')",function(e){
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

            var $pagerBtn   = $("<div></div>").addClass(PAGENAV),
                $firstPage  = $('<a></a>').addClass(FIRSTPAGE).append('<span class="fa fa-angle-double-left"></span>'),
                $prevPage   = $('<a></a>').addClass(PREVPAGE).append('<span class="fa fa-angle-left"></span>'),
                $nextPage   = $('<a></a>').addClass(NEXTPAGE).append('<span class="fa fa-angle-right"></span>'),
                $lastPage   = $('<a></a>').addClass(LASTPAGE).append('<span class="fa fa-angle-double-right"></span>'),
                $numberPage = $("<ul></ul>").addClass(PAGENUMBER);

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

                $pagerBtn   = $("." + PAGENAV,this.$pager),
                $firstPage  = $("." + FIRSTPAGE,$pagerBtn),
                $prevPage   = $("." + PREVPAGE,$pagerBtn),
                $nextPage   = $("." + NEXTPAGE,$pagerBtn),
                $lastPage   = $("." + LASTPAGE,$pagerBtn),
                $numberPage = $("." + PAGENUMBER,$pagerBtn);

            this._fourBtn($firstPage,$prevPage,$nextPage,$lastPage,page,lastPage);
            $numberPage.empty();
            this._numberPage($numberPage,page,lastPage);
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

        _numberPage:function($numberPage,page,lastPage){
            for(var i=-2; i<3; i++){
                var shiftPage = i + page;
                if(shiftPage>0 && shiftPage <= lastPage){
                    var $li = $("<li></li>"),
                        $a  = $("<a></a>").data("page",shiftPage).text(shiftPage);
                    shiftPage != page ?
                        $a.addClass("pager-num"):
                        $a.addClass(STATEDSTATE);
                    $numberPage.append($li.append($a));
                }
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
                $pagerInfo = $("."+PAGEINFO,$pager);

            $pagerInfo.text(numStart + ' - ' + numEnd + ' of ' + total + ' items');
        },

        _createPagerInfo:function(){
            var op  = this.options,
                pageSize  = op.pageSize || 10,
                total     = op.total || 0,
                page      = parseInt(op.page) || 1,
                numStart  = (page-1) * pageSize + 1,
                numEnd    = (page-1) * pageSize + op.rowsLen;

            return $("<div></div>").addClass(PAGEINFO).text(numStart + ' - ' + numEnd + ' of ' + total + ' items');
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
            op.onUpdate && op.onUpdate(this);
        }
    });
    cri.Pager = Pager;
}(window);

/*=====================================================================================
 * easy-bootstrap-panel v2.0
 *
 * @author:niyq
 * @date:2013/08/22
 * @dependce:jquery
 *=====================================================================================*/
!function($){

    "use strict";

    var Panel = function(element,dataOptions){
        var thisObject = this;
        this.$element = $(element);
        this.dataOptions = $.extend({}, $.fn.panel.defaults, dataOptions);
        this.title = '';
        if(this.$element.attr('title'))
            this.title = this.$element.attr("title");
        if(this.dataOptions.title)
            this.title = this.dataOptions.title;
        this.id = this.$element.attr("id");
        this.init();
    };

    Panel.prototype.init = function(){
        var thisObject = this;
        this.$element.wrap($('<div class="eb_panelGroup"></div>'));
        this.parent = this.$element.parent();                                                    //parent
        this.parent.data('panel',thisObject.$element.data('panel'));
        this.parent.data('options',thisObject.$element.data('options'));
        this.parent.prepend($('<div class="eb_panelTitleBar">'+thisObject.title+'</div>'));
        this.titleBarObj = this.parent.children('.eb_panelTitleBar');                             //titleBarObj
        this.setWidth();
        this.setHeight();
    };

    Panel.prototype.setWidth = function(widthParam){
        var width = 600;
        if(this.$element.css('width'))
            width = this.$element.css('width');
        if(this.dataOptions.width)
            width = this.dataOptions.width;
        if(widthParam)
            width = widthParam;
        if(typeof width == 'string')
            width = width.split('px')[0];
        this.parent.width(width);
        this.$element.width(width-2);
        this.titleBarObj.width(width-2);
    }

    Panel.prototype.setHeight = function(heightParam){
        var height = 80;
        if(this.$element.css('height'))
            height = this.$element.css('height');
        if(this.dataOptions.height)
            height = this.dataOptions.height;
        if(heightParam)
            height = heightParam;
        if(typeof height == 'string')
            height = height.split('px')[0];
        this.parent.height(height);
        this.$element.height(height-26);
    }

    $.fn.panel = function (option,param) {
        var result = null;
        var thisObj = this.each(function () {
            var $this = $(this)
                , thisObject = $this.data('panel')
                , dataOptions = typeof option == 'object' && option;
            if(typeof option == 'string' ){
                result = thisObject[option](param);
            }else{
                $this.data('panel', (thisObject = new Panel(this, dataOptions)));
            }
        });
        if(typeof option == 'string' )return result;
        return thisObj;
    };

    $.fn.panel.defaults = {
        width:600,
        height:80
    };

    $(window).on('load', function(){
        $(".eb_panel").each(function () {
            var thisObj = $(this)
                , dataOptionsStr = thisObj.data('options');
            if(!dataOptionsStr)
                thisObj.panel($.fn.panel.defaults);
            else
                thisObj.panel((new Function("return {" + dataOptionsStr + "}"))());
        });
    });
}(window.jQuery);
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
        this.title = this.dataOptions.title || this.$element.attr("title") || "";
        this.id = this.$element.attr("id");
        this.funcArr = {};
        this.init();     //初始化popoutWindowGroup组件
    };

    PopoutWindow.prototype.init = function(){
        var thisObject = this;
        this.$element.wrap('<div class="eb_popoutWindowGroup" id="'+thisObject.id+'_subgroup"></div>');
        this.parent = this.$element.parent();      //parent
        this.parent.data("popoutWindow",thisObject);
        if(thisObject.$element.data("form"))
            this.parent.data("form",thisObject.$element.data("form"));
        this.popoutWindowObj = this.$element;     //popoutWindowObj
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
                var button = thisObject.buttonsArr[i];
                var func = button.handler;
                typeof func == "string" && (func = window[func]);
                thisObject.funcArr[i] = func;
                var $button = $('<span class="eb_buttons" funcIndex="'+i+'"></span>');
                button.icon && $button.append('<i class="eb_icon '+button.icon+'"></i>');
                $button.append(button.text);
                $button.on("click",function(){
                    var thisObj = this;
                    thisObject.funcArr[$(thisObj).attr("funcIndex")]();
                });
                this.buttonsBar.prepend($button);
            }
        }
        this.buttonsObj = this.buttonsBar.children('.eb_buttons');     //buttonsObj
        if(this.dataOptions.fullScreen){
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


/**
 * Author zhouzy
 * Date   2014/9/18
 * SelectBox 组件
 *
 */
!function(window){

    "use strict";

    var cri = window.cri,
        $   = window.jQuery;

    var _defaultOptions = {
        label:''
        ,data:null//Array [{value:"",text:""},{value:"",text:""}]
        ,optionLabel:''
        ,value:null//Function: get or set selectBox value
        ,text:null//Function: get or set selectBox text
        ,change:null//Function: call back after select option
    };

    var SELECTBOX_GROUP = "selectBox-group",
        SELECTBOX_BODY  = "selectBox-body",
        SELECTBOX_INPUT = "selectBox-input",
        SELECTBOX_BTN   = "selectBox-btn",
        OPTIONS  = "options",
        SELECTED = "selected";

    /**
     * TODO:1.增加级联下拉框特性
     */
    var SelectBox = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        this.$selectBoxGroup = null;
        this.$selectBoxInput = null;
        this.$selectBoxOptions = null;
        this._value = null;
        this._text = null;
        cri.Widgets.apply(this,arguments);
    });

    $.extend(SelectBox.prototype,{
        _eventListen:function(){
        },

        _init:function(){
            this._create();
        },

        _create:function(){
            this.$element.hide();
            this.$element.wrap('<span class="' + SELECTBOX_GROUP + '"></span>');
            var $selectBoxGroup = this.$selectBoxGroup = this.$element.parent();
            $selectBoxGroup.append('<label>' + this.options.label + '</label>');
            $selectBoxGroup.append(this._createBody(),this._createOptions())
        },

        _createBody:function(){
            var $selectBody = $('<span class="' + SELECTBOX_BODY + '"></span>'),
                $selectInput = this.$selectBoxInput = $('<span class="' + SELECTBOX_INPUT + '"></span>'),
                $btn = $('<i class="' + SELECTBOX_BTN +' fa fa-caret-down"></i>');
            $selectBody.append($selectInput,$btn);
            $selectBody.on("click",this._toggleOptions());
            return $selectBody;
        },

        /**
         * 初始化下拉选择框
         * @returns {*|HTMLElement}
         * @private
         */
        _createOptions:function(){
            var data = this._data();
            var $options = this.$selectBoxOptions = $('<ul class="' + OPTIONS + '"></ul>').hide();
            if(data){
                for(var i = 0,len = data.length; i<len; i++){
                    $options.append(this._createOption(data[i]));
                }
            }
            return $options;
        },

        /**
         * 构造单个option
         * @param option
         * @private
         */
        _createOption:function(option){
            var $li = $('<li></li>').text(option.text),
                that = this;
            $li.on("click",function(e){
                if(!$li.is("." + SELECTED)){
                    $("li."+SELECTED,that.$selectBoxOptions).removeClass(SELECTED);
                    $li.addClass(SELECTED);
                    that._select(option.text,option.value);
                    that.options.change && that.options.change.call(that);
                }
            })
            .on("click",that._toggleOptions());
            return $li;
        },

        /**
         * 显示隐藏切换options选择框
         * @private
         */
        _toggleOptions:function(){
            var that = this;
            return function(){
                that.$selectBoxOptions.animate({
                    height:'toggle'
                },200,function(){
                    if(!that.$selectBoxOptions.is(":hidden")){
                        that._clickBlank();
                    }
                });
                return false;
            };
        },

        /**
         * 当在非本元素范围内点击，收缩下拉框
         * @private
         */
        _clickBlank:function(){
            var that = this;
            $(document).mouseup(function(e) {
                var _con = that.$selectBoxGroup;
                if (!_con.is(e.target) && _con.has(e.target).length === 0) {
                    that.$selectBoxOptions.animate({
                        height:'hide'
                    },200);
                }
            });
        },

        /**
         * 获取options定义
         * 1.初始化时定义
         * 2.原始select元素options获取
         * @private
         */
        _data:function(){
            var data = this.options.data;
            if(!data){
                data = [];
                $("option",this.$element).each(function(){
                        var text = $(this).text();
                        var value = this.value;
                        data.push({text:text,value:value});
                    }
                );
            }
            this.options.data = data;
            return data;
        },

        /**
         * 单击option触发
         * @param e
         * @private
         */
        _select:function(text,value){
            //TODO:原来元素必须为select
            var $select = this.$element;
            if($select.is("select")){
                $select.val(value);
            }
            this.$selectBoxInput.text(text);
            this._text = text;
            this._value = value;
        },

        /**
         * get or set selectBox value
         * @param value
         * @returns {*}
         */
        value:function(value){
            if(arguments.length>0){
                this._value = value;
                this.$element.val(value);
                this.$selectBoxInput.text(this.options.data[value]);
            }
            else{
                return this._value;
            }
        },

        /**
         * get or set selectBox text
         * @param text
         * @returns {*}
         */
        text:function(text){
            if(arguments.length>0){
                var value = null;
                for(var p in this.options.data){
                    if(p.text === text){
                        value = p.value || "";
                    }
                }
                this._value = value;
                this.$element.val(value);
                this.$selectBoxInput.text(text);
            }
            else{
                return this._text;
            }
        }
    });

    cri.SelectBox = SelectBox;

    $.fn.selectBox = function(option) {
        var o = null;
        this.each(function () {
            var $this = $(this),
                options = typeof option == 'object' && option;
            o = $this.data('selectBox');
            if(o != null){}
            $this.data('selectBox', (o = new SelectBox(this, options)));
        });
        return o;
    };
}(window);

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
 * easy-bootstrap-textarea v2.0
 *
 * @author:niyq
 * @date:2013/08/22
 * @dependce:jquery
 *=====================================================================================*/
!function($){

    "use strict";

    var Textarea = function(element,dataOptions){
        var thisObject = this;
        this.$element = $(element);
        this.dataOptions = $.extend({}, $.fn.textarea.defaults, dataOptions);
        this.value = this.$element.val();
        this.title="";
        if(this.$element.attr("title"))
            this.title = this.$element.attr("title");
        if(this.dataOptions.title)
            this.title = this.dataOptions.title;
        this.id = this.$element.attr("id");
        this.name = this.$element.attr("name");
        if(this.$element.attr("placeholder"))
            this.placeholder = this.$element.attr("placeholder");
        else
            this.placeholder = "";
        this.init();     //初始化textareaGroup组件
        this.setStyle();
        this.$element.change(function(){
            thisObject.check();
        });
    };

    Textarea.prototype.check = function(){
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

    Textarea.prototype.init = function(){
        var thisObject = this;
        this.$element.wrap($('<div class="eb_textareaGroup" name="'+thisObject.name+'" value="'+thisObject.value+'" data-options="'+thisObject.$element.data('options')+'" id="'+thisObject.id+'_subgroup"></div>'));
        this.parent = this.$element.parent();                 //parent
        this.parent.data('textarea',thisObject);
        this.parent.prepend('<div class="eb_title">'+this.title+'</div>');
        this.titleObj = this.parent.children('.eb_title');          //titleObj
        this.textareaObj = this.$element;                             //textareaObj
        if(this.dataOptions.defaultVal)
            this.textareaObj.val(thisObject.dataOptions.defaultVal);
        //this.textareaObj.attr("id","");
        if(this.dataOptions.required == true){
            this.textareaObj.attr('placeholder',thisObject.placeholder+'（必填）');
            this.parent.append('<span class="redStar">*</span>');
        }
        this.style = this.textareaObj.attr("style");
        this.parent.attr("style",thisObject.style);
        this.setWidth();
        this.setHeight();
        this.setEvent();
    };

    Textarea.prototype.setWidth = function(){
        if(this.dataOptions.width){
            var width = this.dataOptions.width;
            if(typeof width == "string")
                width = width.split("px")[0];
            this.parent.width(width);
            this.textareaObj.width(width-86);
        }
        if(this.dataOptions.titleWidth || this.dataOptions.titleWidth == 0){
            var titleWidth = this.dataOptions.titleWidth;
            if(typeof titleWidth == "string")
                titleWidth = titleWidth.split("px")[0];
            var width = this.parent.width();
            var textareaWidth = width - titleWidth - 13;
            this.textareaObj.width(textareaWidth);
            this.titleObj.width(titleWidth);
        }
    };

    Textarea.prototype.setValue = function(value){
        this.textareaObj.val(value);
        this.parent.attr("value",value);
    };

    Textarea.prototype.getValue = function(){
        return this.textareaObj.val();
    };

    Textarea.prototype.clearValue = function(){
        this.setValue("");
    };

    Textarea.prototype.setHeight = function(){
        if(this.dataOptions.height){
            var height = this.dataOptions.height;
            if(typeof height == "string")
                height = height.split("px")[0];
            this.parent.height(height);
            this.textareaObj.height(height-6);
        }
    };

    Textarea.prototype.setStyle = function(){
        var thisObject = this;
        this.textareaObj.focus(function(){
            thisObject.textareaObj.addClass("focus");
        }).blur(function(){
            thisObject.textareaObj.removeClass("focus");
        });
    };

    Textarea.prototype.check = function(){
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
        if(this.dataOptions.validtype == 'numOnly'){
            if(!this.setNumOnly()){
                result['numOnly'] = 'fail';
                result.result = false;
                result.length++;
                thisObject.setValue(thisObject.value);
            }else{
                thisObject.value = thisObject.getValue();
            }
        }
        return result;
    };

    Textarea.prototype.setEvent = function(){          //处理绑定事件的方法，包括：onclick,onmousedown,onmouseup,ondblclick,onfocus,onblur,onkeypress,onkeydown,onkeyup,onchange
        var TIMEOUT = 250;
        if(this.dataOptions.dblclickTimeSpan)
            TIMEOUT = this.dataOptions.dblclickTimeSpan;
        var thisObject = this;
        var clickTimeoutId = null,mousedownTimeoutId = null,mouseupTimeoutId = null;
        var clickLock = false,mousedownLock = false,mouseupLock = false;
        if(this.dataOptions.onclickHandler){             //onclick
            if(this.dataOptions.ondblclickHandler){
                if(typeof this.dataOptions.onclickHandler == "string"){
                    this.textareaObj.get(0).onclick = function(){
                        if(!clickLock){
                            clickTimeoutId = setTimeout(window[this.dataOptions.onclickHandler],TIMEOUT);
                            clickLock = true;
                            setTimeout(function(){clickLock=false;},TIMEOUT);
                        }
                    };
                }else{
                    this.textareaObj.get(0).onclick = function(){
                        if(!clickLock){
                            clickTimeoutId = setTimeout(thisObject.dataOptions.onclickHandler,TIMEOUT);
                            clickLock = true;
                            setTimeout(function(){clickLock=false;},TIMEOUT);
                        }
                    };
                }
            }else{
                if(typeof this.dataOptions.onclickHandler == "string"){
                    this.textareaObj.get(0).onclick = window[this.dataOptions.onclickHandler];
                }else{
                    this.textareaObj.get(0).onclick = thisObject.dataOptions.onclickHandler;
                }
            }
        }
        if(this.dataOptions.onmousedownHandler){             //onmousedown
            if(this.dataOptions.ondblclickHandler){
                if(typeof this.dataOptions.onmousedownHandler == "string"){
                    this.textareaObj.get(0).onmousedown = function(){
                        if(!mousedownLock){
                            mousedownTimeoutId = setTimeout(window[this.dataOptions.onmousedownHandler],TIMEOUT);
                            mousedownLock = true;
                            setTimeout(function(){mousedownLock=false;},TIMEOUT);
                        }
                    };
                }else{
                    this.textareaObj.get(0).onmousedown = function(){
                        if(!mousedownLock){
                            mousedownTimeoutId = setTimeout(thisObject.dataOptions.onmousedownHandler,TIMEOUT);
                            mousedownLock = true;
                            setTimeout(function(){mousedownLock=false;},TIMEOUT);
                        }
                    };
                }
            }else{
                if(typeof this.dataOptions.onmousedownHandler == "string"){
                    this.textareaObj.get(0).onmousedown = window[this.dataOptions.onmousedownHandler];
                }else{
                    this.textareaObj.get(0).onmousedown = thisObject.dataOptions.onmousedownHandler;
                }
            }
        }
        if(this.dataOptions.onmouseupHandler){             //onmouseup
            if(this.dataOptions.ondblclickHandler){
                if(typeof this.dataOptions.onmouseupHandler == "string"){
                    this.textareaObj.get(0).onmouseup = function(){
                        if(!mouseupLock){
                            mouseupTimeoutId = setTimeout(window[this.dataOptions.onmouseupHandler],TIMEOUT);
                            mouseupLock = true;
                            setTimeout(function(){mouseupLock=false;},TIMEOUT);
                        }
                    };
                }else{
                    this.textareaObj.get(0).onmouseup = function(){
                        if(!mouseupLock){
                            mouseupTimeoutId = setTimeout(thisObject.dataOptions.onmouseupHandler,TIMEOUT);
                            mouseupLock = true;
                            setTimeout(function(){mouseupLock=false;},TIMEOUT);
                        }
                    };
                }
            }else{
                if(typeof this.dataOptions.onmouseupHandler == "string"){
                    this.textareaObj.get(0).onmouseup = window[this.dataOptions.onmouseupHandler];
                }else{
                    this.textareaObj.get(0).onmouseup = thisObject.dataOptions.onmouseupHandler;
                }
            }
        }
        if(this.dataOptions.ondblclickHandler){             //ondblclick
            if(typeof this.dataOptions.ondblclickHandler == "string"){
                this.textareaObj.get(0).ondblclick = function(){
                    if(clickTimeoutId){
                        clearTimeout(clickTimeoutId);
                        clickTimeoutId = null;
                    }
                    if(mousedownTimeoutId){
                        clearTimeout(mousedownTimeoutId);
                        mousedownTimeoutId = null;
                    }
                    if(mouseupTimeoutId){
                        clearTimeout(mouseupTimeoutId);
                        mouseupTimeoutId = null;
                    }
                    window[thisObject.dataOptions.ondblclickHandler]();
                };
            }else{
                this.textareaObj.get(0).ondblclick = function(){
                    if(clickTimeoutId){
                        clearTimeout(clickTimeoutId);
                        clickTimeoutId = null;
                    }
                    if(mousedownTimeoutId){
                        clearTimeout(mousedownTimeoutId);
                        mousedownTimeoutId = null;
                    }
                    if(mouseupTimeoutId){
                        clearTimeout(mouseupTimeoutId);
                        mouseupTimeoutId = null;
                    }
                    thisObject.dataOptions.ondblclickHandler();
                };
            }
        }
        if(this.dataOptions.onfocusHandler){                //onfocus
            if(typeof this.dataOptions.onfocusHandler == "string"){
                this.textareaObj.get(0).onfocus = window[this.dataOptions.onfocusHandler];
            }else{
                this.textareaObj.get(0).onfocus = this.dataOptions.onfocusHandler;
            }
        }
        if(this.dataOptions.onblurHandler){                //onblur
            if(typeof this.dataOptions.onblurHandler == "string"){
                this.textareaObj.get(0).onblur = window[this.dataOptions.onblurHandler];
            }else{
                this.textareaObj.get(0).onblur = this.dataOptions.onblurHandler;
            }
        }
        if(this.dataOptions.onkeypressHandler){                //onkeypress
            if(typeof this.dataOptions.onkeypressHandler == "string"){
                this.textareaObj.get(0).onkeypress = window[this.dataOptions.onkeypressHandler];
            }else{
                this.textareaObj.get(0).onkeypress = this.dataOptions.onkeypressHandler;
            }
        }
        if(this.dataOptions.onkeydownHandler){                //onkeydown
            if(typeof this.dataOptions.onkeydownHandler == "string"){
                this.textareaObj.get(0).onkeydown = window[this.dataOptions.onkeydownHandler];
            }else{
                this.textareaObj.get(0).onkeydown = this.dataOptions.onkeydownHandler;
            }
        }
        if(this.dataOptions.onkeyupHandler){                //onkeyup
            if(typeof this.dataOptions.onkeyupHandler == "string"){
                this.textareaObj.get(0).onkeyup = window[this.dataOptions.onkeyupHandler];
            }else{
                this.textareaObj.get(0).onkeyup = this.dataOptions.onkeyupHandler;
            }
        }
        if(this.dataOptions.onchangeHandler){                //onchange
            if(typeof this.dataOptions.onchangeHandler == "string"){
                this.textareaObj.get(0).onchange = window[this.dataOptions.onchangeHandler];
            }else{
                this.textareaObj.get(0).onchange = this.dataOptions.onchangeHandler;
            }
        }
    };

    $.fn.textarea = function (option,param) {
        var result = null;
        var thisObj = this.each(function () {
            var $this = $(this)
                , thisObject = $this.data('textarea')
                , dataOptions = typeof option == 'object' && option;
            if(typeof option == 'string' ){
                result = thisObject[option](param);
            }else{
                $this.data('textarea', (thisObject = new Textarea(this, dataOptions)));
            }
        });
        if(typeof option == 'string' )return result;
        return thisObj;
    };

    $.fn.textarea.defaults = {
        required:false,
        dblclickTimeSpan:250,
        width:250,
        height:90,
        titleWidth:73
    };

    $(window).on('load', function(){
        $(".eb_textarea").each(function () {
            var thisObj = $(this)
                , dataOptionsStr = thisObj.data('options');
            if(!dataOptionsStr)
                thisObj.textarea($.fn.textarea.defaults);
            else
                thisObj.textarea((new Function("return {" + dataOptionsStr + "}"))());
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
 * Date   2014/9/18
 * ToolBar 组件
 *
 */
!function(window){

    "use strict";

    var cri = window.cri,
        $   = window.jQuery;

    var _defaultOptions = {
        buttons:[] //按钮组{text:按钮文本,handler:按钮回调函数,iconCls:按钮图标}
    };

    var TOOLBAR = "toolbar";

    function icon(iconCls){
        var $icon = $('<i class="' + iconCls + '"></i>');
        return $icon;
    }
    function button(button){
        var $button = $("<li></li>");
        button.iconCls && $button.append(icon(button.iconCls));
        button.text && $button.append(button.text);
        button.handler && $button.on("click",button.handler);
        return $button;
    }

    var ToolBar = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        this.$toolBar = null;
        cri.Widgets.apply(this,arguments);
    });

    $.extend(ToolBar.prototype,{
        _eventListen:function(){},

        _init:function () {
            this._create(this.$element);
        },

        _create:function($parent){
            var op = this.options;
            var buttons = op.buttons;
            var $toolbar = this.$toolBar = $('<ul class="'+TOOLBAR + '"></ul>');
            for(var i = 0,len = buttons.length; i<len; i++){
                var btn = buttons[i];
                $toolbar.append(button(btn));
            }
            $parent.append($toolbar);
        }
    });
    cri.ToolBar = ToolBar;
}(window);
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
        _iconWidth = 16; //

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
                calHeight -= 2;
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
        this.toolbar = null;
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
                .on('click', "li i.icon", function(e){
                    that._fold(e);
                    return false;
                })
                .on('dblclick', "div.li-content", function(e){
                    that._onDblClickRow(e);
                });
        },

        /**
         * 展开、收缩子节点
         * @param e
         * @private
         */
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
                this._expand($li);
            }
        },

        /**
         * 收缩、展开后代节点
         * @param $li
         * @private
         */
        _expand:function($li){
            var $ul = $li.children("ul");
            if($ul.length){
                $ul.children("li").each(function(){
                    $(this).animate({
                        height:"toggle"
                    },500);
                });
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
            if(this.options.toolbar) {
                this.toolbar = new cri.ToolBar($parent, {
                    buttons: this.options.toolbar
                });
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

    TreeGrid.prototype._refreshBody = function(){
        var $parent = this.$gridbody,
            $table  = $("<table></table>"),
            op      = this.options,
            columns = this._columns,
            lineNum = 1,
            paddingLeft = 1,
            iconWidth = 6;
        $table.append(this._createColGroup($parent.width()));
        /**
         * 拼装每行HTML
         */
        !function getRowHtml(rows,isShow,id){
            for(var i = 0,len = rows.length; i<len; i++){
                var $tr = $("<tr></tr>").data("rowid",++id).attr("data-rowid",id);
                var row = rows[i];

                isShow == "show" || $tr.hide();

                if(op.checkBox){
                    row.check ?
                        $tr.append($("<td></td>").addClass("line-checkbox").append('<input type="checkbox" checked/>')):
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
        this.$gridbody.removeClass("loading").html($table);
        //fixed IE8 do not support nth-child selector;
        $("tr:nth-child(odd)",$table).css("background","#FFF");
        //根据gird-body 纵向滚动条决定headWrap rightPadding
        var scrollBarW = $parent.width()-$parent.prop("clientWidth");
        this.$gridhead.css("paddingRight",scrollBarW);
    }

    TreeGrid.prototype._fold = function(e){
        var op = this.options,
            item = $(e.target).closest("tr"),
            rowid = item.data('rowid'),
            that = this;
        this.selectedRow = this._getRowDataById(rowid);
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
        this._refreshBody();
    };

    TreeGrid.prototype._checkbox = function(e){
        var input = $(e.target),
            tr    = $(e.target).closest("tr"),
            rowid = parseInt(tr.data('rowid')),
            id    = rowid,
            row   = this._getRowDataById(rowid),
            isChecked = input.prop("checked");

        !function(data){
            if(data.children && data.children.length > 0){
                id *= 1000;
                !function ita(data){
                    $.each(data,function(){
                        id += 1;
                        $("tr[data-rowid="+ id +"] input[type=checkbox]").prop("checked",isChecked);
                        if(this.children && this.children.length > 0){
                            id*=1000;
                            ita(this.children);
                            id= Math.floor(id/=1000);
                        }
                    });
                }(data.children);
            }
        }(row);
    };

    TreeGrid.prototype._getRowDataById = function(rowid){
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
        MINI_WINDOW_WIDTH = 140+10,
        ZINDEX = 10000;

    var _defaultOptions = {
        actions:["Close","Minimize","Maximize"],//Colse:关闭,Minimize:最下化,Maximize:最大化
        content:null,
        visible:true,
        modal:false,//模态窗口
        width:600,
        height:400,
        position:{top:0,left:0},
        center:true,//初始时是否居中
        resizable:true
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
        var op = this.options;
        var viewWidth = $(window).width();
        var viewHeight = $(window).height();

        this._createBody();
        if(op.center){
            op.position.left = (viewWidth - op.width) / 2;
            op.position.top  = (viewHeight - op.height) / 2;
        }
        this.$window.css($.extend({zIndex:this._zIndex()},op.position)).width(op.width).height(op.height);
        this._overlay();
        this._createHead();
        op.resizable && this._createResizeHandler();
        $("body").append(this.$window);
    };

    /**
     * 初始化组件监听事件
     * @private
     */
    Window.prototype._eventListen = function(){
        var that = this;
        this.$window
            .on("click",".action",function(){
                var action = that._actionForButton($(this));
                action && typeof that[action] === "function" && that[action]();
            })
            .on("click",".window-head",function(){
                that.toFront();
            })
            .on("mousedown",".window-head",function(e){
                var left     = +that.$window.css("left").split("px")[0],
                    top      = +that.$window.css("top").split("px")[0],
                    width    = +that.$window.width(),
                    height   = +that.$window.height(),
                    startX   = e.pageX,
                    startY   = e.pageY;
                $(document).on("mousemove",function(e){
                    var pageX  = e.pageX,
                        pageY  = e.pageY,
                        shiftX = pageX - startX,
                        shiftY = pageY - startY;
                    left += shiftX;
                    top  += shiftY;
                    startX = pageX;
                    startY = pageY;
                    that._setPosition({top:top,left:left,width:width,height:height});
                });
            })
            .on("mousedown",".window-resizer",function(e){
                var left     = +that.$window.css("left").split("px")[0],
                    top      = +that.$window.css("top").split("px")[0],
                    width    = +that.$window.width(),
                    height   = +that.$window.height(),
                    startX   = e.pageX,
                    startY   = e.pageY,
                    resizer  = /[ewsn]+$/.exec(this.className)[0];

                $(document).on("mousemove",function(e){
                    var pageX  = e.pageX,
                        pageY  = e.pageY,
                        shiftX = pageX - startX,
                        shiftY = pageY - startY;
                    startX = pageX;
                    startY = pageY;
                    if(resizer.indexOf("e") >= 0){
                        width += shiftX;
                    }
                    if(resizer.indexOf("w") >= 0){
                        left = pageX;
                        width -= shiftX;
                    }
                    if(resizer.indexOf("n") >= 0){
                        top = pageY;
                        height -= shiftY;
                    }
                    if(resizer.indexOf("s") >= 0){
                        height += shiftY;
                    }
                    that._setPosition({top:top,left:left,width:width,height:height});
                });
            });
        $(document).on("mouseup",function(){
            $(document).off("mousemove");
        });
    };

    /**
     * 生成window 头部
     * @private
     */
    Window.prototype._createHead = function(){
        var $windowHead = $("<div></div>").addClass("window-head");
        $windowHead.append(this._createTitle()).append(this._createActions());
        this.$window.prepend($windowHead);
        this.$windowHead = $windowHead;
    };

    /**
     * 包装window 内容部分
     * @private
     */
    Window.prototype._createBody = function(){
        var $element = this.$element;
        $element.detach();
        var $window = $('<div class="window"></div>');
        var $windowBody = $('<div class="window-content"></div>');
        $window.append($windowBody);
        $windowBody.append($element);
        this.$window = $window;
        if(this.options.content){
            $windowBody.load(this.options.content);
        }
        $("body").append(this.$window);

    };

    /**
     * 生成标题栏
     * @returns {*}
     * @private
     */
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
    Window.prototype._createActions = function(){
        var options = this.options;
        var $buttons = $("<div></div>").addClass("actions");
        var defaultButtons = options.modal ? ["Maximize","Close"]:["Minimize","Maximize","Close"];

        for(var i = 0, len = defaultButtons.length; i<len; i++){
            var defBtn = defaultButtons[i];
            for(var j = 0,l = options.actions.length; j < l; j++){
                var action = options.actions[j];
                if(action == defBtn){
                    var $button = $("<span></span>").addClass("action").addClass(action.toLowerCase());
                    var $icon = $("<i></i>").attr("class",icons[action]);
                    $button.append($icon);
                    $buttons.append($button);
                }
            }
        }
        return $buttons;
    };

    /**
     * 生成 8个方位的 resizeHandler
     * @private
     */
    Window.prototype._createResizeHandler = function(){
        var resizerHandler = [],
            resizer = "n e s w nw ne se sw";
        $.each(resizer.split(" "),function(index,value){
            resizerHandler.push('<div class="window-resizer window-resizer-' + value + '" style="display: block;"></div>');
        });
        this.$window.append(resizerHandler.join(""));
    };

    /**
     * 生成模态窗口背景遮罩
     * @private
     */
    Window.prototype._overlay = function(){
        if(this.options.modal){
            var zIndex = +this.$window.css("zIndex");
            this.$window.css("zIndex",(zIndex+1));
            var $overlay = $(".overlay");
            if($overlay.length == 0){
                $overlay = $("<div></div>").addClass("overlay");
                $("body").append($overlay);
            }
            $overlay.css("zIndex",zIndex).show();
        }
    };

    /**
     * 设置窗口位置
     * @param position {top:number,left:number,height:number,width:number}
     * @private
     */
    Window.prototype._setPosition = function(position){
        var $window = this.$window;
        $window.css(position);
        this.options.position = position;
    };

    /**
     * 根据icon类名返回对应的处理函数
     * @param icon
     * @returns {*}
     * @private
     */
    Window.prototype._actionForButton = function(button) {
        var iconClass = /\baction \w+\b/.exec(button[0].className)[0];
        return {
            "action minimize": "minimize",
            "action maximize": "maximize",
            "action resume": "resume",
            "action close": "close"
        }[iconClass];
    };

    Window.prototype._loadContent = function(){
        $.load();
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
     * @param index
     * @private
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

    /**
     * 获取最大zIndex
     * @returns {number}
     * @private
     */
    Window.prototype._zIndex = function(){
        var zindex = ZINDEX;
        $(".window").each(function(i,element){
            zindex = Math.max(+this.style.zIndex,zindex);
        });
        return ++zindex;
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