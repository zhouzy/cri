/**
 * Author zhouzy
 * Date   2014/9/18
 * treegrid widgets
 *
 */
!function($){

    "use strict";

    /**
     * 定义表格标题，工具栏，分页高度
     * @type {number}
     */
    var _titleH      = 31,
        _toolbarH    = 31,
        _pagerH      = 41,
        _gridHeadH   = 31,
        _cellPadding = 4,
        _cellDefaultW= 100,
        _cellBorderW = 1;

    /**
     * 1.如果datagrid初始化时,定义了高宽属性
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

    /**
     * 计算表格高度
     * 1.若table初始化时，定义了高度属性
     * 2.若table设置了高度属性(height)
     * 3.若table设置了高度样式
     * 4.都未定义 默认auto
     * @param $ele
     * @param height
     * @private
     */
    function _getElementHeight($ele,height){
        var styleHeight = $ele[0].style.height,
            propHeight  = $ele[0].height,
            calHeight   = height || styleHeight || propHeight;

        if(calHeight){
            var arr = ("" + calHeight).split("%");
            if(arr.length>1){
                calHeight = Math.floor($ele.parent().width() * arr[0] / 100);
            }
            calHeight = calHeight.split("px")[0];
            if(calHeight){
                return parseInt(calHeight);
            }
        }
        else{
            return null;
        }
    }

    var TreeGrid = function (element, options) {
        this.options     = $.extend({}, $.fn.treegrid.defaults, options);
        this.$element    = $(element);
        this.$treegrid   = null;
        this.$toolbar    = null;
        this.$gridhead   = null;
        this.$gridbody   = null;
        this.selectedRow = null;
        this.col         = [];
        this.init();
        this.eventListen();
    };

    TreeGrid.prototype = {

        eventListen:function(){
            var that = this;
            var isDrag = false;
            var dragStartX = 0;
            var dragIndex = 0;
            var left = 0;
            var right = 0;
            this.$gridbody.on("scroll",function(e){
                $(".grid-head-wrap",that.$gridhead).scrollLeft($(this).scrollLeft());
            });
            this.$gridhead.on('mousedown',".drag-line",function(e){
                that.$treegrid.css("cursor","e-resize");
                dragIndex = $(e.target).data("drag");
                isDrag = true;
                dragStartX = e.pageX;
                left = dragStartX - that.col[dragIndex].width + 20;
                right = dragStartX + that.col[dragIndex + 1].width - 20;
            	}).on("mouseup",function(e){
                    if(isDrag){
                        that.$treegrid.css("cursor","");
                        isDrag = false;
                    }
            	}).on("mouseover",function(e){
                    if(isDrag){
                        if(e.pageX > left && e.pageX <right){
                            that.col[dragIndex].width += e.pageX - dragStartX;
                            that.col[dragIndex + 1].width -= e.pageX - dragStartX;
                            dragStartX = e.pageX;
                            that.refreshGridView();
                        }
                    }
            	});
            this.$gridbody.on('click', "tr[data-rowid]", function(e){that.trclickStyle(e);that.setSelected(e);})
                .on('mouseover',"tr[data-rowid]",function(e){that.trhover(e);})
                .on('mouseout',"tr[data-rowid]",function(e){that.trout(e);})
                .on('click', "tr[data-rowid] td.line-file-icon i", function(e){that.fold(e);})
                .on('click', "tr[data-rowid] td input[type='checkbox']", function(e){that.checkbox(e);})
                .on('dblclick', "tr[data-rowid]", function(e){that.onDblClickRow(e);});
            this.$toolbar && this.$toolbar.on('click',"li[data-toolbar]",function(e){that.clickToolbar(e);});
        },

        init:function () {
            if(!this.options.columns){
                this.options.columns = (function findTableDef(that){
                    var filedArr = "[";
                    $("tr", that).each(function(){
                        filedArr = filedArr + "[";
                        $("th", this).each(function(){
                            var data = $(this).data("options");
                            var title = $(this).html();
                            if(data){
                                filedArr += "{title:\'" + title + "\'," + data + "},";
                            }
                            else{
                                filedArr += "{title:\'" + title + "\'}";
                            }
                        });
                        filedArr = filedArr + "],";
                    });
                    filedArr = filedArr + "]";
                    filedArr = filedArr.replace(/\},\]/g, "}]").replace(/\],\]/g, "]]");
                    return (new Function("return " + filedArr))();
                })(this.$element);
            }
            this.col = this.col || [];
            var that = this;
            var width = _getElementWidth(this.$element, this.options.width);

            $.each(this.options.columns,function(){
                $.each(this,function(){
                    if(this.field){
                        if(this.width){
                            var arr = ("" + this.width).split("%");
                            if(arr.length>1){
                                this.width = Math.floor(width * arr[0] / 100);
                            }
                            this.width -= (_cellPadding * 2 + _cellBorderW);
                        }else{
                            this.width = _cellDefaultW - _cellPadding*2 - 1;
                        }
                    }else{
                        this.width = _cellDefaultW - _cellPadding*2 - 1;
                    }
                    that.col.push(this);
                });
            });

            this.col.length && (this.col[this.col.length-1].width -= _cellBorderW);

            this.options.columns.length > 0
                && this.getData()
                && this.createTreegrid();
            this.$treegrid = this.$element.parent();
            this.$page     = $(".page",this.$datagrid);
            this.$toolbar  = $(".toolbar",this.$treegrid);
            this.$gridhead = $(".grid-head",this.$treegrid);
            this.$gridbody = $(".grid-body",this.$treegrid);
        },

        createTreegrid:function(){
            var height = _getElementHeight(this.$element,this.options.height);

            this.$element.wrap("<div class=\"treegrid\"></div>");
            this.$element.hide();
            this.$treegrid = this.$element.parent();
            height && this.$datagrid.css("height",height);


            this.options.title && this.$treegrid.append("<div class=\"title\"></div>");
            this.options.toolbar && this.$treegrid.append("<div class=\"toolbar\"></div>");
            this.$treegrid.append("<div class=\"grid-view\"></div>");
            this.options.pagination && this.$datagrid.append("<div class=\"page\"></div>");

            var $title = $(".title",this.$datagrid),
                $toolbar = $(".toolbar",this.$datagrid),
                $gridview = $(".grid-view",this.$datagrid),
                $page = $(".page",this.$datagrid);

            this.options.title && $title.html("<span>" + this.options.title + "</span>");
            this.options.pagination && this.createPage($page);
            this.options.toolbar && this.createToolbar($toolbar);
            this.createGrid($gridview,height);
        },

        createGrid:function($parent,height){
            $parent.append("<div class=\"grid-head\"><div class=\"grid-head-wrap\"></div></div><div class=\"grid-body\"></div>");

            var $gridhead = $(".grid-head-wrap",$parent);
            var $gridbody = $(".grid-body",$parent);
            this.createBody($gridbody);
            this.createHead($gridhead);

            if(height){
                height -= _gridHeadH;
                this.options.title && (height-=_titleH);
                this.options.toolbar && (height-=_toolbarH);
                this.options.pagination && (height-=_pagerH);
                $gridbody.css("height",height);
            }
        },

        createHead:function($parent){
            var headHtml = ["<table>"]
                ,op = this.options;

            op.columns && ((function(op){
                $.each(op.columns,function(){
                    var length = this.length;
                    headHtml.push("<tr>");

                    op.checkBox && headHtml.push("<td class=\"line-checkbox\"><input type=\"checkbox\"/></td>");
                    op.rowNum   && headHtml.push("<td class=\"line-number\"><div class=\"empty\"></div></td>");

                    $.each(this,function(i){
                        headHtml.push("<td");
                        var thText  = "",
                            thStyle = ' style="';
                        $.each(this,function(index,data){
                            if(index == 'filed' || index=='width'){
                                return ;
                            }
                            else if(index == 'title'){
                                thText = "<div class=\"td-content\" title=\"" + data + "\" >" + data + "</div>";
                            }
                            else{
                                thStyle = thStyle + index + ":" + data + ";";
                            }
                        });
                        i < (length - 1)?
                            headHtml.push(thStyle + "\">" + thText +"<div class=\"drag-line\" data-drag=\"" + i +"\"></td>"):
                            headHtml.push(thStyle + "\">" + thText +"</td>");
                    });
                    headHtml.push("</tr>");
                });
            })(op));

            headHtml.push("</table>");
            if($parent.children().length > 0){
                $("table",$parent).html(headHtml.join(""));
            }
            else{
                $parent.append(headHtml.join(""));
            }

            this.$gridhead = $(".grid-head",$parent);

            $("tr:eq(0) td",this.$gridbody).each(function(index){
                $("tr:eq(0) td:eq(" + index + ") .td-content",$parent).width($(this).width());
            });
        },

        createBody:function($parent){
            var html = ["<table>"]
                ,op = this.options
                ,col = this.col
                ,rowNum = 1
                ,paddingLeft = 1
                ,iconWidth = 6;
            /**
             * 拼装每行HTML
             */
            !function getRowHtml(data,isShow,id){
                $.each(data,function(index,value){
                    var that = this;
                    var checkbox = "";
                    id++;
                    rowNum++;
                    isShow=="show"?
                        html.push("<tr data-rowid=\"" + id + "\">"):
                        html.push("<tr data-rowid=\"" + id + "\" style=\"display:none\">");

                    op.checkBox && (checkbox = '<td class="line-checkbox"><input type=\"checkbox\"/></td>');
                    op.checkBox && this.check && (checkbox = '<td class="line-checkbox"><input type="checkbox" checked/></td>');
                    html.push(checkbox);

                    op.rowNum && html.push('<td class="line-number">' + rowNum + '</td>');

                    html = Array.prototype.concat.call(html,getColHtml(col,that,paddingLeft,id));
                    html.push("</tr>");

                    if(this.children && this.children.length > 0){
                        this.hasChildren = true;
                        paddingLeft = paddingLeft + iconWidth;
                        this.state && this.state == "closed" ?
                            getRowHtml(this.children,"hide",id*1000) :
                            getRowHtml(this.children,isShow,id*1000);
                        paddingLeft = paddingLeft -  iconWidth;
                    }
                });
            }(op.rows,"show",0);

            /**
             * 拼装列HTML
             * @param colDef     列定义
             * @param colData    列数据
             * @param textIndent 文件图标缩进
             * @param nodeId     id
             * @returns {Array}
             */
            function getColHtml(colDef,colData,textIndent,nodeId){
                var colHtml   = [],
                    fileIcons = {"file":"fa fa-file","folderOpen":"fa fa-folder-open","folderClose":"fa fa-folder"};
                $.each(colDef,function(index){
                	var text = colData[this.field] || "",
                        iconSty = fileIcons.file,
                        width = colDef[index].width || 100,
                        divWidth = width - 2*_cellPadding;

                    if(colData.hasChildren || (colData.children && colData.children.length)){
                    	iconSty = colData.state == "open" ? fileIcons.folderOpen:fileIcons.folderClose;
                    }

                    if(this.field == "text"){
                        colHtml.push('<td class="line-file-icon" style="text-indent:' + textIndent + 'px; width:' + width + 'px;">');
                        colHtml.push('<span class="td-content" style="width:' + divWidth + 'px" ><i class="'+ iconSty + '"></i>' + text+ '</span></td>');
                    }
                    else{
                        colHtml.push("<td style=\"width:" + width + "px;\">");
                        colHtml.push('<span class="td-content" style="width:' + divWidth + 'px">' + text + "</span></td>");
                    }
                });
                return colHtml;
            }

            html.push("</table>");

            if($parent.children().length > 0){
                $("table",$parent).html(html.join(""));
            }
            else{
                $parent.append(html.join(""));
            }

            this.$gridbody = $parent;
            var gridbodyWith = $parent.width(),
                tableWidth   = $("table",$parent).width();
            if(gridbodyWith>(tableWidth+1)){
                var lastTdWidth = $("table tr td:last-child",$parent).width();
                $("table tr td:last-child").width(lastTdWidth + gridbodyWith-tableWidth);
            }
        },
        createToolbar:function($parent){
            var html = "<ul>"
                ,op = this.options;
            $.each(op.toolbar,function(index,data){
                html += "<li data-toolbar=\"" + index + "\">" + this.text + "</li>";
            });
            html += "</ul>";
            $parent.append(html);
        },

        refreshGridView:function(){
            this.createBody(this.$gridbody);
            this.createHead(this.$gridhead);
            this.eventListen();
        },

        reload:function(param){
            param && (this.options.param = param);
            this.options.selectedRow = null;
            this.getData();
            this.refreshGridView();
        },

        getData:function(){
            var tgrid = this
                ,result = true;
            $.ajax({
                type: "post",
                url: this.options.url,
                success: function(data, textStatus){
                    tgrid.options.rows = data.rows;
                },
                data:this.options.param,
                dataType:"JSON",
                async:false
            });
            return result;
        },

        checkbox:function(e){
            var input = $(e.target)
                ,tr = $(e.target).closest("tr")
                ,rowid = tr.data('rowid')
                ,row = this.getRowDataById(rowid)
                ,isChecked = input.prop("checked");
            !function(data){
                data.check = isChecked;
                if(data.children && data.children.length > 0){
                    !function ita(data){
                        $.each(data,function(){
                            this.check = isChecked;
                            if(this.children && this.children.length > 0){
                                ita(this.children);
                            }
                        });
                    }(data.children);
                }
            }(row);
            this.createBody(this.$gridbody);
        },

        fold:function(e){
            var op = this.options
                ,item = $(e.target).closest("tr")
                ,rowid = item.data('rowid')
                ,that = this;
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
        },

        getMulSelected:function(){
            var mulSelectRow = []
                ,that = this;
            $("tr[data-rowid] input[type='checkbox']",this.$gridbody).each(function(){
                var $this = $(this)
                    ,item = $this.closest("tr")
                    ,rowid = item.data('rowid');
                $this.prop("checked") && mulSelectRow.push(that.getRowDataById(rowid));
            });
            return mulSelectRow;
        },

        getSelected:function(){
            return this.selectedRow;
        },

        setSelected:function(e){
            var op = this.options
                ,item = $(e.target).closest("tr")
                ,rowid = item.data('rowid')
                ,that = this;
            this.selectedRow = this.getRowDataById(rowid);
            if(op.onClick){
                op.onClick(that.selectedRow);
            }
        },

        getRowDataById:function(rowid){
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

        trclickStyle:function(e){
            var item = $(e.target).closest("tr")
                ,lastClickTr = $("tr.click",this.$gridbody);
            if(item.hasClass("click")){
                return ;
            }else{
                item.addClass("click");
                lastClickTr.attr("class","");
                if ($(lastClickTr).css('background-color') == "rgb(255, 136, 136)") {
                	$(lastClickTr).css('background-color', '#ff4444');
                }
            }
        },

        trhover:function(e){
            var item = $(e.target).closest("tr");
            if(item.hasClass("click")){
                return ;
            }
            //console.log($(item).css('background-color'));
            if ($(item).css('background-color') == "rgb(255, 68, 68)") {
            	$(item).css('background-color', '#ff8888');
            }
            $(item).addClass("hover");
        },

        trout:function(e){
            var item = $(e.target).closest("tr");
            if(item.hasClass("click")){
                return ;
            }
            if ($(item).css('background-color') == "rgb(255, 136, 136)") {
            	$(item).css('background-color', '#ff4444');
            }
            item.attr("class","");
        }
    };

    $.fn.treegrid = function (option,param) {
        var result = null;
        var tgrid = this.each(function () {
            var $this = $(this)
                , data = $this.data('treegrid')
                , options = typeof option == 'object' && option;
            if(typeof option == 'string' ){
                result = data[option](param);
            }else{
                $this.data('treegrid', (data = new TreeGrid(this, options)));
            }
        });
        if(typeof option == 'string')return result;
        return tgrid;
    };

    $.fn.treegrid.defaults = {
        url:"",
        title:null,
        toolbar:null,
        param:null,
        columns:null,
        rows:[],
        onDblClick:null,
        style:"treegrid",
        async:false,
        asyncUrl:"",
        onClick:null,
        rowNum:false,
        checkBox:false
    };

}(window.jQuery);
