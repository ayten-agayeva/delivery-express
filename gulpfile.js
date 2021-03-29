const { src, dest, parallel, watch, series } = require('gulp');

const browserSync = require('browser-sync').create();

const del = require('del');
const gulpLoadPlugins = require('gulp-load-plugins');

const $ = gulpLoadPlugins();

const BUILD_DIR = 'dist';

function vendor(){
	return src(['src/js/jquery.min.js','src/js/**/*','!src/js/script.js','!src/js/lang/**/*'])
		.pipe($.concat('vendor.min.js'))
		.pipe(dest(BUILD_DIR + '/js/'));
}

function js(){
	 return src(['src/js/script.js'])
		.pipe($.sourcemaps.init({loadMaps: true}))
		.pipe($.babel())
		.pipe($.uglify().on('error',console.log))
		.pipe($.rename('script.min.js'))
		.pipe($.sourcemaps.write('.'))
		.pipe(dest(BUILD_DIR + '/js/'));
}

function css(){
	return src(['src/scss/index.scss','src/scss/*'])
		.pipe($.sourcemaps.init({loadMaps: true}))
		.pipe($.concat('style.css'))
		.pipe($.sass().on('error',console.log))
		.pipe(dest(BUILD_DIR + '/css/'))
		.pipe($.rename('style.min.css'))
		.pipe($.csso().on('error',console.log))
		.pipe($.sourcemaps.write('.'))
		.pipe(dest(BUILD_DIR + '/css/'));
}

function clean(){
	return del([BUILD_DIR + '/**/*']);
}

function copy_images(){
	return src(['src/images/**/*']).pipe(dest(BUILD_DIR + '/images'));
}

function copy_js(){
	return src(['src/js/lang/**/*']).pipe(dest(BUILD_DIR + '/js/lang'));
}

function copy_fonts(){
	return src(['src/fonts/**/*']).pipe(dest(BUILD_DIR + '/fonts'));
}

function html(){
	return src('src/*.html') // run the Twig template parser on all .html files in the "src" directory
		.pipe($.twig({data:{modified_time:new Date().getTime()}}).on('error',console.log))
		.pipe(dest(BUILD_DIR));// output the rendered HTML files to the "dist" directory
}
function watch_file(){
	watch('src/scss/*', parallel(css, html));
	watch('src/js/script.js', parallel(js, html));
	watch(['src/js/**/*','!src/js/script.js'], parallel(vendor, html));
	watch('src/*.html', html);
	watch('src/images/**/*', series(function(){ return del([BUILD_DIR + '/images/**/*']); }, copy_images));
}
function serve(){

	watch_file();

	browserSync.init({
		files:[BUILD_DIR + '/*.*'],
		server: BUILD_DIR,
		port: 3000
	});
}

exports.build = series(clean, parallel(css, vendor, js, copy_images, copy_js, copy_fonts, html));
exports.clean = clean;
exports.vendor = vendor;
exports.html = html;
exports.serve = serve;
exports.default = watch_file;