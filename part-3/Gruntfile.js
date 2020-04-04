module.exports = function(grunt) {
  grunt.initConfig({
    ts: {
      default: {
        src: ['**/*.ts', '!node_modules/**'],
        tsconfig: './tsconfig.json',
      },
    },
  });
  grunt.loadNpmTasks('grunt-ts');
  grunt.registerTask('default', ['ts']);
};
