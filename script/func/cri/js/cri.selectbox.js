/*=====================================================================================
 * easy-bootstrap-selectBox v2.0
 *
 * @author:niyq
 * @date:2013/08/19
 * @dependce:jquery
 *=====================================================================================*/
 !function($){

	"use strict";

	var SelectBox = function(element,dataOptions){
		var thisObject = this;
		this.$element = $(element);
		this.style = this.$element.attr("style");
		this.dataOptions = $.extend({}, $.fn.selectBox.defaults, dataOptions);
		this.name = this.$element.attr("name");
		this.value = "";
		this.title = "";
		if(this.$element.attr("title"))
			this.title = this.$element.attr("title");
		if(this.dataOptions.title)
			this.title = this.dataOptions.title;
		this.id = this.$element.attr("id");
		this.placeholder = this.$element.attr("placeholder");
		this.init();     //初始化selectBoxGroup组件
		this.inputObj.click(function(){
			$(".eb_timeInput.focus").removeClass("focus");
			$(".eb_timeBox.show").hide().removeClass("show");
			thisObject.toggleDropdownMenu();
		});
		this.blurAction();
		this.stopBubbleTransfer();
	};

	SelectBox.prototype.addOpts = function(param){
		var thisObject = this;
		if(this.dataOptions.multiple != true){
			for(var i in param){
				this.dropdownMenu.append($('<span class="eb_dropdownOption" value="'+i+'">'+param[i]+'</span>').width(thisObject.dropdownMenu.width()-2).mouseover(function(){
					$(this).addClass("mouseover");
				}).mouseout(function(){
					$(this).removeClass("mouseover");
				}).click(function(){
					var value = $(this).attr("value");
					thisObject.setValue(value);
					thisObject.inputObj.focus();
					thisObject.toggleDropdownMenu();
				}));
				this.optionArr["option_"+i] = {text:param[i],value:i};
				var length = this.dropdownMenu.find(".eb_dropdownOption").length;
				this.dropdownMenu.height(length*30);
			}
			if(this.dataOptions.onselectHandler){
				for(var i in param){
					this.dropdownMenu.find(".eb_dropdownOption[value='"+i+"']").each(function(){
						var oldValue;
						$(this).mousedown(function(){
							oldValue = thisObject.parent.attr("value");
						});
						$(this).click(function(){
							var value = $(this).attr("value");
							if(value != oldValue){
								var func = thisObject.dataOptions.onselectHandler;
								if(typeof func == "string")
									func = window[func];
								func(thisObject.parent.get(0));
							}
						});
					});
				}
			}
		}else{
			for(var i in param){
				this.displayAreaObj.append($('<span class="eb_dropdownOption" value="'+i+'"><input type="checkbox" value="'+i+'" class="eb_dropdownCheckbox" /><span>'+param[i]+'</span></span>').width(thisObject.dropdownMenu.width()-2).mouseover(function(){
					$(this).addClass("mouseover");
				}).mouseout(function(){
					$(this).removeClass("mouseover");
				}).click(function(){
					var checked = $(this).children('.eb_dropdownCheckbox').get(0).checked;
					if(checked == true){
						$(this).children('.eb_dropdownCheckbox').get(0).checked = false;
					}else if(checked == false){
						$(this).children('.eb_dropdownCheckbox').get(0).checked = true;
					}
				}).children('.eb_dropdownCheckbox').click(function(event){
					event.stopPropagation();
				}).parent());
				this.optionArr["option_"+i] = {text:param[i],value:i};
				var length = this.dropdownMenu.find(".eb_dropdownOption").length;
				this.dropdownMenu.height(length*30 + 26);
				this.displayAreaObj.height(length*30);
			}
			/*if(this.dataOptions.onselectHandler){
				this.buttonOKObj.click(function(){
					thisObject.dataOptions.onselectHandler(thisObject.selectBoxObj);
				});
			}*/
		}
	};

	SelectBox.prototype.addOpt = function(text,value){
		var thisObject = this;
		if(this.dataOptions.multiple != true){
			this.dropdownMenu.append($('<span class="eb_dropdownOption" value="'+value+'">'+text+'</span>').width(thisObject.dropdownMenu.width()-2).mouseover(function(){
					$(this).addClass("mouseover");
				}).mouseout(function(){
					$(this).removeClass("mouseover");
				}).click(function(){
					var value = $(this).attr("value");
					thisObject.setValue(value);
					thisObject.inputObj.focus();
					thisObject.toggleDropdownMenu();
				}));
			this.optionArr["option_"+value] = {text:text,value:value};
			var length = this.dropdownMenu.find(".eb_dropdownOption").length;
			this.dropdownMenu.height(length*30);
			if(this.dataOptions.onselectHandler){
				this.dropdownMenu.find(".eb_dropdownOption[value='"+value+"']").each(function(){
					var oldValue;
					$(this).mousedown(function(){
						oldValue = thisObject.parent.attr("value");
					});
					$(this).click(function(){
						var value = $(this).attr("value");
						if(value != oldValue){
							var func = thisObject.dataOptions.onselectHandler;
							if(typeof func == "string")
								func = window[func];
							func(thisObject.parent.get(0));
						}
					});
				});
			}
		}else{
			this.displayAreaObj.append($('<span class="eb_dropdownOption" value="'+value+'"><input type="checkbox" value="'+value+'" class="eb_dropdownCheckbox" /><span>'+text+'</span></span>').width(thisObject.dropdownMenu.width()-2).mouseover(function(){
					$(this).addClass("mouseover");
				}).mouseout(function(){
					$(this).removeClass("mouseover");
				}).click(function(){
					var checked = $(this).children('.eb_dropdownCheckbox').get(0).checked;
					if(checked == true){
						$(this).children('.eb_dropdownCheckbox').get(0).checked = false;
					}else if(checked == false){
						$(this).children('.eb_dropdownCheckbox').get(0).checked = true;
					}
				}).children('.eb_dropdownCheckbox').click(function(event){
					event.stopPropagation();
				}).parent());
			this.optionArr["option_"+value] = {text:text,value:value};
			var length = this.dropdownMenu.find(".eb_dropdownOption").length;
			this.dropdownMenu.height(length*30+26);
			this.displayAreaObj.height(length*30);
		}
	};

	SelectBox.prototype.clearOpts = function(){
		this.dropdownMenu.html("").height(30);
		this.setValue("");
	};

	SelectBox.prototype.setValueByIndex = function(index){
		var obj = this.dropdownMenu.find(".eb_dropdownOption").eq(index);
		var value = "";
		if(obj && obj.length>0)
			value = obj.attr("value");
		this.setValue(value);
	};

	SelectBox.prototype.setValue = function(valueParam){
		valueParam = "" + valueParam;
		var thisObject = this;
		var value = "";
		if(valueParam || valueParam == ""){
			value = valueParam;
		}else if(this.dataOptions.defaultVal){
			value = "" + this.dataOptions.defaultVal;
		}
		var valueArr = value.split(",");
		var textArr = [];
		for(var i=0;i<valueArr.length;i++){
			if(this.optionArr["option_"+valueArr[i]])
				textArr.push(this.optionArr["option_"+valueArr[i]].text);
			else
				textArr.push(valueArr[i]);
		}
		var text = "";
		for(var i=0;i<textArr.length;i++){
			if(i<textArr.length-1){
				text = text + textArr[i] + ",";
			}else{
				text = text + textArr[i];
			}
		}
		this.selectBoxObj.html(text);
		this.selectBoxObj.attr("value",value);
		this.parent.attr("value",value);
		if(this.dataOptions.multiple == true){
			var valueArr = value.split(",");
			thisObject.displayAreaObj.find('.eb_dropdownCheckbox').each(function(){
				$(this).get(0).checked = false;
			});
			for(var i=0;i<valueArr.length;i++){
				this.displayAreaObj.find('.eb_dropdownCheckbox[value="'+valueArr[i]+'"]').get(0).checked = true;
			}
		}
		return this.selectBoxObj;
	};

	SelectBox.prototype.getValue = function(){
		var value = this.parent.attr("value");
		return value;
	};

	SelectBox.prototype.getText = function(){
		var value = this.getValue();
		var text = value;
		var textArr = text.split(",");
		for(var i = 0;i<textArr.length;i++){
			if(this.optionArr["option_"+textArr[i]] && this.optionArr["option_"+textArr[i]].text){
				textArr[i] = this.optionArr["option_"+textArr[i]].text;
			}
		}
		/*if(this.optionArr["option_"+value] && this.optionArr["option_"+value].text){
			text = this.optionArr["option_"+value].text;
		}*/
		text = textArr[0];
		for(var j = 1;j<textArr.length;j++){
			text = ","+textArr[j];
		}
		return text;
	}

	SelectBox.prototype.clearValue = function(){
		var thisObject = this;
		if(thisObject.dataOptions.defaultVal)
			this.setValue(thisObject.dataOptions.defaultVal);
		else
			this.setValue("");
	};

	SelectBox.prototype.blurAction = function(){
		var thisObject = this;
		$("body").click(function(){
			$(".eb_show").hide().removeClass('eb_show');
		});
	};

	SelectBox.prototype.stopBubbleTransfer = function(){
		$(".eb_dropdownMenu,.eb_selectBox_hide").each(function(){
			$(this).click(function(event){
				event.stopPropagation();
			});
		});
	};

	SelectBox.prototype.init = function(){
		var thisObject = this;
		this.optionObjArr = this.$element.get(0).getElementsByTagName("option");      //optionObjArr
		this.optionArr = {};
		for(var i=0;i<this.optionObjArr.length;i++){
			this.optionArr["option_"+$(thisObject.optionObjArr[i]).attr("value")] = {text:$(thisObject.optionObjArr[i]).html(),value:$(thisObject.optionObjArr[i]).attr("value")};
		}
		this.dropdownArea = $(".eb_dropdownArea");                            //dropdownArea
		if(this.dropdownArea.length <= 0)      //检查在窗口中有没有 .dropdownArea 如果没有，则添加一个
			$("body").prepend('<div class="eb_dropdownArea"></div>');
		this.dropdownArea = $(".eb_dropdownArea");
		this.$element.wrap('<div class="eb_selectBoxGroup" id="'+thisObject.id+'_subgroup" name="'+thisObject.name+'" value="'+thisObject.value+'" data-options="'+thisObject.$element.data('options')+'" ></div>');
		this.parent = this.$element.parent();                                   //parent
		this.parent.data('selectBox',thisObject);
		this.parent.data('selectBox',thisObject.$element.data('selectBox'));
		var html = "";
		html = html + '<span class="eb_title">'+thisObject.title+'</span>';
		if((this.dataOptions.defaultVal || this.dataOptions.defaultVal == '') && this.optionArr["option_"+this.dataOptions.defaultVal] && this.optionArr["option_"+this.dataOptions.defaultVal].text)
			this.dataOptions.defaultText = this.optionArr["option_"+this.dataOptions.defaultVal].text;
		else if(this.dataOptions.defaultVal || this.dataOptions.defaultVal == '')
			this.dataOptions.defaultText = this.dataOptions.defaultVal;
		else
			this.dataOptions.defaultText = "";
		html = html + '<span class="eb_selectBox" id="'+thisObject.id+'" name="'+thisObject.name+'" value="'+thisObject.value+'" placeholder="'+thisObject.placeholder+'">'+this.dataOptions.defaultText+'</span>';
		html = html + '<span class="eb_selectBoxButton"><span class="eb_selectBoxButtonIcon"></span></span>';
		if(this.dataOptions.required == true)
			html = html + '<span class="redStar" style="color:red;">*</span>';
		this.parent.html(html);
		this.selectBoxObj = this.parent.find(".eb_selectBox");                 //selectBoxObj
		this.selectBoxObj.data("selectBox",thisObject);
		this.selectBoxObj.attr("style",thisObject.style);
		this.titleObj = this.parent.find(".eb_title");                         //titleObj
		this.buttonObj = this.parent.find(".eb_selectBoxButton");              //buttonObj
		//this.$element.attr("class","eb_selectBox_hide");
		this.parent.prepend('<input class="eb_selectBox_hide" />');
		this.inputObj = this.parent.children("input");                         //inputObj
		this.setWidth();
		this.setHeight();
		if(this.dataOptions.multiple == true){
			this.initMultipleDropdownMenu();                                    //初始化为多选下拉框
		}else{
			this.initSingleDropdownMenu();                                      //初始化为单选下拉框
		}
		if(this.dataOptions.defaultVal || this.dataOptions.defaultVal == ''){
			this.setValue(this.dataOptions.defaultVal);
		}
		this.setStyle();                                                       //设置组件样式变化
		this.setEvent();														//绑定事件
	};

	SelectBox.prototype.setWidth = function(){
		if(this.dataOptions.width){
			var width = this.dataOptions.width;
			if(typeof width == "string")
				width = width.split("px")[0];
			this.parent.width(width);
			this.selectBoxObj.width(width-84);
			this.inputObj.width(width-80);
		}
		if(this.dataOptions.titleWidth || this.dataOptions.titleWidth == 0){
			var width = this.dataOptions.width;
			var titleWidth = this.dataOptions.titleWidth;
			if(typeof titleWidth == "string")
				titleWidth = titleWidth.split("px")[0];
			titleWidth = titleWidth + 7;
			var inputWidth = width - titleWidth;
			this.inputObj.width(inputWidth);
			this.selectBoxObj.width(inputWidth-4);
		}
	};

	SelectBox.prototype.setHeight = function(){
		if(this.dataOptions.height){
			var height = this.dataOptions.height;
			if(typeof height == "string")
				height = height.split("px")[0];
			this.parent.height(height);
			this.parent.css("line-height",height+"px");
			this.selectBoxObj.height(height);
			this.selectBoxObj.css("line-height",height+"px");
			this.inputObj.height(height);
			this.buttonObj.height(height-2);
			this.buttonObj.css("line-height",height-2+"px");
		}
	};

	SelectBox.prototype.initSingleDropdownMenu = function(){
		var thisObject = this;
		this.dropdownArea.append('<div class="eb_dropdownMenu" id="eb_dropdownMenu_'+thisObject.id+'"></div>');
		this.dropdownMenu = this.dropdownArea.children("#eb_dropdownMenu_"+thisObject.id);     //dropdownMenu
		var width = this.selectBoxObj.width() + 2;

		for(var i in this.optionArr){
			this.dropdownMenu.append('<span class="eb_dropdownOption" value="'+thisObject.optionArr[i].value+'">'+thisObject.optionArr[i].text+'</span>');
		}
		var height = this.dropdownMenu.find(".eb_dropdownOption").length*30;
		this.dropdownMenu.width(width);
		this.dropdownMenu.height(height);
		this.dropdownMenu.find(".eb_dropdownOption").width(width-2);
		this.dropdownMenu.find(".eb_dropdownOption").each(function(){
			$(this).click(function(){
				var value = $(this).attr("value");
				thisObject.setValue(value);
				thisObject.inputObj.focus();
				thisObject.toggleDropdownMenu();
			});
		});
	};

	SelectBox.prototype.initMultipleDropdownMenu = function(){
		var thisObject = this;
		this.dropdownArea.append('<div class="eb_dropdownMenu" id="eb_dropdownMenu_'+thisObject.id+'"></div>');
		this.dropdownMenu = this.dropdownArea.children("#eb_dropdownMenu_"+thisObject.id);     //dropdownMenu
		var width = this.selectBoxObj.width() + 2;
		this.dropdownMenu.html('<div class="eb_displayArea"></div>');
		this.displayAreaObj = this.dropdownMenu.children('.eb_displayArea');                  //displayAreaObj
		this.dropdownMenu.css('overflow-y','hidden');
		for(var i in this.optionArr){
			this.displayAreaObj.append('<span class="eb_dropdownOption" value="'+thisObject.optionArr[i].value+'"><input type="checkbox" value="'+thisObject.optionArr[i].value+'" class="eb_dropdownCheckbox" /><span>'+thisObject.optionArr[i].text+'</span></span>');
		}
		if(this.dataOptions.defaultVal){
			var defaultVal = this.dataOptions.defaultVal;
			defaultVal = defaultVal.split(",");
			for(var i=0;i<defaultVal.length;i++){
				this.displayAreaObj.find(".eb_dropdownCheckbox[value='"+defaultVal[i]+"']").get(0).checked = true;
			}
		}
		var height = this.dropdownMenu.find(".eb_dropdownOption").length*30;
		this.dropdownMenu.width(width);
		this.dropdownMenu.height(height+26);
		this.displayAreaObj.width(width);
		this.displayAreaObj.height(height);
		this.dropdownMenu.find(".eb_dropdownOption").width(width-2);
		this.dropdownMenu.find(".eb_dropdownCheckbox").click(function(event){
			event.stopPropagation();
		});
		this.dropdownMenu.find(".eb_dropdownOption").each(function(){
			$(this).click(function(){
				var check = $(this).children(".eb_dropdownCheckbox").get(0).checked;
				if(check == true){
					$(this).children(".eb_dropdownCheckbox").get(0).checked = false;
				}else{
					$(this).children(".eb_dropdownCheckbox").get(0).checked = true;
				}
			});
		});
		this.dropdownMenu.append($('<div class="eb_dropdownButtonsBar"><div class="eb_buttonOK">确定</div><div class="eb_buttonCancel">取消</div></div>'));
		this.buttonsBarObj = this.dropdownMenu.children('.eb_dropdownButtonsBar');                               //buttonsBarObj
		this.buttonOKObj = this.buttonsBarObj.children('.eb_buttonOK');                                             //buttonOKObj
		this.buttonCancelObj = this.buttonsBarObj.children('.eb_buttonCancel');                                             //buttonCancelObj
		this.buttonsBarObj.width(width-2);
		this.buttonOKObj.width((width-2)/2);
		this.buttonCancelObj.width((width-2)/2).css('left',(width-2)/2+'px');
		this.buttonsBarObj.children('div').each(function(){
			$(this).mouseover(function(){
				$(this).addClass('mouseover');
			}).mouseout(function(){
				$(this).removeClass('mouseover');
			});
		});
		this.buttonCancelObj.click(function(){
			thisObject.dropdownMenu.hide().removeClass('eb_show');
		});

		this.buttonOKObj.click(function(){
			var valueArr = [];
			var textArr = [];
			thisObject.dropdownMenu.find(".eb_dropdownCheckbox").each(function(){
				if($(this).get(0).checked == true){
					valueArr.push($(this).attr("value"));
					textArr.push($(this).next().html());
				}
			});
			var value = "";
			var text = '<span style="display:inline-block;max-height:21px;max-width:'+(thisObject.selectBoxObj.width()-40)+'px;overflow:hidden;word-break:break-all;">';
			for(var i=0;i<valueArr.length;i++){
				if(i<valueArr.length-1){
					value = value + valueArr[i] + ",";
					text = text + textArr[i] + ",";
				}else{
					value = value + valueArr[i];
					text = text + textArr[i] + '</span>';
				}
			}
			thisObject.parent.attr('value',value);
			thisObject.selectBoxObj.attr('value',value).html(text);
			if(thisObject.selectBoxObj.children('span').get(0).offsetHeight>20){
				thisObject.selectBoxObj.append('<span style="position:relative;top:-6px;">...</span>');
			};
			thisObject.inputObj.focus();
			thisObject.toggleDropdownMenu();
		});
		this.buttonsBarObj.width(thisObject.dropdownMenu.get(0).clientWidth-2);
	}

	SelectBox.prototype.toggleDropdownMenu = function(){
		if(this.dropdownMenu.attr("class").indexOf("eb_show")>=0){
			this.hideDropdownMenu();
		}else{
			this.showDropdownMenu();
		}
	};

	SelectBox.prototype.showDropdownMenu = function(){
		this.locatDropdownMenu();
		$(".eb_dropdownMenu.eb_show").hide().removeClass("eb_show");
		this.dropdownMenu.slideDown('fast').addClass("eb_show");
	};

	SelectBox.prototype.hideDropdownMenu = function(){
		this.dropdownMenu.hide().removeClass("eb_show");
	};

	SelectBox.prototype.locatDropdownMenu = function(){
		var top = this.selectBoxObj.offset().top;
		var left = this.selectBoxObj.offset().left;
		var scrollTop = $(window).scrollTop();
		var scrollLeft = $(window).scrollLeft();
		top = top + this.selectBoxObj.height();
		if(navigator.userAgent.indexOf("Firefox")>=0)
			top = top + 4;
		left = left + 1;
		$(this.dropdownMenu).css("left",left).css("top",top+this.$element.height()+3);
	};

	SelectBox.prototype.setStyle = function(){
		var thisObject = this;
		this.inputObj.focus(function(){
			thisObject.selectBoxObj.addClass("focus");
			thisObject.buttonObj.addClass("focus");
		}).blur(function(){
			thisObject.selectBoxObj.removeClass("focus");
			thisObject.buttonObj.removeClass("focus");
		});
		this.dropdownMenu.click(function(){
			thisObject.selectBoxObj.addClass("focus");
			thisObject.buttonObj.addClass("focus");
		}).find(".eb_dropdownOption").each(function(){
			$(this).mouseover(function(){
				$(this).addClass("mouseover");
			}).mouseout(function(){
				$(this).removeClass("mouseover");
			});
		});
	};

	SelectBox.prototype.check = function(){
		var thisObject = this;
		var result = {length:0,result:true};
		var val = this.getValue();
		if(this.dataOptions.required == true){
			if(!val && val!=""){
				result['required'] = 'fail';
				result.result = false;
				result.length++;
			}
		}
		return result;
	};

	SelectBox.prototype.setEvent = function(){
		var thisObject = this;
		if(this.dataOptions.onclickHandler){
			this.selectBoxObj.click(function(){
				var func = thisObject.dataOptions.onclickHandler;
				if(typeof func == "string"){
					func = window[func];
				}
				func(thisObject.parent.get(0));
			});
		}
		if(this.dataOptions.onselectHandler){
			if(this.dataOptions.multiple != true){
				this.dropdownMenu.find(".eb_dropdownOption").each(function(){
					var oldValue;
					$(this).mousedown(function(){
						oldValue = thisObject.parent.attr("value");
					});
					$(this).click(function(){
						var value = $(this).attr("value");
						if(value != oldValue){
							var func = thisObject.dataOptions.onselectHandler;
							if(typeof func == "string")
								func = window[func];
							func(thisObject.parent.get(0));
						}
					});
				});
			}else{
				this.buttonOKObj.click(function(){
					this.dataOptions.onselectHandler(thisObject.selectBoxObj);
				});
			}
		}
	};

	$.fn.selectBox = function (option,param,param1) {
		var result = null;
	    var thisObj = this.each(function () {
	    	var $this = $(this)
	        	, thisObject = $this.data('selectBox')
	        	, dataOptions = typeof option == 'object' && option;
	    	if(typeof option == 'string' ){
	    		result = thisObject[option](param,param1);
	    	}else{
	    		$this.data('selectBox', (thisObject = new SelectBox(this, dataOptions)));
	    	}
	    });
	    if(typeof option == 'string' )return result;
	    return thisObj;
	};

	$.fn.selectBox.defaults = {
		required:false,
		dblclickTimeSpan:250,
		multiple:false,
		width:250,
		height:20,
		titleWidth:73
	};

	$(window).on('load', function(){
		$(".eb_selectBox").each(function () {
			var thisObj = $(this)
			, dataOptionsStr = thisObj.data('options');
			if(!dataOptionsStr)
				thisObj.selectBox($.fn.selectBox.defaults);
			else
				thisObj.selectBox((new Function("return {" + dataOptionsStr + "}"))());
		});
	});
}(window.jQuery);