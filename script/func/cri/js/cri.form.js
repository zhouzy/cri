
/*=====================================================================================
 * easy-bootstrap-form v2.0
 *
 * @author:niyq
 * @date:2013/08/22
 * @dependce:jquery
 *=====================================================================================*/
!function($){

    "use strict";

    var Form = function(element,dataOptions){
        var thisObject = this;
        this.$element = $(element);
        this.dataOptions = $.extend({}, $.fn.form.defaults, dataOptions);
        this.title = this.$element.attr("title");
        this.id = this.$element.attr("id");
        this.init();
    };

    Form.prototype.init = function(){
        var thisObject = this;
        var formPanel = $('body').get(0);
        if(this.dataOptions.ajax == true){//----------------------------------------------------------ajax-----------------------------------------------------------
            $('body').append(formPanel = $('<iframe src="ajaxFileUpload.html" id="ajaxFileUploadTest"></iframe>'));
            var myWindow = formPanel.get(0).contentWindow;
            myWindow.onload = function(){
                formPanel = myWindow.$('#eb_ajaxFileUploadFormPanel').get(0);
                $(formPanel).append(thisObject.realFormObj = $('<form class="eb_realForm" style="display:none" id="eb_form_'+thisObject.id+'"></form>'));                   //realFormObj
                thisObject.realFormObj.attr('action',thisObject.dataOptions.action).attr('method',thisObject.dataOptions.method);
                var fileUploadArr = thisObject.$element.find('.eb_fileUpload');
                if(fileUploadArr.length > 0){
                    fileUploadArr.each(function(){
                        $(this).fileUpload('initInForm',thisObject.realFormObj);
                    });
                    thisObject.realFormObj.attr('enctype','multipart/form-data');
                }
                var nameValueArr = {};
                thisObject.$element.find('[name]').each(function(){
                    var name = $(this).attr('name');
                    var value = $(this).attr('value');
                    if($(this).val())
                        value = $(this).val();
                    if(!nameValueArr[name]){
                        nameValueArr[name] = value;
                    }else{
                        nameValueArr[name] = nameValueArr[name] + "," + value;
                    }
                });
                for(var index in nameValueArr){
                    if(thisObject.realFormObj.find('[name="'+index+'"]').length<=0){
                        thisObject.realFormObj.append($('<input type="hidden" name="'+index+'" value="'+nameValueArr[index]+'" />'));
                    }
                }
            };
            //formPanel = myWindow.document.getElementById('eb_ajaxFileUploadFormPanel');
        }else{ //-------------------------------------------------------------------------------------------------------------------------------------------------------------
            $(formPanel).append(thisObject.realFormObj = $('<form class="eb_realForm" style="display:none" id="eb_form_'+thisObject.id+'"></form>'));                   //realFormObj
            this.realFormObj.attr('action',thisObject.dataOptions.action).attr('method',thisObject.dataOptions.method);
            var fileUploadArr = this.$element.find('.eb_fileUpload');
            if(fileUploadArr.length > 0){
                fileUploadArr.each(function(){
                    $(this).fileUpload('initInForm',thisObject.realFormObj);
                });
                thisObject.realFormObj.attr('enctype','multipart/form-data');
            }
            var nameValueArr = {};
            this.$element.find('[name]').each(function(){
                var name = $(this).attr('name');
                var value = $(this).attr('value');
                if($(this).val())
                    value = $(this).val();
                if(!nameValueArr[name]){
                    nameValueArr[name] = value;
                }else{
                    nameValueArr[name] = nameValueArr[name] + "," + value;
                }
            });
            for(var index in nameValueArr){
                if(thisObject.realFormObj.find('[name="'+index+'"]').length<=0){
                    thisObject.realFormObj.append($('<input type="hidden" name="'+index+'" value="'+nameValueArr[index]+'" />'));
                }
            }
        }
    };

    Form.prototype.submit = function(param){
        var thisObject = this;
        if(param && param.type && (param.type == "get" || param.type == "post")){
            this.realFormObj.attr("action",type);
        }
        var valueArr = this.getValue();
        for(var index in valueArr){
            var value = valueArr[index];
            if(value && isArray(value)=="array"){
                var newValue = value[0];
                for(var i = 1;i<value.length;i++){
                    newValue = newValue + "," + value[i];
                }
                value = newValue;
            }
            thisObject.realFormObj.find('[name="'+index+'"]').each(function(){
                $(this).val(value);
            });
        }
        if(param && param.action){
            this.realFormObj.attr("action",param.action);
        }
        this.realFormObj.submit();
    }

    Form.prototype.getValue = function(){
        var result = {};
        var requiredFailArr = [];
        this.$element.find("div[name]").each(function(){
            var thisObj = this;
            if($(this).attr("class") == "eb_inputGroup"){
                var checkResult = $(this).input('check');
                if(checkResult.result == true){
                    if(!result[$(thisObj).attr("name")] && result[$(thisObj).attr("name")]!=""){
                        result[$(thisObj).attr("name")] = $(thisObj).input("getValue");
                    }else if(isArray(result[$(thisObj).attr("name")])!='array'){
                        var value1 = result[$(thisObj).attr("name")];
                        result[$(thisObj).attr("name")] = [];
                        result[$(thisObj).attr("name")].push(value1);
                        result[$(thisObj).attr("name")].push($(thisObj).input("getValue"));
                    }else if(isArray(result[$(thisObj).attr("name")])=='array'){
                        result[$(thisObj).attr("name")].push($(thisObj).input("getValue"));
                    }
                }else{
                    if(checkResult.required == 'fail'){
                        requiredFailArr.push($(thisObj).find('.eb_title').html());
                    }
                }
            }else if($(this).attr("class") == "eb_timeInputGroup"){
                var checkResult = $(this).timeInput('check');
                if(checkResult.result == true){
                    if(!result[$(thisObj).attr("name")] && result[$(thisObj).attr("name")]!=""){
                        result[$(thisObj).attr("name")] = $(thisObj).timeInput("getValue");
                    }else if(isArray(result[$(thisObj).attr("name")])!='array'){
                        var value1 = result[$(thisObj).attr("name")];
                        result[$(thisObj).attr("name")] = [];
                        result[$(thisObj).attr("name")].push(value1);
                        result[$(thisObj).attr("name")].push($(thisObj).timeInput("getValue"));
                    }else if(isArray(result[$(thisObj).attr("name")])=='array'){
                        result[$(thisObj).attr("name")].push($(thisObj).timeInput("getValue"));
                    }
                }else{
                    if(checkResult.required == 'fail'){
                        requiredFailArr.push($(thisObj).find('.eb_title').html());
                    }
                }
            }else if($(this).attr("class") == "eb_selectBoxGroup"){
                //result[$(thisObj).attr("name")] = $(thisObj).selectBox("getValue");
                var checkResult = $(this).selectBox('check');
                if(checkResult.result == true){
                    if(!result[$(thisObj).attr("name")] && result[$(thisObj).attr("name")]!=""){
                        result[$(thisObj).attr("name")] = $(thisObj).selectBox("getValue");
                    }else if(isArray(result[$(thisObj).attr("name")])!='array'){
                        var value1 = result[$(thisObj).attr("name")];
                        result[$(thisObj).attr("name")] = [];
                        result[$(thisObj).attr("name")].push(value1);
                        result[$(thisObj).attr("name")].push($(thisObj).selectBox("getValue"));
                    }else if(isArray(result[$(thisObj).attr("name")])=='array'){
                        result[$(thisObj).attr("name")].push($(thisObj).selectBox("getValue"));
                    }
                }else{
                    if(checkResult.required == 'fail'){
                        requiredFailArr.push($(thisObj).find('.eb_title').html());
                    }
                }
            }else if($(this).attr("class") == "eb_textareaGroup"){
                //result[$(thisObj).attr("name")] = $(thisObj).textarea("getValue");
                var checkResult = $(this).textarea('check');
                if(checkResult.result == true){
                    if(!result[$(thisObj).attr("name")] && result[$(thisObj).attr("name")]!=""){
                        result[$(thisObj).attr("name")] = $(thisObj).textarea("getValue");
                    }else if(isArray(result[$(thisObj).attr("name")])!='array'){
                        var value1 = result[$(thisObj).attr("name")];
                        result[$(thisObj).attr("name")] = [];
                        result[$(thisObj).attr("name")].push(value1);
                        result[$(thisObj).attr("name")].push($(thisObj).textarea("getValue"));
                    }else if(isArray(result[$(thisObj).attr("name")])=='array'){
                        result[$(thisObj).attr("name")].push($(thisObj).textarea("getValue"));
                    }
                }else{
                    if(checkResult.required == 'fail'){
                        requiredFailArr.push($(thisObj).find('.eb_title').html());
                    }
                }
            }
        });
        this.$element.find("input[type='text'],select,textarea,input[type='hidden'],input[type='password']").not(".eb_input,.eb_selectBox,.eb_timeInput,.eb_textarea,.eb_selectBox_hide").each(function(){
            var thisObj = this;
            if(!result[$(thisObj).attr("name")] && result[$(thisObj).attr("name")]!=""){
                result[$(thisObj).attr("name")] = $(thisObj).val();
            }else if(isArray(result[$(thisObj).attr("name")])!='array'){
                var value1 = result[$(thisObj).attr("name")];
                result[$(thisObj).attr("name")] = [];
                result[$(thisObj).attr("name")].push(value1);
                result[$(thisObj).attr("name")].push($(thisObj).val());
            }else if(isArray(result[$(thisObj).attr("name")])=='array'){
                result[$(thisObj).attr("name")].push($(thisObj).val());
            }
        });
        if(requiredFailArr.length > 0){
            var msg = '"';
            for(var i=0;i<requiredFailArr.length;i++){
                if(i<requiredFailArr.length-1){
                    msg = msg + requiredFailArr[i] + ",";
                }else{
                    msg = msg + requiredFailArr[i] + '"为必填项，请完成填写！';
                }
            }
            alert(msg);
            return false;
        }else{
            return result;
        }
    };

    Form.prototype.setValue = function(param){
        var thisObject = this;
        for(var i in param){
            thisObject.$element.find("div[name='"+i+"']").each(function(){
                var thisObj = this;
                if($(this).attr("class") == "eb_inputGroup"){
                    $(thisObj).input("setValue",param[i]);
                }else if($(this).attr("class") == "eb_selectBoxGroup"){
                    if(param[i]==""){
                        $(thisObj).selectBox("clearValue");
                    }else{
                        $(thisObj).selectBox("setValue",param[i]);
                    }
                }else if($(this).attr("class") == "eb_textareaGroup"){
                    $(thisObj).textarea("setValue",param[i]);
                }else if($(this).attr("class") == "eb_timeInputGroup"){
                    $(thisObj).timeInput("setValue",param[i]);
                }
            });
            thisObject.$element.find("input[name='"+i+"'],select[name='"+i+"'],textarea[name='"+i+"']").each(function(){
                $(this).val(param[i]);
            });
        }
    };

    Form.prototype.clearValue = function(){
        var thisObject = this;
        var param = {};
        this.$element.find('[name]').each(function(){
            var thisObj = this;
            param[$(thisObj).attr("name")] = "";
        });
        this.setValue(param);
    };

    $.fn.form = function (option,param) {
        var result = null;
        var thisObj = this.each(function () {
            var $this = $(this)
                , thisObject = $this.data('form')
                , dataOptions = typeof option == 'object' && option;
            if(typeof option == 'string' ){
                result = thisObject[option](param);
            }else{
                $this.data('form', (thisObject = new Form(this, dataOptions)));
            }
        });
        if(typeof option == 'string' )return result;
        return thisObj;
    };

    $.fn.form.defaults = {
        method:'post',
        action:'',
        ajax:false
    };

    $(window).on('load', function(){
        $(".eb_form").each(function () {
            var thisObj = $(this)
                , dataOptionsStr = thisObj.data('options');
            if(!dataOptionsStr)
                thisObj.form($.fn.form.defaults);
            else
                thisObj.form((new Function("return {" + dataOptionsStr + "}"))());
        });
    });
}(window.jQuery);
