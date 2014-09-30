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
                .on('click',"li", function(e){that._setSelected(e);})
                .on('click', "li i.icon", function(e){that._fold(e);})
                .on('dblclick', "li", function(e){that._onDblClickRow(e);});
            this.$toolbar
                .on('click',"a[data-toolbar]",function(e){that._clickToolbar(e);});
        },

        _fold:function(e){
            var op = this.options
                ,item = $(e.target).closest("div")
                ,id = item.data('uid');
            this._getDataById(id);

            if(op.selectedRow.state == "open") {
                op.selectedRow.state = "closed";
            }

            else if(op.selectedRow.state == "closed"){
                op.selectedRow.state = "open";
                if(op.async){
                    var pa = {};
                    $.each(op.selectedRow,function(index,data){index != "childrenList" && (pa[index] = data);});
                    op.selectedRow.childrenList || $.ajax({
                        type: "get",
                        url: op.asyncUrl,
                        success: function(data, textStatus){
                            op.selectedRow.childrenList = data.rows;
                        },
                        data:pa,
                        dataType:"JSON",
                        async:false
                    });
                }
            }
            this._createTree();
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
                $tree   = $("<div></div>").addClass(this._className).width(width).height(height),
                $treeview = this.$treeview = $("<div></div>").addClass("tree-view"),
                $treebody = this.$treebody = $("<ul></ul>").addClass("tree-body"),
                textIndent = 0;

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

            var fileIcons = {"file":"icon fa fa-file","folderOpen":"icon fa fa-folder-open","folderClose":"icon fa fa-folder"};

            !function eachLi(data,isShow,id){
                for(var i = 0,len=data.length; i<len; i++){
                    var row = data[i];
                    var $li = $("<li></li>").data("uid",++id);
                    $treebody.append($li);
                    isShow == "hide" && $li.hide();

                    var $text = $("<span></span>").addClass("li-content").text(row.text);
                    var $icon = $("<i></i>").attr("class",fileIcons.file).css("marginLeft",textIndent);

                    if(row.children && row.children.length > 0){
                        if(row.hasChildren || (row.children && row.children.length)){
                            row.state == "open" ? $icon.attr("class",fileIcons.folderOpen):$icon.attr("class",fileIcons.folderClose);
                        }
                        $li.append($icon).append($text);
                        textIndent += _iconWidth;
                        row.state && row.state == "closed"
                            ? eachLi(row.children,"hide",id*1000)
                            : eachLi(row.children,isShow,id*1000);
                        textIndent -= _iconWidth;
                    }
                    else{
                        $li.append($icon).append($text);
                    }
                }
            }(op.rows,"show",0);
            this.$tree.append($treeview);
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
        style:"nav nav-tabs nav-stacked",
        page:true,
        async:false,
        asyncUrl:null
    };

}(window);