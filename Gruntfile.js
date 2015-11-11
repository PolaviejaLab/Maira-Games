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
      alienjs: {
        src: ["src/js/typings/*.ts", "src/js/common/*.ts", "src/js/alien/*.ts", "src/js/alien/components/*.ts", "src/js/alien/objects/*.ts"],
        dest: "src/js/build/alien.js",
        options: ts_options
      },

      mazejs: {
        src: ["src/js/typings/*.ts", "src/js/common/*.ts", "src/js/maze/*.ts"],
        dest: "src/js/build/maze.js",
        options: ts_options
      }
    },


    jshint: {
      alienjs: {
        src: ["src/js/build/alien.js", "src/js/build/maze.js"],
        options: {
          browser: true,
          globalstrict: true,
          devel: true,
          jquery: true
        }
      }
    },


    uglify: {
      alienjs: {
        src: "src/js/build/alien.js",
        dest: "src/js/build/alien.min.js",
        options: { sourceMap: true }
      },

      mazejs: {
        src: "src/js/build/maze.js",
        dest: "src/js/build/maze.min.js",
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
