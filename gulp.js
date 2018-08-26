const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
 

//Compress Images Task 
gulp.task('image', () =>
    gulp.src('orig-img/*')
        .pipe(imagemin())
        .pipe(gulp.dest('img'))
);