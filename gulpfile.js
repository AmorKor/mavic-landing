const {src, dest, watch, series, parallel} = require('gulp')
const sass = require('gulp-sass')
const sourcemap = require('gulp-sourcemaps')
const sync = require('browser-sync').create()
const pug = require('gulp-pug')
// const ccso = require('gulp-csso')
// const htmlmin = require('gulp-htmlmin')
// const del = require('del')
// const concat = require('gulp-concat')
// const tsc = require('gulp-typescript')
const tsify = require('tsify') 
const browserify = require('browserify')
const vynil = require('vinyl-source-stream')

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
            "./src/app/transformer.ts",
            "./src/app/utils.ts"
        ],
        cache: {},
        packageCache: {},
      })
        .plugin(tsify)
        .bundle()
        .pipe(vynil("bundle.js"))
        .pipe(dest("dist/app"));
}

function runServer() {
    sync.init({
        server: './dist'
    })

    watch('./src/pug/**.pug', series(compilePug)).on('change', sync.reload)
    watch('./src/scss/**/**.scss', series(compileSass)).on('change', sync.reload)
    watch('./src/app/**.ts', series(compileTS)).on('change', sync.reload)
}

function stopServer(cb) {
    sync.exit()
    cb()
}

exports.tscomp = compileTS
exports.pug = compilePug
exports.server = runServer
exports.serverstop = stopServer
