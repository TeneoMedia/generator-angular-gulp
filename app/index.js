'use strict';
var fs = require('fs');
var util = require('util');
var path = require('path');
var spawn = require('child_process').spawn;
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');
var wiredep = require('wiredep');

var AppGenerator = module.exports = function Appgenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.argument('appname', { type: String, required: false });
  this.appname = this.appname || path.basename(process.cwd());
  this.appname = this._.camelize(this._.slugify(this._.humanize(this.appname)));
  this.scriptAppName = this.appname;

  // setup the test-framework property, gulpfile template will need this
  // this.testFramework = options['test-framework'] || 'mocha';

  // for hooks to resolve on mocha by default
  // options['test-framework'] = this.testFramework;

  // resolved to mocha by default (could be switched to jasmine for instance)
  // this.hookFor('test-framework', {
  //   as: 'app',
  //   options: {
  //     options: {
  //       'skip-install': options['skip-install-message'],
  //       'skip-message': options['skip-install']
  //     }
  //   }
  // });

  this.options = options;
  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(AppGenerator, yeoman.generators.Base);

AppGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  // welcome message
  if (!this.options['skip-welcome-message']) {
    this.log(yosay('Time to start angular'));
    this.log(chalk.magenta('Out of the box I include HTML5 Boilerplate, jQuery, and a gulpfile.js to build your app.'));
  }

  var prompts = [{
    type: 'checkbox',
    name: 'features',
    message: 'What more would you like?',
    choices: [{
      name: 'Sass',
      value: 'includeSass',
      checked: true
    }, {
      name: 'Bootstrap',
      value: 'includeBootstrap',
      checked: true
    }, {
      name: 'd3',
      value: 'included3',
      checked: true
    }]
  }];

  this.prompt(prompts, function (answers) {
    var features = answers.features;

    var hasFeature = function (feat) {
      return features.indexOf(feat) !== -1;
    };

    // manually deal with the response, get back and store the results.
    // we change a bit this way of doing to automatically do this in the self.prompt() method.
    this.includeSass = hasFeature('includeSass');
    this.includeBootstrap = hasFeature('includeBootstrap');
    this.includeModernizr = hasFeature('included3');

    cb();
  }.bind(this));
};

AppGenerator.prototype.askForModules = function askForModules() {
  var cb = this.async();

  var prompts = [{
    type: 'checkbox',
    name: 'modules',
    message: 'Which modules would you like to include?',
    choices: [
    {
      value: 'animateModule',
      name: 'angular-animate.js',
      checked: true
    }, {
      value: 'cookiesModule',
      name: 'angular-cookies.js',
      checked: true
    }, {
      value: 'resourceModule',
      name: 'angular-resource.js',
      checked: true
    }, {
      value: 'routeModule',
      name: 'angular-route.js',
      checked: true
    }, {
      value: 'sanitizeModule',
      name: 'angular-sanitize.js',
      checked: true
    }, {
      value: 'touchModule',
      name: 'angular-touch.js',
      checked: true
    }
    ]
  }];


  this.prompt(prompts, function (props) {
    var hasMod = function (mod) { return props.modules.indexOf(mod) !== -1; };
    this.animateModule = hasMod('animateModule');
    this.cookiesModule = hasMod('cookiesModule');
    this.resourceModule = hasMod('resourceModule');
    this.routeModule = hasMod('routeModule');
    this.sanitizeModule = hasMod('sanitizeModule');
    this.touchModule = hasMod('touchModule');

    var angMods = [];
    this.angModules = [];

    angMods.push("'ui.router'");

    if (this.animateModule) {
      angMods.push("'ngAnimate'");
      this.angModules.push('angular-animate');
    }

    if (this.cookiesModule) {
      angMods.push("'ngCookies'");
      this.angModules.push('angular-cookies');

    }

    if (this.resourceModule) {
      angMods.push("'ngResource'");
      this.angModules.push('angular-resource');
    }

    if (this.routeModule) {
      angMods.push("'ngRoute'");
      this.angModules.push('angular-route');
      this.env.options.ngRoute = true;
    }

    if (this.sanitizeModule) {
      angMods.push("'ngSanitize'");
      this.angModules.push('angular-sanitize');
    }

    if (this.touchModule) {
      angMods.push("'ngTouch'");
      this.angModules.push('angular-touch');
    }


    if (angMods.length) {
      this.angularModules = '\n    ' + angMods.join(',\n    ') + '\n  ';
    }

    cb();
  }.bind(this));
};

