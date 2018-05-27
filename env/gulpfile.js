var
    gulp            = require('gulp'),
    sass            = require('gulp-sass'), // препроцессор sass
    autoprefixer    = require('gulp-autoprefixer'), // вендорные префексы css
    sourcemaps      = require('gulp-sourcemaps'), // создание sourcemap
    nano            = require('gulp-clean-css'), // жатие стилей
    babel           = require('gulp-babel'), //подключаем babel
    uglify          = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
    concat          = require('gulp-concat'), //конкатинация
    browsersync     = require('browser-sync'),  // перезагрузка страницы браузера при изменении файлов
    watch           = require('gulp-watch'), // наблюдение за ихменением файлов
    imagemin        = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
    pngquant        = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
    clean             = require('gulp-clean'), // Удаление папок и файлов
    rename          = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
    cache           = require('gulp-cache'), // Подключаем библиотеку кеширования
    pug             = require('gulp-pug');

//переменные путей
var dir             = '../',
    path = {
        src: {
            pugsrc:        dir+'/src/pug/*.pug',  //
            pugdst:        dir+'/src/pug/',  //
            html:       dir+'/src/*.*',
            css:        dir+'/src/css/',
            sass:       dir+'/src/sass/**/*.*',
            js:         dir+'/src/js/**/*.*',
            jsdest:     dir+'/src/js/dist/app.js',
            php:        dir+'/src/**/*.php',
            img:        dir+'/src/img/**/*.*',
            fonts:      dir+'/src/fonts/**/*.*',
            folder:     dir+'/src/',
            libsjs:     dir+'/src/libs/**/*.js',
            libscss:    dir+'/src/libs/css/**/*.*',
            libsdest:   dir+'/src/libs'
        },
        dist: {
            libs:       dir+'/dist/libs/',
            clean:      dir+'/dist/',
            folder:     dir+'/dist/',
            css:        dir+'/dist/css/',
            js:         dir+'/dist/js/',
            img:        dir+'dist/img',
            fonts:      dir+'dist/fonts'
        }
};

// tasks
//перезагрзка страницы
gulp.task('browsersync', function () {
    browsersync({
        server: { baseDir: dir+'/src/' },// Директория для сервера
        // proxy: "http://example.com/", // проксирование вашего удаленного сервера, не важно на чем back-end
        // logPrefix: 'example.com', // префикс для лога bs, маловажная настройка
        //host:      'http://172.28.12.222/', // можно использовать ip сервера
        // port:      3000, // порт через который будет проксироваться сервер
        // open: 'external', // указываем, что наш url внешний
        // ghost:     true,
        // files:     [/*массив с путями к файлам и папкам за которыми вам нужно следить*/]
        notify: false
    });
});
//pug
gulp.task('pug', function buildHTML() {
    return gulp.src(path.src.pugsrc)
        .pipe(pug({
                pretty: true
            }
        ))
        .pipe(gulp.dest(path.src.pugdst))
});
// компиляция sass
gulp.task('sass', function () {
    return gulp.src(path.src.sass) // Берем источник
        .pipe(sass()) // Преобразуем Sass в CSS посредством gulp-sass
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true})) // Создаем префиксы
        .pipe(sourcemaps.init())
        .pipe(nano())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.src.css)) // Выгружаем результата в папку
        .pipe(browsersync.reload({stream: true})); // Обновляем CSS на странице при изменении
});
// js
gulp.task('scripts', function () {
    gulp.src(path.src.js)
        .pipe(sourcemaps.init())
        // .pipe(babel({
        //     presets: ['babel-preset-env']
        // }))
        .pipe(concat('all.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.src.jsdest)); // Выгружаем в папку app/js
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
gulp.task('clean', function() {
    return gulp.src(path.dist.clean)               // выберае папку
        .pipe(clean({force: true}));                     // очистка
});
// выгружаем скомпилированный проект в продакшен
gulp.task('build', ['clean', 'img', 'sass'], function () {
    gulp.src(path.src.css+'**/*.css')  //css
        .pipe(gulp.dest(path.dist.css));
    gulp.src(path.src.fonts)            // fonts
        .pipe(gulp.dest(path.dist.fonts));
    gulp.src(path.src.js)               //js
        .pipe(gulp.dest(path.dist.js));
    gulp.src(path.src.libsjs)               //jslibs
        .pipe(gulp.dest(path.dist.libs));
    gulp.src(path.src.img)               //img
        .pipe(gulp.dest(path.dist.img));
    gulp.src(path.src.html)               //folder
        .pipe(gulp.dest(path.dist.folder));
});


// наблюдение за изменением файлов
gulp.task('watch', ['browsersync', 'sass', 'scripts'], function () {
    gulp.watch(path.src.sass, ['sass']); // Наблюдение за sass файлами в папке sass
    gulp.watch(path.src.html, browsersync.reload); // Наблюдение за HTML файлами в корне проекта
    gulp.watch(path.src.php, browsersync.reload); // Наблюдение за php файлами в корне проекта
    gulp.watch(path.src.js, browsersync.reload); // Наблюдение за js файлами в корне проекта
    gulp.watch(path.src.libsjs, browsersync.reload); // Наблюдение за js библиотеками в корне проекта
});
// отмечаем скрипт по умолчанию
gulp.task('default', ['watch']);
