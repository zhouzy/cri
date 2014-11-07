/**
 * Author zhouzy
 * Date   2014/9/18
 * SelectBox 组件
 *
 */
!function(window){

    "use strict";

    var cri = window.cri,
        $   = window.jQuery;

    var _defaultOptions = {
        label:'',
        data:null,//Array [{value:"",text:""},{value:"",text:""}]
        optionLabel:''
    };

    var SELECTBOX_GROUP = "selectBox-group",
        SELECTBOX_BODY  = "selectBox-body",
        SELECTBOX_INPUT = "selectBox-input",
        SELECTBOX_BTN   = "selectBox-btn",
        OPTIONS  = "options",
        SELECTED = "selected";

    var SelectBox = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        this.$selectBoxGroup = null;
        this.$selectBoxInput = null;
        this.$selectBoxOptions = null;
        cri.Widgets.apply(this,arguments);
    });

    $.extend(SelectBox.prototype,{
        _eventListen:function(){
        },

        _init:function(){
            this._create();
        },

        _create:function(){
            this.$element.hide();
            this.$element.wrap('<span class="' + SELECTBOX_GROUP + '"></span>');
            var $selectBoxGroup = this.$selectBoxGroup = this.$element.parent();
            $selectBoxGroup.append('<label>' + this.options.label + '</label>');
            $selectBoxGroup.append(this._createBody(),this._createOptions())
        },

        _createBody:function(){
            var $selectBody = $('<span class="' + SELECTBOX_BODY + '"></span>'),
                $selectInput = this.$selectBoxInput = $('<span class="' + SELECTBOX_INPUT + '"></span>'),
                $btn = this._createSlectBtn();
            $selectBody.append($selectInput,$btn);
            $selectBody.on("click",this._toggleOptions());
            return $selectBody;
        },

        _createSlectBtn:function(){
            return $('<i class="' + SELECTBOX_BTN +' fa fa-caret-down"></i>');
        },

        /**
         * 显示隐藏切换options选择框
         * @private
         */
        _toggleOptions:function(){
            var isHide = true,//当前是否显示
                that = this;
            return function(){
                if(isHide){
                    that._hideOptions();
                }else{
                    that._showOptions();
                    $(document).one("click",function(){
                        that._hideOptions();
                        isHide = false;
                    });
                }
                isHide = !isHide;
                return false;
            };
        },

        /**
         * 显示Options选择框
         * @private
         */
        _showOptions:function(){
            this.$selectBoxOptions.animate({
                height:'show'
            },200);
        },

        /**
         * 隐藏Options选择框
         * @private
         */
        _hideOptions:function(){
            this.$selectBoxOptions.animate({
                height:'hide'
            },200);
        },

        /**
         * 初始化下拉选择框
         * @returns {*|HTMLElement}
         * @private
         */
        _createOptions:function(){
            var data = this._data();
            var $options = this.$selectBoxOptions = $('<ul class="' + OPTIONS + '"></ul>');
            if(data){
                for(var i = 0,len = data.length; i<len; i++){
                    $options.append(this._createOption(data[i]));
                }
            }
            return $options;
        },

        /**
         * 构造单个option
         * @param option
         * @private
         */
        _createOption:function(option){
            var $li = $('<li></li>').text(option.text),
                that = this;
            $li.on("click",function(e){
                $("li."+SELECTED,that.$selectBoxOptions).removeClass(SELECTED);
                $li.addClass(SELECTED);
                that._select(option.text,option.value);
                //TODO:set value to select
                return false;
            });
            return $li;
        },

        /**
         * 获取options定义
         * 1.初始化时定义
         * 2.原始select元素options获取
         * @private
         */
        _data:function(){
            var data = this.options.data;
            if(!data){
                data = [];
                $("option",this.$element).each(function(){
                        var text = $(this).text();
                        var value = this.value;
                        data.push({text:text,value:value});
                    }
                );
            }
            return data;
        },

        /**
         * 单击option触发
         * @param e
         * @private
         */
        _select:function(text,value){
            this.$selectBoxInput.text(text);
        }
    });

    cri.SelectBox = SelectBox;

    $.fn.selectBox = function(option) {
        var o = null;
        this.each(function () {
            var $this = $(this),
                options = typeof option == 'object' && option;
            o = $this.data('selectBox');
            if(o != null){}
            $this.data('selectBox', (o = new SelectBox(this, options)));
        });
        return o;
    };
}(window);