AppGenerator.prototype.gulpfile = function () {
  this.template('gulpfile.js');
};

AppGenerator.prototype.packageJSON = function () {
  this.template('_package.json', 'package.json');
};

AppGenerator.prototype.git = function () {
  this.copy('gitignore', '.gitignore');
  this.copy('gitattributes', '.gitattributes');
};

AppGenerator.prototype.bower = function () {
  var bower = {
    name: this._.slugify(this.appname),
    private: true,
    dependencies: {}
  };

  bower.dependencies['angular'] = "~1.2.24";

  for (var i = 0; i < this.angModules.length; i++) {
    bower.dependencies[this.angModules[i]] = "~1.2.24";
    this.log('ang mod here ' + this.angModules[i]);
  }

  bower.dependencies['ui-router'] = "~0.2.11";
  if (this.includeBootstrap) {
    var bs = 'bootstrap' + (this.includeSass ? '-sass-official' : '');
    bower.dependencies[bs] = '~3.2.0';
    bower.dependencies['angular-bootstrap'] = '~0.11.0';
  }

  if (this.included3) {
    bower.dependencies['d3'] = '~3.4.11';
  }

  this.copy('bowerrc', '.bowerrc');
  this.write('bower.json', JSON.stringify(bower, null, 2));
};

AppGenerator.prototype.jshint = function () {
  this.copy('jshintrc', '.jshintrc');
};

AppGenerator.prototype.editorConfig = function () {
  this.copy('editorconfig', '.editorconfig');
};

AppGenerator.prototype.h5bp = function () {
  this.copy('favicon.ico', 'app/favicon.ico');
  this.copy('robots.txt', 'app/robots.txt');
};

AppGenerator.prototype.angular = function () {
  this.template('main.js', 'app/scripts/main.js');
  this.template('HomeCtrl.js', 'app/scripts/controllers/HomeCtrl.js');
  this.template('OtherCtrl.js', 'app/scripts/controller/OtherCtrl.js');
};

AppGenerator.prototype.mainStylesheet = function () {
  var css = 'main.' + (this.includeSass ? 's' : '') + 'css';
  this.copy(css, 'app/styles/' + css);
};

AppGenerator.prototype.writeIndex = function () {
  this.indexFile = this.readFileAsString(path.join(this.sourceRoot(), 'index.html'));
  this.indexFile = this.engine(this.indexFile, this);

  this.indexFile = this.appendFiles({
    html: this.indexFile,
    fileType: 'js',
    optimizedPath: 'scripts/app.js',
    sourceFileList: ['scripts/app.js']
  });
};

AppGenerator.prototype.app = function () {
  this.mkdir('app');
  this.mkdir('app/scripts');
  this.mkdir('app/scripts/constants');
  this.mkdir('app/scripts/controllers');
  this.mkdir('app/scripts/directives');
  this.mkdir('app/scripts/filters');
  this.mkdir('app/scripts/services');
  this.mkdir('app/views');
  this.mkdir('app/images');
  this.mkdir('app/fonts');
  this.write('app/index.html', this.indexFile);
  // this.write('app/scripts/main.js', 'console.log(\'\\\'Allo \\\'Allo!\');');
};

AppGenerator.prototype.install = function () {
  var howToInstall =
    '\nAfter running `npm install & bower install`, inject your front end dependencies into' +
    '\nyour HTML by running:' +
    '\n' +
    chalk.yellow.bold('\n  gulp wiredep');

  if (this.options['skip-install']) {
    this.log(howToInstall);
    return;
  }

  var done = this.async();
  this.installDependencies({
    skipMessage: this.options['skip-install-message'],
    skipInstall: this.options['skip-install'],
    callback: function () {
      var bowerJson = JSON.parse(fs.readFileSync('./bower.json'));

      // wire Bower packages to .html
      wiredep({
        bowerJson: bowerJson,
        directory: 'bower_components',
        exclude: ['bootstrap-sass', 'bootstrap.js'],
        src: 'app/index.html'
      });

      if (this.includeSass) {
        // wire Bower packages to .scss
        wiredep({
          bowerJson: bowerJson,
          directory: 'bower_components',
          src: 'app/styles/*.scss'
        });
      }

      done();
    }.bind(this)
  });
};