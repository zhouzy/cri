
/*=====================================================================================
 * easy-bootstrap-messager v1.0
 *
 * @author:zhouzy
 * @date:2013/10/18
 * @dependce:jquery
 *=====================================================================================*/
!function($){
    var Messager = function(){
        this.messagerQueue = [];
        var that = this;
        window.MessagerOkBtn = function(){
            $("#EASYBOOTSTARPMSGWND").popoutWindow("hide");
            $("#EASYBOOTSTARPMSGWND").html("");
            var msg = that.messagerQueue.pop();
            if(msg.length == 3){
                msg[2](true);
            }
        };
        window.MessagerCancelBtn = function(){
            $("#EASYBOOTSTARPMSGWND").popoutWindow("hide");
            $("#EASYBOOTSTARPMSGWND").html("");
            var msg = that.messagerQueue.pop();
            if(msg.length == 3){
                msg[2](false);
            }
        };
        window.MessagerCloseBtn = function(){
            $("#EASYBOOTSTARPMSGWND").popoutWindow("hide");
            $("#EASYBOOTSTARPMSGWND").html("");
            var msg = that.messagerQueue.pop();
            if(msg.length == 3){
                msg[2](false);
            }
        };
    };
    Messager.prototype = {
        alert:function(title,content,iconSty){
            this.messagerQueue.push(arguments);
            var id = "EASYBOOTSTARPMSGWND";
            $("#EASYBOOTSTARPMSGWND").length > 0 || $("body").append("<div class=\"eb_popoutWindow\" id=\"" + id + "\"></div>");
            var $wnd = $("#EASYBOOTSTARPMSGWND");
            $wnd.html(content);
            $wnd.popoutWindow({
                title:title,
                buttons:[
                    {text:'确定',icon:'eb_iconOK',handler:'MessagerOkBtn'}
                ],
                width:500,
                height:300,
                left:440,
                top:100
            });
            $wnd.popoutWindow("show");
        },
        confirm:function(title,content,callBack){
            this.messagerQueue.push(arguments);
            var id = "EASYBOOTSTARPMSGWND";
            $("#EASYBOOTSTARPMSGWND").length > 0 || $("body").append("<div class=\"eb_popoutWindow\" id=\"" + id + "\"></div>");
            var $wnd = $("#EASYBOOTSTARPMSGWND");
            $wnd.html(content);
            $wnd.popoutWindow({
                title:title,
                buttons:[
                    {text:'确定',icon:'eb_iconOK',handler:'MessagerOkBtn'},
                    {text:'取消',icon:'eb_iconCancel',handler:'MessagerCancelBtn'}
                ],
                width:500,
                height:300,
                left:440,
                top:100
            });
            $wnd.popoutWindow("show");
        }
    };
    $.messager = new Messager();
}(jQuery);

