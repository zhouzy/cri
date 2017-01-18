/**
 * Author zhouzy
 * Date   2014/9/18
 * TimeInput 组件
 * 依赖Input组件
 */
!function(window){

    "use strict";

    var cri = window.cri,
        $   = window.jQuery;

    var TIME_INPUT_GROUP = "timeInputGroup",
        TIME_BOX         = "timeBox",
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
        HMS:false,
        enable:true
    };

    var TimeInput = cri.Widgets.extend(function(element,options){
        this.options = _defaultOptions;
        this.date  = null;
        this.input = null;
        this.selectView = null;
        cri.Widgets.apply(this,arguments);
        this.$element.attr('data-role','timeInput');
    });

    TimeInput.prototype._init = function(){
        if(this.options.format && /hh|ss/.test(this.options.format)){
            this.options.HMS = true;
        }
        this.date = this.options.value || new Date();

        if(!(this.date instanceof Date)){
            this.date = cri.string2Date(this.date)
        }

        this._wrapInput();
        this.$timeInputGroup = this.$element.closest('.input-group').addClass(TIME_INPUT_GROUP);
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
            enable:this.options.enable
        });
        this.$element.click(function(){
            that.selectView.toggle();
        });
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
     * 获取格式化后日期字符串
     */
    TimeInput.prototype.getFormatValue = function(){
        return this.$element.val();
    };

    /**
     * 获取设置时间输入框的值
     * @param value String|Date
     * @returns {*|Date}
     */
    TimeInput.prototype.value = function(value){
        if(value == undefined){
            return this.date;
        }
        else{
            if(value instanceof Date){
                this._setValue(value);
            }
            else{
                this._setValue(cri.string2Date(value));
            }
        }
    };

    /**
     * @param: errorMsg 异常提示
     * @private
     */
    TimeInput.prototype._showValidateMsg=function(errorMsg){
        this.input && this.input._showValidateMsg(errorMsg);
    };

    TimeInput.prototype._hideValidateMsg=function(){
        this.input && this.input._hideValidateMsg();
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
            var $timeBox = this.$timeBox = $('<div class="container-fluid ' + TIME_BOX + '"></div>');
            var $titleBar = $('<div class="titleBar form-inline"></div>');
            var $row = $('<div class="row"></div>');
            $titleBar.append(
                this._yearSelect(),
                this._monthSelect());
            $timeBox.append($row.append($titleBar),this._daySelect());
            if(this.options.HMS == true){
                $timeBox.append($('<div class="row"></div>').append(this._hmsSelect()));
            }
            $("body").append($timeBox);
        },

        /**
         * 年份选择
         * @returns {*|jQuery|HTMLElement}
         * @private
         */
        _yearSelect : function(){
            var that = this;
            var date = this.date;
            var $yearSelect = $('<div class="year_Selecter col-sm-8"></div>');
            var $minusBtn   = $('<span class="input-group-btn"><button class="btn btn-default" type="button">-</button></span>');
            var $plusBtn    = $('<span class="input-group-btn"><button class="btn btn-default" type="button">+</button></span>');
            var $year       = $('<input class="form-control" readonly/>').val(date.yyyy + '年');
            this.$year = $year;
            var $yearInputGroup = $('<div class="input-group input-group-sm"></div>');
            $minusBtn.on("click",function(){
                $year.val(--that.date.yyyy + '年');
                that._change();
            });
            $plusBtn.on("click",function(){
                $year.val(++that.date.yyyy + '年');
                that._change();
            });
            $yearInputGroup.append($minusBtn,$year,$plusBtn);
            $yearSelect.append($yearInputGroup);
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
                $select = $('<select class="form-control month_Select">');
            var $selectWrap = $('<div class="col-sm-4"></div>');
            var $inputGroup = $('<div class="input-group-sm"></div>');

            this.$month = $select;
            $.each([1,2,3,4,5,6,7,8,9,10,11,12],function(index,value){
                value < 10 && (value = "0" + value);
                $select.append('<option value="' + index + '">' + value + '</option>');
            });
            $select.val(date.MM).on("change",function(){
                that.date.MM = $select.val();
                that._refreshDaySelect();
                that._change();
            });
            return $selectWrap.append($inputGroup.append($select,'<span class="control-label">月</span>'));
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
                day == "Sunday" && $day.addClass("red");
                day == "Saturday" && $day.addClass("red");
                $week.append($day);
            }
            for(var i=0; i<6; i++){
                var $tr = $('<tr class="days"></tr>');
                for(var j=0; j<7;j++){
                    var $td = $("<td></td>").on("click",function(){
                        var day = $(this).find(".day-content").text();
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
                $td.append('<div class="day-content">' + day + '</div>');
                day == this.date.dd && $td.addClass("choosed");
            }
        },

        /**
         * 时间选择
         * @returns {*|jQuery|HTMLElement}
         * @private
         */
        _hmsSelect:function(){
            var that = this,
                $hmsBar = $('<div class="HMSBar form-inline"></div>'),
                $hour   = $('<input class="form-control hour"/>'),
                $minute = $('<input class="form-control minute"/>'),
                $second = $('<input class="form-control second"/>');
            $hmsBar.append($('<div class="col-sm-4"></div>').append($hour));
            $hmsBar.append($('<div class="col-sm-4"></div>').append($minute));
            $hmsBar.append($('<div class="col-sm-4"></div>').append($second));

            this.hour = $hour.numberInput({
                min:0,
                max:23,
                value:this.date.HH,
                onChange:function(){
                    that.date.HH = this.value();
                    that._change();
                }
            });
            $hour.before('<span class="input-group-addon">时</span>');
            this.minute = $minute.numberInput({
                min:0,
                max:59,
                value:this.date.mm,
                onChange:function(){
                    that.date.mm = this.value();
                    that._change();
                }
            });
            $minute.before('<span class="input-group-addon">分</span>');
            this.second = $second.numberInput({
                min:0,
                max:59,
                value:this.date.ss,
                onChange:function(){
                    that.date.ss = this.value();
                    that._change();
                }
            });
            $second.before('<span class="input-group-addon">秒</span>');
            $hmsBar.find(".form-group").addClass("form-group-sm");
            return $hmsBar;
        },

        _change:function(){
            this.options.onChange && this.options.onChange.call(this);
        },

        /**
         * 设置position显示时在屏幕中的位置
         * @private
         */
        _setPosition:function(){
            var left = this.$parent.offset().left + this.$parent.find('label').outerWidth();
            var top = this.$parent.offset().top + 34;
            var scrollHeight = document.body.scrollHeight;
            this.$timeBox.removeClass('top');
            if(top + 250 > scrollHeight){
                top = top - 34 - 250;
                this.$timeBox.addClass('top');
            }
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
                var cb = function(e){
                    var _con = that.$timeBox;
                    if (!_con.is(e.target) && _con.has(e.target).length === 0) {
                        that.$timeBox.slideUp(200);
                        $(document).off('mouseup',cb);
                    }
                };
                if(this.$timeBox.is('.top')){
                    this.$timeBox.show();
                    $(document).on('mouseup',cb);
                }else{
                    this.$timeBox.slideDown(200,function(){
                        $(document).on('mouseup',cb);
                    });
                }
            }
            else{
                this.$timeBox.is('.top') ? this.$timeBox.hide() : this.$timeBox.slideUp(200);
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
            if(this.options.HMS){
                this.hour.value(this.date.HH);
                this.minute.value(this.date.mm);
                this.second.value(this.date.ss);
            }
        }
    };

    $.fn.timeInput = function (option) {
        var widget = null;
        this.each(function () {
            var $this = $(this),
                options = typeof option == 'object' && option;
            widget = $this.data('widget');
            if(widget != null){
                widget._destroy();
            }
            $this.data('widget', (widget = new TimeInput(this, options)));
        });
        return widget;
    };

}(window);
