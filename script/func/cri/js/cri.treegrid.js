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
        this._refreshBody();
    };

    TreeGrid.prototype._checkbox = function(e){
        var input = $(e.target),
            tr    = $(e.target).closest("tr"),
            rowid = parseInt(tr.data('rowid')),
            id    = rowid,
            row   = this.getRowDataById(rowid),
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
