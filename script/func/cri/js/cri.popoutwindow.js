/*=====================================================================================
 * easy-bootstrap-popoutWindow v2.0
 *
 * @author:niyq
 * @date:2013/08/22
 * @dependce:jquery
 *=====================================================================================*/
 !function($){

	"use strict";

	var PopoutWindow = function(element,dataOptions){
		var thisObject = this;
		this.$element = $(element);
		this.dataOptions = $.extend({}, $.fn.popoutWindow.defaults, dataOptions);
		this.title = this.$element.attr("title");
		if(this.dataOptions.title)
			this.title = this.dataOptions.title;
		this.id = this.$element.attr("id");
		this.funcArr = {};
		this.init();     //初始化popoutWindowGroup组件
		//this.setStyle();
		/*this.$element.focus(function(){
			var result = thisObject.check();
			if(result == false)
				return false;
			else
				return true;
		});*/
	};

	PopoutWindow.prototype.init = function(){
		var thisObject = this;
		this.$element.wrap('<div class="eb_popoutWindowGroup" id="'+thisObject.id+'_subgroup"></div>');
		this.parent = this.$element.parent();      //parent
		this.parent.data("popoutWindow",thisObject);
		if(thisObject.$element.data("form"))
			this.parent.data("form",thisObject.$element.data("form"));
		this.popoutWindowObj = this.$element;     //popoutWindowObj
		//this.popoutWindowObj.attr("id","");
		this.parent.prepend('<div class="eb_title">'+thisObject.title+'<span class="eb_closeWindowButton">x</span></div>');
		this.titleObj = this.parent.children('.eb_title');    //titleObj
		if(this.dataOptions.closeHandler){
			var func = this.dataOptions.closeHandler;
			if(typeof func == "string")
				func = window[func];
			thisObject.titleObj.find('.eb_closeWindowButton').click(function(){
				func();
			});
		}
		this.parent.append('<div class="eb_buttonsBar"></div>');
		this.buttonsBar = this.parent.children('.eb_buttonsBar');       //buttonsBar
		this.buttonsArr = this.dataOptions.buttons;
		if(typeof this.buttonsArr == "string"){
			this.buttonsArr = window[thisObject.buttonsArr];
		}                                                   //buttonsArr
		if(thisObject.buttonsArr){
			for(var i=0;i<thisObject.buttonsArr.length;i++){
				var func = thisObject.buttonsArr[i].handler;
				if(typeof func == "string")
					func = window[func];
				thisObject.funcArr[i]=func;
				this.buttonsBar.prepend($('<span class="eb_buttons" funcIndex="'+i+'"><span class="eb_icon '+thisObject.buttonsArr[i].icon+'"></span>'+thisObject.buttonsArr[i].text+'</span>').click(function(){
					var thisObj = this;
					thisObject.funcArr[$(thisObj).attr("funcIndex")]();
				}));
			}
		}
		this.buttonsObj = this.buttonsBar.children('.eb_buttons');     //buttonsObj
		if(this.dataOptions.fullScreen == true){
			this.setFullScreen();
		}else{
			this.setWidth();
			this.setHeight();
		}
		this.setPosition();
		this.setStyle();
	};

	PopoutWindow.prototype.show = function(url){
		var thisObject = this;
		if(this.parent.css("display") == 'none'){
			if(this.popoutWindowObj.children("iframe.eb_iframe").length<=0 && (url || this.dataOptions.url || this.popoutWindowObj.attr("url") || this.popoutWindowObj.children("div.eb_iframe").length>0)){
				this.src = "";
				if(this.popoutWindowObj.children("div.eb_iframe").length>0)
					this.src = this.popoutWindowObj.children("div.eb_iframe").attr("src");
				if(this.popoutWindowObj.attr("url"))
					this.src = this.popoutWindowObj.attr("url");
				if(this.dataOptions.url)
					this.src = this.dataOptions.url;
				if(url)
					this.src = url;
				var html = '<iframe id="eb_iframe_'+this.id+'" class="eb_iframe" src="'+this.src+'" style="margin:auto" ></iframe>';
				this.popoutWindowObj.html(html);
				this.iframeObj = this.popoutWindowObj.children("iframe.eb_iframe");      //iframeObj
				this.iframeObj.width(thisObject.popoutWindowObj.width()-5).height(thisObject.popoutWindowObj.height()-5);
			}else if(this.popoutWindowObj.children("iframe.eb_iframe").length>0){
				if(url)
					this.src = url;
				var html = '<iframe id="eb_iframe_'+this.id+'" class="eb_iframe" src="'+this.src+'" style="margin:auto" ></iframe>';
				this.popoutWindowObj.html(html);
				this.iframeObj = this.popoutWindowObj.children("iframe.eb_iframe");      //iframeObj
				this.iframeObj.width(thisObject.popoutWindowObj.width()-5).height(thisObject.popoutWindowObj.height()-5);
			}
			this.parent.parent().prepend('<div id="maskX" style="display: none"></div>');
			$("#maskX").css({"opacity":"0.3", "display":"block", "position":"absolute", "background-color":"#fff", "z-index":11})
				.width(document.body.clientWidth)
				.height(document.body.clientHeight);
			this.setPosition();
			this.parent.show();
			}
	};

	PopoutWindow.prototype.hide = function(){
		this.parent.hide();
		$("#maskX").remove();
	};

	PopoutWindow.prototype.setPosition = function(param){
		if(this.dataOptions.fullScreen != true){
			var top = $.fn.popoutWindow.defaults.top;
			var left = $.fn.popoutWindow.defaults.left;
			if(this.dataOptions.top)
				top = this.dataOptions.top;
			if(typeof top == "string")
				top = top.split("px")[0];
			top = top + $(window).scrollTop();
			if(this.dataOptions.left)
				left = this.dataOptions.left;
			if(typeof left == "string")
				left = left.split("px")[0];
			if(param){
				if(param.top){
					if(typeof param.top == "string")
						top = param.top.split("px")[0];
					else
						top = param.top;
				}
				if(param.left){
					if(typeof param.left == "string")
						left = param.left.split("px")[0];
					else
						left = param.left;
				}
			}
			this.parent.css("top",top+"px").css("left",left+"px");
		}
	};

	PopoutWindow.prototype.setFullScreen = function(){
		var width = $(window).width();
		if(typeof width == "string")
			width = width.split("px")[0];
		var height = $(window).height();
		if(typeof height == "string")
			height = height.split("px")[0];
		this.parent.css("top",0).css("left",0);
		this.setWidth(width);
		this.setHeight(height);
		this.parent.css("border-radius","0");
	};

	PopoutWindow.prototype.setWidth = function(widthParam){
		if(this.dataOptions.width){
			var width = this.dataOptions.width;
			if(widthParam)
				width = widthParam;
			if(typeof width == "string")
				width = width.split("px")[0];
			this.parent.width(width);
			this.titleObj.width(width);
			this.popoutWindowObj.width(width);
			this.buttonsBar.width(width);
		}
	};

	PopoutWindow.prototype.setHeight = function(heightParam){
		if(this.dataOptions.height){
			var height = this.dataOptions.height;
			if(heightParam)
				height = heightParam;
			if(typeof height == "string")
				height = height.split("px")[0];
			this.parent.height(height);
			this.popoutWindowObj.height(height-61);
			this.buttonsBar.css("top",height-30+"px");
		}
	};

	PopoutWindow.prototype.setStyle = function(){
		var thisObject = this;
		this.buttonsObj.each(function(){
			$(this).mouseover(function(){
				$(this).addClass("mouseover");
			}).mouseout(function(){
				$(this).removeClass("mouseover");
			}).mousedown(function(){
				$(this).addClass("mousedown");
			}).mouseup(function(){
				$(this).removeClass("mousedown");
			});
		});
		this.titleObj.find(".eb_closeWindowButton").mouseover(function(){
			$(this).addClass("mouseover");
		}).mouseout(function(){
			$(this).removeClass("mouseover");
		}).click(function(){
			thisObject.parent.hide();
			$("#maskX").remove();
		});
	};

	$.fn.popoutWindow = function (option,param) {
		var result = null;
	    var thisObj = this.each(function () {
	    	var $this = $(this)
	        	, thisObject = $this.data('popoutWindow')
	        	, dataOptions = typeof option == 'object' && option;
	    	if(typeof option == 'string' ){
	    		result = thisObject[option](param);
	    	}else{
	    		if(thisObject){

	    		}else{
	    			$this.data('popoutWindow', (thisObject = new PopoutWindow(this, dataOptions)));
	    		}
	    	}
	    });
	    if(typeof option == 'string' )return result;
	    return thisObj;
	};

	$.fn.popoutWindow.defaults = {
		required:false,
		dblclickTimeSpan:250,
		top:30,
		left:60
	};

	$(window).on('load', function(){
		$(".eb_popoutWindow").each(function () {
			var thisObj = $(this)
			, dataOptionsStr = thisObj.data('options');
			if(!dataOptionsStr)
				thisObj.popoutWindow($.fn.popoutWindow.defaults);
			else
				thisObj.popoutWindow((new Function("return {" + dataOptionsStr + "}"))());
		});
	});
}(window.jQuery);
