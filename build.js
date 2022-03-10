
const rewire = require('rewire');
const webpackConfig = rewire('react-scripts/scripts/build');
const config = webpackConfig.__get__('config');

addLazyLoadingStyleLoader(config.module);
	
function addLazyLoadingStyleLoader(config) {
	const cssLoader = config.rules[1].oneOf[5];
	
	config.rules[1].oneOf.splice(5, 2, {
		...cssLoader,
		use: [
			{
				loader: require.resolve('style-loader'),
				options: {
					injectType: 'lazyStyleTag'
				}
			},
			cssLoader.use[1],
			cssLoader.use[2]
		]
	});
}
