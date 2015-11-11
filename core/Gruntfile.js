module.exports = function(grunt) {

  var concat_options = {
    // Replace all 'use strict' statements in the code with a single one at the top
    banner: "'use strict';\n",
    process: function(src, filepath) {
      return '// Source: ' + filepath + '\n' +
        src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
    },
    sourceMap: true
  };

  var ts_options = {
    module: "amd",
    target: "es5",
    sourceMap: true,
    declaration: true
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),


    typescript: {
      enginejs: {
        src: ["src/typings/*.ts", "src/common/*.ts"],
        dest: "build/engine.js",
        options: ts_options
      },

      alienjs: {
        src: ["src/typings/*.ts", "build/engine.d.ts", "src/alien/*.ts", "src/alien/components/*.ts", "src/alien/objects/*.ts"],
        dest: "build/alien.js",
        options: ts_options
      },

      mazejs: {
        src: ["src/typings/*.ts", "build/engine.d.ts", "src/maze/*.ts"],
        dest: "build/maze.js",
        options: ts_options
      }
    },


    jshint: {
      alienjs: {
        src: ["build/engine.js", "build/alien.js", "build/maze.js"],
        options: {
          browser: true,
          globalstrict: true,
          devel: true,
          jquery: true
        }
      }
    },


    uglify: {
      enginejs: {
        src: "build/engine.js",
        dest: "build/engine.min.js",
        options: { sourceMap: true }
      },

      alienjs: {
        src: "build/alien.js",
        dest: "build/alien.min.js",
        options: { sourceMap: true }
      },

      mazejs: {
        src: "build/maze.js",
        dest: "build/maze.min.js",
        options: { sourceMap: true }
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-typescript");

  grunt.registerTask("default", ["typescript", "uglify"]);
}
