/**
 * Author zhouzy
 * Date   2014/9/23
 *
 * 青牛软件成都研发中心
 * 前端框架 cri 基础类
 *
 * 版本 v 2.0
 *
 */

!function(window){
    window.cri = {};

    function Class(){}

    Class.extend = function(subType){
        var prototype = (function(prototype){
            function Prototype(){}
            Prototype.prototype = prototype;
            return new Prototype();
        }(this.prototype));

        prototype.constructor = subType;

        subType.prototype = prototype;

        subType.extend = this.extend;

        return subType;
    };

    cri.Class = Class;

    /**
     * 获取表单值
     * @param $form
     * @returns {{}}
     */
    cri.getFormValue = function($form){
        var o = {},
            inputQuery = ":input:not(:button,[type=submit],[type=reset],[disabled])",
            selectQuery = "select";
        $(inputQuery,$form).each(function(){
            this.name && (o[this.name] = $(this).val());
        });
        $(selectQuery,$form).each(function(){
            var role = $(this).attr('data-role');
            if(role && role=='selectBox'){
                this.name && (o[this.name] = $(this).data("selectBox").value());
            }
            else{
                this.name && (o[this.name] = $(this).val());
            }
        });
        return o;
    };

    /**
     * 设置表单值
     * @param $form
     * @param o
     */
    cri.setFormValue = function($form,o){
        for(var name in o){
            var $i = $("[name=" + name + "]",$form);
            if($i.length){
                switch($i.attr('data-role')){
                    case 'input':{
                        $i.data('input').value(o[name]);
                    }break;
                    case 'timeInput':{
                        $i.data('timeInput').value(o[name]);
                    }break;
                    case 'selectBox':{
                        $i.data('selectBox').value(o[name]);
                    }break;
                    default:{
                        $i.val(o[name]);
                    }
                }
            }
        }
    };

    /**
     * 判断是否为闰年
     * @param year
     * @returns {boolean}
     */
    cri.isLeapYear = function(year){
        return (0==year%4&&((year%100!=0)||(year%400==0)));
    };

    /**
     * 日期格式化
     * 格式 YYYY/yyyy/YY/yy 表示年份
     * MM/M 月份
     * W/w 星期
     * dd/DD/d/D 日期
     * hh/HH/h/H 时间
     * mm/m 分钟
     * ss/SS/s/S 秒
     */
    cri.formatDate = function(date,formatStr){
        var str    = formatStr || 'yyyy-MM-dd',
            year   = date.getFullYear(),
            month  = date.getMonth()+1,
            day    = date.getDate(),
            hour   = date.getHours(),
            minute = date.getMinutes(),
            second = date.getSeconds();

        str=str.replace(/yyyy|YYYY/,year);
        str=str.replace(/yy|YY/,(year % 100)>9?(year % 100).toString():'0' + (year % 100));

        str=str.replace(/MM/,month>9?month.toString():'0' + month);
        str=str.replace(/M/g,month);

        str=str.replace(/dd|DD/,day>9?day.toString():'0' + day);
        str=str.replace(/d|D/g,day);

        str=str.replace(/hh|HH/,hour>9?hour.toString():'0' + hour);
        str=str.replace(/h|H/g,hour);

        str=str.replace(/mm/,minute>9?minute.toString():'0' + minute);
        str=str.replace(/m/g,minute);

        str=str.replace(/ss|SS/,second>9?second.toString():'0' + second);
        str=str.replace(/s|S/g,second);
        return str;
    };

    /**
     *把日期分割成数组
     */
    cri.date2Array = function(myDate){
        return [
            myDate.getFullYear(),
            myDate.getMonth(),
            myDate.getDate(),
            myDate.getHours(),
            myDate.getMinutes(),
            myDate.getSeconds()
        ];
    };

    /**
     * 日期保存为JSON
     * @param myDate
     * @returns {{yyyy: number, MM: number, dd: (*|number), HH: number, mm: number, ss: number, ww: number}}
     */
    cri.date2Json = function(myDate){
        return {
            yyyy:myDate.getFullYear(),
            MM:myDate.getMonth(),
            dd:myDate.getDate(),
            HH:myDate.getHours(),
            mm:myDate.getMinutes(),
            ss:myDate.getSeconds(),
            ww:myDate.getDay()
        };
    };

    /**
     * 字符串转成日期类型
     * 日期时间格式 YYYY/MM/dd HH:mm:ss  YYYY-MM-dd HH:mm:ss
     * 日期格式 YYYY/MM/dd YYYY-MM-dd
     */
    cri.string2Date = function(d){
        return new Date(Date.parse(d.replace(/-/g,"/")));
    };

    /**
     * 将json格式字符串转换成对象
     * @param json
     * @returns {*}
     *
     * {{deprecated}}
     */
    cri.parseJSON = function(json){
        return json ? (new Function("return " + json))(): {};
    };

    /**
     * 判断是否为数组
     * @param o
     * @returns {boolean}
     */
    cri.isArray = function(o){
        return Object.prototype.toString.call(o) === '[object Array]';
    };

    /**
     * 判断是否为数字
     * @param s
     * @returns {boolean}
     */
    cri.isNum = function(s){
        if (s!=null && s!=""){
            return !isNaN(s);
        }
        return false;
    };

    /**
     * 判断是否为电话号码
     * @param s
     * @returns {boolean}
     */
    cri.isPhoneNo = function(s){
        return /((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/.test(s);
    };

    /**
     * 向前兼容HTML5特性，方法
     */
    !function forwardCompatibleHtml5(){
        if (!Array.prototype.indexOf) {
            Array.prototype.indexOf = function (searchElement, fromIndex) {
                if( this === undefined || this === null ) {
                    throw new TypeError( '"this" is null or not defined' );
                }
                var length = this.length >>> 0; // Hack to convert object.length to a UInt32
                fromIndex = +fromIndex || 0;
                if (Math.abs(fromIndex) === Infinity) {
                    fromIndex = 0;
                }
                if (fromIndex < 0) {
                    fromIndex += length;
                    if (fromIndex < 0) {
                        fromIndex = 0;
                    }
                }
                for (;fromIndex < length; fromIndex++) {
                    if (this[fromIndex] === searchElement) {
                        return fromIndex;
                    }
                }
                return -1;
            };
        }
        JSON || (window['JSON'] = {
            parse:function(jsonStr){
                return cri.parseJSON(jsonStr);
            },
            stringify:function(obj){
                return obj.toSource();
            }
        });
    }();


    /**
     * 拓展jQuery对象方法
     */
    !function(jQuery){
        /**
         * 获取元素的绝对高度像素值
         * 当父元素隐藏，或者父元素高度未设置时，返回null
         * 如果调用方法时，传入了value，则使用该value，不再去获取元素CSS高度及height属性
         * @param value 设定高度(String,Number,百分比)
         * @returns {*} 绝对高度值，类型为Number或者为Null
         * @private
         */
        $.fn._getHeightPixelValue = function(value){
            var $this       = $(this),
                styleHeight = $this[0].style.height,
                propHeight  = $this[0].height,
                calHeight   = value || styleHeight || propHeight;
            if(calHeight){
                //百分比
                if(/\d*%/.test(calHeight)){
                    var $parent = $this.parent();
                    if($parent.is(":visible") && $parent.css('height')!='0px'){
                        return Math.floor($this.parent().height() * parseInt(calHeight) / 100);
                    }
                    else{
                        return null;
                    }
                }
                else{
                    return parseInt(calHeight);
                }
            }
            else{
                return null;
            }
        };

        /**
         * 获取元素的绝对宽度像素值
         * 当父元素隐藏，或者父元素宽度未设置时，返回null
         * 如果调用方法时，传入了value，则使用该value，不再去获取元素CSS宽度及width属性
         * @param value 设定宽度(String,Number,百分比)
         * @returns {*} 绝对宽度值，类型为Number或者为Null
         * @private
         */
        $.fn._getWidthPixelValue = function(value){
            var $this       = $(this),
                styleWidth = $this[0].style.width,
                propWidth  = $this[0].width,
                calWidth   = value || styleWidth || propWidth;
            if(calWidth){
                //百分比
                if(/\d*%/.test(calWidth)){
                    var $parent = $this.parent();
                    if($parent.is(":visible") && $parent.css('width')!='0px'){
                        return Math.floor($this.parent().width() * parseInt(calWidth) / 100);
                    }
                    else{
                        return null;
                    }
                }
                else{
                    return parseInt(calWidth);
                }
            }
            else{
                return null;
            }
        };

        /**
         * 拓展 jquery formValue 方法
         *
         * @param o
         * @returns {{}}
         */
        $.fn.formValue = function(o){
            if(arguments.length>0){
                cri.setFormValue($(this),o);
            }
            else{
                return cri.getFormValue($(this));
            }
        };

        /**
         * 重置form
         */
        $.fn.formReset = function(param){
            var $this = $(this),
                inputQuery = ":input:not(:button,[type=submit],[type=reset],[disabled])",
                selectQuery = "select";
            param = param || {};
            $(inputQuery,$this).each(function(){
                var role = $(this).attr('data-role');
                var value = this.name ? param[this.name] : '';
                value = value || '';
                if(role){
                    if(role=='input'){
                        $(this).data("input").value(value);
                    }
                    else if(role == 'timeInput'){
                        value = value || new Date();
                        $(this).data("timeInput").value(value);
                    }
                }
                else{
                    $(this).val(value);
                }
            });
            $(selectQuery,$this).each(function(){
                var role = $(this).attr('data-role');
                var value = this.name ? param[this.name] : '';
                value = value || '';
                if(role && role=='selectBox'){
                    if(value != ''){
                        $(this).data("selectBox").value(value);
                    }
                    else{
                        $(this).data("selectBox").select(0);
                    }
                }
                else{
                    if(value != ''){
                        $(this).val(value);
                    }else{
                        this.selectedIndex = 0;
                    }
                }
            });
        };
    }(jQuery);
}(window);

