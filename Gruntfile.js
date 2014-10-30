module.exports = function (grunt) {
    // grunt 组件
    grunt.loadNpmTasks('grunt-contrib-less'); // 合并压缩 less 文件
    grunt.loadNpmTasks('grunt-contrib-concat'); // 合并 js 文件
    grunt.loadNpmTasks('grunt-contrib-uglify'); // 压缩 js 文件
    grunt.loadNpmTasks('grunt-contrib-watch'); // 动态执行任务
    grunt.loadNpmTasks('grunt-contrib-qunit');//js 单元测试

    // 配置
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // 合并压缩 less 文件
        // 文档 https://github.com/gruntjs/grunt-contrib-less
        less: {
            development: {
                options: {
                    yuicompress: false
                },
                files: {
                    "script/func/cri/css/datagrid.css": "script/func/cri/less/datagrid.less",
                    "script/func/cri/css/treegrid.css": "script/func/cri/less/treegrid.less",
                    "script/func/cri/css/tree.css": "script/func/cri/less/tree.less",
                    "script/func/cri/css/toolbar.css": "script/func/cri/less/toolbar.less",
                    "script/func/cri/css/pager.css": "script/func/cri/less/pager.less"
                }
            },
            production: {
                options: {
                    yuicompress: true
                },
                files:[{
                    src:["script/func/cri/less/*.less","!script/func/cri/less/lib.less","!script/func/cri/less/theme-default.less"],
                    dest:"script/func/cri/final/cri.min.css"
                }]
            }
        },
        // 合并 js css 文件
        // 文档 https://github.com/gruntjs/grunt-contrib-concat
        concat:{
            js:{
                files:[{
                    src: [
                        'script/func/cri/js/cri.framework.js',
                        'script/func/cri/js/cri.widgets.js',
                        'script/func/cri/js/cri.grid.js',
                        'script/func/cri/js/*.js'
                    ],
                    dest:'script/func/cri/final/cri.js'
                }]
            },
            css:{
                files:[{
                    src:["script/func/cri/css/*.css","!script/func/cri/css/easy-*.css","!script/func/cri/css/reset.css"],
                    dest:"script/func/cri/css/cri.css"
                }]
            }
        },
        // 压缩 js 文件
        // 文档 https://github.com/gruntjs/grunt-contrib-uglify
        uglify: {
            build: {
                files:[
                    {
                        src:['script/func/cri/final/cri.js'],
                        dest:'script/func/cri/final/cri.min.js'
                    }
                ]
            }
        },
        qunit:{
            all: {
                options: {
                    urls: [
                        'http://localhost:63342/easy-bootstrap/script/func/cri/test/datagrid/datagrid-test.html'
                    ]
                }
            }
        },
        // 监控文件变化并动态执行任务
        // 文档 https://github.com/gruntjs/grunt-contrib-watch
        watch: {
            scripts: {
                files: ['script/func/cri/js/*.js'],
                tasks: ['concat:js']
            },
            css: {
                files: ['script/func/cri/css/*.css'],
                tasks: ['concat:css']
            },
            less: {
                files: 'script/func/cri/less/*.less',
                tasks: ['less:production']
            }
        }
    });

    // 开发环境不压缩 可调用 `grunt dev`
    grunt.registerTask('dev', ['less:development','concat']);
    // 生产环境压缩 可调用 `grunt pro`
    grunt.registerTask('pro', ['less:production','concat:js','uglify']);
    // 注册以外部调用 `grunt`
    grunt.registerTask('default', ['dev']);
};