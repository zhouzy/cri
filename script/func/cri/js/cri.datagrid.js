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
            var $this   = $(this),
                dg      = $this.data('datagrid'),
            options = typeof option == 'object' && option;
            if(dg != null){
                dg.$grid.before($this).remove();
            }
            $this.data('datagrid', (datagrid = new DataGrid(this, options)));
        });
        return datagrid;
    };

}(window);
