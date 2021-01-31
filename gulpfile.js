const {src, dest, watch, series, parallel} = require('gulp')
const sass = require('gulp-sass')
const sourcemap = require('gulp-sourcemaps')
const sync = require('browser-sync').create()
const pug = require('gulp-pug')
const ccso = require('gulp-csso')
const htmlmin = require('gulp-htmlmin')
const del = require('del')
const concat = require('gulp-concat')
const tsc = require('gulp-typescript') 

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

const tscProject = tsc.createProject('./tsconfig.json')

function compileTS() {
    return src('./src/app/**.ts')
            .pipe(sourcemap.init())
            .pipe(tsc({
                target: 'es2016',
                removeComments: true,
                strictNullChecks: false
            }))
            .pipe(sourcemap.write('.'))
            .pipe(dest('./dist/app'))
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

exports.pug = compilePug
exports.server = runServer
exports.serverstop = stopServer
