'use strict';
// if(require('electron-squirrel-startup')) return;

const Editor = require('./editor-framework');
const Path = require('fire-path');
const Electron = require('electron');

// set application ID
if (process.platform === 'win32') {
  var appId = 'com.cocos.cocoscreator.CocosCreator';
  Electron.app.setAppUserModelId(appId);
}

// switch off Chromium blacklist for better graphic card compatibility
Electron.app.commandLine.appendSwitch('ignore-gpu-blacklist');
// expose gc to global.gc for manually gc memory
Electron.app.commandLine.appendSwitch('js-flags', '--expose-gc');

//
Editor.App.extend({
  beforeInit: ( yargs ) => {
    yargs
      .usage('cocos-creator <path> [options]')
      .options({
        'path': { type: 'string', desc: 'Open a project by path' },
        'nologin': { type: 'boolean', desc: 'Do not require login in dev mode' },
        'internal': { type: 'boolean', desc: 'Show internal mount' },
        'testing': { type: 'boolean', desc: 'Use test update feed' },
        'mount': { type: 'string', array: true, desc: 'Mount external resources' },
        'writable': { type: 'boolean', desc: 'Specify the external resources are writable. Default is readonly.'},
        'build': { type: 'string', desc: 'Build options'},
        'compile': { type: 'string', desc: 'Compile options'}
      })
      ;
  },

  init: ( options, cb ) => {
    //
    let subinit;
    let args = Editor.argv;

    //console.log('===========options=========');
    //console.log(args);

    if ( args._command === 'test' ) {
      subinit = require('./editor/init');
    } else if ( args._command === 'build' ) {
      subinit = require('./editor/init');
    } else {
      let projectPath;
      if ( options._.length > 0 ) {
        projectPath = Path.resolve(options._[0]);
      } else if ( options.path ) {
        projectPath = Path.resolve(options.path);
      }

      // if we have project path, go to the editor, otherwise go to the dashboard
      if ( projectPath ) {
        subinit = require('./editor/init');
      } else {
        subinit = require('./dashboard/init');
      }
    }

    if ( subinit ) {
      subinit( options, cb );
      return;
    }

    //
    if ( cb ) {
      cb ();
    }
  }
});