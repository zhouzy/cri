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
        format:"yyyy/MM/dd",
        HMS:false
    };

    var TimeInput = cri.Widgets.extend(function(element,options){
        if(!options.HMS && options.format){
            options.format = options.format.replace(/\s*[Hh].*$/,"");
        }
        this.options = _defaultOptions;
        this.date  = null;
        this.input = null;
        this.selectView = null;
        cri.Widgets.apply(this,arguments);
    });

    TimeInput.prototype._init = function(){
        var $element = this.$element.attr("role","timeInput");
        $element.wrap('<div class="'+TIME_INPUT_GROUP+'"></div>');
        this.$timeInputGroup = $element.parent();
        this.date = this.options.value || new Date();
        this._wrapInput();
        this._timeSelectView();
    };

    /**
     * 生成Input
     * @private
     */
    TimeInput.prototype._wrapInput = function(){
        var that = this,
            value = this.date,
            button = {iconCls:TIME_INPUT_ICON,handler:function(){
                that.selectView.toggle();
            }};

        this.input = new cri.Input(this.$element,{readonly:true,value:cri.formatDate(value,this.options.format),button:button,onFocus:function(){
            that.selectView.toggle();
        }});
    };

    /**
     * 日期选择下拉面板
     * @private
     */
    TimeInput.prototype._timeSelectView = function(){
        var that = this,
            date = this.date;
        this.selectView = new TimeSelectView(this.$timeInputGroup,{
            value:date,
            HMS:this.options.HMS,
            onChange:function(){
                that.date = this.getDate();
                that.input.value(cri.formatDate(that.date,that.options.format));
            }
        });
    };

    /**
     * 设置值
     * @private
     */
    TimeInput.prototype._setValue = function(value){
        this.date = value;
        this.input.value(cri.formatDate(value,this.options.format));
        this.selectView.setDate(value);
    };

    TimeInput.prototype.value = function(value){
        if(value == undefined){
            return this.date;
        }
        else{
            this._setValue(value);
        }
    };

    var TimeSelectView = function($parent,options){
        this.$parent = $parent;
        this.$timeBox = null;
        this.$daySelect = null;
        this.options = $.extend({
            value:new Date(),
            HMS:false,
            onChange:null
        },options);
        this.date = cri.date2Json(this.options.value);
        this._create($parent);
    };

    TimeSelectView.prototype = {
        /**
         * 生成时间选择下拉面板
         * @returns {*|HTMLElement}
         * @private
         */
        _create:function($parent){
            var $timeBox = this.$timeBox = $('<div class="' + TIME_BOX + '"></div>');
            var $titleBar = $('<div class="eb_titleBar"></div>');
            $titleBar.append(
                this._yearSelect(),
                this._monthSelect(),
                '<span style="position:absolute;top:5px;right:23px;">月</span>');
            $timeBox.append($titleBar,this._daySelect());
            if(this.options.HMS == true){
                $timeBox.append(this._hmsSelect());
            }
            $parent.append($timeBox);
        },

        _yearSelect : function(){
            var that = this;
            var date = this.date;
            var $yearSelect = $('<div class="eb_yearSelecter"></div>');
            var $minusBtn   = $('<i class="eb_toLastYear eb_yearButton fa fa-minus"></i>');
            var $plusBtn    = $('<i class="eb_toNextYear eb_yearButton fa fa-plus"></i>');
            var $year       = $('<span class="eb_year">' + date.yyyy + '</span>');

            $minusBtn.on("click",function(){
                $year.html(--that.date.yyyy);
                that._change();
            });
            $plusBtn.on("click",function(){
                $year.html(++that.date.yyyy);
                that._change();
            });
            $yearSelect.append($minusBtn,$year,'年',$plusBtn);
            return $yearSelect;
        },

        _monthSelect:function(){
            var that = this,
                date = this.date,
                $select = $('<select class="eb_monthSelect">');

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
                        if(day && day!=that.date.dd){
                            $('td.choosed',$daySelect).removeClass("choosed");
                            that.date.dd = +day;
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
            var date   = this.date,
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
                day == this.date.dd && $td.addClass("choosed");
            }
        },

        _hmsSelect:function(){
            var $hmsBar      = $('<div class="eb_HMSBar">'),
                $hourInput   = $('<input class="eb_HMSInput eb_Hour" value="00" />'),
                $minuteInput = $('<input class="eb_HMSInput eb_minute"  value="00" />'),
                $secondInput = $('<input class="eb_HMSInput eb_second"  value="00" />'),
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
                    that.date.HH = +$hourInput.val();
                    that.date.mm = +$minuteInput.val();
                    that.date.ss = +$secondInput.val();
                    that._change();
                };
            }
            $hmsBar.append($hourInput,":",$minuteInput,":",$secondInput);
            $(".eb_HMSInput",$hmsBar).on("keydown",function(e){
                var keycode = e.keyCode || e.which || e.charCode;
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
            var date = this.date;
            return new Date(date.yyyy,date.MM,date.dd,date.HH,date.mm,date.ss);
        },

        setDate:function(date){
            this.date = cri.date2Json(date);
        }
    };

    $.fn.timeInput = function (option) {
        var o = null;
        this.each(function () {
            var $this = $(this),
                options = typeof option == 'object' && option;
            o = $this.data('timeInput');
            if(o != null){
                o._destory();
            }
            $this.data('timeInput', (o = new TimeInput(this, options)));
        });
        return o;
    };

}(window);