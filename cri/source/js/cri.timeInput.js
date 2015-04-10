/**
 * Author zhouzy
 * Date   2014/9/18
 * TimeInput 组件
 *
 */
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
        format:"yyyy/MM/dd hh:mm:ss",
        HMS:false,
        enable:true
    };

    var TimeInput = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        this.date  = null;
        this.input = null;
        this.selectView = null;
        cri.Widgets.apply(this,arguments);
        this.$element.attr('data-role','timeinput');
    });

    TimeInput.prototype._init = function(){
        if(!this.options.HMS && this.options.format){
            this.options.format = this.options.format.replace(/\s*[Hh].*$/,"");
        }
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

        this.input = new cri.Input(this.$element,{
            readonly:true,
            value:cri.formatDate(value,this.options.format),
            button:button,
            enable:this.options.enable,
            onFocus:function(){
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
                that.options.change && that.options.change.call(that);
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

    /**
     * 销毁组件
     * @private
     */
    TimeInput.prototype._destroy = function(){
        this.selectView._destroy();
        this.$timeInputGroup.replaceWith(this.$element);
        this.input = null;
        this.selectView = null;
    };

    /**
     * 使输入框不能用
     */
    TimeInput.prototype.disable=function(){
        this.input.disable();
    };

    /**
     * 使输入框可用
     */
    TimeInput.prototype.enable=function(){
        this.input.enable();
    };

    /**
     * 获取设置时间输入框的值
     * @param value
     * @returns {*|Date}
     */
    TimeInput.prototype.value = function(value){
        if(value == undefined){
            return this.date;
        }
        else{
            this._setValue(value);
        }
    };

    /**
     * 时间输入框下拉面板
     * @param $parent
     * @param options
     * @constructor
     */
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

            var left = $parent.offset().left + 80;
            var top = $parent.offset().top + 28;

            $("body").append($timeBox.css({top:top,left:left}));
        },

        /**
         * 年份选择
         * @returns {*|jQuery|HTMLElement}
         * @private
         */
        _yearSelect : function(){
            var that = this;
            var date = this.date;
            var $yearSelect = $('<div class="eb_yearSelecter"></div>');
            var $minusBtn   = $('<i class="eb_toLastYear eb_yearButton fa fa-minus"></i>');
            var $plusBtn    = $('<i class="eb_toNextYear eb_yearButton fa fa-plus"></i>');
            var $year       = $('<span class="eb_year">' + date.yyyy + '</span>');
            this.$year = $year;
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

        /**
         * 月份选择
         * @returns {*|jQuery|HTMLElement}
         * @private
         */
        _monthSelect:function(){
            var that = this,
                date = this.date,
                $select = $('<select class="eb_monthSelect">');
            this.$month = $select;
            $.each([1,2,3,4,5,6,7,8,9,10,11,12],function(index,value){
                value < 10 && (value = "0" + value);
                $select.append('<option value="' + index + '">' + value + '</option>');
            });
            $select.val(date.MM);
            $select.on("change",function(){
                that.date.MM = $select.val();
                that._refreshDaySelect();
                that._change();
            });
            return $select;
        },

        /**
         * 日期选择
         * @returns {*|jQuery|HTMLElement}
         * @private
         */
        _daySelect:function(){
            var $daySelect = this.$daySelect = $('<table></table>'),
                $week = $('<tr class="week"></tr>'),
                week = {"Sunday":"日","Monday":"一","Tuesday":"二","Wednesday":"三",Thursday:"四","Friday":"五","Saturday":"六"},
                that = this;
            this.$day = $daySelect;

            for(var day in week){
                var $day = $('<th>' + week[day] + '</th>');
                day == "Sunday" && $day.addClass("eb_red");
                day == "Saturday" && $day.addClass("red");
                $week.append($day);
            }
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

        /**
         * 时间选择
         * @returns {*|jQuery|HTMLElement}
         * @private
         */
        _hmsSelect:function(){
            var $hmsBar      = $('<div class="eb_HMSBar">'),
                $hourInput   = $('<input class="eb_HMSInput eb_Hour"/>').val(this.date.HH),
                $minuteInput = $('<input class="eb_HMSInput eb_minute"/>').val(this.date.mm),
                $secondInput = $('<input class="eb_HMSInput eb_second"/>').val(this.date.ss),
                that         = this;
            this.$hour = $hourInput;
            this.$minute = $minuteInput;
            this.$second = $secondInput;
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
                var _con = that.$timeBox;
                if (!_con.is(e.target) && _con.has(e.target).length === 0) {
                    that.$timeBox.slideUp(200);
                }
            });
        },
        /**
         * 设置position显示时在屏幕中的位置
         * @private
         */
        _setPosition:function(){
            var left = this.$parent.offset().left + 80;
            var top = this.$parent.offset().top + 28;
            this.$timeBox.css({top:top,left:left});
        },

        /**
         * 销毁时间选择面板
         * @private
         */
        _destroy : function(){
            this.$timeBox.remove();
        },

        /**
         * 展开收缩时间选择面板
         */
        toggle:function(){
            var that = this;
            this._setPosition();
            if(this.$timeBox.is(":hidden")){
                this.$timeBox.slideDown(200,function(){
                    that._clickBlank();
                });
            }
            else{
                this.$timeBox.slideUp(200);
            }
        },

        /**
         * 获取时间选择面板中保存的日期
         * @returns {Date}
         */
        getDate:function(){
            var date = this.date;
            return new Date(date.yyyy,date.MM,date.dd,date.HH,date.mm,date.ss);
        },

        /**
         * 设置时间选择面板各个选择项的值
         * @param date
         */
        setDate:function(date){
            this.date = cri.date2Json(date);
            this.$year.text(this.date.yyyy);
            this.$month.val(this.date.MM);
            this._refreshDaySelect();
            if(this.options.HMS) {
                this.$hour.val(this.date.HH);
                this.$minute.val(this.date.mm);
                this.$second.val(this.date.ss);
            }
        }
    };

    $.fn.timeInput = function (option) {
        var o = null;
        this.each(function () {
            var $this = $(this),
                options = typeof option == 'object' && option;
            o = $this.data('timeInput');
            if(o != null){
                o._destroy();
            }
            $this.data('timeInput', (o = new TimeInput(this, options)));
        });
        return o;
    };

}(window);
