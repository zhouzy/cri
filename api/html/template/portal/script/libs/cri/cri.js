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
        var o = {};
        $("input[name],select[name],textarea[name]",$form).each(function(){
            if($(this).is("[type=checkbox]")){
                if($(this).prop("checked")) {
                    o[this.name] = this.value;
                }
                else{
                    return true;
                }
            }
            o[this.name] = this.value;
        });
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

    cri.isLeapYear = function(year){
        return (0==year%4&&((year%100!=0)||(year%400==0)));
    }

    /**
     * 日期格式化
     * 格式 YYYY/yyyy/YY/yy 表示年份
     * MM/M 月份
     * W/w 星期
     * dd/DD/d/D 日期
     * hh/HH/h/H 时间
     * mm/m 分钟
     * ss/SS/s/S 秒
     */
    cri.formatDate = function(date,formatStr){
        var str    = formatStr,
            year   = date.getFullYear(),
            month  = date.getMonth()+1,
            day    = date.getDate(),
            hour   = date.getHours(),
            minute = date.getMinutes(),
            second = date.getSeconds();

        str=str.replace(/yyyy|YYYY/,year);
        str=str.replace(/yy|YY/,(year % 100)>9?(year % 100).toString():'0' + (year % 100));

        str=str.replace(/MM/,month>9?month.toString():'0' + month);
        str=str.replace(/M/g,month);

        str=str.replace(/dd|DD/,day>9?day.toString():'0' + day);
        str=str.replace(/d|D/g,day);

        str=str.replace(/hh|HH/,hour>9?hour.toString():'0' + hour);
        str=str.replace(/h|H/g,hour);

        str=str.replace(/mm/,minute>9?minute.toString():'0' + minute);
        str=str.replace(/m/g,minute);

        str=str.replace(/ss|SS/,second>9?second.toString():'0' + second);
        str=str.replace(/s|S/g,second);
        return str;
    }

    /**
     *把日期分割成数组
     */
    cri.date2Array = function(myDate){
        var myArray = Array();
        myArray[0] = myDate.getFullYear();
        myArray[1] = myDate.getMonth();
        myArray[2] = myDate.getDate();
        myArray[3] = myDate.getHours();
        myArray[4] = myDate.getMinutes();
        myArray[5] = myDate.getSeconds();
        return myArray;
    };

    /**
     * 字符串转成日期类型
     * 格式 MM/dd/YYYY MM-dd-YYYY YYYY/MM/dd YYYY-MM-dd
     */
    cri.StringToDate  = function(DateStr){
        var converted = Date.parse(DateStr);
        var myDate = new Date(converted);
        if (isNaN(myDate))
        {
            var arys= DateStr.split('-');
            myDate = new Date(arys[0],--arys[1],arys[2]);
        }
        return myDate;
    }
}(window);


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
        this.options = $.extend(true,{}, this.options, options);
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

    /**
     * 销毁组件
     * @private
     */
    Widgets.prototype._destory = function(){
        var $element = this.$element;
        var $warpper = $element.parent();
        $warpper.after($element).remove();
    };

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
     * @type {{url: null, param: {}, title: null, toolbar: null, columns: null, rows: null, onChange: null, onDblClick: null, rowNum: boolean, checkBox: boolean, onChecked: null, pagination: boolean, page: number, pageSize: number, total: number, ajaxDone: null, ajaxError: null}}
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
        onChange:null,    //行点击时触发
        onDblClick:null, //双击行时触发
        onSelected:null, //当选择一行或者多行时触发
        onLoad:null      //构造表格结束时触发
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
        this.selectedId  = [];
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
                    $("input[type=checkbox]",that.$gridhead).prop("checked",false);
                    that._setSelected(e);
                    that.options.onChange && that.options.onChange.call(that);
                })
                .on('dblclick', "tr", function(e){
                    that._onDblClickRow(e);
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
                    if(isChecked){
                        that.selectedId = [];
                        $("tr",that.$gridbody).each(function(){
                            var $tr = $(this);
                            that.selectedId.push($tr.data("rowid"));
                            $tr.addClass("selected");
                            $('input[type=checkbox]',$tr).prop("checked",isChecked);
                        });
                    }else{
                        that.selectedId = [];
                        $("tr",that.$gridbody).removeClass("selected");
                    }
                    $("input[type=checkbox]",that.$gridbody).each(function(){
                        $(this).prop("checked",isChecked);
                    });
                    op.onChange && op.onChange.call(that);
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
            this._colsWidth();
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

        /**
         * 当用户点击选中行时触发onSelected事件
         * 当options.checkbox=true为多选,否则为单选
         * @param e
         * @private
         */
        _setSelected:function(e){
            var item  = $(e.target).closest("tr"),
                rowId = item.data('rowid');

            if(!this.options.checkBox){
                if(item.hasClass("selected")){
                    this.selectedId = [];
                    item.removeClass("selected");
                }else{
                    this.selectedId = this.selectedId || [];
                    $("tr.selected",this.$gridbody).removeClass("selected");
                    item.addClass("selected");
                    this.selectedId = [rowId];
                }
            }
            else{
                if(item.hasClass("selected")){
                    var index = $.inArray(rowId,this.selectedId);
                    index >= 0 && this.selectedId.splice(index,1);
                    item.removeClass("selected");
                    $("input[type=checkbox]",item).prop("checked",false);
                }else{
                    this.selectedId = this.selectedId || [];
                    item.addClass("selected");
                    this.selectedId.push(rowId);
                    if(this.options.checkBox){
                        $("input[type=checkbox]",item).prop("checked",true);
                    }
                }
            }
            if(this.selectedId && this.selectedId.length){
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

        _getRowDataById:function(rowid){
            return this.options.rows[parseInt(rowid)];
        },

        _onDblClickRow:function(e){
            var op = this.options
                ,item = $(e.target).closest("tr")
                ,rowid = item.data('rowid')
                ,that = this;
            this.selectedId = [rowid];
            if(op.onDblClick){
                op.onDblClick();
            }
        },

        reload:function(param){
            param && (this.options.param = param);
            this.selectedId = [];
            this._getData();
        },

        loadData:function(param){
            if(param.push){
                this.options.rows = param;
                this._refreshBody();
            }
        },

        getSelected:function(){
            var selected = [];
            for(var i=0; i<this.selectedId.length;i++){
                selected.push(this._getRowDataById(this.selectedId[i]));
            }
            return selected;
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
        text:"",
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
            var text = op.text || $e.text() || $e.val();
            $button.append($icon, text);
            $button.on("click",function(){
                op.onClick && op.onClick.call();
            });
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
            var $this = $(this),
                dg    = $this.data('datagrid'),
            options = typeof option == 'object' && option;
            if(dg != null){
                dg._distory();
            }
            $this.data('datagrid', (datagrid = new DataGrid(this, options)));
        });
        return datagrid;
    };

}(window);


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
        value:null,
        readonly:false,
        onFocus:null,
        onBlur:null,
        onClick:null
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
            var $element = this.$element;
            $element.wrap('<div class="'+ INPUT_GROUP + '"></div>');
            this.$inputGroup = $element.parent();
            this._wrapInput();
            this.$input.before(this._label());
        },

        _wrapInput:function(){
            var that = this,
                op   = that.options,
                $input = this.$element;

            if(op.readonly){
                $input = this._readonlyInput($input);
            }
            else{
                $input.on("focus",function(){
                    that.options.onFocus && that.options.onFocus.call(that);
                }).blur(function(){
                    that.options.onBlur && that.options.onBlur.call(that);
                });
            }

            op.button && $input.after(this._button()) && $input.addClass(WITH_BTN);

            this.$input = $input;

            if(op.value != null){
                this._setValue(op.value)
            }
        },

        /**
         * 返回包装 readonly input
         * @param $element
         * @private
         */
        _readonlyInput:function($element){
            var that = this,
                $input = $('<span class="readonly" role="readonly">'+this.$element.val()+'</span>');
            $input.on("click",function(){
                that.options.onFocus && that.options.onFocus.call(that);
            }).blur(function(){
                that.options.onBlur && that.options.onBlur.call(that);
            });
            this.$element.attr("readonly",true).hide().after($input);
            return $input;
        },

        _button:function(){
            var op    = this.options,
                $icon = null;
            if(op.button){
                $icon = $('<i class="' + INPUT_BTN + " " + op.button.iconCls + '"></i>').on("click",function(){
                    op.button.handler.call();
                });
            }
            return $icon;
        },

        _label:function(){
            var label = this.options.label ||
                this.$element.data("label") ||
                this.$element.attr("title") ||
                this.$element.attr("name") ||
                "";
            return $('<label></label>').text(label);
        },

        _destory:function(){
            var $input = this.$element;
            this.$inputGroup.replaceWith($input);
        },

        _setValue:function(value){
            if(this.$input.is("input")){
                this.$input.val(value);
            }else{
                this.$element.val(value);
                this.$input.text(value);
                this.$element.trigger("change");
            }
        },

        _getValue:function(){
            return this.$element.val();
        },

        value:function(value){
            if(arguments.length>0){
                this._setValue(value)
            }
            else{
                return this._getValue();
            }
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

/**
 * Author zhouzy
 * Date   2014/10/14
 * notification 组件
 *
 */
!function(window){

    var cri = window.cri,
        $   = window.jQuery;

    var Notification = function(){

    };

    Notification.prototype={
        _notiBody:function(type,message){
            var that = this;
            var icons = {success:"fa-exclamation",error:"fa-exclamation",warming:"fa-exclamation"};
            if(this.$notification && this.$notification.length){
                this._hide(this.$notification);
            }
            var $notification = this.$notification = $('<div class="notification ' + type + '"></div>'),
                $icon = $('<i class="icon fa ' + icons[type]+ '"></i>'),
                $message = $('<span class="message">' + message + '</span>'),
                $btn = $('<i class="btn fa fa-close"></i>').on("click",function(){
                    that._hide($notification);
                });
            $notification.append($icon,$message,$btn);
            $('body').append($notification);
            that._show();
            window.setTimeout(function(){
                that._hide($notification);
            },1000*5);
        },

        _hide:function($notification){
            $notification.animate({
                height:"hide"
            },function(){
                $notification.remove();
            });
        },

        _show:function(){
            this.$notification.animate({
                height:"show"
            });
        },

        error:function(message){
            this._notiBody("error",message);
        },
        warming:function(message){
            this._notiBody("warming",message);
        },
        success:function(message){
            this._notiBody("success",message);
        }
    }

    cri.notification = new Notification();

}(window);
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

    var SELECTBOX_GROUP = "selectBox-group",
        SELECTBOX_BODY  = "selectBox-body",
        SELECTBOX_INPUT = "selectBox-input",
        SELECTBOX_BTN   = "fa fa-caret-down",
        OPTIONS  = "options",
        SELECTED = "selected";

    var _defaultOptions = {
        label:''
        ,data:null//Array [{value:"",text:""},{value:"",text:""}]
        ,optionLabel:''
        ,value:null//Function: get or set selectBox value
        ,text:null//Function: get or set selectBox text
        ,change:null//Function: call back after select option
    };

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
            this.$selectBoxGroup = this.$element.parent();
            this._createInput();
            this._createListView();
        },

        _createInput:function(){
            var that = this,
                button = {iconCls:SELECTBOX_BTN,handler:function(){
                    that.listView.toggle();
                }};

            this.input = new cri.Input(this.$element,{
                readonly:true,
                value:this.$element.find("option:selected").text(),
                button:button,
                onFocus:function(){
                    that.listView.toggle();
                }
            });
        },

        _createListView:function(){
            var that = this;
            this.listView = new ListView(this.$selectBoxGroup,{
                data:that._data(),
                value:that.$element.val(),
                onChange:function(value,text){
                    that.$element.val(value);
                    that.input.value(text);
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

    var ListView = function($parent,options){
        this.options = $.extend({
            data:[],
            onChange:null
        },options);
        this.$options = null;
        this.$parent = $parent;
        this.value = options.value;//下拉框初始值
        this._init();
        this.text = null;
    };

    ListView.prototype = {
        /**
         * 初始化下拉选择框
         * @returns {*|HTMLElement}
         * @private
         */
        _init:function(){
            var data = this.options.data;
            var $options = this.$options = $('<ul class="' + OPTIONS + '"></ul>').hide();
            if(data){
                for(var i = 0,len = data.length; i<len; i++){
                    $options.append(this._createOption(data[i]));
                }
            }
            this.$parent.append($options);
        },

        /**
         * 构造单个option
         * @param option
         * @private
         */
        _createOption:function(option){
            var $li = $('<li></li>').text(option.text),
                that = this;
            $li.on("click",function(){
                if(!$li.is("." + SELECTED)){
                    $("li."+SELECTED,that.$options).removeClass(SELECTED);
                    $li.addClass(SELECTED);
                    that.text = option.text;
                    that.value = option.value;
                    that._change();
                }
                that.toggle();
            });
            that.value == option.value && $li.addClass(SELECTED);
            return $li;
        },

        /**
         * 显示隐藏切换options选择框
         * @private
         */
        toggle:function(){
            var that = this;
            this.$options.animate({
                    height:'toggle'
                },200,function(){
                    if(!that.$options.is(":hidden")){
                        that._clickBlank();
                    }
                });
        },

        /**
         * 当在非本元素范围内点击，收缩下拉框
         * @private
         */
        _clickBlank:function(){
            var that = this;
            $(document).mouseup(function(e) {
                var _con = that.$parent;
                if (!_con.is(e.target) && _con.has(e.target).length === 0) {
                    that.$options.animate({
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
        _change:function(){
            this.options.onChange && this.options.onChange.call(this,this.value,this.text);
        }
    };

    cri.SelectBox = SelectBox;

    $.fn.selectBox = function(option) {
        var o = null;
        this.each(function () {
            var $this = $(this),
                options = typeof option == 'object' && option;
            o = $this.data('selectBox');
            if(o != null){
                o._destory();
            }
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
!function(window){

    "use strict";

    var cri = window.cri,
        $   = window.jQuery;

    var TIME_INPUT_GROUP = "eb_timeInputGroup",
        TIME_BOX         = "eb_timeBox",
        TIME_INPUT_ICON  = "fa fa-table";

    function getDate(yyyy,MM,dd,HH,mm,ss){
        var date = new Date();
        date.setFullYear(yyyy);
        date.setMonth(MM);
        date.setDate(dd);
        date.setHours(HH);
        date.setMinutes(mm);
        date.setSeconds(ss);
        return date;
    }

    /**
     * 获取某年的月份数组
     * @param year
     * @returns {number[]}
     */
    function getMonthArr (year){
        if(cri.isLeapYear(year))
            return [31,29,31,30,31,30,31,31,30,31,30,31];
        else
            return [31,28,31,30,31,30,31,31,30,31,30,31];
    }


    var _defaultOptions = {
        value:null,
        format:"yyyy/MM/dd",
        HMS:false
    };

    var TimeInput = cri.Widgets.extend(function(element,options){
        if(!options.HMS && options.format){
            options.format = options.format.replace(/\s*[Hh].*$/,"");
        }
        this.options = _defaultOptions;
        this.date  = null;
        this.input = null;
        this.selectView = null;
        cri.Widgets.apply(this,arguments);
    });

    TimeInput.prototype._init = function(){
        var $element = this.$element.attr("role","timeInput");
        $element.wrap('<div class="'+TIME_INPUT_GROUP+'"></div>');
        this.$timeInputGroup = $element.parent();
        this.date = this.options.value || new Date();
        this._wrapInput();
        this._timeSelectView();
    };

    /**
     * 生成Input
     * @private
     */
    TimeInput.prototype._wrapInput = function(){
        var that = this,
            value = this.date,
            button = {iconCls:TIME_INPUT_ICON,handler:function(){
                that.selectView.toggle();
            }};

        this.input = new cri.Input(this.$element,{readonly:true,value:cri.formatDate(value,this.options.format),button:button,onFocus:function(){
            that.selectView.toggle();
        }});
    };

    /**
     * 日期选择下拉面板
     * @private
     */
    TimeInput.prototype._timeSelectView = function(){
        var that = this,
            date = this.date;
        this.selectView = new TimeSelectView(this.$timeInputGroup,{
            value:date,
            HMS:this.options.HMS,
            onChange:function(){
                that.date = this.getDate();
                that.input.value(cri.formatDate(that.date,that.options.format));
            }
        });
    };

    /**
     * 设置值
     * @private
     */
    TimeInput.prototype._setValue = function(value){
        this.date = value;
        this.input.value(cri.formatDate(value,this.options.format));
        this.selectView.setDate(value);
    };

    TimeInput.prototype.value = function(value){
        if(value == undefined){
            return this.date;
        }
        else{
            this._setValue(value);
        }
    };

    var TimeSelectView = function($parent,options){
        this.$parent = $parent;
        this.$timeBox = null;
        this.$daySelect = null;
        var date = new Date();
        this.options = $.extend({
            HMS:false,
            onChange:null,
            date:{
                yyyy:date.getFullYear(),
                MM:date.getMonth(),
                dd:date.getDate(),
                HH:date.getHours(),
                mm:date.getMinutes(),
                ss:date.getSeconds(),
                ww:date.getDay()
            }
        },options);
        this._create($parent);
    };

    TimeSelectView.prototype = {
        /**
         * 生成时间选择下拉面板
         * @returns {*|HTMLElement}
         * @private
         */
        _create:function($parent){
            var $timeBox = this.$timeBox = $('<div class="' + TIME_BOX + '"></div>');
            var $titleBar = $('<div class="eb_titleBar"></div>');
            $titleBar.append(this._yearSelect(),this._monthSelect(),'<span style="position:absolute;top:5px;right:23px;">月</span>');
            $timeBox.append($titleBar,this._daySelect());
            if(this.options.HMS == true){
                $timeBox.append(this._hmsSelect());
            }
            $parent.append($timeBox);
        },

        _yearSelect : function(){
            var that = this;
            var date = this.options.date;
            var $yearSelect = $('<div class="eb_yearSelecter"></div>');
            var $minusBtn   = $('<i class="eb_toLastYear eb_yearButton fa fa-minus"></i>');
            var $plusBtn    = $('<i class="eb_toNextYear eb_yearButton fa fa-plus"></i>');
            var $year       = $('<span class="eb_year">' + date.yyyy + '</span>');

            $minusBtn.on("click",function(){
                $year.html(--that.options.date.yyyy);
                that._change();
            });
            $plusBtn.on("click",function(){
                $year.html(++that.options.date.yyyy);
                that._change();
            });
            $yearSelect.append($minusBtn,$year,'年',$plusBtn);
            return $yearSelect;
        },

        _monthSelect : function(){
            var that = this,
                date = this.options.date,
                $select = $('<select class="eb_monthSelect">');

            $.each([1,2,3,4,5,6,7,8,9,10,11,12],function(index,value){
                value < 10 && (value = "0" + value);
                $select.append('<option value="' + index + '">' + value + '</option>');
            });
            $select.val(date.MM);

            $select.on("change",function(){
                date.MM = $select.val();
                that._refreshDaySelect();
                that._change();
            });

            return $select;
        },

        _daySelect:function(){
            var $daySelect = this.$daySelect = $('<table></table>'),
                $week = $('<tr class="week"></tr>'),
                week = {"Sunday":"日","Monday":"一","Tuesday":"二","Wednesday":"三",Thursday:"四","Friday":"五","Saturday":"六"},
                that = this;
            for(var day in week){
                var $day = $('<th>' + week[day] + '</th>');
                day == "Sunday" && $day.addClass("eb_red");
                day == "Saturday" && $day.addClass("red");
                $week.append($day);
            }
            $daySelect.append($week);
            for(var i=0; i<6; i++){
                var $tr = $('<tr class="days"></tr>');
                for(var j=0; j<7;j++){
                    var $td = $("<td></td>").on("click",function(){
                        var day = $(this).text();
                        if(day && day!=that.options.date.dd){
                            $('td.choosed',$daySelect).removeClass("choosed");
                            that.options.date.dd = +day;
                            $(this).addClass("choosed");
                            that._change();
                        }
                    });
                    $tr.append($td);
                }
                $daySelect.append($tr);
            }
            this._refreshDaySelect();
            return $daySelect;
        },

        /**
         * 当日期改变后，刷新daySelect
         * @private
         */
        _refreshDaySelect:function(){
            var date   = this.options.date,
                maxDay = getMonthArr(date.yyyy)[date.MM],
                shift  = new Date(date.yyyy,date.MM,1).getDay();
            $('td.choosed',this.$daySelect).removeClass("choosed");
            $('tr.days td',this.$daySelect).html("");
            for(var i=shift;i<maxDay+shift;i++){
                var rows = i%7,
                    cols = Math.floor(i/7),
                    $td = $('tr.days:eq("'+cols+'") td:eq("' + rows + '")',this.$daySelect),
                    day = i- shift + 1;
                $td.text(day);
                day == date.dd && $td.addClass("choosed");
            }
        },

        _hmsSelect:function(){
            var $hmsBar      = $('<div class="eb_HMSBar">'),
                $hourInput   = $('<input class="eb_HMSInput eb_Hour" value="00" />'),
                $minuteInput = $('<input class="eb_HMSInput eb_minute"  value="00" />'),
                $secondInput = $('<input class="eb_HMSInput eb_second"  value="00" />'),
                date         = this.options.date,
                that         = this;

            $hourInput.on("change",_handleNumF(0,23));
            $minuteInput.on("change",_handleNumF(0,59));
            $secondInput.on("change",_handleNumF(0,59));
            function _handleNumF(min,max){
                return function(){
                    var value = +$(this).val();
                    if(value>max){
                        $(this).val(max);
                    }
                    else if(value<min){
                        $(this).val(min);
                    }
                    date.HH = +$hourInput.val();
                    date.mm = +$minuteInput.val();
                    date.ss = +$secondInput.val();
                    that._change();
                };
            }

            $hmsBar.append($hourInput,":",$minuteInput,":",$secondInput);
            $(".eb_HMSInput",$hmsBar).on("keydown",function(e){
                var keycode=e.keyCode||e.which||e.charCode;
                if((keycode>=48 && keycode<=57) || keycode == 8){
                    return true;
                }else{
                    return false;
                }
            });
            return $hmsBar;
        },

        _change:function(){
            this.options.onChange && this.options.onChange.call(this);
        },

        /**
         * 当在非本元素范围内点击，收缩下拉框
         * @private
         */
        _clickBlank:function(){
            var that = this;
            $(document).mouseup(function(e) {
                var _con = that.$parent;
                if (!_con.is(e.target) && _con.has(e.target).length === 0) {
                    that.$timeBox.animate({
                        height:'hide'
                    },200);
                }
            });
        },

        toggle:function(){
            var that = this;
            this.$timeBox.animate({
                height:"toggle"
            },200,function(){
                if(!that.$timeBox.is(":hidden")){
                    that._clickBlank();
                }
            });
        },

        getDate:function(){
            var date = this.options.date;
            return getDate(date.yyyy,date.MM,date.dd,date.HH,date.mm,date.ss);
        },

        setDate:function(date){
            this.options.date = {
                yyyy:date.getFullYear(),
                MM:date.getMonth(),
                dd:date.getDate(),
                HH:date.getHours(),
                mm:date.getMinutes(),
                ss:date.getSeconds(),
                ww:date.getDay()
            }
        }
    };

    $.fn.timeInput = function (option) {
        var o = null;
        this.each(function () {
            var $this = $(this),
                options = typeof option == 'object' && option;
            o = $this.data('timeInput');
            if(o != null){
                o._destory();
            }
            $this.data('timeInput', (o = new TimeInput(this, options)));
        });
        return o;
    };

}(window);

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
 * 继承 Widgets
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

    var fileIcons = {"file":"icon fa fa-file","folderOpen":"icon fa fa-folder-open","folderClose":"icon fa fa-folder"};

    var _defaultOptions = {
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

    var Tree = cri.Tree = cri.Widgets.extend(function (element,options) {
        this.options = _defaultOptions;
        this.$tree = null;
        this.$treebody = null;
        this.selectedRow = null;
        this.toolbar = null;
        this._className = "tree";
        cri.Widgets.apply(this,arguments);
    });

    $.extend(Tree.prototype,{
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

        /**
         * 递归生成节点
         * 节点默认显示打开
         * @param $li
         * @param children
         * @private
         */
        _appendChildren:function($li,children){
            var $ul    = $("<ul></ul>"),
                indent = $(i,$li).attr("marginLeft");
            this._eachNode($ul,children,"show",0,indent);
            $li.append($ul);
        },

        /**
         * 生成每个节点
         * 同步树(当点击fold节点，不查询后台数据)
         * 异步树(当点击fold检点，实时查询后台后代节点)
         * 当为同步树，检查children进行递归生成节点
         * 当为异步树，检查hasChildren,children字段，hasChildren==true && (!children || children.length==0)时，访问后台
         *
         * @param $ul
         * @param data
         * @param isShow
         * @param id
         * @param indent
         * @private
         */
        _eachNode:function($ul,data,isShow,id,indent){
            for(var i = 0,len=data.length; i<len; i++){
                var row      = data[i],
                    $li      = $('<li></li>'),
                    $text    = $('<span class="li-text">' + row.text + '</span>'),
                    $icon    = $('<i class="' + fileIcons.file + '"></i>').css("marginLeft",indent),
                    $content = $('<div class="li-content"></div>').data("uid",++id);
                this._dealNodeData(row);
                $icon.attr("class",fileIcons[row.iconType]);
                $ul.append($li.append($content.append($icon,$text)));
                isShow == "hide" && $li.hide();
                if(row.hasChildren){
                    var $parent = $("<ul></ul>");
                    $li.append($parent);
                    indent += _iconWidth;
                    row.state && row.state == "close"
                        ? this._eachNode($parent,row.children,"hide",id*1000,indent)
                        : this._eachNode($parent,row.children,isShow,id*1000,indent);
                    indent -= _iconWidth;
                }
            }
        },

        /**
         * 处理node数据的默认值
         * state：默认值open
         * 获取节点图标类型
         * 如果节点指定 hasChildren 则图标显示为文件夹，
         * 如果 children 不存在，则显示为关闭文件夹
         * 如果未指定 state ，则默认为 close
         * @param node
         * @private
         */
        _dealNodeData:function(node){
            node.iconType = "file";
            if(node.children && node.children.length>0){
                node.hasChildren = true;
            }
            if(node.hasChildren){
                if(node["state"] == undefined || node["state"] == null){
                    node["state"] = "open";
                }
                if(node.state && node.state=="open" && node.children && node.children.length>0){
                    node.iconType = "folderOpen";
                }
                else{
                    node.iconType = "folderClose";
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
    });

    $.fn.tree = function (option,param) {
        var tree = null;
        this.each(function () {
            var $this   = $(this),
                options = typeof option == 'object' && option;
            $this.data('tree', (tree = new Tree(this, options)));
        });
        return tree;
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
 *
 * jQuery 插件基类
 * 继承自Class
 *
 */
!function(window){

    "use strict";

    var cri = window.cri,
        $   = window.jQuery;

    var INPUTSELECTOR = ":input:not(:button,[type=submit],[type=reset],[disabled])",
        CHECKBOXSELECTOR = ":checkbox:not([disabled],[readonly])",
        NUMBERINPUTSELECTOR = "[type=number],[type=range]";

    var emailRegExp = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,
        urlRegExp = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
    function patternMatcher(value, pattern) {
        if (typeof pattern === "string") {
            pattern = new RegExp('^(?:' + pattern + ')$');
        }
        return pattern.test(value);
    }

    function matcher(input, selector, pattern) {
        var value = input.val();
        if (input.filter(selector).length && value !== "") {
            return patternMatcher(value, pattern);
        }
        return true;
    }

    function hasAttribute(input, name) {
        if (input.length)  {
            return input[0].attributes[name] != null;
        }
        return false;
    }

    var Rules = {
        required: function(input) {
            var checkbox = input.filter("[type=checkbox]").length && !input.is(":checked"),
                value = input.val();

            return !(hasAttribute(input, "required") && (value === "" || !value  || checkbox));
        },
        pattern: function(input) {
            if (input.filter("[role=text],[role=email],[role=url],[role=tel],[role=search],[role=password]").filter("[pattern]").length && input.val() !== "") {
                return patternMatcher(input.val(), input.attr("pattern"));
            }
            return true;
        },
        min: function(input){
            if (input.filter(NUMBERINPUTSELECTOR + ",[role=number]").filter("[min]").length && input.val() !== "") {
                var min = parseFloat(input.attr("min")) || 0,
                    val = parseFloat(input.val());
                return min <= val;
            }
            return true;
        },
        max: function(input){
            if (input.filter(NUMBERINPUTSELECTOR + ",[role=number]").filter("[max]").length && input.val() !== "") {
                var max = parseFloat(input.attr("max")) || 0,
                    val = parseFloat(input.val());
                return max >= val;
            }
            return true;
        },

        email: function(input) {
            return matcher(input, "[role=email]", emailRegExp);
        },
        url: function(input) {
            return matcher(input, "[role=url]", urlRegExp);
        },
        date: function(input) {
            if (input.filter("[role^=date]").length && input.val() !== ""){
                return parseDate(input.val(), input.attr("format")) !== null;
            }
            return true;
        }
    };

    var Messages = {
        required:"请输入",
        min:"请输入大于的数字",
        max:"请输入小于的数字",
        email:"请输入合法的邮箱地址",
        url:"请输入合法的URL地址",
        date:"请输入合法的日期"
    };

    var _defaultOptions = {
        rules : Rules,
        messages:Messages,
        validateOnBlur:false
    };

    var Validator = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        cri.Widgets.apply(this,arguments);
    });

    $.extend(Validator.prototype,{
        _init: function(element, options){},
        _eventListen:function(){
            /**
             * 如果是表单,在提交时验证
             * 如果设置validateOnBlur,则在input blur事件中验证
             */
            var that = this,
                $element = this.$element;
            if(this.$element.is("form")){
                this.$element.on("submit",function(){
                    that.validate();
                });
            }
            if(that.options.validateOnBlur){
                if(!$element.is(INPUTSELECTOR)){
                    $element.find(INPUTSELECTOR).each(function(){
                        if($(this).is('[role=timeInput]')){
                            $(this).on("change",function(){
                                that._validateInput($(this));
                            });
                        }else{
                            $(this).on("blur",function(){
                                that._validateInput($(this));
                            });
                        }
                    });
                }else{
                    $element.on("blur",function(){
                        that._validateInput($element);
                    });
                }
            }
        },

        /**
         * 检查 input 合法性
         * @param $input
         * @private
         */
        _checkValidity:function($input){
            var rules = this.options.rules,
                rule;
            for (rule in rules) {
                if (!rules[rule].call(this, $input)) {
                    return { valid: false, key: rule };
                }
            }
            return { valid: true };
        },

        /**
         * 验证表单或者输入框
         */
        validate:function(){
            var that = this,
                $element = this.$element,
                result = true;
            if(!$element.is(INPUTSELECTOR)){
                $element.find(INPUTSELECTOR).each(function(){
                    var isValidity = that._validateInput($(this));
                    result = result && isValidity;
                });
            }else{
                result = result && that._validateInput($element)
            }
            return result;
        },

        /**
         * 验证每个Input
         * @param $input
         * @returns {boolean|Validator._checkValidity.valid|exports.valid|valid}
         * @private
         */
        _validateInput:function($input){
            var result = this._checkValidity($input),
                valid = result.valid;
            if(!valid){
                var $errormsg = $input.next(".input-warm");
                if($errormsg.length == 0){
                    $input.after($('<span class="input-warm">' + this.options.messages[result.key] + '</span>'));
                }
                else{
                    $errormsg.text(this.options.messages[result.key]);
                }
            }else{
                $input.next(".input-warm").remove();
            }
            return valid;
        }
    });

    cri.Validator = Validator;

    $.fn.validator = function(option) {
        var validator = null;
        this.each(function () {
            var $this   = $(this),
                options = typeof option == 'object' && option;
            validator = $this.data('validator');
            if(validator != null){
            }
            $this.data('validator', (validator = new Validator(this, options)));
        });
        return validator;
    };

}(window);
/**
 * Author zhouzy
 * Date   2014/10/14
 * window 组件
 *
 * 继承 Widgets
 *
 */
!function(window){

    "use strict";

    var cri = window.cri,
        $   = window.jQuery;

    var WINDOW_HEAD = "window-head";

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
        resizable:true,
        onReady:null//当窗口初始化完成时触发
    };

    var Window = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        this.windowStatus = "normal";
        cri.Widgets.apply(this,arguments);
        Window.prototype.windowStack.push(this);
    });

    $.extend(Window.prototype,{

        windowStack : [],

        /**
         * 初始化组件DOM结构
         * @private
         */
        _init : function(){
            var op = this.options,
                viewWidth = $(window).width(),
                viewHeight = $(window).height();

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
            if(op.visible){
                this.$window.show();
            }else{
                this.$window.hide();
            }
        },

        /**
         * 初始化组件监听事件
         * @private
         */
        _eventListen : function(){
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
        },

        /**
         * 生成window 头部
         * @private
         */
        _createHead : function(){
            var $windowHead = $('<div class="' + WINDOW_HEAD + '"></div>');
            $windowHead.append(this._createTitle()).append(this._createActions());
            this.$window.prepend($windowHead);
            this.$windowHead = $windowHead;
        },

        /**
         * 包装window 内容部分
         * @private
         */
        _createBody : function(){
            var that     = this,
                op       = this.options,
                $element = this.$element,
                $window  = $('<div class="window"></div>'),
                $windowBody = $('<div class="window-content"></div>');

            $element.detach();
            $window.append($windowBody);
            this.$window = $window;
            $windowBody.append($element);
            if(this.options.content){
                $element.load(this.options.content,function(){
                    op.onReady && op.onReady.call(that,that.$window);
                });
            }else{
                op.onReady && op.onReady.call(that,that.$window);
            }
            $("body").append(this.$window);
        },

        /**
         * 生成标题栏
         * @returns {*}
         * @private
         */
        _createTitle : function(){
            var title = this.options.title || "";
            var $title = $("<span></span>").addClass("title").text(title);
            return $title;
        },

        /**
         * 根据actions 按照（最小化，放大，关闭）顺序生成按钮
         * 模态窗口不生成最小化按钮
         * @returns {*}
         * @private
         */
        _createActions : function(){
            var options = this.options,
                $buttons = $("<div></div>").addClass("actions"),
                defaultButtons = options.modal ? ["Maximize","Close"]:["Minimize","Maximize","Close"];

            for(var i = 0, len = defaultButtons.length; i<len; i++){
                var defBtn = defaultButtons[i];
                for(var j = 0,l = options.actions.length; j < l; j++){
                    var action = options.actions[j];
                    if(action == defBtn){
                        var $button = $('<span class="action"></span>').addClass(action.toLowerCase()),
                            $icon   = $('<i class="' + icons[action] + '"></i>');
                        $buttons.append($button);
                        $button.append($icon);
                    }
                }
            }
            return $buttons;
        },

        /**
         * 生成 8个方位的 resizeHandler
         * @private
         */
        _createResizeHandler : function(){
            var resizerHandler = [],
                resizer = "n e s w nw ne se sw";
            $.each(resizer.split(" "),function(index,value){
                resizerHandler.push('<div class="window-resizer window-resizer-' + value + '" style="display: block;"></div>');
            });
            this.$window.append(resizerHandler.join(""));
        },

        /**
         * 生成模态窗口背景遮罩
         * @private
         */
        _overlay : function(){
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
        },

        /**
         * 设置窗口位置
         * @param position {top:number,left:number,height:number,width:number}
         * @private
         */
        _setPosition : function(position){
            var $window = this.$window;
            $window.css(position);
            this.options.position = position;
        },

        /**
         * 根据icon类名返回对应的处理函数
         * @param icon
         * @returns {*}
         * @private
         */
        _actionForButton : function(button) {
            var iconClass = /\baction \w+\b/.exec(button[0].className)[0];
            return {
                "action minimize": "minimize",
                "action maximize": "maximize",
                "action resume": "resume",
                "action close": "close"
            }[iconClass];
        },

        /**
         * 由最小化打开窗口
         */
        open : function(){
            this._setStyleByStatus("normal");
            this.windowStatus = "normal";
        },

        /**
         * 关闭当前窗口
         *
         * 隐藏并且放置到最底层
         */
        close : function(){
            var max      = ZINDEX,
                frontWnd = null,
                $windows = $(".window"),
                $overlay = $(".overlay");

            this.$window.css("zIndex",ZINDEX).hide();
            $windows.each(function(){
                var z = +this.style.zIndex + 1;
                this.style.zIndex = z;
                if(z >= max){
                    max = z;
                    frontWnd = this;
                }
            });
            frontWnd.style.zIndex = max+1;
            $windows.is(":visible") ? $overlay.css("zIndex",max) : $overlay.hide();

            this.$window.removeClass("mini-window");
            this.windowStatus = "close";
        },

        /**
         * 最大化窗口
         * 最大化后 复原、关闭
         */
        maximize : function(){
            this._setStyleByStatus("maximize");
            this._setButtons("maximize");
            this.windowStatus = "maximize";
        },

        /**
         * 最小化窗口
         * 依次排放到左下侧
         * 模态窗口没有最小化按钮
         */
        minimize : function(){
            this._setButtons("minimize");
            $(".window-content",this.$window).hide();
            var left = $(".mini-window").size() * MINI_WINDOW_WIDTH;
            this._setStyleByStatus("minimize");
            this.$window.css("left",left);
            this.windowStatus = "minimize";
        },

        /**
         * 复原窗口到初始(缩放、移动窗口会改变初始位置尺寸信息)尺寸、位置
         */
        resume : function(){
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
        },

        /**
         * 根据窗口的状态设置窗口样式
         * @private
         */
        _setStyleByStatus : function(status){
            var op    = this.options,
                pos   = op.position,
                KLASS = {minimize:"window mini-window",maximize:"window maxi-window",closed:"window",normal:"window"},
                style = {width:op.width,height:op.height,left:pos.left,top:pos.top,bottom:"auto",right:"auto"};
            this.$window.prop("class",KLASS[status]).css(style);
        },

        /**
         * 根据当前窗口状态设置窗口按钮组
         * @param buttons
         * @private
         */
        _setButtons : function(status){
            var BUTTONS = {minimize:["resume","close"],maximize:["resume","close"],normal:["minimize","maximize","close"]};
            var $actions = $(".actions",this.$window);
            $(".action",$actions).hide();

            if(status == "minimize"){
                var $btn = $(".maximize",$actions).removeClass("maximize").addClass("resume");
                $("i",$btn).prop("class",icons["Maximize"]);
            }

            if(status == "maximize"){
                var $btn = $(".maximize",$actions).removeClass("maximize").addClass("resume");
                $("i",$btn).prop("class",icons["Resume"]);
            }
            if(status == "normal"){
                var $btn = $(".resume",$actions).removeClass("resume").addClass("maximize");
                $("i",$btn).prop("class",icons["Maximize"]);
            }
            $.each(BUTTONS[status],function(index,value){
                $("." + value,$actions).show();
            });
        },

        /**
         * 当左侧最小化窗口复原后，右侧最小化窗口依次左移一个窗口位置
         * @param index
         * @private
         */
        _moveLeft : function(index){
            this.$window.css("left",MINI_WINDOW_WIDTH * index);
        },

        /**
         * 把当前窗口顶至最前,与之前最上层窗口替换
         */
        toFront : function(){
            /**
             * 轮询窗口，取最大zindex,替换zindex
             */
            var frontWnd = this._getFrontWindow();
            if(this.$window != frontWnd){
                var zIndex = +this.$window.css("zIndex");
                this.$window.css("zIndex",frontWnd.css("zIndex"));
                frontWnd.css("zIndex",zIndex);
            }
        },

        /**
         * 获取最上层窗口
         * @private
         */
        _getFrontWindow : function(){
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
        },

        /**
         * 获取最大zIndex
         * @returns {number}
         * @private
         */
        _zIndex : function(){
            var zindex = ZINDEX;
            $(".window").each(function(i,element){
                zindex = Math.max(+this.style.zIndex,zindex);
            });
            return ++zindex;
        },

        _destory : function(){
            var $element = this.$element,
                $warpper = $element.parents(".window");
            $warpper.after($element).remove();
        }
    });
    cri.Window = Window;

    $.fn.window = function(option) {
        var wnd = null;
        this.each(function () {
            var $this   = $(this),
                wnd     = $this.data('window'),
                options = typeof option == 'object' && option;
            if(wnd != null){
                wnd._destory();
            }
            $this.data('window', (wnd = new Window(this, options)));
        });
        return wnd;
    };
}(window);