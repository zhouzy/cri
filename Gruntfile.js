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
                    "cri/source/cri/cri.css":["cri/source/less/reset.less","cri/source/less/*.less", "!cri/source/less/lib.less", "!cri/source/less/heme-default.less","!cri/source/less/easybootstrap.less"]
                }
            },
            production:{
                options:{
                    rootpath:"cri/source/less/",
                    yuicompress:true
                },
                files:{
                    "cri/source/cri/cri.css":["cri/source/less/reset.less","cri/source/less/*.less", "!cri/source/less/lib.less", "!cri/source/less/heme-default.less","!cri/source/less/easybootstrap.less"]
                }
            }
        },
        //合并 js css 文件(文档 https://github.com/gruntjs/grunt-contrib-concat)
        concat:{
            js:{
                files:[{
                    src: [
                        'cri/source/js/velocity.js',
                        'cri/source/js/velocity.ui.js',
                        'cri/source/js/cri.framework.js',
                        'cri/source/js/cri.widgets.js',
                        'cri/source/js/cri.grid.js',
                        'cri/source/js/*.js'
                    ],
                    dest:'cri/source/cri/cri.js'
                }]
            }
        },
        // 压缩 js 文件(https://github.com/gruntjs/grunt-contrib-uglify)
        uglify: {
            build: {
                files:[
                    {
                        src:['cri/source/cri/cri.js'],
                        dest:'cri/source/cri/cri.min.js'
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
                src:['cri/source/cri/**']
            }
        },

        //监控文件变化并动态执行任务(https://github.com/gruntjs/grunt-contrib-watch)
        watch: {
            scripts: {
                files: ['cri/source/js/*.js'],
                tasks: ['concat:js']
            },
            less: {
                files: 'cri/source/less/*.less',
                tasks: ['less:production']
            },
            /*
            redeploy:{
                files: 'api/**',
                tasks: "tomcat_redeploy"
            },
            */
            zip:{
                files: 'cri/source/cri/*.*',
                tasks: "zip:cri"
            }
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