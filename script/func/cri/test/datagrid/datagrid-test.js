/**
 * Author Administrator
 * Date   2014/10/13
 *
 *
 */

QUnit.test("datagrid",function(assert){
    //当无法加载数据时，rows:[]，total:0
    var grid = $("#grid").datagrid({
        url:"./wrong-data.json"
    });
    assert.equal(grid.options.rows.length,0);
    assert.equal(grid.options.total,0);


    grid = $("#grid").datagrid({
        url:"./datagrid-data.json"
    });
    var event = $.Event("click");
    var $gridbody = grid.$gridbody;
    $("tr:eq(0)",$gridbody).trigger(event);
    var selectRow = grid.getSelected();
    assert.deepEqual(selectRow,{
        "propA": 1123,
        "propB": 456,
        "propC": 789,
        "propD": "ABC",
        "propE": "DEF",
        "propF": "GHT"
    });
});
