const
    pkg = require('./package.json'),
    path = require('path'),
    tools = require('browserify-transform-tools'),
    sasshimi = require('sasshimi');

module.exports = tools.makeStringTransform(pkg.name, {
    includeExtensions: sasshimi.defaults.extensions,
    evaluateArguments: true
}, function(content, options, done) {
    var self = this,
        cfgdir = options.configData.configDir ? options.configData.configDir : process.cwd();
    sasshimi.create(options.file, Object.assign({
        paths: ((typeof(options.config.paths) === 'string' ? [options.config.paths] : options.config.paths) || []).map(function(dir) {
            return path.resolve(cfgdir, dir);
        })
    }), function(result) {
        emitDependencies(self, result.stats.includedFiles);
        content = 'var css = ' + JSON.stringify(result.css.toString()) + '; (require(' + JSON.stringify('browserify-sasshimi') + ').createStyle(css, {}, { "insertAt": ' + JSON.stringify('top') + ' })); module.exports = css;';
        done(null, content);
    });
});


function emitDependencies(stream, deps) {
  for (let index = 0; index < deps.length; ++index)
    stream.emit('file', deps[index])
}
