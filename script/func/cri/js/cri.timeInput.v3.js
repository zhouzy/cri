/*=====================================================================================
 * easy-bootstrap-timeInput v2.0
 *
 * @author:niyq
 * @date:2013/09/05
 * @dependce:jquery
 *=====================================================================================*/
!function(window){

    "use strict";

    var cri = window.cri,
        $   = window.jQuery;

    var TIME_INPUT_GROUP = "eb_timeInputGroup",
        TIME_BOX         = "eb_timeBox",
        TIME_INPUT_ICON  = "fa fa-table";

    function getDate(yyyy,MM,dd,HH,mm,ss){
        var date = new Date();
        date.setFullYear(yyyy);
        date.setMonth(MM);
        date.setDate(dd);
        date.setHours(HH);
        date.setMinutes(mm);
        date.setSeconds(ss);
        return date;
    }
    /**
     * 判断是否为闰年
     * @param year
     * @returns {boolean}
     */
    function isLeapYear(year){
        if(year%4==0 && (year%100!= 0 || year%400 == 0))
            return true;
        else
            return false;
    }

    /**
     * 获取某年的月份数组
     * @param year
     * @returns {number[]}
     */
    function getMonthArr (year){
        if(isLeapYear(year))
            return [31,29,31,30,31,30,31,31,30,31,30,31];
        else
            return [31,28,31,30,31,30,31,31,30,31,30,31];
    }

    var TimeSlectView = function(options){
        var date = new Date();
        this.options = $.extend({
            HMS:false,
            onChange:null,
            date:{
                yyyy:date.getFullYear(),
                MM:date.getMonth(),
                dd:date.getDate(),
                HH:date.getHours(),
                mm:date.getMinutes(),
                ss:date.getSeconds()
            }
        },options);

        this._create();
    };

    TimeSlectView.prototype = {
        /**
         * 生成时间选择下拉面板
         * @returns {*|HTMLElement}
         * @private
         */
        _create:function(){
            var $timeBox = this.$timeBox = $('<div class="' + TIME_BOX + '" id="'+this.timeBoxId+'"></div>');
            var $titleBar = $('<div class="eb_titleBar"></div>');
            $titleBar.append(this._yearSelect(),this._monthSelect(),'<span style="position:absolute;top:5px;right:23px;">月</span>');
            $timeBox.append($titleBar,this._daySelect());
            if(this.options.HMS == true){
                $timeBox.append(this._hmsSelect());
            }
            return $timeBox;
        },

        _yearSelect : function(){
            var that = this;
            var date = this.options.date;
            var $yearSelect = $('<div class="eb_yearSelecter"></div>');
            var $minusBtn   = $('<span class="eb_toLastYear eb_yearButton">－</span>');
            var $plusBtn    = $('<span class="eb_toNextYear eb_yearButton">＋</span>');
            var $year       = $('<span class="eb_year">' + date.yyyy + '</span>');

            $minusBtn.on("click",function(){
                $year.html(--that.yyyy);
                that._change();
            });
            $plusBtn.on("click",function(){
                $year.html(++that.yyyy);
                that._change();
            });
            $yearSelect.append($minusBtn,$year,'年',$plusBtn);
            return $yearSelect;
        },

        _monthSelect : function(){
            var that = this,
                date = this.options.date,
                $select = $('<select name="month" class="eb_monthSelect">');

            $.each([0,1,2,3,4,5,6,7,8,9,10,11],function(index,value){
                index<9 && (value += "");
                $select.append('<option value="' + value + '">' + (value+1) + '</option>');
            });
            $select.val(date.mm);

            $select.on("change",function(){
                date.mm = $select.val();
                that._refreshDaySelect();
                that._change();
            });

            return $select;
        },

        _daySelect:function(){
            var $daySelect = $('<table></table>');
            var $week = $('<tr class="week"></tr>');
            var week = {"Sunday":"日","Monday":"一","Tuesday":"二","Wednesday":"三",Thursday:"四","Friday":"五","Saturday":"六"};
            for(var day in week){
                var $day = $('<th>' + week[day] + '</th>');
                day == "Sunday" && $day.addClass("eb_red");
                day == "Saturday" && $day.addClass("red");
                $week.append($day);
            }
            $daySelect.append($week);
            for(var i=0; i< 6; i++){
                var $tr = $('<tr class="days"></tr>');
                for(var j=0; j<7;j++){
                    var $td = $("<td></td>").on("click",function(){
                            //TODO:选择天数
                            //TODO:排除空td
                        });
                    $tr.append($td);
                }
                $daySelect.append($tr);
            }
            return $daySelect;
        },

        _refreshDaySelect:function(){
            //TODO:当月份改变后，每月的天数改变
            var date = this.options.date;
            var maxDay = getMonthArr(date.yyyy)[date.MM];

        },

        _hmsSelect:function(){
            var $hmsBar      = $('<div class="eb_HMSBar">'),
                $hourInput   = $('<input class="eb_HMSInput eb_Hour" value="00" />'),
                $minuteInput = $('<input class="eb_HMSInput eb_minute"  value="00" />'),
                $secondInput = $('<input class="eb_HMSInput eb_second"  value="00" />'),
                date         = this.options.date,
                that         = this;

            $hourInput.on("change",_handleNumF(0,23));
            $minuteInput.on("change",_handleNumF(0,59));
            $secondInput.on("change",_handleNumF(0,59));
            function _handleNumF(min,max){
                return function(){
                    var value = +$(this).val();
                    if(value>max){
                        $(this).val(max);
                    }
                    else if(value<min){
                        $(this).val(min);
                    }
                    date.HH = +$hourInput.val();
                    date.mm = +$minuteInput.val();
                    date.ss = +$secondInput.val();
                    that._change();
                };
            }

            $hmsBar.append($hourInput,":",$minuteInput,":",$secondInput);
            $(".eb_HMSInput",$hmsBar).on("keydown",function(e){
                var keycode=e.keyCode||e.which||e.charCode;
                if((keycode>=48 && keycode<=57) || keycode == 8){
                    return true;
                }else{
                    return false;
                }
            });
            return $hmsBar;
        },

        _change:function(){
            this.options.onChange && this.options.onChange.call(this);
        },

        getDate:function(){
            var date = this.options.date;
            return getDate(date.yyyy,date.MM,date.dd,date.HH,date.mm,date.ss);
        },

        setDate:function(date){
            this.options.date = {
                yyyy:date.getFullYear(),
                MM:date.getMonth(),
                dd:date.getDate(),
                HH:date.getHours(),
                mm:date.getMinutes(),
                ss:date.getSeconds()
            }
        }
    };

    var _defaultOptions = {
        value:null,
        format:"yyyy/MM/dd"
    };

    var TimeInput = cri.Widgets.extend(function(element,dataOptions){
        cri.Widgets.apply(this,arguments);
    });

    TimeInput.prototype._eventListen = function(){
        this.$element.keypress(function(){return false;}).val("");
    };

    TimeInput.prototype._init = function(){
        var that = this,
            $element = this.$element,
            op = this.options;

        $element.wrap('<div class="'+TIME_INPUT_GROUP+'"></div>');

        var $timeInputGroup = this.$timeInputGroup = $element.parent();

        this._wrapInput();

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

    /**
     * 包装Input
     * @private
     */
    TimeInput.prototype._wrapInput = function(){
        //TODO:value 类型为Date类型
        //TODO:format Date
        var value = this.options || new Date();
        var buttons = [{iconCls:TIME_INPUT_ICON,handler:function(){
            //TODO:展开timeSelectView
        }}];
        this.input = new cri.Input(this.$element,{value:""+value,button:buttons});
    };

    /**
     * 包装时期选择下拉面板
     * @private
     */
    TimeInput.prototype._timeSelectView = function(){
        var selectView = new TimeSlectView();
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

    TimeInput.prototype.enabled = function(){
        this.ifEnable = true;
    };

    TimeInput.prototype.disabled = function(){
        this.ifEnable = false;
    };

    TimeInput.prototype.refreshDate = function(){
        var that = this,
            $timeBox = this.$timeBox;

        this.$timeBox.find(".choosed").removeClass("choosed");

        this.$timeBox.find("table td").html("").unbind("click");

        this.month = this.monthSelectObj.val();

        var maxDay = getMonthArr(this.year)[this.month-1];

        var firstDay = new Date(this.year,this.month-1,1).getDay();

        var index = firstDay%7;

        for(var i=0;i<maxDay;i++){

            $timeBox.find("table td").eq(index).html(i+1);

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
            }else if(this.year == this.thisYear && this.month == this.thisMonth && i+1 ==that.today){
                $("#"+this.timeBoxId).find(".choosed").removeClass("choosed");
                $("#"+this.timeBoxId).find("table td").eq(index).addClass('choosed');
            }
            if(that.dataOptions.HMS != true){
                $timeBox.find("table td").eq(index).click(function(){
                    $timeBox.find(".choosed").removeClass("choosed");
                    $(this).addClass("choosed");
                    that.date = $(this).html();
                    if(that.date<10)
                        that.date = "0" +that.date;
                    var data = that.year + "-" + that.month + "-" + that.date;
                    that.setValue(data);
                    that.timeBoxObj.hide().removeClass("show");
                    that.$element.change();
                });
            }
            else{
                $timeBox.find("table td").eq(index).click(function(){
                    that.date = $(this).html();
                    if(that.date<10)
                        that.date = "0" +that.date;
                    var data =that.year + "-" +that.month + "-" +that.date;
                    $timeBox.find(".choosed").removeClass("choosed");
                    $(this).addClass("choosed");
                });
            }
            index++;
        }
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

    TimeInput.prototype.value = function(value){
        if(value == undefined){
            return this.inputObj.val();
        }
        else{
            this.inputObj.val(value);
            this.parent.attr("value",value);
        }
    };

    TimeInput.prototype.clearValue = function(){
        this.setValue("");
    };

    TimeInput.prototype.check = function(){
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
        this.$timeBox.css({"left":left,"top":top+this.$element.height()+3});
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

}(window);
