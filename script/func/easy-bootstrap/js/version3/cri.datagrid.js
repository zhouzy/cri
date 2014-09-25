/**
 * Author zhouzy
 * Date   2014/9/23
 *
 * DataGrid
 *
 * 依赖 Grid
 */
!function(cri){

    var DataGrid = function(){
        this.kind = "animal";
    };

    DataGrid.prototype={
        eat:function(){
            console.log(this.kind + " can eat");
            _private();
        },
        sleep:function(){
            console.log(this.kind + " can sleep");
        }
    };

    cri.DataGrid = DataGrid;

}(window.cri);
