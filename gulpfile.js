const gulp = require('gulp');
const minify = require('gulp-minify');


/*Imagemin reduced the png file well but didn't change jpg file sizes*/
// const imagemin = require('gulp-imagemin');

// //Compress Images Task
// gulp.task('image', function() {
//   return gulp.src('orig-img/*')
//       .pipe(imagemin())
//       .pipe(gulp.dest('img'))
// });

var $ = require('gulp-load-plugins')();

gulp.task('images', function () {
  return gulp.src('orig-img/*.{jpg,png}')
    .pipe($.responsive({
      // Resize all JPG images to three different sizes: 200, 500, and 630 pixels
      '*.jpg': [{
        width: 200,
        rename: { suffix: '-200px' },
      }, {
        width: 500,
        rename: { suffix: '-500px' },
      }, {
        width: 630,
        rename: { suffix: '-630px' },
      }, {
        // Compress, strip metadata, and rename original image
        rename: { suffix: '-original' },
      }],
      // Resize all PNG images to be retina ready
      '*.png': [{
        width: 250,
      }, {
        width: 250 * 2,
        rename: { suffix: '@2x' },
      }],
    }, {
      // Global configuration for all images
      // The output quality for JPEG, WebP and TIFF output formats
      quality: 70,
      // Use progressive (interlace) scan for JPEG and PNG output
      progressive: true,
      // Strip all metadata
      withMetadata: false,
    }))
    .pipe(gulp.dest('img'));
});

gulp.task('minifyJS', function() {
  gulp.src(['js/*.js'])
    .pipe(minify())
    .pipe(gulp.dest('dist'))
});