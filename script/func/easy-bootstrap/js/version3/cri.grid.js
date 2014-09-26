/**
 * Author zhouzy
 * Date   2014/9/18
 * datagrid 组件
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
        _cellPadding  = 4,  //表格单元格左右Padding
        _cellDefaultW = 100,//单元格默认宽度
        _cellBorderW  = 1;  //表格border宽度

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

    /**
     * 计算表格高度
     * 1.若table初始化时，定义了高度属性
     * 2.若table设置了高度属性(height)
     * 3.若table设置了高度样式
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

    var Grid = cri.Class.extend(function(element,options){
        this.options     = _defaultOptions;
        this.$element    = $(element);
        this.$grid       = null;
        this.$gridhead   = null;
        this.$gridbody   = null;
        this.$toolbar    = null;
        this.$page       = null;
        this.col         = null;
        this.selectedRow = null;
        this.gridType    = null;
        this._initOptions(options);
        this.init();
        this.eventListen();
    });

    $.extend(Grid.prototype,{
        eventListen:function(){
            var that = this;
            var op = this.options;
            var isDrag = false;
            var dragStartX = 0;
            var dragIndex = 0;
            var left = 0;
            var right = 0;

            this.$gridbody
                .on("scroll",function(e){
                    $(".grid-head-wrap",that.$gridhead).scrollLeft($(this).scrollLeft());
                })
                .on('click', "tr[data-rowid]", function(e){
                    that.setSelected(e);
                })
                .on('dblclick', "tr[data-rowid]", function(e){
                    that.onDblClickRow(e);
                })
                .on("change", "input[type=checkbox]",function(e){
                    var isChecked = $(e.target).prop("checked");
                    var rowid = $(e.target).closest("tr").data("rowid");
                    if(isChecked && op.onChecked){
                        op.onChecked(that.getRowDataById(rowid),rowid);
                    }
                });

            this.$gridhead
                .on('mousedown',".drag-line",function(e){
                    that.$datagrid.css("cursor","e-resize");
                    dragIndex = $(e.target).data("drag");
                    isDrag = true;
                    dragStartX = e.pageX;
                    left = dragStartX - that.col[dragIndex].width + 20;
                    right = dragStartX + that.col[dragIndex + 1].width - 20;
                })
                .on("mouseup",function(e){
                    if(isDrag){
                        that.$datagrid.css("cursor","");
                        isDrag = false;
                    }
                })
                .on("mouseover",function(e){
                    if(isDrag){
                        if(e.pageX > left && e.pageX <right){
                            that.col[dragIndex].width += e.pageX - dragStartX;
                            that.col[dragIndex + 1].width -= e.pageX - dragStartX;
                            dragStartX = e.pageX;
                            that.refreshGridView();
                        }
                    }
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

        init:function () {
            if(!this.options.columns){
                this.options.columns = (function findTableDef(that){
                    var fieldArr = "[";
                    $("tr", that).each(function(){
                        fieldArr  += "[";
                        $("th,td", this).each(function(){
                            var data = $(this).data("options");
                            var title = $(this).html();
                            if(data){
                                fieldArr += "{title:\'" + title + "\'," + data + "},";
                            }
                            else{
                                fieldArr  += "{title:\'" + title + "\'},";
                            }
                        });
                        fieldArr += "],";
                    });
                    fieldArr += "]";
                    fieldArr = fieldArr.replace(/\},\]/g, "}]").replace(/\],\]/g, "]]");
                    return (new Function("return " + fieldArr))();
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
            && this.createDatagrid();
            this.$toolbar  = $(".toolbar",this.$datagrid);
            this.$page     = $(".page",this.$datagrid);
            this.$gridhead = $(".grid-head",this.$datagrid);
            this.$gridbody = $(".grid-body",this.$datagrid);
        },

        createDatagrid:function(){
            var height = _getElementHeight(this.$element,this.options.height);
            this.$element
                .wrap("<div class=\"datagrid\"></div>")
                .hide();

            this.$grid = this.$element.parent();
            this.options.title   && this._createTitle(this.$grid);
            this.options.toolbar && this.createToolbar(this.$grid);
            this.createGrid(this.$grid,height);
            this.options.pagination && this.createPage(this.$grid);
            this.$grid.css("height",height);
        },

        createGrid:function($parent,height){
            var html = '<div class="grid-view"><div class="grid-head"><div class="grid-head-wrap"></div></div><div class="grid-body"></div></div>';
            $parent.append(html);
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
        _createTitle:function($grid){
            $grid.append('<div class="title"><span>' + this.options.title + '</span></div>');
        },
        createHead:function($parent){
            var headHtml = ["<table cellspacing=\"1\">"]
                ,op = this.options
                ,col = this.col;
            op.columns && ((function(op){
                $.each(op.columns,function(){
                    var length = this.length;
                    headHtml.push("<tr>");
                    op.checkBox && headHtml.push('<td class="line-checkbox"><span class="td-content"><input type="checkbox"/></span></td>');
                    op.rowNum   && headHtml.push('<td class="line-number"><div class="td-content"></div></td>');
                    $.each(this,function(i){
                        headHtml.push("<td");
                        var thText   = "",
                            thStyle  = " style=\"";
                        $.each(this,function(index,data){
                            if(index == 'field' || index=='width'){
                                return ;
                            }
                            else if(index == 'title'){
                                thText = "<div class=\"td-content grid-header-text\" title=\"" + data + "\" >" + data + "</div>";
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
            $("tr:eq(0) td",this.$gridbody).each(function(index){
                $("tr:eq(0) td:eq(" + index + ") .td-content",$parent).width($(this).width());
            });
            this.$gridhead = $(".grid-head",$parent);
        },

        createBody:function($parent){
            var bodyHtml = ["<table cellspacing=\"1\">"],
                op       = this.options,
                id       = 0,
                rowNum   = 1 + op.pageSize * (op.page - 1),
                col      = this.col;
            $.each(op.rows,function(index,value){
                var that = this;
                if (that.specialColor == "1") {
                    bodyHtml.push("<tr style=\"font-weight:bold;color:#333333;\" data-rowid=\"" + id + "\">");
                } else {
                    bodyHtml.push("<tr data-rowid=\"" + id + "\">");
                }
                op.checkBox && bodyHtml.push("<td class=\"line-checkbox\"><input type=\"checkbox\"/></td>");
                op.rowNum && bodyHtml.push("<td class=\"line-number\">" + rowNum + "</td>");

                $.each(col,function(index,value){
                    var text = that[this.field] || "";
                    var _text = ("" + text).replace(/<.\w+\s*[^<]+>/g,""),
                        width = col[index].width,
                        divWidth = width - 2*_cellPadding;

                    bodyHtml.push("<td style=\"width:" + width + "px;\"><div class=\"td-content\" title=\""+ _text +"\" style=\"width:" + divWidth + "px;\">" + text + "</div></td>");
                });
                bodyHtml.push("</tr>");
                rowNum++;
                id++;
            });
            bodyHtml.push("</table>");

            if($parent.children().length > 0){
                $("table",$parent).html(bodyHtml.join(""));
            }
            else{
                $parent.append(bodyHtml.join(""));
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
            var html = "<div class=\"toolbar\"><ul>"
                ,op = this.options;
            $.each(op.toolbar,function(index,data){
                html += "<li data-toolbar=\"" + index + "\">" + this.text + "</li>";
            });
            html += "</ul></div>";
            $parent.append(html);
        },

        createPage:function($parent){
            var pageHtml  = [],
                op        = this.options,
                pageSize  = op.pageSize || 10,
                totalPage = 1,
                totalNum  = 0,
                page      = parseInt(this.options.page),
                lastPage  = page - 1,
                nextPage  = page + 1;
            if(op.pagination){
                op.rows
                && op.total
                && (totalNum = op.total)
                && op.total > 0
                && (totalPage = Math.ceil(op.total / op.pageSize));

                //分页按钮组
                pageHtml.push('<div class="page"><div class="pager-nav">');
                if(page <= 1){
                    pageHtml.push("<a class=\"pager-nav state-disabled\"><span class=\"fa fa-angle-double-left\"></span></a>");
                    pageHtml.push("<a class=\"pager-nav state-disabled\"><span class=\"fa fa-angle-left\"></span></a>");
                }
                else{
                    pageHtml.push("<a data-page=\"1\" class=\"pager-nav\"><span class=\"fa fa-angle-double-left\"></span></a>");
                    pageHtml.push("<a data-page=\""+ lastPage +"\" class=\"pager-nav\"><span class=\"fa fa-angle-left\"></span></a>");
                }

                for(var i=-2; i<3; i++){
                    var shiftpage = i + page;
                    if(shiftpage <= totalPage && shiftpage > 0){
                        shiftpage != page ?
                            pageHtml.push("<a data-page=\"" + shiftpage + "\" class=\"pager-nav pager-num\" >" + shiftpage + "</a>"):
                            pageHtml.push("<a data-page=\"" + shiftpage + "\" class=\"pager-nav state-selected\" >" + shiftpage + "</a>");
                    }
                }
                if(page >= totalPage){
                    pageHtml.push("<a class=\"pager-nav state-disabled\"><span class=\"fa fa-angle-right\"></span></a>");
                    pageHtml.push("<a class=\"pager-nav state-disabled\"><span class=\"fa fa-angle-double-right\"></span></a>");
                }else{
                    pageHtml.push("<a data-page=\"" + nextPage + "\" class=\"pager-nav\"><span class=\"fa fa-angle-right\"></span></a>");
                    pageHtml.push("<a data-page=\"" + totalPage + "\" class=\"pager-nav\"><span class=\"fa fa-angle-double-right\"></span></a>");
                }
                pageHtml.push('</div>');
                //分页信息
                pageHtml.push('<div class="pager-info">' + ((page-1) * pageSize + 1) + ' - ' + (page * pageSize) + ' of ' + totalNum + ' items');
                pageHtml.push('</div>');
                if(this.$page){
                    $parent.html(pageHtml.join(""));
                }else{
                    $parent.append(pageHtml.join(""));
                }
            }
        },

        refreshGridView:function(){
            this.createBody(this.$gridbody);
            this.createHead(this.$gridhead);
            this.createPage(this.$page);
        },

        reload:function(param){
            param && (this.options.param = param);
            this.selectedRow = null;
            this.getData();
            this.refreshGridView();
        },

        getData:function(){
            var result = true,
                op = this.options;
            if(op.pagination){
                op.param.page = op.page;
                op.param.rows = op.pageSize;
            }
            $.ajax({
                type: "post",
                url: this.options.url,
                success: function(data, textStatus){
                    if(op.ajaxDone){
                        op.ajaxDone(data);
                    }
                    op.rows = data.rows || [];
                    op.total = data.total || 0;
                },
                data:op.param,
                dataType:"JSON",
                async:false
            });
            return result;
        },

        loadData:function(param){
            if(param.push){
                this.options.rows = param;
                this.refreshGridView();
            }
        },

        page:function(){
            this.getData();
            this.refreshGridView();
            this.createPage(this.$page);
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