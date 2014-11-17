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