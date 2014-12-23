/**
 * Author zhouzy
 * Date   2014/12/8
 *
 */

var grid = $("#grid").datagrid({
    url:"./data-grid.json",
    checkBox:true,
    onChange:function(){
        var selected = this.getSelected();
        if(selected.length>0){
            toggleActionBar(true);
        }else{
            toggleActionBar(false);
        }
    }
});
var tree = $("#tree").tree({
    url:"./tree-data.json",
    title:"Menu Tree"
});
$("#modifyFilter").on("click",function(){
    toggleFilterWnd();
});

function toggleFilterWnd(){
    $("#filterWnd").animate({
        width:"toggle"
    });
}

$("#filterWnd input").input();

$("#filterWnd").validator({
    validateOnBlur:true
});

$("#filterWndBtnOk").button({
    iconCls:"fa fa-circle-o",
    onClick:function(){
        var formJson = $("#filterWnd").formValue(),
            $filters = $("#filters").empty();
        for(var p in formJson){
            var $filter = $('<span class="filter">' + p + ":" + formJson[p] + '</span>');
            $filters.append($filter);
        }
        toggleFilterWnd();
    }
});

$("#filterWndBtnCancel").button({
    iconCls:"fa fa-close",
    onClick:function(){
        toggleFilterWnd();
    }
});

$("#filterWndBtnClear").button({
    iconCls:"fa fa-refresh",
    onClick:function(){
        toggleFilterWnd();
    }
});

$("#actionDelBtn").click(function(){
    var selected = grid.getSelected();
    var users = [];
    for(var s in selected){
        users.push(selected[s].firstName + " " + selected[s].lastName);
    }
    cri.notification.warming("您将要删除用户:" + users.join("、"));
});
$("#actionModBtn").click(function(){
    var selected = grid.getSelected();
    if(selected.length>1){
        cri.notification.error("不能一次修改多个用户");
    }
    else{
        $("#modifyWnd").window({
            title:"Modify User",
            modal:true,
            content:"modify-window.html",
            onReady:function($window){
                var that = this;
                $("input",$window).input();
                $("#modifyWndBtnOk",$window).button({
                    iconCls:"fa fa-circle-o",
                    onClick:function(){
                        that.close();
                    }
                });
                $("#modifyWndBtnCancel",$window).button({
                    iconCls:"fa fa-close",
                    onClick:function(){
                        that.close();
                    }
                });
                $("#modifyWndBtnClear",$window).button({
                    iconCls:"fa fa-close",
                    onClick:function(){
                        that.close();
                    }
                });
            }
        });
    }
});

function toggleActionBar(isShow){
    var $actionBar = $("#actionBar");
    if(isShow){
        if($actionBar.is(":hidden")){
            $actionBar.animate({
                height:"toggle"
            });
        }
    }else{
        if(!$actionBar.is(":hidden")){
            $actionBar.animate({
                height:"toggle"
            });
        }
    }
}

