window.camTasklistConf = {
  'locales':{
    'availableLocales': ['en', 'pt-BR'],
    'fallbackLocale': 'pt-BR'
  },
  // change the app name and vendor
  // app: {
  //   name: 'Todos',
  //   vendor: 'Company'
  // },
  //
  // configure the date format
  // "dateFormat": {
  //   "normal": "LLL",
  //   "long":   "LLLL"
  // },
  //
  // "locales": {
  //    "availableLocales": ["en", "de"],
  //    "fallbackLocale": "en"
  //  },
  //
  // // custom libraries and scripts loading and initialization,
  // // see: http://docs.camunda.org/guides/user-guide/#tasklist-customizing-custom-scripts
  // customScripts: {
  //   // AngularJS module names
  //   ngDeps: ['ui.bootstrap'],
  //   // RequireJS configuration for a complete configuration documentation see:
  //   // http://requirejs.org/docs/api.html#config
  //   deps: ['jquery', 'custom-ui'],
  //   paths: {
  //     // if you have a folder called `custom-ui` (in the `scripts` folder)
  //     // with a file called `scripts.js` in it and defining the `custom-ui` AMD module
  //     'custom-ui': 'custom-ui/scripts'
  //   }
  // },

  'shortcuts': {
    'claimTask': {
      'key': 'ctrl+alt+c',
      'description': 'atribui-se a tarefa selecionada'
    },
    'focusFilter': {
      'key': 'ctrl+shift+f',
      'description': 'foca no primeiro filtro da lista'
    },
    'focusList': {
      'key': 'ctrl+alt+l',
      'description': 'foca na primeira task da lista'
    },
    'focusForm': {
      'key': 'ctrl+alt+f',
      'description': 'foca no primeiro input da lista'
    },
    'startProcess': {
      'key': 'ctrl+alt+p',
      'description': 'abre o inicializador de processos'
    }
  }
};
