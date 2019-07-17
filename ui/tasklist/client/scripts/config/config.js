window.camTasklistConf = {
  'locales':{
    'availableLocales': ['en', 'pt-BR'],
    'fallbackLocale': 'pt-BR'
  },
  customScripts: {
    ngDeps: ['cronLogout'],
    deps: ['cronLogout'],
    paths: {
      'cronLogout': '../../../../common/scripts/module/services/logout'
    }
  },
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
