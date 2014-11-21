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
            function Prototype(){};
            Prototype.prototype = prototype;
            return new Prototype();
        }(this.prototype));

        prototype.constructor = subType;

        subType.prototype = prototype;

        subType.extend = this.extend;

        return subType;
    };

    cri.Class = Class;

    cri.isArray = function(value){
        if(value instanceof Array ||
            (!(value instanceof Object) &&
                (Object.prototype.toString.call((value)) == '[object Array]') ||
                typeof value.length == 'number' &&
                typeof value.splice != 'undefined' &&
                typeof value.propertyIsEnumerable != 'undefined' &&
                !value.propertyIsEnumerable('splice'))) {
            return true;
        }else{
            return false;
        }
    };

    /**
     * 获取表单值
     * @param $form
     * @returns {{}}
     */
    cri.getFormValue = function($form){
        var nameValues = $form.serialize().split(/&/) || [],
            o = {};
        for(var i= 0,len=nameValues.length;i<len;i++){
            var nameValue = nameValues[i].split(/=/);
            var name = nameValue[0];
            var value = nameValue[1]
            o[name] = value;
        }
        return o;
    };

    /**
     * 设置表单值
     * @param $form
     * @param o
     */
    cri.setFormValue = function($form,o){
        for(var name in o){
            $("[name=" + name + "]",$form).val(o[name]);
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

    cri.isLeapYear = function(year){
        return (0==year%4&&((year%100!=0)||(year%400==0)));
    }

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
        var str    = formatStr,
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
    }

    /**
     *把日期分割成数组
     */
    cri.date2Array = function(myDate){
        var myArray = Array();
        myArray[0] = myDate.getFullYear();
        myArray[1] = myDate.getMonth();
        myArray[2] = myDate.getDate();
        myArray[3] = myDate.getHours();
        myArray[4] = myDate.getMinutes();
        myArray[5] = myDate.getSeconds();
        return myArray;
    };

    /**
     * 字符串转成日期类型
     * 格式 MM/dd/YYYY MM-dd-YYYY YYYY/MM/dd YYYY-MM-dd
     */
    cri.StringToDate  = function(DateStr){
        var converted = Date.parse(DateStr);
        var myDate = new Date(converted);
        if (isNaN(myDate))
        {
            var arys= DateStr.split('-');
            myDate = new Date(arys[0],--arys[1],arys[2]);
        }
        return myDate;
    }
}(window);

/*=====================================================================================
 * easy-bootstrap-公用方法 v2.0
 *
 * @author:niyq
 * @date:2013/09/05
 * @dependce:jquery
 *=====================================================================================*/
 function isArray(value){
	if (value instanceof Array ||
	(!(value instanceof Object) &&
	(Object.prototype.toString.call((value)) == '[object Array]') ||
	typeof value.length == 'number' &&
	typeof value.splice != 'undefined' &&
	typeof value.propertyIsEnumerable != 'undefined' &&
	!value.propertyIsEnumerable('splice'))) {
		return 'array';
	}else{
		return typeof value;
	}
 }