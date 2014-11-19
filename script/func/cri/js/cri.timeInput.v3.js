/*=====================================================================================
 * easy-bootstrap-timeInput v2.0
 *
 * @author:niyq
 * @date:2013/09/05
 * @dependce:jquery
 *=====================================================================================*/
!function($){

    "use strict";

    var TIME_INPUT_GROUP = "eb_timeInputGroup",
        TIME_BOX    = "eb_timeBox";

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
        this.monthArr = [];
        this.ifEnable = true;
        this.value = "";

        //TODO:这个有BUG 如果未指定id 则是 undefined 并且出现多个相同的id
        this.id = this.$element.attr("id") || "";

        this.timeBoxId = "timeBox_"+this.id;

        this.title = "时间";
        if(this.$element.attr("title"))
            this.title = this.$element.attr("title");
        if(this.dataOptions.title)
            this.title = this.dataOptions.title;
        this.init();

    };

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
        var that = this;
        var $element = this.$element;
        this.dataOptions.required && $element.attr("placeholder",that.$element.attr("placeholder")+" (必填)");
        $element.wrap('<div class="'+TIME_INPUT_GROUP+'"></div>');
        var $timeInput = this.$timeInput = this.parent = $element.parent();
        $timeInput
            .data("timeInput",that)
            .attr("name",that.name)
            .attr("id",that.id + "_subgroup")
            .data("options",$element.data("options"));

        if(this.dataOptions && this.dataOptions.defaultVal){
            this.inputObj.val(that.dataOptions.defaultVal);
            this.parent.attr("value",that.dataOptions.defaultVal);
        }
        function _title(title){
            return $('<span class="eb_title">' + title + '</span>');
        }
        var $title = this.titleObj = _title(that.title);
        $timeInput.prepend($title);
        var redStar = '<span class="redStar" style="color:red;">*</span>';
        this.dataOptions && this.dataOptions.required == true && $timeInput.append(redStar);
        this.setWidth();
        this.setHeight();
        var timeBoxArea = $(".eb_timeBoxArea");
        if(timeBoxArea.length <= 0){
            $("body").prepend('<div class="eb_timeBoxArea"></div>');
            timeBoxArea = $(".eb_timeBoxArea");
        }
        timeBoxArea.append(that._timeBox());
        this.$element.click(function(){
            $(".eb_dropdownMenu.eb_show").hide().removeClass("eb_show");
            $(".eb_timeInput.focus").not(that.$element).removeClass('focus');
            that.toggleBox();
        });
        this.$element.focus(function(){
            that.$element.addClass("focus");
        });
        this.refreshDate();
        this.$element.on("click",function(){
            return false;
        });
    };

    TimeInput.prototype._timeBox = function(){
        var $timeBox = this.timeBoxObj = $('<div class="' + TIME_BOX + '" id="'+this.timeBoxId+'"></div>');
        var $titleBar = this.titleBarObj = $('<div class="eb_titleBar"></div>');
        $titleBar.append(this._yearSelect(),this._monthSelect(),'<span style="position:absolute;top:5px;right:23px;">月</span>');
        $timeBox.append($titleBar,this._daySelect());
        if(this.dataOptions.HMS == true){
            $timeBox.height($timeBox.height()+30);
            this.timeBoxObj.append(this._hmsSelect());
        }
        return $timeBox;
    };

    TimeInput.prototype._yearSelect = function(){
        var that = this;
        var $yearSelect = $('<div class="eb_yearSelecter"></div>');
        var $minusBtn   = $('<span class="eb_toLastYear eb_yearButton">－</span>');
        var $plusBtn    = $('<span class="eb_toNextYear eb_yearButton">＋</span>');
        var $year       = $('<span class="eb_year">' + this.year + '</span>');
        $minusBtn.on("click",function(){
            that.year--;
            $("#"+that.timeBoxId).find(".eb_year").html(that.year);
            that.refreshDate();
        });
        $plusBtn.on("click",function(){
            that.year++;
            $("#"+that.timeBoxId).find(".eb_year").html(that.year);
            that.refreshDate();
        });
        $yearSelect.append($minusBtn,$year,'年',$plusBtn);

        $(".eb_yearButton",$yearSelect)
            .on("mouseover",function(){
                $(this).addClass("mouseover");
            })
            .on("mouseout",function(){
                $(this).removeClass("mouseover");
            })
            .on("mousedown",function(){
                $(this).addClass("mousedown");
            })
            .on("mouseup",function(){
                $(this).removeClass("mousedown");
            });
        return $yearSelect;
    }

    TimeInput.prototype._monthSelect = function(){
        var that = this;
        var $select = $('<select name="month" class="eb_monthSelect">');
        "1,2,3,4,5,6,7,8,9,10,11,12".split(/,/).each(function(index,value){
            index<9 && (value += "");
            $select.append('<option value="' + value + '">' + value + '</option>');
        });
        $select.val(that.thisMonth);
        $select.on("change",function(){
            that.refreshDate();
        });
        return $select;
    }

    TimeInput.prototype._daySelect = function(){
        var $daySelect = $('<table></table>');
        var $week = $("<tr></tr>");
        var week = {"Sunday":"日","Monday":"一","Tuesday":"二","Wednesday":"三",Thursday:"四","Friday":"五","Saturday":"六"};
        for(var day in week) {
            var $day = '<th class="eb_' + day + '">' + week[day] + '</th>';
            day == "Sunday" && $day.addClass("eb_red");
            day == "Saturday" && $day.addClass("red");
            $week.append($day);
        }
        $daySelect.append($week);
        for(var i=0; i< 6; i++){
            var $tr = $("<tr></tr>");
            for(var j=0; j<7;j++){
                var $td = $("<td></td>").on("mouseover",function(){
                    $(this).addClass("eb_dateMouseover");
                }).on("mouseout",function(){
                    $(this).removeClass("eb_dateMouseover");
                });
                $tr.append($td);
            }
            $daySelect.append($tr);
        }
        return $daySelect;
    };

    TimeInput.prototype._hmsSelect = function(){
        var $hmsBar      = $('<div class="eb_HMSBar">'),
            $hourInput   = $('<input class="eb_HMSInput eb_Hour" value="00" />'),
            $minuteInput = $('<input class="eb_HMSInput eb_minute"  value="00" />'),
            $secondInput = $('<input class="eb_HMSInput eb_second"  value="00" />'),
            $okBtn       = $('<div class="timeInputOK">确定</div>'),
            $cancelBtn   = $('<div class="timeInputCancel">取消</div>'),
            that         = this;

        $hourInput.on("change",_handleNumF(0,23));
        $minuteInput.on("change",_handleNumF(0,59));
        $secondInput.on("change",_handleNumF(0,59));
        function _handleNumF(min,max){
            return function(){
                var value = +$(this).val();
                if(value>max){
                    $(this).val("59");
                }else if(value<min){
                    $(this).val("00");
                }
            };
        }

        $okBtn
            .on("mouseover",function(){
                $(this).addClass("mouseover");
            })
            .on("mouseout",function(){
                $(this).removeClass("mouseover");
            })
            .on("click",function(){
                var date = that.timeBoxObj.find(".choosed").html();
                if(!date)
                    date = "1";
                if(date<10 && date.length == 1)
                    date = "0"+date;
                var YMD = that.year + "-" + that.month + "-" + date;
                var hour = that.timeBoxObj.find(".eb_Hour").val();
                if(hour<10 && hour.length == 1)
                    hour = "0" + hour;
                var min = that.timeBoxObj.find(".eb_minute").val();
                if(min<10 && min.length == 1)
                    min = "0" + min;
                var second = that.timeBoxObj.find(".eb_second").val();
                if(second<10 && second.length == 1)
                    second = "0" + second;
                var HMS = hour + ":" + min + ":" + second;
                var result = YMD + "  " + HMS;
                that.setValue(result);
                that.timeBoxObj.hide().removeClass("show");
                that.$element.change();
            });

        $cancelBtn
            .on("mouseover",function(){
                $(this).addClass("mouseover");
            })
            .on("mouseout",function(){
                $(this).removeClass("mouseover");
            })
            .on("click",function(){
                that.timeBoxObj.hide().removeClass("show");
            });

        $hmsBar.append($hourInput,":",$minuteInput,":",$secondInput,$okBtn,$cancelBtn);
        $(".eb_HMSInput",$hmsBar)
            .on("focus",function(){
                $(this).addClass("focus");
                $(this).select();
            })
            .on("blur",function(){
                $(this).removeClass("focus");
            })
            .on("keydown",function(e){
                var keycode=e.keyCode||e.which||e.charCode;
                if((keycode>=48 && keycode<=57) || keycode == 8){
                    return true;
                }else{
                    return false;
                }
            });
        return $hmsBar;
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

    $.fn.timeInsput = function (option,param) {
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

}(window.jQuery);
