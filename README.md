cri
==============
[cri](http://zhouzy.github.io/cri/) 类似于easyUI的一种前端框架，封装了各种jquery插件，例如：datagrid、tree、treegrid、window、tabpage、input。

###1.版本：

    v3.0

###2.项目管理工具：

    Grunt

###3.项目结构：

    cri

        --html(组件example页面)

        --script(JS CSS 源码)

            --func

                --cri

                    --css   (单css文件)

                    --final (生产环境,释出最终压缩混淆代码)

                    --js    (js源代码)

                    --less  (less源代码)

                    --test  (QUnit测试代码)

            --lib(依赖外部库)

###4.框架结构：

    Class

        --Widgets

            --Grid

                --DataGrid

                --TreeGrid

            --Tree

            --Window
