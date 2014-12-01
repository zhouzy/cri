/**
 * Author zhouzy
 * Date   2014/10/14
 * notification 组件
 *
 */
!function(window){

    var cri = window.cri,
        $   = window.jQuery;

    var Notification = function(){

    };

    Notification.prototype={
        _notiBody:function(type,message){
            var that = this;
            var icons = {success:"fa-exclamation",error:"fa-exclamation",warming:"fa-exclamation"};
            if(this.$notification && this.$notification.length){
                this._hide(this.$notification);
            }
            var $notification = this.$notification = $('<div class="notification ' + type + '"></div>'),
                $icon = $('<i class="icon fa ' + icons[type]+ '"></i>'),
                $message = $('<span class="message">' + message + '</span>'),
                $btn = $('<i class="btn fa fa-close"></i>').on("click",function(){
                    that._hide($notification);
                });
            $notification.append($icon,$message,$btn);
            $('body').append($notification);
            that._show();
            window.setTimeout(function(){
                that._hide($notification);
            },1000*5);
        },

        _hide:function($notification){
            $notification.animate({
                height:"hide"
            },function(){
                $notification.remove();
            });
        },

        _show:function(){
            this.$notification.animate({
                height:"show"
            });
        },

        error:function(message){
            this._notiBody("error",message);
        },
        warming:function(message){
            this._notiBody("warming",message);
        },
        success:function(message){
            this._notiBody("success",message);
        }
    }

    cri.notification = new Notification();

}(window);