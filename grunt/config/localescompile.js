module.exports = function(config, localesConfig, pathConfig) {
  'use strict';

  var appName = pathConfig.appName === 'modeler' ? 'welcome' : pathConfig.appName;

  console.log('pathConfig.appName=' + pathConfig.appName + '. appName=' + appName);

  localesConfig[pathConfig.appName + '_locales'] = {
      options: {
        dest: pathConfig.buildTarget + '/locales',
        onlyProd: 1,
        anOption: 'for production'
      },
      src: [
        '<%= pkg.gruntConfig.enTranslationDir %>/' + appName + '/en.json'
      ]
  };
};
