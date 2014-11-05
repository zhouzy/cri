
/*=====================================================================================
 * easy-bootstrap-tabPage v2.0
 *
 * @author:niyq
 * @date:2013/09/04
 * @dependce:jquery
 *=====================================================================================*/
!function($){

    "use strict";

    var TabPage = function(element,dataOptions){
        var thisObject = this;
        this.$element = $(element);
        this.dataOptions = $.extend({}, $.fn.tabPage.defaults, dataOptions);
        this.title = this.$element.attr("title");
        this.id = this.$element.attr("id");
        this.init();
    };

    TabPage.prototype.setHeadBarView = function(myObj){
        var thisObject = this;
        var obj = this.headBarObj.children('.eb_tabPageHead.on');
        if(myObj)
            obj = myObj;
        var objLeft = obj.offset().left;
        var objRight = obj.offset().left + obj.width() + 61;
        var headBarPanelLeft = this.headBarPanelObj.offset().left;
        var headBarPanelRight = this.headBarPanelObj.offset().left + this.headBarPanelObj.width();
        if(objLeft < headBarPanelLeft){
            this.headMoveLeft(obj);
        }else if(objRight > headBarPanelRight){
            this.headMoveRight(obj);
        }
    };

    TabPage.prototype.headMoveLeft = function(givenObj){
        var thisObject = this;
        var headBarPanelLeft = this.headBarPanelObj.offset().left;
        var headBarLILeft = null;
        var headBarLeftOffset = this.headBarObj.offset().left;
        var headBarLeft = this.headBarObj.css("left");
        if(typeof headBarLeft == "string")
            headBarLeft = headBarLeft.split("px")[0];
        var distance;
        if(givenObj){
            headBarLILeft = givenObj.offset().left;
        }else{
            this.headBarObj.children('.eb_tabPageHead').each(function(){
                var left = $(this).offset().left;
                if((left-headBarPanelLeft)<-25){
                    headBarLILeft = left;
                }
            });
            if(headBarLILeft == null)
                headBarLILeft = this.headBarObj.children('.eb_tabPageHead').first().offset().left;
        }
        var distance = headBarPanelLeft - headBarLILeft;
        var newLeft =  parseInt(headBarLeft) + parseInt(distance);
        this.headBarObj.animate({left:newLeft},200,'',function(){
            if(thisObject.headBarObj.offset().left >= thisObject.headBarPanelObj.offset().left){
                thisObject.leftBtnObj.children('.eb_arrow02L').hide();
            }else{
                thisObject.leftBtnObj.children('.eb_arrow02L').show();
            }
            if(thisObject.headBarObj.offset().left + thisObject.headBarObj.width() <= thisObject.headBarPanelObj.offset().left + thisObject.headBarPanelObj.width()){
                thisObject.rightBtnObj.children('.eb_arrow02R').hide();
            }else{
                thisObject.rightBtnObj.children('.eb_arrow02R').show();
            }
        });
    };

    TabPage.prototype.headMoveRight = function(givenObj){
        var thisObject = this;
        var headBarPanelRight = this.headBarPanelObj.offset().left + this.headBarPanelObj.width();
        var headBarLIleft = headBarPanelRight;
        var headBarLIRight;
        var headBarLeft = parseInt(this.headBarObj.css("left"));
        var obj;
        this.headBarObj.children('.eb_tabPageHead').each(function(){
            var left = $(this).offset().left;
            if(left <= headBarPanelRight+25){
                headBarLIleft = left;
                obj = $(this);
            }
        });
        if(obj.length<=0)
            obj = this.headBarObj.children('.eb_tabPageHead').last();
        if(givenObj){
            obj = givenObj;
            headBarLIleft = givenObj.offset().left;
        }
        headBarLIRight = headBarLIleft + (obj.width()+61);
        var distance = headBarLIRight - headBarPanelRight;
        var newLeft = headBarLeft - distance;
        this.headBarObj.animate({left:newLeft},200,'',function(){
            if(thisObject.headBarObj.offset().left >= thisObject.headBarPanelObj.offset().left){
                thisObject.leftBtnObj.children('.eb_arrow02L').hide();
            }else{
                thisObject.leftBtnObj.children('.eb_arrow02L').show();
            }
            if(thisObject.headBarObj.offset().left + thisObject.countWidth() <= thisObject.headBarPanelObj.offset().left + thisObject.headBarPanelObj.width()){
                thisObject.rightBtnObj.children('.eb_arrow02R').hide();
            }else{
                thisObject.rightBtnObj.children('.eb_arrow02R').show();
            }
        });
    }

    TabPage.prototype.toggleHeadBtn = function(){
        var thisObject = this;
        var parentWidth = this.parent.width();
        var pageHeadTotalWidth = this.countWidth();
        //alert("parentWidth="+parentWidth+",pageHeadTotalWidth="+pageHeadTotalWidth+",typeof parentWidth="+(typeof pageHeadTotalWidth));
        if(pageHeadTotalWidth > (parentWidth-14)){
            this.headBarPanelObj.width(parentWidth-16).css("left","8px");
            this.leftBtnObj.show();
            this.rightBtnObj.show();
        }else{
            this.headBarPanelObj.width(parentWidth-2).css("left","0");
            this.leftBtnObj.hide();
            this.rightBtnObj.hide();
            this.headBarObj.css("left","0");
        }
    }

    TabPage.prototype.countWidth = function(){
        var thisObject = this;
        var parentWidth = this.parent.width();
        var pageHeadTotalWidth = 0;
        this.headBarObj.children('.eb_tabPageHead').each(function(){
            pageHeadTotalWidth = pageHeadTotalWidth + $(this).width() + 61;
        });
        return pageHeadTotalWidth;
    }

    TabPage.prototype.setWidth = function(widthNum){
        var thisObject = this;
        var width;
        if(this.dataOptions.width)
            width = this.dataOptions.width;
        if(widthNum)
            width = widthNum;
        if(typeof width == "string")
            width = width.split("px")[0];
        this.parent.width(width);
        //this.headBarObj.width(width-2);
        this.headBarPanelObj.width(width-2);
        this.headBarBGObj.width(width-2);
        this.parent.children('.eb_tabPageBody').each(function(){
            $(this).width(width-2);
        });
        this.parent.children('.eb_tabPageBody').children('.eb_iframe').each(function(){
            $(this).width(width-2);
        });
        this.toggleHeadBtn();
    };

    TabPage.prototype.setHeight = function(heightNum){
        var thisObject = this;
        var height;
        if(this.dataOptions.height)
            height = this.dataOptions.height;
        if(heightNum)
            height = heightNum;
        if(typeof height == "string")
            height = height.split("px")[0];
        this.parent.height(height);
        this.parent.children('.eb_tabPageBody').each(function(){
            $(this).height(height-37);
        });
        this.parent.children('.eb_tabPageBody').children('.eb_iframe').each(function(){
            $(this).height(height-37);
        });
    };

    TabPage.prototype.remove = function(name){
        var thisObject = this;
        var cls = this.headBarObj.children('.eb_tabPageHead[name="'+name+'"]').attr("class");
        var next = this.parent.children('.eb_tabPageBody[name="'+name+'"]').next();
        this.parent.children('.eb_tabPageBody[name="'+name+'"]').remove();
        this.headBarObj.children('.eb_tabPageHead[name="'+name+'"]').remove();
        if(cls.indexOf(' on')>=0){
            var name = '';
            if(next.length>0){
                name = next.attr("name");
            }else{
                var objArr = thisObject.headBarObj.get(0).getElementsByTagName('span');
                var obj = objArr[objArr.length-1];
                name = $(obj).attr('name');
            }
            this.select(name);
        }
        var lastObj = this.headBarObj.children('.eb_tabPageHead').last();
        if(lastObj.length>0 && (lastObj.offset().left + lastObj.width() < this.headBarPanelObj.offset().left + this.headBarPanelObj.width() && this.countWidth() > this.headBarPanelObj.width()-14)){
            this.headMoveRight(lastObj);
        }
        this.toggleHeadBtn();
    };

    TabPage.prototype.removeByNum = function(num){
        var thisObject = this;
        var objArr = thisObject.headBarObj.get(0).getElementsByTagName('span');
        if(num < 0 || num > objArr.length-1){
            alert('$(selecter).tabPage("remove",num) 方法输入的数字超出范围！');
            return false;
        }
        var obj = objArr[num];
        var name = $(obj).attr('name');
        this.remove(name);
    };

    TabPage.prototype.select = function(name){
        var thisObject = this;
        if(this.headBarObj.children('.eb_tabPageHead[name="'+name+'"]').length>0 && this.headBarObj.children('.eb_tabPageHead[name="'+name+'"]').attr("class").indexOf(" on")<0){
            var thisObj = this.headBarObj.children('.eb_tabPageHead[name="'+name+'"]');
            thisObject.headBarObj.find('.on').removeClass('on');
            $(thisObj).addClass("on");
            thisObject.parent.find(".eb_tabPageBody").hide();
            var bodyObj = thisObject.getBody($(thisObj));
            if(bodyObj.children('div.eb_iframe').length>0){
                var src = '';
                var html = '';
                src = bodyObj.children('.eb_iframe').attr('src');
                html = html + '<iframe src="'+src+'" class="eb_iframe"></iframe>';
                bodyObj.html(html);
            }
            bodyObj.show();
            this.setHeadBarView();
        }
    };

    TabPage.prototype.selectByNum = function(num){
        var thisObject = this;
        var objArr = thisObject.headBarObj.get(0).getElementsByTagName('span');
        if(num < 0 || num > objArr.length-1){
            alert('$(selecter).tabPage("remove",num) 方法输入的数字超出范围！');
            return false;
        }
        var obj = objArr[num];
        var name = $(obj).attr('name');
        this.select(name);
    };

    TabPage.prototype.add = function(param){
        var thisObject = this;
        var arr = [];
        if(isArray(param) == 'array')
            arr = param;
        else if(isArray(param) == "object")
            arr[0] = param;
        else
            alert("$(selecter).tabPage('add',param) 方法传入参数错误！");
        for(var i = 0;i<arr.length;i++){
            var obj = arr[i];
            if(this.headBarObj.children('.eb_tabPageHead[name="'+obj.name+'"]').length>0){
                thisObject.select(obj.name);
            }else{
                this.parent.append($('<div class="eb_tabPageBody" style="display:none" name="'+obj.name+'"><iframe src="'+obj.src+'" class="eb_iframe"></iframe></div>'));
                this.headBarObj.append($('<span class="eb_tabPageHead" name="'+obj.name+'">'+obj.title+'</span>').click(function(){
                    var thisObj = this;
                    if($(this).attr("class").indexOf(" on")<0){
                        thisObject.headBarObj.find('.on').removeClass('on');
                        $(this).addClass("on");
                        thisObject.parent.find(".eb_tabPageBody").hide();
                        thisObject.getBody($(thisObj)).show();
                    }
                    thisObject.setHeadBarView();
                }).append($('<div class="eb_tabPageCloseBtn">x</div>').click(function(){
                    var name = $(this).parent().attr("name");
                    thisObject.remove(name);
                }).mouseover(function(){
                    $(this).addClass("mouseover");
                }).mouseout(function(){
                    $(this).removeClass("mouseover");
                })).mouseover(function(){
                    $(this).children('.eb_tabPageCloseBtn').show();
                }).mouseout(function(){
                    $(this).children('.eb_tabPageCloseBtn').hide();
                }));
                if(this.countWidth()>this.headBarPanelObj.width()-14){
                    givenObj = this.headBarObj.children('.eb_tabPageHead').last();
                    this.headMoveRight(givenObj);
                }
            }
        }
        var showPageName = arr[arr.length-1].name;
        this.select(showPageName);
        this.setWidth(thisObject.parent.width());
        this.setHeight(thisObject.parent.height());
        this.toggleHeadBtn();
        var givenObj = null;

    };

    TabPage.prototype.init = function(){
        var thisObject = this;
        this.parent = this.$element;          //parent
        this.parent.children('div').each(function(){
            $(this).addClass('eb_tabPageBody');
        });
        this.parent.prepend($('<div class="eb_headBar"></div>'));
        this.headBarObj = this.parent.children('.eb_headBar');                //headBarObj
        this.headBarObj.wrap($('<div class="eb_headBarPanel"></div>'));
        this.headBarPanelObj = this.headBarObj.parent();                      //headBarPanelObj
        this.headBarPanelObj.wrap($('<div class="eb_headBarBG"></div>'));
        this.headBarBGObj = this.headBarPanelObj.parent();                    //headBarBGObj
        this.headBarBGObj.prepend($('<div class="eb_headBarLeftBtn"><div class="eb_arrow02L"></div></div>').mouseover(function(){
            $(this).addClass('mouseover');
        }).mouseout(function(){
            $(this).removeClass('mouseover');
        }).mousedown(function(){
            $(this).addClass('mousedown');
        }).mouseup(function(){
            $(this).removeClass('mousedown');
        }).click(function(){
            thisObject.headMoveLeft();
        })).append($('<div class="eb_headBarRightBtn"><div class="eb_arrow02R"></div></div>').mouseover(function(){
            $(this).addClass('mouseover');
        }).mouseout(function(){
            $(this).removeClass('mouseover');
        }).mousedown(function(){
            $(this).addClass('mousedown');
        }).mouseup(function(){
            $(this).removeClass('mousedown');
        }).click(function(){
            thisObject.headMoveRight();
        }));
        this.leftBtnObj = this.headBarBGObj.children('.eb_headBarLeftBtn');   //leftBtnObj
        this.rightBtnObj = this.headBarBGObj.children('.eb_headBarRightBtn');  //rightBtnObj
        this.bodyObjArr = {};                                                //bodyObjArr
        this.parent.children('.eb_tabPageBody').each(function(){
            var thisObj = this;
            thisObject.bodyObjArr[$(thisObj).attr('name')] = $(this);
        });
        for(var i in this.bodyObjArr){
            var title = '';
            var dataOptions = null;
            if(this.bodyObjArr[i].attr('title'))
                title = this.bodyObjArr[i].attr('title');
            if(this.bodyObjArr[i].data('options') && (dataOptions = (new Function('return {'+this.bodyObjArr[i].data('options')+'}'))()) && dataOptions.title)
                title = dataOptions.title;
            this.headBarObj.append($('<span class="eb_tabPageHead" name="'+i+'">'+title+'</span>').click(function(){
                var thisObj = this;
                if($(this).attr("class").indexOf(" on")<0){
                    var name = $(this).attr("name");
                    thisObject.select(name);
                }
                thisObject.setHeadBarView();
            }).append($('<div class="eb_tabPageCloseBtn">x</div>').click(function(){
                var name = $(this).parent().attr("name");
                thisObject.remove(name);
            }).mouseover(function(){
                $(this).addClass("mouseover");
            }).mouseout(function(){
                $(this).removeClass("mouseover");
            })).mouseover(function(){
                $(this).children('.eb_tabPageCloseBtn').show();
            }).mouseout(function(){
                $(this).children('.eb_tabPageCloseBtn').hide();
            }));
        }
        this.headObjArr = {};                                                 //headObjArr
        this.headBarObj.children(".eb_tabPageHead").each(function(){
            var thisObj = this;
            thisObject.headObjArr[$(thisObj).attr('name')] = $(this);
        });
        this.headBarObj.children(".eb_tabPageHead").first().addClass("on");    //将第一项设置为显示状态
        this.getBody(thisObject.headBarObj.children(".eb_tabPageHead").first()).show();           //将第一项设置为显示状态
        /*this.parent.children('.eb_tabPageBody').each(function(){
         var thisObj = this;
         if($(this).children('.eb_iframe').length>0){
         var src = '';
         var html = '';
         src = $(this).children('.eb_iframe').attr('src');
         html = html + '<iframe src="'+src+'" class="eb_iframe"></iframe>';
         $(this).html(html);
         }
         });*/
        this.setWidth();
        this.setHeight();
        this.toggleHeadBtn();
    };

    TabPage.prototype.getBody = function(headObj){
        var name = headObj.attr("name");
        var bodyObj = this.parent.children(".eb_tabPageBody[name='"+name+"']");
        return bodyObj;
    };

    TabPage.prototype.getBodyByNum = function(num){
        var thisObject = this;
        var length = thisObject.headBarObj.get(0).getElementsByTagName('span').length;
        if(num >= length)
            num = length-1;
        else if(num<0)
            num = 0;
        var name = $(thisObject.headBarObj.get(0).getElementsByTagName('span')[num]).attr("name");
        var bodyObj = this.parent.children(".eb_tabPageBody[name='"+name+"']");
        return bodyObj;
    };

    TabPage.prototype.setAction = function(){

    };

    $.fn.tabPage = function (option,param) {
        var result = null;
        var thisObj = this.each(function () {
            var $this = $(this)
                , thisObject = $this.data('tabPage')
                , dataOptions = typeof option == 'object' && option;
            if(typeof option == 'string' ){
                result = thisObject[option](param);
            }else{
                $this.data('tabPage', (thisObject = new TabPage(this, dataOptions)));
            }
        });
        if(typeof option == 'string' )return result;
        return thisObj;
    };

    $.fn.tabPage.defaults = {

    };

    $(window).on('load', function(){
        $(".eb_tabPage").each(function () {
            var thisObj = $(this)
                , dataOptionsStr = thisObj.data('options');
            if(!dataOptionsStr)
                thisObj.tabPage($.fn.tabPage.defaults);
            else
                thisObj.tabPage((new Function("return {" + dataOptionsStr + "}"))());
        });
    });
}(window.jQuery);
