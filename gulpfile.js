const autoprefixer = require( "autoprefixer" );
const dartSass = require( "sass" );
const gulp = require( "gulp" );
const gulpSass = require( "gulp-sass" );
const postcss = require( "gulp-postcss" );
const rename = require( "gulp-rename" );
const uglify = require( "gulp-uglify" );

const scss = gulpSass( dartSass );

function buildJs ( done ) {
  gulp.src( [ "js/jquery.nice-select.js", "js/jquery.nice-select-with-search-multiple.js" ] )
    .pipe( uglify() )
    .pipe( rename( { suffix: ".min" } ) )
    .pipe( gulp.dest( "js" ) );
  done();
}

function buildCss ( done ) {
  gulp.src( "scss/**/*.scss" )
    .pipe( scss( {
      precision: 10,
      includePaths: [ "." ],
    } ).on( 'error', scss.logError ) )
    .pipe( postcss( [ autoprefixer() ] ) )
    .pipe( gulp.dest( "css" ) );

  done();
}

function watch ( done ) {
  gulp.watch( "js/*.js", gulp.parallel( buildJs ) );
  gulp.watch( "scss/*.scss", gulp.parallel( buildCss ) );
  done();
}

const build = gulp.parallel( buildCss, buildJs );

exports.css = buildCss;
exports.js = buildJs;
exports.build = build;
exports.watch = watch;
exports.default = build;