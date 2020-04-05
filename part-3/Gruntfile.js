module.exports = function(grunt) {
  grunt.initConfig({
    ts: {
      default: {
        src: ['**/*.ts', '!node_modules/**'],
        tsconfig: './tsconfig.json',
      },
    },
    watch: {
      scripts: {
        files: ['src/*.ts', 'src/**/*.ts'],
        tasks: ['ts'],
      },
    },
  });
  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', ['ts', 'watch']);
};
