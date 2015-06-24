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

    var SELECTBOX_GROUP = "selectBox-group",
        SELECTBOX_BTN   = "fa fa-caret-down",
        OPTIONS  = "options",
        SELECTED = "selected";

    var _defaultOptions = {
        label:'',
        data:null,  //Array [{value:"",text:""},{value:"",text:""}]
        change:null, //Function: call back after select option
        value:null,
        enable:true
    };

    var SelectBox = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        this.$selectBoxGroup = null;
        this.input = null;
        this.listView = null;
        this._value = null;
        this._text = null;
        cri.Widgets.apply(this,arguments);
        this.$element.attr('data-role','selectbox');
    });

    $.extend(SelectBox.prototype,{
        _init:function(){
            this._create();
            var value = this.options.value || this.$element.val();
            if(value != null){
                this.value(value);
            }
        },

        _create:function(){
            this.$element.hide();
            this.$element.wrap('<span class="' + SELECTBOX_GROUP + '"></span>');
            this.$selectBoxGroup = this.$element.parent();
            this._createInput();
            this._createListView();
        },

        _createInput:function(){
            var that = this,
                button = {iconCls:SELECTBOX_BTN,handler:function(){
                    that.listView.toggle();
                }};
            this.input = new cri.Input(this.$element,{
                label:that.label,
                readonly:true,
                button:button,
                enable:this.options.enable,
                onFocus:function(){
                    that.listView.toggle();
                }
            });
        },

        _createListView:function(){
            var that = this;
            this.listView = new ListView(this.$selectBoxGroup,{
                data:that._data(),
                onChange:function(value){
                    that.value(value);
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
            else{
                var option = [];
                for(var i= 0,len=data.length;i<len;i++){
                    option.push('<option value="' + data[i].value + '">' + data[i].text + '</option>');
                }
                this.$element.html(option.join(""));
            }
            this.options.data = data;
            return data;
        },

        /**
         * 设置原生元素select option
         * @param optionsArr [{value:value,text:text}]
         * @private
         */
        _setSelectOptions:function(optionsArr){
            var $select = this.$element;
            if($select.is("select")){
                $select.empty();
                for(var i = 0,len=optionsArr.length;i<len;i++){
                    var option = optionsArr[i];
                    $select.append('<option value="' + option.value + '">' + option.text + '</option>');
                }
            }
        },

        /**
         * 根据value值获取对应的text值
         * @param value
         * @private
         */
        _getTextByValue:function(value){
            var data = this.options.data;
            for(var i= 0,len=data.length; i<len; i++){
                if(data[i].value === value){
                    return data[i].text;
                }
            }
        },

        /**
         * 销毁组件
         * @private
         */
        _destroy:function(){
            this.listView._destroy();
            this.$selectBoxGroup.replaceWith(this.$element);
            this.input = null;
            this.listView = null;
        },

        /**
         * 使输入框不能用
         */
        disable:function(){
            this.input.disable();
        },

        /**
         * 使输入框可用
         */
        enable:function(){
            this.input.enable();
        },

        /**
         * get or set selectBox value
         * @param value
         * @returns {*}
         */
        value:function(value){
            if(arguments.length>0){
                if(value == this._value){
                    return ;
                }
                this._value = value;
                this._text  = this._getTextByValue(value);
                this.input.value(this._value);
                this.listView.select(this._value);
                this.options.change && this.options.change.call(this);
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
            var data = this.options.data;
            if(arguments.length>0){
                for(var i= 0,len = data.length;i<len;i++){
                    if(data[i].text === text){
                        this.value(data[i].value);
                    }
                }
            }
            else{
                return this._text;
            }
        },

        /**
         * 动态改变selectBox的options
         * @param options
         */
        setOptions:function(options){
            this.options.data = options;
            this._data();
            this._setSelectOptions(options);
            options.length && this.value(options[0].value);
            this.listView._destroy();
            this._createListView();
        },

        /**
         * 选择第几个下拉选项
         * @param index
         */
        select:function(index){
            index = parseInt(index) || 0;
            index>=0 && index<this.options.data.length && this.value(this.options.data[index].value);
        }
    });

    var ListView = function($parent,options){
        this.options = $.extend({
            data:[],
            onChange:null
        },options);
        this.value = options.value || null;//下拉框初始值
        this.$options = null;
        this.$parent = $parent;
        this._init();
        this.text = null;
    };

    ListView.prototype = {
        /**
         * 初始化下拉选择框
         * @returns {*|HTMLElement}
         * @private
         */
        _init:function(){
            var data = this.options.data;
            var $options = this.$options = $('<ul class="' + OPTIONS + '"></ul>');
            if(data){
                for(var i = 0,len = data.length; i<len; i++){
                    $options.append(this._createOption(data[i]));
                }
            }
            $('body').append($options.hide());
        },

        /**
         * 构造单个option
         * @param option
         * @private
         */
        _createOption:function(option){
            var $li = $('<li></li>').text(option.text),
                that = this;
            $li.on("click",function(){
                if(!$li.is("." + SELECTED)){
                    $("li."+SELECTED,that.$options).removeClass(SELECTED);
                    $li.addClass(SELECTED);
                    that.text = option.text;
                    that.value = option.value;
                    that._change();
                }
                that.toggle();
            });
            that.value == option.value && $li.addClass(SELECTED);
            return $li;
        },

        /**
         * 设置position显示时在屏幕中的位置
         * @private
         */
        _setPosition:function(){
            var labelWidth = this.$parent.find('label').outerWidth();
            var left = this.$parent.offset().left + labelWidth;
            var top = this.$parent.offset().top + 28;
            //magic number 10 为 options padding+border宽度
            var width = this.$parent.find('.input-group').outerWidth()-10-labelWidth;
            this.$options.css({top:top,left:left,width:width});
        },

        /**
         * 当在非本元素范围内点击，收缩下拉框
         * @private
         */
        _clickBlank:function(){
            var that = this;
            $(document).mouseup(function(e) {
                var _con = that.$options;
                if (!_con.is(e.target) && _con.has(e.target).length === 0) {
                    that.$options.slideUp(200);
                }
            });
        },

        /**
         * 单击option触发
         * @param e
         * @private
         */
        _change:function(){
            this.options.onChange && this.options.onChange.call(this,this.value,this.text);
        },

        select:function(value){
            var data = this.options.data;
            var $options = this.$options;
            if(data){
                for(var i = 0,len = data.length; i<len; i++){
                    if(value == data[i].value){
                        this.value = value;
                        $options.children().removeClass(SELECTED);
                        $options.children().eq(i).addClass(SELECTED);
                        return ;
                    }
                }
            }
        },

        /**
         * 显示隐藏切换options选择框
         */
        toggle:function(){
            var that = this;
            this._setPosition();
            if(this.$options.is(":hidden")){
                this.$options.slideDown(200, function(){
                    that._clickBlank();
                });
            }
            else{
                this.$options.slideUp(200);
            }
        },

        /**
         * 销毁ListView
         */
        _destroy:function(){
            this.$options.remove();
        }
    };

    cri.SelectBox = SelectBox;

    $.fn.selectBox = function(option) {
        var o = null;
        this.each(function () {
            var $this = $(this),
                options = typeof option == 'object' && option;
            o = $this.data('selectBox');
            if(o != null){
                o._destroy();
            }
            $this.data('selectBox', (o = new SelectBox(this, options)));
        });
        return o;
    };
}(window);