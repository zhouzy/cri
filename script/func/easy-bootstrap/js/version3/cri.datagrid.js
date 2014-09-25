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

    var DataGrid = cri.DataGrid = function(element,options){
        cri.Grid.call(this,arguments);
    };

    DataGrid.prototype = new cri.Grid();

    $.fn.datagrid = function(option) {
        var datagrid = null;
        this.each(function () {
            var $this   = $(this),
                options = typeof option == 'object' && option;
            $this.data('datagrid', (datagrid = new DataGrid(this, options)));
        });
        return datagrid;
    };

}(window);
