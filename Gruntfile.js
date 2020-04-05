module.exports = function (grunt) {
  grunt.initConfig({
    babel: {
      options: {
        sourceMap: true,
        presets: ['@babel/preset-env'],
        plugins: [
          '@babel/plugin-transform-runtime',
        ],
      },
      debug: {
        files: [
          {
            expand: true,
            cwd: 'src/',
            src: ['**/*.js', '*.js'],
            dest: 'build/',
          },
          {
            expand: true,
            cwd: 'test/',
            src: ['**/*.js', '*.js'],
            dest: 'build/test/',
          },
        ],
      },
    },
    watch: {
      components: {
        files: ['src/**/*.js'],
        tasks: ['babel'],
      },
    },
  });
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', ['babel', 'watch']);
  grunt.registerTask('pre-test', ['babel']);
};
