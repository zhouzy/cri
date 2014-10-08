module.exports = function (grunt) {
    // grunt 组件
    grunt.loadNpmTasks('grunt-contrib-less'); // 合并压缩 less 文件
    grunt.loadNpmTasks('grunt-contrib-concat'); // 合并 js 文件
    grunt.loadNpmTasks('grunt-contrib-uglify'); // 压缩 js 文件
    grunt.loadNpmTasks('grunt-contrib-watch'); // 动态执行任务

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
                    "script/func/easy-bootstrap/css/datagrid.css": "script/func/easy-bootstrap/less/datagrid.less",
                    "script/func/easy-bootstrap/css/treegrid.css": "script/func/easy-bootstrap/less/treegrid.less",
                    "script/func/easy-bootstrap/css/tree.css": "script/func/easy-bootstrap/less/tree.less",
                    "script/func/easy-bootstrap/css/toolbar.css": "script/func/easy-bootstrap/less/toolbar.less",
                    "script/func/easy-bootstrap/css/pager.css": "script/func/easy-bootstrap/less/pager.less"
                }
            },
            production: {
                options: {
                    yuicompress: true
                },
                files: {
                    "script/func/easy-bootstrap/css/datagrid.css": "script/func/easy-bootstrap/less/datagrid.less",
                    "script/func/easy-bootstrap/css/treegrid.css": "script/func/easy-bootstrap/less/treegrid.less",
                    "script/func/easy-bootstrap/css/tree.css": "script/func/easy-bootstrap/less/tree.less",
                    "script/func/easy-bootstrap/css/toolbar.css": "script/func/easy-bootstrap/less/toolbar.less",
                    "script/func/easy-bootstrap/css/pager.css": "script/func/easy-bootstrap/less/pager.less"
                }
            }
        },
        // 合并 js css 文件
        // 文档 https://github.com/gruntjs/grunt-contrib-concat
        concat: {
            js: {
                options:{
                    separator:";"
                },
                src: [
                    'script/func/easy-bootstrap/js/version3/js/version3/*.js'
                ],
                dest:'script/func/easy-bootstrap/js/cri.js'
            },
            css:{
                src:["script/func/easy-bootstrap/css/*.css","!script/func/easy-bootstrap/css/easy-*.css","!script/func/easy-bootstrap/css/reset.css"],
                dest:"script/func/easy-bootstrap/css/cri.css"
            }
        },
        // 压缩 js 文件
        // 文档 https://github.com/gruntjs/grunt-contrib-uglify
        uglify: {
            build: {
                files: {
                    // concat 任务合并后的文件路径 可同名
                    'public/javascripts/func/main.min.js': ['public/javascripts/func/main.js']
                }
            }
        },

        // 监控文件变化并动态执行任务
        // 文档 https://github.com/gruntjs/grunt-contrib-watch
        watch: {
            scripts: {
                files: ['script/func/easy-bootstrap/js/version3/js/version3/*.js'],
                tasks: ['concat:js']
            },
            css: {
                files: ['script/func/easy-bootstrap/css/*.css'],
                tasks: ['concat:css']
            },
            less: {
                files: 'script/func/easy-bootstrap/less/*.less',
                tasks: ['less']
            }
        }
    });

    // 开发环境不压缩 可调用 `grunt dev`
    grunt.registerTask('dev', ['concat', 'uglify', 'less:development']);
    // 生产环境压缩 可调用 `grunt pro`
    grunt.registerTask('pro', ['concat', 'uglify']);
    // 注册以外部调用 `grunt`
    grunt.registerTask('default', ['dev']);
};