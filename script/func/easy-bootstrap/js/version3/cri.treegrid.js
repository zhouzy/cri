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
        cri.Grid.apply(this,arguments);
        this.$treegrid = null;
    });

    TreeGrid.prototype.eventListen = function(){
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
            .on('click', "tr[data-rowid] td.line-file-icon i", function(e){
                that.fold(e);e.preventDefault();
            })
            .on('click', "tr[data-rowid] td input[type='checkbox']", function(e){that.checkbox(e);})
            .on('dblclick', "tr[data-rowid]", function(e){that.onDblClickRow(e);});
        this.$toolbar && this.$toolbar.on('click',"li[data-toolbar]",function(e){that.clickToolbar(e);});
    };


    $.fn.treegrid = function(option) {
        var treeGrid = null;
        this.each(function () {
            var $this   = $(this),
                options = typeof option == 'object' && option;
            $this.data('treegrid', (treeGrid = new TreeGrid(this, options)));
        });
        return treeGrid;
    };


}(window);
