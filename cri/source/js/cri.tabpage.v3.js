/**
 * Author zhouzy
 * Date   2014/12/26
 *
 * TabPage
 */

!function(window){

    "use strict";

    var cri = window.cri,
        $   = window.jQuery;

    var TABPAGE_GROUP  = "tabPage-group",
        TABPAGE_HEADER = "fa fa-caret-down",
        TABPAGE_BODY   = "options";

    var _defaultOptions = {
        label:'',
        data:null,  //Array [{value:"",text:""},{value:"",text:""}]
        change:null //Function: call back after select option
    };

    var TabPage = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        cri.Widgets.apply(this,arguments);
    });

    $.extend(TabPage.prototype,{
        _eventListen:function(){
        },

        _init:function(){
            this._create();
        },

        _create:function(){},

        _createHeader:function(){},

        _addTab:function(){},

        _delTab:function(){},

        _fouceTab:function(){},

        /**
         * 增加Tab
         * @param content : html字符串、url
         */
        addTab:function(content){}

    });

    var TabPageBody = function($parent,options){
        this.options = $.extend({

        },options);
        this.$body = null;
        this._init();
    };

    $.extend(TabPageBody.prototype,{
        _init:function(){
            this.$body = $('<div class="' + TABPAGE_BODY + '">');
        },
        _load:function(){

        },
        _destory:function(){

        },
        _show:function(){
            this.$body.hide();
        },
        _hide:function(){
            this.$body.show();
        }
    });

    cri.TabPage = TabPage;

    $.fn.tabPage = function(option) {
        var o = null;
        this.each(function () {
            var $this = $(this),
                options = typeof option == 'object' && option;
            o = $this.data('selectBox');
            if(o != null){
                o._destory();
            }
            $this.data('selectBox', (o = new SelectBox(this, options)));
        });
        return o;
    };
}(window);