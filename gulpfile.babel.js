import gulp from "gulp";
import gpug from "gulp-pug";
import del from "del";
import ws from "gulp-webserver";
import image from "gulp-image";
import sass from "gulp-sass";
import autoprefixer from "gulp-autoprefixer";
import miniCSS from "gulp-csso";
import bro from "gulp-bro";
import babelify from "babelify";
import ghPages from "gulp-gh-pages";

sass.compiler = require("node-sass");

console.log(sass.logError);

const routes = {
    pug: {
        watch: "src/**/*.pug",
        src: "src/*.pug",
        dest: "build"
    },
    img: {
        src: "src/img/*",
        dest: "build/img"
    },
    scss: {
        watch: "src/scss/**/*",
        src: "src/scss/style.scss",
        dest: "build/css"
    },
    js: {
        watch: "src/js/**/*.js",
        src: "src/js/main.js",
        dest: "build/js"
    }
}

const clean = () => del(["build"]);

const webserver = () => gulp.src("build").pipe(ws({livereload: true, open: true }));


const pug = () => 
    gulp
        .src(routes.pug.src)
        .pipe(gpug())
        .pipe(gulp.dest(routes.pug.dest));

const img = () => 
    gulp
        .src(routes.img.src)
        .pipe(image())
        .pipe(gulp.dest(routes.img.dest));

const styles = () => 
    gulp
        .src(routes.scss.src)
        .pipe(sass().on("error", sass.logError))
        .pipe(
            autoprefixer({
                overrideBrowserslist: ["last 2 versions"]
            })
        )
        .pipe(miniCSS())
        .pipe(gulp.dest(routes.scss.dest));

const js = () => 
    gulp
    .src(routes.js.src)
    .pipe(
        bro({
            transform: [
                babelify.configure({presets: ["@babel/preset-env"]}),
                ["uglifyify", { global: true }]
            ]
        })
    )
    .pipe(gulp.dest(routes.js.dest));

const watch = () => {
    gulp.watch(routes.pug.watch, pug);
    gulp.watch(routes.img.src, img);
    gulp.watch(routes.scss.watch, styles);
    gulp.watch(routes.js.watch, js);
}

const ghDeplay = () => gulp.src("build/**/*").pipe(ghPages(
    {
        remoteUrl: "https://github.com/vmfhrmfoaj-tech/super-gulp.git",
        branch: "master"
    }
));

const prepare = gulp.series([clean]);

const assets = gulp.parallel([pug, img, styles, js]);

const live = gulp.parallel([webserver, watch]);

export const build = gulp.series([prepare, assets]);
export const dev = gulp.series([build, live]);
export const deploy = gulp.series([build, ghDeplay]);