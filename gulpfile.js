var
    gulp            = require('gulp'),
    sass            = require('gulp-sass'), // препроцессор sass
    autoprefixer    = require('gulp-autoprefixer'), // вендорные префексы css
    sourcemaps      = require('gulp-sourcemaps'), // создание sourcemap
    nano            = require('gulp-cssnano'), // жатие стилей
    uglify          = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
    concat          = require('gulp-concat'), //конкатинация
    browsersync     = require('browser-sync'),  // перезагрузка страницы браузера при изменении файлов
    watch           = require('gulp-watch'), // наблюдение за ихменением файлов
    imagemin        = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
    pngquant        = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
    del             = require('del'), // Подключаем библиотеку для удаления файлов и папок
    rename          = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
    cache           = require('gulp-cache'); // Подключаем библиотеку кеширования
//переменные путей

var dir             = 'src',
    path = {
    src: {
        pug:        dir+'/pug/pages',  //
        html:       dir+'/*.html',
        css:        dir+'/css/',
        sass:       dir+'/sass/**/*.*',
        js:         dir+'/js/**/*.*',
        php:        dir+'/**/*.php',
        img:        dir+'/img/**/*.*',
        fonts:      dir+'/fonts/**/*.*',
        libsjs:     dir+'/libs/js/**/*.*',
        libscss:    dir+'/libs/css/**/*.*',
        libsdest:   dir+'/libs'
    },
    dist: {
        libs: '',
        folders: 'dist',
        php: 'dist',
        html: 'dist',
        css: 'dist/css',
        js: 'dist/js',
        img: 'dist/img',
        fonts: 'dist/fonts'
    }
};
// tasks
// компиляция sass
gulp.task('sass', function () {
    return gulp.src(path.src.sass) // Берем источник
        .pipe(sass()) // Преобразуем Sass в CSS посредством gulp-sass
        .pipe(sourcemaps.init())
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true})) // Создаем префиксы
        .pipe(nano())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.src.css)) // Выгружаем результата в папку
        .pipe(browsersync.reload({stream: true})); // Обновляем CSS на странице при изменении
});
// js
gulp.task('scripts', function () {
    return gulp.src(path.src.libsjs)
        .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
        .pipe(uglify()) // Сжимаем JS файл
        .pipe(gulp.dest(path.src.libsdest)); // Выгружаем в папку app/js
});
//перезагрзка страницы
gulp.task('browsersync', function () {
    browsersync({
        server: { // Определяем параметры сервера
            baseDir: 'src' // Директория для сервера
        },
        //proxy: "start template/src",  //при запуска с open server
        notify: false
    });
});
// наблюдение за изменением файлов
gulp.task('watch', ['browsersync', 'sass', 'scripts'], function () {
    gulp.watch(path.src.sass, ['sass']); // Наблюдение за sass файлами в папке sass
    gulp.watch(path.src.html, browsersync.reload); // Наблюдение за HTML файлами в корне проекта
    gulp.watch(path.src.php, browsersync.reload); // Наблюдение за php файлами в корне проекта
    gulp.watch(path.src.js, browsersync.reload); // Наблюдение за js файлами в корне проекта
    gulp.watch(path.src.libsjs, browsersync.reload); // Наблюдение за js библиотеками в корне проекта
});
//работа с изображениями
gulp.task('img', function () {
    return gulp.src(path.src.img) // Берем все изображения из app
        .pipe(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(path.dist.img)); // Выгружаем на продакшен
});
//очистка папки перед билдом
gulp.task('clean', function () {
    return del.sync(path.dist.folders); // Удаляем папку dist перед сборкой
});
// выгружаем скомпилированный проект в продакшен
gulp.task('build', ['clean', 'img', 'sass'], function () {
    var buildCss = gulp.src(path.src.css),
        buildFonts = gulp.src(path.src.fonts), // Переносим шрифты в продакшен
        buildJs = gulp.src(path.src.js), // Переносим скрипты в продакшен
        buildHtml = gulp.src(path.src.html), // Переносим HTML в продакшен
        buildPHP = gulp.src(path.src.php) // Переносим PHP в продакшен
        .pipe(gulp.dest(path.dist.css))
        .pipe(gulp.dest(path.dist.fonts))
        .pipe(gulp.dest(path.dist.js))
        .pipe(gulp.dest(path.dist.html))
        .pipe(gulp.dest(path.dist.php));
});
// отмечаем скрипт по умолчанию
gulp.task('default', ['watch']);
