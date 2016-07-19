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
        title:null,
        toolbar:null,
        url:null,
        param:null,
        async:false,
        asyncUrl:null,
        page:true,

        onSelected:null,
        onDblClick:null
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
        this.rows = null;
        this._className = "tree";
        cri.Widgets.apply(this,arguments);
        this.$element.attr('data-role','tree');
    });

    $.extend(Tree.prototype,{

        _eventListen:function(){
            var that = this,
                op   = that.options;
            this.$treebody
                .on('click',"div.li-content",function(e){
                    that._select(e);
                    that._fold(e);
                    op.onSelected && op.onSelected.call(that,that.selectedRow);
                    return false;
                })
                .on('dblclick', "div.li-content", function(e){
                    that._select(e);
                    op.onDblClick && op.onDblClick.call(that,that.selectedRow);
                    return false;
                });
        },

        _init:function () {
            this._getData();
            this._createTree();
            if(this.options.onLoad && typeof(this.options.onLoad) === 'function'){
                this.options.onLoad.call(this);
            }
        },

        /**
         * 同步数据
         * @returns {boolean}
         * @private
         */
        _getData:function(){
            var tree = this;
            $.ajax({
                type: "post",
                url: this.options.url,
                success:function(data){
                    tree.rows = data.rows;
                },
                data:this.options.param,
                dataType:"JSON",
                async:false
            });
            return true;
        },

        /**
         * 生成tree视图
         * @private
         */
        _createTree:function(){
            var op      = this.options,
                height  = this.$element._getHeightPixelValue(op.height),
                width   = this.$element._getWidthPixelValue(op.width),
                $tree   = $("<div></div>").addClass(this._className).addClass('panel panel-default').width(width),

                $treeview = this.$treeview = $("<div></div>").addClass("tree-view panel-body"),
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
            this._eachNode($treebody,this.rows,"show",0,0);
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
                uid    = $(".li-content",$li).data('uid') * 1000,
                indent = +($('i',$li).css("marginLeft").split('px')[0]);
            indent += _iconWidth;
            this._eachNode($ul,children,"show",uid,indent);
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

                if(row.hasChildren && row.children && row.children.length){
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
                    node.state = "close";
                    node.iconType = "folderClose";
                }
            }
        },

        _createTitle:function($parent){
            if(this.options.title){
                this.$title = $('<div class="title panel-heading"><span>' + this.options.title + '</span></div>');
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

        /**
         * 展开、收缩子节点
         * @param e
         * @private
         */
        _fold:function(e){
            var op = this.options,
                that = this,
                item = $(e.target).closest("div"),
                $li = $(e.target).closest("li"),
                $icon = $("i",item);

            $icon.is(".fa-folder")?
                $icon.removeClass("fa-folder").addClass("fa-folder-open"):
                $icon.removeClass("fa-folder-open").addClass("fa-folder");

            if(!that.selectedRow.children && op.async){
                var pa = {};
                $.each(that.selectedRow,function(index,data){
                    index != "children" && (pa[index] = data);
                });
                that.selectedRow.children || $.ajax({
                    type: "get",
                    url: op.asyncUrl,
                    success: function(data){
                        that.selectedRow.children = data.rows;
                        that._appendChildren($li,data.rows);
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

        _select:function(e){
            var item = $(e.target).closest("div"),
                uid = item.data('uid');
            this.selectedRow = this._getDataById(uid);
        },

        _getDataById:function(id){
            var row = null;
            !function getRow(data){
                var arr = [];
                while(id >= 1){
                    var t = id%1000;
                    arr.push(t);
                    id = Math.floor(id/1000);
                }
                for(var i = arr.length - 1; i >= 0 ; i--){
                    var k = arr[i] - 1;
                    data[k]&&(row = data[k])&&(data = data[k].children);
                }
            }(this.rows);
            return row;
        },

        getSelected:function(){
            return this.selectedRow;
        },

        reload:function(param){
            param && (this.options.param = param);
            this._init();
        }
    });

    $.fn.tree = function (option) {
        var tree = null;
        this.each(function () {
            var $this   = $(this),
                options = typeof option == 'object' && option;
            $this.data('tree', (tree = new Tree(this, options)));
        });
        return tree;
    };

}(window);
