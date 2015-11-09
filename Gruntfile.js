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

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),


    concat: {
      alienjs: {
        src: ["src/js/common/*.js", "src/js/alien/*.js", "src/js/alien/components/*.js", "src/js/alien/objects/*.js"],
        dest: "src/js/build/alien.js",
        options: concat_options
      },

      mazejs: {
        src: ["src/js/common/*.js", "src/js/maze/*.js", "src/js/maze/levels/*.js"],
        dest: "src/js/build/maze.js",
        options: concat_options
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

  grunt.registerTask("default", ["concat", "uglify"]);
}
