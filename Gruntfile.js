module.exports = function (grunt) {
    // 配置
    grunt.config.init({
        pkg: grunt.file.readJSON('package.json'),
        //编译 less 文件(https://github.com/gruntjs/grunt-contrib-less)
        less:{
            development:{
                options:{
                    yuicompress:false
                },
                files:{
                    "dest/cri.css":["src/less/*.less",
                        "!src/less/reset.less",
                        "!src/less/lib.less",
                        "!src/less/theme-default.less",
                        "!src/less/easybootstrap.less"]
                }
            },
            production:{
                options:{
                    yuicompress:true
                },
                files:{
                    "dest/cri.css":["src/less/*.less",
                        "!src/less/reset.less",
                        "!src/less/lib.less",
                        "!src/less/theme-default.less",
                        "!src/less/easybootstrap.less"]
                }
            }
        },
        //合并 js css 文件(文档 https://github.com/gruntjs/grunt-contrib-concat)
        concat:{
            js:{
                files:[{
                    src: [
                        'src/js/cri.framework.js',
                        'src/js/cri.widgets.js',
                        'src/js/cri.grid.js',
                        'src/js/*.js'
                        //'cri/source/js/cri.grid.js',
                    ],
                    dest:'dest/cri.js'
                }]
            }
        },
        // 压缩 js 文件(https://github.com/gruntjs/grunt-contrib-uglify)
        uglify: {
            build: {
                files:[
                    {
                        src:['dest/cri.js'],
                        dest:'dest/cri.min.js'
                    }
                ]
            }
        },

        tomcat_deploy: {
            host: '10.132.10.203',
            login: 'tomcat',
            password: 'tomcat',
            path: '/cri',
            port: '8180',
            dist: 'api',
            deploy: '/manager/deploy',
            undeploy: '/manager/undeploy'
        },

        zip: {
            cri:{
                dest:'api/download/cri.zip',
                src:['dest/**']
            }
        },

        //监控文件变化并动态执行任务(https://github.com/gruntjs/grunt-contrib-watch)
        watch: {
            scripts: {
                files: ['src/js/*.js'],
                tasks: ['concat:js']
            },
            less: {
                files: 'src/less/*.less',
                tasks: ['less:production','less:development']
            }/*,
            redeploy:{
                files: 'api/**',
                tasks: "tomcat_redeploy"
            },
            zip:{
                files: 'cri/source/cri/*.*',
                tasks: "zip:cri"
            }
            */
        }
    });
    // grunt 组件
    grunt.loadNpmTasks('grunt-contrib-less');   // 合并压缩 less 文件
    grunt.loadNpmTasks('grunt-contrib-concat'); // 合并 js 文件
    grunt.loadNpmTasks('grunt-contrib-uglify'); // 压缩 js 文件
    grunt.loadNpmTasks('grunt-contrib-watch');  // 动态执行任务
    grunt.loadNpmTasks('grunt-tomcat-deploy');  //发布
    grunt.loadNpmTasks('grunt-zip');  //发布

    // 开发环境不压缩 可调用 `grunt dev`
    grunt.registerTask('dev', ['less:development','concat:js','uglify']);
    // 生产环境压缩 可调用 `grunt pro`
    grunt.registerTask('pro', ['less:production','concat:js','uglify']);
    // 注册以外部调用 `grunt`
    grunt.registerTask('default', ['dev']);
};
