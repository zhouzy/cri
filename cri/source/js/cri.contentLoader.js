/**
 * Author zhouzy
 * Date   2015/4/8
 *
 * ContentLoader
 * ”√”⁄º”‘ÿHTML
 */
!function(window){

    "use strict";

    var cri = window.cri,
        $   = window.jQuery;

    var CONTENT_LOADER = 'content-loader';
    var _defaultOptions = {
        content:null,
        isIframe:false,
        onReady:null
    };

    var ContentLoader = cri.Widgets.extend(function($element,options){
        this.options = _defaultOptions;
        cri.Widgets.apply(this,arguments);
        this.$content.attr('data-role','content-loader');
    });

    $.extend(ContentLoader.prototype,{

        _init:function(){
            this._createBody();
        },

        _createBody:function(){
            this.$content = $('<div class="' + CONTENT_LOADER + '"></div>');
            this.$element.append(this.$content);
            this._load();
        },

        _load:function(){
            var iframe = true,
                that = this;
            //jQuery
            if(this.options.content instanceof jQuery){
                iframe = false;
            }
            //HTML
            else if(/^<\w+>.*/g.test(this.options.content)){
                iframe = false;
            }
            if(iframe){
                if(this.options.isIframe){
                    var iframeNode = document.createElement("iframe");
                    var shame = +new Date();
                    iframeNode.src = this.options.content;
                    iframeNode.id = 'id_' + shame;
                    iframeNode.name = 'name_' + shame;
                    if (iframeNode.attachEvent){
                        iframeNode.attachEvent("onload", function(){
                            that.options.callback && that.options.callback.call();
                        });
                    }
                    else {
                        iframeNode.onload = function(){
                            that.options.onReady && that.options.onReady.call();
                        };
                    }
                    this.$content.append(iframeNode);
                }
                else{
                    this.$content.load(this.options.content,function(){
                        that.options.onReady && that.options.onReady.call();
                    });
                }
            }
            else{
                this.$content.append(this.options.content);
                this.options.onReady && this.options.onReady.call();
            }
        },
        _destroy:function(){
            this.$content.remove();
        },

        getContent:function(){
            return this.$content;
        },

        show:function(){
            this.$content.show();
        },

        hide:function(){
            this.$content.hide();
        },

        reload:function(c,onReady){
            c && (this.options.content = c);
            onReady && (this.options.onReady = onReady);
            this._destroy();
            this._load();
        }
    });
    cri.ContentLoader = ContentLoader;
}(window);
