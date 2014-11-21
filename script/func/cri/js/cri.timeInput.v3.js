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
     * 获取某年的月份数组
     * @param year
     * @returns {number[]}
     */
    function getMonthArr (year){
        if(cri.isLeapYear(year))
            return [31,29,31,30,31,30,31,31,30,31,30,31];
        else
            return [31,28,31,30,31,30,31,31,30,31,30,31];
    }


    var _defaultOptions = {
        value:null,
        format:"yyyy/MM/dd HH:mm:ss"
    };

    var TimeInput = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        cri.Widgets.apply(this,arguments);
    });

    TimeInput.prototype._eventListen = function(){
    };

    TimeInput.prototype._init = function(){
        var $element = this.$element;
        $element.wrap('<div class="'+TIME_INPUT_GROUP+'"></div>');
        this.$timeInputGroup = $element.parent();
        this._wrapInput();
        this._timeSelectView();
    };

    /**
     * 生成Input
     * @private
     */
    TimeInput.prototype._wrapInput = function(){
        //TODO:value 类型为Date类型
        //TODO:format Date
        var that = this,
            value = this.options.value || new Date(),
            button = {iconCls:TIME_INPUT_ICON,handler:function(){
                that.selectView.toggle();
            }};

        this.input = new cri.Input(this.$element,{value:cri.formatDate(value,this.options.format),button:button,onFocus:function(){
            //TODO:展开timeSelectView
            that.selectView.toggle();
        }});
    };

    /**
     * 日期选择下拉面板
     * @private
     */
    TimeInput.prototype._timeSelectView = function(){
        var that = this;
        this.options.value = this.options.value || new Date();
        this.selectView = new TimeSelectView(this.$timeInputGroup,{
            value:this.options.value,
            HMS:this.options.HMS,
            onChange:function(){
                var date = this.getDate();
                that.input.value(cri.formatDate(date,that.options.format));
            }
        });
    };

    TimeInput.prototype.value = function(value){
        if(value == undefined){
            return this.input.value();
        }
        else{
            this.input.value(value);
            //TODO:刷新timeSelectView
        }
    };

    var TimeSelectView = function($parent,options){
        this.$parent = $parent;
        this.$timeBox = null;
        this.$daySelect = null;
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
                ss:date.getSeconds(),
                ww:date.getDay()
            }
        },options);
        this._create($parent);
    };

    TimeSelectView.prototype = {
        /**
         * 生成时间选择下拉面板
         * @returns {*|HTMLElement}
         * @private
         */
        _create:function($parent){
            var $timeBox = this.$timeBox = $('<div class="' + TIME_BOX + '" id="'+this.timeBoxId+'"></div>');
            var $titleBar = $('<div class="eb_titleBar"></div>');
            $titleBar.append(this._yearSelect(),this._monthSelect(),'<span style="position:absolute;top:5px;right:23px;">月</span>');
            $timeBox.append($titleBar,this._daySelect());
            if(this.options.HMS == true){
                $timeBox.append(this._hmsSelect());
            }
            $parent.append($timeBox);
        },

        _yearSelect : function(){
            var that = this;
            var date = this.options.date;
            var $yearSelect = $('<div class="eb_yearSelecter"></div>');
            var $minusBtn   = $('<span class="eb_toLastYear eb_yearButton">－</span>');
            var $plusBtn    = $('<span class="eb_toNextYear eb_yearButton">＋</span>');
            var $year       = $('<span class="eb_year">' + date.yyyy + '</span>');

            $minusBtn.on("click",function(){
                $year.html(--that.options.date.yyyy);
                that._change();
            });
            $plusBtn.on("click",function(){
                $year.html(++that.options.date.yyyy);
                that._change();
            });
            $yearSelect.append($minusBtn,$year,'年',$plusBtn);
            return $yearSelect;
        },

        _monthSelect : function(){
            var that = this,
                date = this.options.date,
                $select = $('<select name="month" class="eb_monthSelect">');

            $.each([1,2,3,4,5,6,7,8,9,10,11,12],function(index,value){
                value < 10 && (value = "0" + value);
                $select.append('<option value="' + index + '">' + value + '</option>');
            });
            $select.val(date.MM);

            $select.on("change",function(){
                date.MM = $select.val();
                that._refreshDaySelect();
                that._change();
            });

            return $select;
        },

        _daySelect:function(){
            var $daySelect = this.$daySelect = $('<table></table>'),
                $week = $('<tr class="week"></tr>'),
                week = {"Sunday":"日","Monday":"一","Tuesday":"二","Wednesday":"三",Thursday:"四","Friday":"五","Saturday":"六"},
                that = this;
            for(var day in week){
                var $day = $('<th>' + week[day] + '</th>');
                day == "Sunday" && $day.addClass("eb_red");
                day == "Saturday" && $day.addClass("red");
                $week.append($day);
            }
            $daySelect.append($week);
            for(var i=0; i<6; i++){
                var $tr = $('<tr class="days"></tr>');
                for(var j=0; j<7;j++){
                    var $td = $("<td></td>").on("click",function(){
                        var day = $(this).text();
                        if(day && day!=that.options.date.dd){
                            $('td.choosed',$daySelect).removeClass("choosed");
                            that.options.date.dd = +day;
                            $(this).addClass("choosed");
                            that._change();
                        }
                    });
                    $tr.append($td);
                }
                $daySelect.append($tr);
            }
            this._refreshDaySelect();
            return $daySelect;
        },

        /**
         * 当日期改变后，刷新daySelect
         * @private
         */
        _refreshDaySelect:function(){
            var date   = this.options.date,
                maxDay = getMonthArr(date.yyyy)[date.MM],
                shift  = new Date(date.yyyy,date.MM,1).getDay();
            $('td.choosed',this.$daySelect).removeClass("choosed");
            $('tr.days td',this.$daySelect).html("");
            for(var i=shift;i<maxDay+shift;i++){
                var rows = i%7,
                    cols = Math.floor(i/7),
                    $td = $('tr.days:eq("'+cols+'") td:eq("' + rows + '")',this.$daySelect),
                    day = i- shift + 1;
                $td.text(day);
                day == date.dd && $td.addClass("choosed");
            }
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

        /**
         * 当在非本元素范围内点击，收缩下拉框
         * @private
         */
        _clickBlank:function(){
            var that = this;
            $(document).mouseup(function(e) {
                var _con = that.$parent;
                if (!_con.is(e.target) && _con.has(e.target).length === 0) {
                    that.$timeBox.animate({
                        height:'hide'
                    },200);
                }
            });
        },

        toggle:function(){
            var that = this;
            this.$timeBox.animate({
                height:"toggle"
            },200,function(){
                if(!that.$timeBox.is(":hidden")){
                    that._clickBlank();
                }
            });
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
                ss:date.getSeconds(),
                ww:date.getDay()
            }
        }
    };
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
