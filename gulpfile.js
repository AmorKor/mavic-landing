const {src, dest, watch, series, parallel} = require('gulp')
const sass = require('gulp-sass')
const sync = require('browser-sync').create()
const pug = require('gulp-pug')
const ccso = require('gulp-csso')
const htmlmin = require('gulp-htmlmin')
const del = require('del')

function compilePug() {
    return src('./src/pug/index.pug')
            .pipe(pug({
                pretty: true,

            })).pipe(dest('./dist'))
}

function compileSass() {
    return src('./src/scss/main.scss')
            .pipe(sass().on('error', sass.logError))
            .pipe(dest('dist/styles'))
}

function runServer() {
    sync.init({
        server: './dist'
    })

    watch('./src/pug/**.pug', series(compilePug)).on('change', sync.reload)
    watch('./src/scss/**.scss', series(compileSass)).on('change', sync.reload)
}

function stopServer(cb) {
    sync.exit()
    cb()
}

exports.pug = compilePug
exports.server = runServer
exports.serverstop = stopServer
