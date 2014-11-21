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
        label:''
        ,data:null//Array [{value:"",text:""},{value:"",text:""}]
        ,optionLabel:''
        ,value:null//Function: get or set selectBox value
        ,text:null//Function: get or set selectBox text
        ,change:null//Function: call back after select option
    };

    var SELECTBOX_GROUP = "selectBox-group",
        SELECTBOX_BODY  = "selectBox-body",
        SELECTBOX_INPUT = "selectBox-input",
        SELECTBOX_BTN   = "selectBox-btn",
        OPTIONS  = "options",
        SELECTED = "selected";

    /**
     * TODO:1.增加级联下拉框特性
     */
    var SelectBox = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        this.$selectBoxGroup = null;
        this.$selectBoxInput = null;
        this.$selectBoxOptions = null;
        this._value = null;
        this._text = null;
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
            $selectBoxGroup.append(this._label());
            $selectBoxGroup.append(this._createBody(),this._createOptions())
        },

        _label:function(){
            var label = this.options.label || this.$element.attr("title") || this.$element.attr("name") || "";
            return $('<label></label>').text(label);
        },

        _createBody:function(){
            var $selectBody = $('<span class="' + SELECTBOX_BODY + '"></span>'),
                $selectInput = this.$selectBoxInput = $('<span class="' + SELECTBOX_INPUT + '"></span>'),
                $btn = $('<i class="' + SELECTBOX_BTN +' fa fa-caret-down"></i>');
            $selectBody.append($selectInput,$btn);
            $selectBody.on("click",this._toggleOptions());
            return $selectBody;
        },

        /**
         * 初始化下拉选择框
         * @returns {*|HTMLElement}
         * @private
         */
        _createOptions:function(){
            var data = this._data();
            var $options = this.$selectBoxOptions = $('<ul class="' + OPTIONS + '"></ul>').hide();
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
                if(!$li.is("." + SELECTED)){
                    $("li."+SELECTED,that.$selectBoxOptions).removeClass(SELECTED);
                    $li.addClass(SELECTED);
                    that._select(option.text,option.value);
                    that.options.change && that.options.change.call(that);
                }
            })
            .on("click",that._toggleOptions());
            return $li;
        },

        /**
         * 显示隐藏切换options选择框
         * @private
         */
        _toggleOptions:function(){
            var that = this;
            return function(){
                that.$selectBoxOptions.animate({
                    height:'toggle'
                },200,function(){
                    if(!that.$selectBoxOptions.is(":hidden")){
                        that._clickBlank();
                    }
                });
                return false;
            };
        },

        /**
         * 当在非本元素范围内点击，收缩下拉框
         * @private
         */
        _clickBlank:function(){
            var that = this;
            $(document).mouseup(function(e) {
                var _con = that.$selectBoxGroup;
                if (!_con.is(e.target) && _con.has(e.target).length === 0) {
                    that.$selectBoxOptions.animate({
                        height:'hide'
                    },200);
                }
            });
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
            this.options.data = data;
            return data;
        },

        /**
         * 单击option触发
         * @param e
         * @private
         */
        _select:function(text,value){
            //TODO:原来元素必须为select
            var $select = this.$element;
            if($select.is("select")){
                $select.val(value);
            }
            this.$selectBoxInput.text(text);
            this._text = text;
            this._value = value;
        },

        /**
         * get or set selectBox value
         * @param value
         * @returns {*}
         */
        value:function(value){
            if(arguments.length>0){
                this._value = value;
                this.$element.val(value);
                this.$selectBoxInput.text(this.options.data[value]);
            }
            else{
                return this._value;
            }
        },

        /**
         * get or set selectBox text
         * @param text
         * @returns {*}
         */
        text:function(text){
            if(arguments.length>0){
                var value = null;
                for(var p in this.options.data){
                    if(p.text === text){
                        value = p.value || "";
                    }
                }
                this._value = value;
                this.$element.val(value);
                this.$selectBoxInput.text(text);
            }
            else{
                return this._text;
            }
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