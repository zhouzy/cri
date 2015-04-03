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
        this.$element.attr('data-role','datagrid');
    });

    $.fn.datagrid = function(option) {
        var o = null;
        this.each(function () {
            var $this = $(this),
                dg    = $this.data('datagrid');
            options = typeof option == 'object' && option;
            if(dg != null){
                dg._destroy();
            }
            $this.data('datagrid', (o = new DataGrid(this, options)));
        });
        return o;
    };

}(window);
