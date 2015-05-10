"use strict";

module.exports = function (grunt) {
    // Load grunt tasks automatically
    require("jit-grunt")(grunt, {
        nugetpack: "grunt-nuget",
        nugetpush: "grunt-nuget",
        buildcontrol: "grunt-build-control"
    });
    require("time-grunt")(grunt); // Time how long tasks take. Can help when optimizing build times
    
    var pkg = require("./package.json");
    
    grunt.initConfig({
        pkg: pkg,
        // Configurable paths
        paths: {
            bin: "bin",
            lib: "lib",
            tmpl: "template",
            dist: "dist",
            all: "{<%= paths.bin %>,<%= paths.lib %>,<%= paths.tmpl %>}",
            defs: "typings/_definitions.d.ts",
            temp: "temp"
        },

        typescript: {
            options: {
                target: "es5",
                module: "commonjs",
                sourceMap: true,
                declaration: false,
                removeComments: false
            },
            src: {
                src: ["<%= paths.defs %>", "<%= paths.all %>/**/*.ts", "./*.ts"]
            },
            dist: {
                src: ["<%= typescript.src.src %>"],
                options: {
                    sourceMap: false
                }
            }
        },
        
        tslint: {
            options: {
                configuration: grunt.file.readJSON("tslint.json")
            },
            src: {
                src: ["<%= paths.all %>/**/*.ts", "./*.ts"]
            }
        },
        
        clean: {
            src: [
                "<%= paths.all %>/**/*.{d.ts,js,js.map}", 
                "./*.{d.ts,js,js.map}", 
                "!<%= paths.tmpl %>/static/**",
                "!Gruntfile.js",
            ],
            temp: "<%= paths.temp %>"
        },
        
        connect: {
            options: {
                port: "8080",
                livereload: 56765
            },
            dist: {
                options: {
                    base: "<%= paths.dist %>"
                }
            }
        },
        
        watch: {
            tslint: { files: ["<%= tslint.src.src %>"], tasks: ["tslint:src"] },
            typescript: { files: ["<%= typescript.src.src %>"], tasks: ["typescript:src"] },
            gruntfile: { files: ["Gruntfile.js"] },
            
            livereload: {
                options: {
                    livereload: "<%= connect.options.livereload %>"
                },
                files: ["<%= paths.dist %>/**/*.{js,html,css}"]
            }
        },
        
        buildcontrol: {
            options: {
                dir: "<%= paths.dist %>",
                commit: true,
                push: true,
                branch: "gh-pages",
                message: "Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%"
            },
            dist: { }
        }
    });

    
    grunt.registerTask("dev", ["tslint:src", "clean:src", "typescript:src"]);
    grunt.registerTask("build", ["tslint:src", "clean:src", "typescript:dist"]);
    
    grunt.registerTask("serve", ["dev", "doc", "connect:dist", "watch"]);
    
    grunt.registerTask("publish", ["build", "buildcontrol:publish"]);
    
    grunt.registerTask("default", ["build"]);
};