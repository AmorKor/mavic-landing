const {src, dest, watch, series, parallel} = require('gulp')
const sass = require('gulp-sass')
const sourcemap = require('gulp-sourcemaps')
const sync = require('browser-sync').create()
const pug = require('gulp-pug')
const buffer = require('vinyl-buffer')
const terser = require('gulp-terser')
const tsify = require('tsify') 
const browserify = require('browserify')
const vynil = require('vinyl-source-stream')
const htmlmin = require('gulp-htmlmin')
const csso = require('gulp-csso')

function compilePug() {
    return src('./src/pug/index.pug')
            .pipe(pug({
                pretty: true,

            })).pipe(dest('./dist'))
}

function compileSass() {
    return src('./src/scss/main.scss')
            .pipe(sourcemap.init())
            .pipe(sass().on('error', sass.logError))
            .pipe(sourcemap.write('.'))
            .pipe(dest('dist/styles'))
}

function compileTS() {
    return browserify({
        basedir: ".",
        debug: true,
        entries: [
            "./src/app/main.ts",
            "./src/app/linked_list.ts",
            "./src/app/observer.ts",
            "./src/app/controller.ts",
            "./src/app/utils.ts"
        ],
        cache: {},
        packageCache: {},
      })
        .plugin(tsify)
        .bundle()
        .pipe(vynil("bundle.js"))
        .pipe(buffer())
        .pipe(terser())
        .pipe(dest("dist/app"));
}

function minHTML() {
    return src('./dist/index.html')
            .pipe(htmlmin({collapseWhitespace: true}))
            .pipe(dest('./dist'))
}

function minCSS() {
    return src('./dist/styles/main.css')
            .pipe(csso({
                restructure: false
            }))
            .pipe(dest('./dist/styles'))
}

function runServer() {
    sync.init({
        server: './dist'
    })

    watch('./src/pug/**.pug', series(compilePug)).on('change', sync.reload)
    watch('./src/scss/**/**.scss', series(compileSass)).on('change', sync.reload)
    watch('./src/app/**.ts', series(compileTS)).on('change', sync.reload)
}

exports.final = series(parallel(compileTS, compilePug, compileSass), parallel(minCSS, minHTML))
exports.tscomp = compileTS
exports.server = runServer
