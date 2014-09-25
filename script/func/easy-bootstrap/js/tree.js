/**
 * Author zhouzy
 * Date   2014/9/25
 *
 * tree widgets
 *
 */

!function($){

    "use strict";

    var Tree = function (element, options) {
        this.options = $.extend({}, $.fn.tree.defaults, options);
        this.$element = $(element);
        this.init();
        var that = this;
        $(element).on('click', "div[data-nodeid]", function(e){that.setSelected(e);return false;})
            .on('click', "div span[data-nodeicon]", function(e){that.fold(e);return false;})
            .on('dblclick', "div[data-nodeid]", function(e){that.onDblClickRow(e);return false;})
            .on('click',"a[data-toolbar]",function(e){that.clickToolbar(e);return false;});
    };

    Tree.prototype = {
        init:function () {
            this.getData();
            this.creatTree();
            $(this.$element).addClass("tree");
            $("ul",this.$element).addClass(this.options.style);
        },
        reload:function(param){
            param && (this.options.param = param);
            this.init();
        },
        fold:function(e){
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
            this.creatTree();
        },
        getData:function(){
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
        creatTree:function(){
            var html = ""
                ,rownum = 0
                ,level = 0
                ,op = this.options;
            if(op.toolbar){
                var tbHTML = "<div class=\"toolbar\">";
                $.each(op.toolbar,function(index,data){
                    tbHTML = tbHTML + "<a href=\"javascript:void(0)\" data-toolbar=\"" + index + "\"><i class=\"" + this.iconCls + "\"></i>" + this.text + "</a>";
                });
                tbHTML = tbHTML + "</div>";
                html = html + tbHTML;
            }
            !function createCol(data,isShow,id){
                $.each(data,function(index,value){
                    id = id + 1;
                    var nodeClass = level == 0 ? "topnode" : "node";
                    if(isShow=="show"){
                        html += "<div class=\"" + nodeClass + "\" data-nodeid=\"" + id + "\">";
                    }else{
                        html += "<div class=\"" + nodeClass + "\" style=\"display:none\" data-nodeid=\"" + id + "\">>";
                    }
                    rownum ++ ;
                    if(this.children && this.children.length > 0){
                        if(this.state && this.state == "closed"){
                            html += "<span class=\"shrink\" style=\"margin-left:" + level*16 + "px;\" data-nodeicon=\"" + "shrink" + "\"></span>";
                        }
                        else{
                            html += "<span class=\"spread\" style=\"margin-left:" + level*16 + "px;\" data-nodeicon=\"" + "spread" + "\"></span>";
                        }
                        html += "<span data-nodetext=\"text\">" + this.text + "</span></div>";
                        level++;
                        this.state && this.state == "closed"
                            ? createCol(this.children,"hide",id*1000)
                            : createCol(this.children,isShow,id*1000);
                        level--;
                    }
                    else{
                        html += "<span class=\"leaf\" style=\"margin-left:" + level*16 + "px;\" data-nodeicon=\"" + "leaf" + "\"></span>";
                        html += "<span data-nodetext=\"text\">" + this.text + "</span></div>";
                    }
                });
            }(op.rows,"show",0);
            this.$element.html(html);
        },

        getSelected:function(){
            return this.options.selectedRow;
        },

        setSelected:function(e){
            var item = $(e.target).closest("div")
                ,id = item.data('nodeid')
                ,op = this.options;
            this.getDataById(id);
            if(op.onClick){
                op.onClick(op.selectedRow);
            }
        },

        onDblClickRow:function(e){
            var item = $(e.target).closest("div")
                ,id = item.data('nodeid')
                ,op = this.options;
            this.getDataById(id);
            if(op.onDblClick){
                op.onDblClick(op.selectedRow);
            }
            return false;
        },
        clickToolbar:function(e){
            var toolbar = $(e.target)
                ,index = toolbar.data('toolbar');
            this.options.toolbar[index].handler();
        },

        getDataById:function(id){
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
        }
    };

    $.fn.tree = function (option,param) {
        var result = null;
        var tree = this.each(function () {
            var $this = $(this)
                , data = $this.data('tree')
                , options = typeof option == 'object' && option;
            typeof option == 'string'
                ? result = data[option](param)
                : $this.data('tree', (data = new Tree(this, options)));
        });
        if(typeof option == 'string')return result;
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

    $(window).on('load', function(){
        $("[class='tree']").each(function () {
            var $tree = $(this)
                , data = $tree.data('options');
            if(!data) return;
            $tree.tree((new Function("return {" + data + "}"))());
        });
    });

}(window.jQuery);