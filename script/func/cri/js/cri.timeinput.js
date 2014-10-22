/*=====================================================================================
 * easy-bootstrap-timeInput v2.0
 *
 * @author:niyq
 * @date:2013/09/05
 * @dependce:jquery
 *=====================================================================================*/
 !function($){

	"use strict";

	var TimeInput = function(element,dataOptions){
		this.$element = $(element);
		this.$element.keypress(function(){
			return false;
		}).val("");
		this.dataOptions = $.extend({}, $.fn.timeInput.defaults, dataOptions);
		this.name = this.$element.attr("name");
		this.id = this.$element.attr("id");
		this.thisYear = new Date().getFullYear();
		this.thisMonth = new Date().getMonth()+1;
		if(this.thisMonth<10)
			this.thisMonth = "0"+this.thisMonth;
		this.today = new Date().getDate();
		this.year = new Date().getFullYear();
		this.month = new Date().getMonth()+1;
		if(this.month<10)
			this.month = "0"+this.month;
		this.monthArr = new Array();
		this.ifEnable = true;
		this.value = "";
		this.id = this.$element.attr("id");
		this.timeBoxId = "timeBox_"+this.id;
		this.title = "时间";
		if(this.$element.attr("title"))
			this.title = this.$element.attr("title");
		if(this.dataOptions.title)
			this.title = this.dataOptions.title;
		this.init();

	};//Timeinput

	TimeInput.prototype.enabled = function(){
		this.ifEnable = true;
	};

	TimeInput.prototype.disabled = function(){
		this.ifEnable = false;
	};

	TimeInput.prototype.setWidth = function(widthParam){
		var width = this.dataOptions.width;
		if(widthParam)
			width = widthParam;
		if(typeof width == "string")
			width = width.split("px")[0];
		this.parent.width(width);
		this.inputObj.width(width-85);
		if(this.dataOptions.titleWidth || this.dataOptions.titleWidth == 0){
			var titleWidth = this.dataOptions.titleWidth;
			if(typeof titleWidth == "string")
				titleWidth = titleWidth.split("px")[0];
			titleWidth = titleWidth - 1;
			var inputWidth = width - titleWidth - 13;
			this.inputObj.width(inputWidth);
			this.titleObj.width(titleWidth);
		}
	};

	TimeInput.prototype.setHeight = function(heightParam){
		var height = this.dataOptions.height;
		if(heightParam)
			height = heightParam;
		if(typeof height == "string")
			height = height.split("px")[0];
		this.parent.height(height);
		this.parent.css("line-height",height+"px");
		this.inputObj.height(height-2);
		this.inputObj.css("line-height",(height-2)+"px");
		this.titleObj.height(height);
		this.titleObj.css("line-height",height+"px");
	};

	TimeInput.prototype.init = function(){
		var thisObject = this;
		if(this.dataOptions.required == true){
			this.$element.attr("placeholder",thisObject.$element.attr("placeholder")+" (必填)");
		}
		this.inputObj = this.$element;                 //inputObj

		this.inputObj.wrap($("<div class=\"eb_timeInputGroup\"></div>"));
		this.parent = this.inputObj.parent();                       //parent
		this.parent.data("timeInput",thisObject);
		this.parent.attr("name",thisObject.name).attr("id",thisObject.id + "_subgroup");
		this.parent.data("options",thisObject.$element.data("options"));
		if(this.dataOptions && this.dataOptions.defaultVal){
			this.inputObj.val(thisObject.dataOptions.defaultVal);
			this.parent.attr("value",thisObject.dataOptions.defaultVal);
		}
		this.parent.prepend($('<span class="eb_title">'+thisObject.title+'</span>'));
		this.titleObj = this.parent.children(".eb_title");        //titleObj
		if(this.dataOptions && this.dataOptions.required == true){
			this.parent.append('<span class="redStar" style="color:red;">*</span>');
		}
		this.setWidth();
		this.setHeight();
		var html = "";
		html = html + '<div class="eb_timeBox" id="'+this.timeBoxId+'"></div>';
		var timeBoxArea = $(".eb_timeBoxArea");               //timeBoxArea
		if(timeBoxArea.length <= 0){
			$("body").prepend('<div class="eb_timeBoxArea"></div>');
			timeBoxArea = $(".eb_timeBoxArea");
		}
		timeBoxArea.append(html);
		this.timeBoxObj = $("#" + thisObject.timeBoxId);
		$("#"+this.timeBoxId).append('<div class="eb_titleBar"></div>');
		this.titleBarObj = this.timeBoxObj.find(".eb_titleBar");
		html = "";
		html = html + '<div class="eb_yearSelecter"><span class="eb_toLastYear eb_yearButton">－</span><span class="eb_year">'+this.year+'</span>&nbsp;年<span class="eb_toNextYear eb_yearButton">＋</span></div>';
		$("#"+this.timeBoxId).find(".eb_titleBar").append(html); //写入年份选择组件
		$("#"+this.timeBoxId).find(".eb_yearButton").each(function(){ //年份增减按钮样式控制
			var thisObj = this;
			$(thisObj).mouseover(function(){
				$(thisObj).addClass("mouseover");
			}).mouseout(function(){
				$(thisObj).removeClass("mouseover");
			}).mousedown(function(){
				$(thisObj).addClass("mousedown");
			}).mouseup(function(){
				$(thisObj).removeClass("mousedown");
			});
		});
		$("#"+this.timeBoxId).find(".eb_toLastYear").click(function(){ //年份向前翻页
			thisObject.year--;
			$("#"+thisObject.timeBoxId).find(".eb_year").html(thisObject.year);
			thisObject.refreshDate();
		});
		$("#"+this.timeBoxId).find(".eb_toNextYear").click(function(){ //年份向后翻页
			thisObject.year++;
			$("#"+thisObject.timeBoxId).find(".eb_year").html(thisObject.year);
			thisObject.refreshDate();
		});
		html = '';
		html = html + '<select name="month" class="eb_monthSelect">';
		html = html + '<option value="01">01</option>';
		html = html + '<option value="02">02</option>';
		html = html + '<option value="03">03</option>';
		html = html + '<option value="04">04</option>';
		html = html + '<option value="05">05</option>';
		html = html + '<option value="06">06</option>';
		html = html + '<option value="07">07</option>';
		html = html + '<option value="08">08</option>';
		html = html + '<option value="09">09</option>';
		html = html + '<option value="10">10</option>';
		html = html + '<option value="11">11</option>';
		html = html + '<option value="12">12</option>';
		html = html + '</select>';
		this.titleBarObj.append($(html));
		this.titleBarObj.append('<span style="position:absolute;top:5px;right:23px;">月</span>');
		this.monthSelectObj = this.titleBarObj.find(".eb_monthSelect");                      //monthSelectObj
		this.monthSelectObj.val(thisObject.thisMonth);
		this.monthSelectObj.change(function(){
			thisObject.refreshDate();
		});
		html = "";
		html = html + '<table>';
		html = html + '<tr>';
		html = html + '<th class="eb_Sunday eb_red">日</th>';
		html = html + '<th class="eb_Monday">一</th>';
		html = html + '<th class="eb_Tuesday">二</th>';
		html = html + '<th class="eb_Wednesday">三</th>';
		html = html + '<th class="eb_Thursday">四</th>';
		html = html + '<th class="eb_Friday">五</th>';
		html = html + '<th class="eb_Saturday red">六</th>';
		html = html + '</tr>';
		html = html + '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
		html = html + '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
		html = html + '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
		html = html + '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
		html = html + '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
		html = html + '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
		html = html + '</table>';
		$("#"+this.timeBoxId).append(html);
		$("#"+this.timeBoxId).find("table td").each(function(){
			var thisObj = this;
			$(thisObj).mouseover(function(){
				$(thisObj).addClass("eb_dateMouseover");
			}).mouseout(function(){
				$(thisObj).removeClass("eb_dateMouseover");
			});
		});
		this.$element.click(function(){
			$(".eb_dropdownMenu.eb_show").hide().removeClass("eb_show");
			$(".eb_timeInput.focus").not(thisObject.$element).removeClass('focus');
			thisObject.toggleBox();
		});
		this.$element.focus(function(){
			thisObject.$element.addClass("focus");
		});
		this.refreshDate();
		if(this.dataOptions.HMS == true){                      //HMS == true
			this.timeBoxObj.height(thisObject.timeBoxObj.height()+30);
			var html = "";
			html = html + '<div class="eb_HMSBar">';
			html = html + '<input class="eb_HMSInput eb_Hour" value="00" />&nbsp;时&nbsp;';
			html = html + '<input class="eb_HMSInput eb_minute"  value="00" />&nbsp;分&nbsp;';
			html = html + '<input class="eb_HMSInput eb_second"  value="00" />&nbsp;秒';
			html = html + '</div>';
			this.timeBoxObj.append(html);
			this.timeBoxObj.find(".eb_HMSInput").focus(function(){
				$(this).addClass("focus");
			}).blur(function(){
				$(this).removeClass("focus");
			}).focus(function(){
				$(this).select();
			});
			this.timeBoxObj.find(".eb_HMSInput").keydown(function(e){
				var keycode=e.keyCode||e.which||e.charCode;
				var thisObj = this;
				var value = $(this).val();
				if((keycode>=48 && keycode<=57) || keycode == 8){
					return true;
				}else{
					return false;
				}
			});
			this.timeBoxObj.find(".eb_Hour").change(function(){
				var value = $(this).val();
				if(value>23){
					$(this).val("23");
				}else if(value<0){
					$(this).val("00");
				}
			});
			this.timeBoxObj.find(".eb_minute,.eb_second").change(function(){
				var value = $(this).val();
				if(value>59){
					$(this).val("59");
				}else if(value<0){
					$(this).val("00");
				}
			});
			this.timeBoxObj.append($('<div class="timeInputOK">确定</div>').mouseover(function(){
				$(this).addClass("mouseover");
			}).mouseout(function(){
				$(this).removeClass("mouseover");
			}).click(function(){
				var date = thisObject.timeBoxObj.find(".choosed").html();
				if(!date)
					date = "1";
				if(date<10 && date.length == 1)
					date = "0"+date;
				var YMD = thisObject.year + "-" + thisObject.month + "-" + date;
				var hour = thisObject.timeBoxObj.find(".eb_Hour").val();
				if(hour<10 && hour.length == 1)
					hour = "0" + hour;
				var min = thisObject.timeBoxObj.find(".eb_minute").val();
				if(min<10 && min.length == 1)
					min = "0" + min;
				var second = thisObject.timeBoxObj.find(".eb_second").val();
				if(second<10 && second.length == 1)
					second = "0" + second;
				var HMS = hour + ":" + min + ":" + second;
				var result = YMD + "  " + HMS;
				thisObject.setValue(result);
				thisObject.timeBoxObj.hide().removeClass("show");
				thisObject.$element.change();
			})).append($('<div class="timeInputCancel">取消</div>').mouseover(function(){
				$(this).addClass("mouseover");
			}).mouseout(function(){
				$(this).removeClass("mouseover");
			}).click(function(){
				thisObject.timeBoxObj.hide().removeClass("show");
			}));
		}
		$(window).click(function(){
			//thisObject.check();
			thisObject.$element.removeClass("focus");
			$("#"+thisObject.timeBoxId).removeClass("show").hide();
		});
		this.$element.each(function(){
			$(this).click(function(event){
				event.stopPropagation();
			});
		});
		$("#"+this.timeBoxId).each(function(){
			$(this).click(function(event){
				event.stopPropagation();
			});
		});
	};

	TimeInput.prototype.refreshDate = function(){
		var thisObject = this;
		this.timeBoxObj.find(".choosed").removeClass("choosed");
		$("#"+this.timeBoxId).find("table td").html("").unbind("click");
		this.month = this.monthSelectObj.val();
		var maxDay = this.getMonthArr(this.year)[this.month-1];
		var firstDay = new Date(this.year,this.month-1,1).getDay();
		var index = firstDay%7;
		for(var i=0;i<maxDay;i++){
			$("#"+this.timeBoxId).find("table td").eq(index).html(i+1);
			if(this.dataOptions.defaultVal){
				var value = this.dataOptions.defaultVal;
				if(this.inputObj.val())
					value = this.inputObj.val();
				var YMD = value.split(" ")[0];
				var Y = YMD.split("-")[0];
				var M = YMD.split("-")[1];
				var D = YMD.split("-")[2];
				if(D.indexOf("0") == 0)
					D = D.split("0")[1];
				if(this.year == Y && this.month == M && i+1 == D){
					$("#"+this.timeBoxId).find(".choosed").removeClass("choosed");
					$("#"+this.timeBoxId).find("table td").eq(index).addClass('choosed');
				}
			}else if(this.year == this.thisYear && this.month == this.thisMonth && i+1 == thisObject.today){
				$("#"+this.timeBoxId).find(".choosed").removeClass("choosed");
				$("#"+this.timeBoxId).find("table td").eq(index).addClass('choosed');
			}
			if(thisObject.dataOptions.HMS != true){
				$("#"+this.timeBoxId).find("table td").eq(index).click(function(){
					$("#"+thisObject.timeBoxId).find(".choosed").removeClass("choosed");
					$(this).addClass("choosed");
					thisObject.date = $(this).html();
					if(thisObject.date<10)
						thisObject.date = "0" + thisObject.date;
					var data = thisObject.year + "-" + thisObject.month + "-" + thisObject.date;
					thisObject.setValue(data);
					thisObject.timeBoxObj.hide().removeClass("show");
					thisObject.$element.change();
				});
			}else{
				$("#"+this.timeBoxId).find("table td").eq(index).click(function(){
					thisObject.date = $(this).html();
					if(thisObject.date<10)
						thisObject.date = "0" + thisObject.date;
					var data = thisObject.year + "-" + thisObject.month + "-" + thisObject.date;
					//thisObject.inputObj.val(data);
					//thisObject.timeBoxObj.hide();
					thisObject.timeBoxObj.find(".choosed").removeClass("choosed");
					$(this).addClass("choosed");
				});
			}
			index++;
		}
	};
	TimeInput.prototype.isLeapYear = function(year){
		if(year%4==0 && (year%100!= 0 || year%400 == 0))
			return true;
		else
			return false;
	};

	TimeInput.prototype.getMonthArr = function(year){
		if(this.isLeapYear(year))
			return [31,29,31,30,31,30,31,31,30,31,30,31];
		else
			return [31,28,31,30,31,30,31,31,30,31,30,31];
	};

	TimeInput.prototype.toggleBox = function(){
		this.locatBox();
		var display = $("#"+this.timeBoxId).attr("class");
		if(display.indexOf("show")>=0){
			$("#"+this.timeBoxId).removeClass("show").hide();
		}else{
			$(".eb_timeBoxArea .show").hide().removeClass("show");
			if(this.ifEnable == true){
				$("#"+this.timeBoxId).slideDown('fast').addClass("show");
			}
		}
	};

	TimeInput.prototype.getValue = function(){
		return this.inputObj.val();
	};

	TimeInput.prototype.setValue = function(value){
		this.inputObj.val(value);
		this.parent.attr("value",value);
	};

	TimeInput.prototype.clearValue = function(){
		this.setValue("");
	};

	TimeInput.prototype.check = function(){
		var thisObject = this;
		var result = {length:0,result:true};
		var val = this.$element.val();
		if(this.dataOptions.required == true){
			if(!val){
				result['required'] = 'fail';
				result.result = false;
				result.length++;
			}
		}
		return result;
	};

	TimeInput.prototype.locatBox = function(){
		var top = this.$element.offset().top;
		var left = this.$element.offset().left;
		var scrollTop = $(window).scrollTop();
		var scrollLeft = $(window).scrollLeft();
		top = top;
		left = left;
		$("#"+this.timeBoxId).css("left",left).css("top",top+this.$element.height()+3);
	}

	$.fn.timeInput = function (option,param) {
		var result = null;
	    var thisObj = this.each(function () {
	    	var $this = $(this)
	        	, thisObject = $this.data('timeInput')
	        	, dataOptions = typeof option == 'object' && option;
	    	if(typeof option == 'string' ){
	    		result = thisObject[option](param);
	    	}else{
	    		$this.data('timeInput', (thisObject = new TimeInput(this, dataOptions)));
	    	}
	    });
	    if(typeof option == 'string' )return result;
	    return thisObj;
	};

	$.fn.timeInput.defaults = {
		required:false,
		width:250,
		height:20,
		titleWidth:73
	};

	$(window).on('load', function(){
		$(".eb_timeInput").each(function () {
			var thisObj = $(this)
			, dataOptionsStr = thisObj.data('options');
			if(!dataOptionsStr)
				thisObj.timeInput($.fn.timeInput.defaults);
			else
				thisObj.timeInput((new Function("return {" + dataOptionsStr + "}"))());
		});
	});
}(window.jQuery);