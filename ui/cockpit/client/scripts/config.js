window.camCockpitConf = {
  'locales':{
    'availableLocales': ['en', 'pt-BR'],
    'fallbackLocale': 'pt-BR'
  },
  customScripts: {
    ngDeps: ['cronLogout'],
    deps: ['cronLogout'],
    paths: {
      'cronLogout': '../../../common/scripts/module/services/logout'
    }
  }
};
