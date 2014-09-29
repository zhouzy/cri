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
    var $   = window.jQuery,
        cri = window.cri;

    var Tree = cri.Tree = function (element, options) {
        this.options = $.extend({}, $.fn.tree.defaults, options);
        this.$element = $(element);
        this.$tree = null;
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
            this.$element
                .on('click', "div[data-nodeid]", function(e){that._setSelected(e);return false;})
                .on('click', "div span[data-nodeicon]", function(e){that._fold(e);return false;})
                .on('dblclick', "div[data-nodeid]", function(e){that._onDblClickRow(e);return false;})
                .on('click',"a[data-toolbar]",function(e){that._clickToolbar(e);return false;});
        },

        _fold:function(e){
            var op = this.options
                ,item = $(e.target).closest("div")
                ,id = item.data('nodeid');
            this.getDataById(id);

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
            var html = ""
                ,rownum = 0
                ,level = 0
                ,op = this.options;
            var height = _getElementHeight(this.$element,this.options.height);
            var $tree = $("<div></div>").addClass(this._className).css("height",height);
            this.$element.wrap($tree);
            this._createToolbar($tree);
            var $ul = $("<ul></ul>");

            !function createCol(data,isShow,id){
                $.each(data,function(index,value){
                    var nodeClass = level == 0 ? "topnode" : "node";
                    var $li = $("<li></li>").data("nodeid",++id).addClass(nodeClass);
                    $ul.append($li);
                    isShow == "" || $li.hide();
                    rownum ++ ;
                    var $icon = $("<span></span>");
                    var $text = $("<span></span>").data("nodetext",this.text);
                    if(this.children && this.children.length > 0){
                        if(this.state && this.state == "closed"){
                            $icon.addClass("shrink").data("nodeicon","shrink");
                        }
                        else{
                            $icon.addClass("shrink").data("nodeicon","spread");
                        }
                        $li.append($icon).append($text);
                        level++;
                        this.state && this.state == "closed"
                            ? createCol(this.children,"hide",id*1000)
                            : createCol(this.children,isShow,id*1000);
                        level--;
                    }
                    else{
                        $icon.addClass("leaf").data("nodeicon","leaf");
                        $li.append($icon).append($text);
                    }
                });
            }(op.rows,"show",0);
            $tree.append($ul);
            this.$tree = $tree;
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
                $parent.html($toolbar);
                this.$toolbar = this.$toolbar || $toolbar;
            }
        },

        _setSelected:function(e){
            var item = $(e.target).closest("div")
                ,id = item.data('nodeid')
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
                ,id = item.data('nodeid')
                ,op = this.options;
            this.getDataById(id);
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
            this.init();
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