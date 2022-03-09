
const rewire = require('rewire');
const webpackConfig = rewire('react-scripts/scripts/start');
const oldConfigFactory = webpackConfig.__get__('configFactory');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const fs = require('fs');
const path = require('path');

webpackConfig.__set__('configFactory', function(env) {
	const config = oldConfigFactory(env);
	
	// disable use modules outside of src
	config.resolve.plugins = config.resolve.plugins.filter(plugin => !(plugin instanceof ModuleScopePlugin));
	
	// disable local node_modules/ path
	config.resolve.modules.shift();
	
	// add aliased packages from /opt/packages
	for (const alias of find_custom_packages('/opt/packages')){
		config.resolve.alias[alias.name] = alias.path;
	}

	addLazyLoadingStyleLoader(config.module);
	
	console.log(config);
	//process.exit(0);
	
	return config;
});

function* find_custom_packages(location) {
	const dir = fs.opendirSync(location, { withFileTypes: true });
	let dirent;
	while ((dirent = dir.readSync()) !== null) {
	  if (dirent.isSymbolicLink()) {
		  yield {name: dirent.name, path: fs.realpathSync(path.join(location, dirent.name))};
	  }
	}
	dir.closeSync();
}

function addLazyLoadingStyleLoader(config) {
	const cssLoader = config.rules[1].oneOf[5];
	
	config.rules[1].oneOf.splice(5, 2, {
		...cssLoader,
		use: [
			{
				loader: cssLoader.use[0],
				options: {
					injectType: 'lazyStyleTag'
				}
			},
			cssLoader.use[1],
			cssLoader.use[2]
		]
	});
}