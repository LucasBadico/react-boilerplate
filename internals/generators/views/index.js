/**
 * Container Generator
 */

const componentExists = require('../utils/componentExists');

module.exports = {
  description: 'Add a views component',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: 'What should it be called?',
      default: 'Form',
      validate: value => {
        if (/.+/.test(value)) {
          return componentExists(value)
            ? 'A component or views with this name already exists'
            : true;
        }

        return 'The name is required';
      },
    },
    {
      type: 'confirm',
      name: 'memo',
      default: true,
      message: 'Do you want to wrap your view in React.memo?',
    },
    {
      type: 'confirm',
      name: 'wantHeaders',
      default: true,
      message: 'Do you want headers?',
    },
    {
      type: 'confirm',
      name: 'wantActionsAndReducer',
      default: true,
      message: 'Do you want a store folder with tuple for this view?',
    },
    {
      type: 'confirm',
      name: 'wantEpic',
      default: true,
      message: 'Do you want epics for asynchronous flows? (e.g. fetching data)',
    },
    {
      type: 'confirm',
      name: 'wantMessages',
      default: true,
      message: 'Do you want i18n messages (i.e. will this component use text)?',
    },
    {
      type: 'confirm',
      name: 'wantLoadable',
      default: true,
      message: 'Do you want to load resources asynchronously?',
    },
    {
      type: 'confirm',
      name: 'wantSubComponents',
      default: true,
      message: 'Do you want a subfolder with components?',
    },
  ],
  actions: data => {
    // Generate index.js and index.test.js
    const actions = [
      {
        type: 'add',
        path: '../../src/views/{{properCase name}}/index.js',
        templateFile: './views/index.js.hbs',
        abortOnFail: true,
      },
      {
        type: 'add',
        path: '../../src/views/{{properCase name}}/tests/index.test.js',
        templateFile: './views/test.js.hbs',
        abortOnFail: true,
      },
    ];

    // If component wants messages
    if (data.wantMessages) {
      actions.push({
        type: 'add',
        path: '../../src/views/{{properCase name}}/translations/index.js',
        templateFile: './views/messages.js.hbs',
        abortOnFail: true,
      });
    }

    // If they want actions and a reducer, generate actions.js, constants.js,
    // reducer.js and the corresponding tests for actions and the reducer
    if (data.wantActionsAndReducer) {
      // Actions
      actions.push({
        type: 'add',
        path: '../../src/views/{{properCase name}}/store/actions.js',
        templateFile: './views/actions.js.hbs',
        abortOnFail: true,
      });
      actions.push({
        type: 'add',
        path: '../../src/views/{{properCase name}}/store/tests/actions.test.js',
        templateFile: './views/actions.test.js.hbs',
        abortOnFail: true,
      });

      // Constants
      actions.push({
        type: 'add',
        path: '../../src/views/{{properCase name}}/store/constants.js',
        templateFile: './views/constants.js.hbs',
        abortOnFail: true,
      });

      // Selectors
      actions.push({
        type: 'add',
        path: '../../src/views/{{properCase name}}/store/selectors.js',
        templateFile: './views/selectors.js.hbs',
        abortOnFail: true,
      });
      actions.push({
        type: 'add',
        path:
          '../../src/views/{{properCase name}}/store/tests/selectors.test.js',
        templateFile: './views/selectors.test.js.hbs',
        abortOnFail: true,
      });

      // Reducer
      actions.push({
        type: 'add',
        path: '../../src/views/{{properCase name}}/store/reducers.js',
        templateFile: './views/reducer.js.hbs',
        abortOnFail: true,
      });
      actions.push({
        type: 'add',
        path:
          '../../src/views/{{properCase name}}/store/tests/reducers.test.js',
        templateFile: './views/reducer.test.js.hbs',
        abortOnFail: true,
      });
    }

    // Epics
    if (data.wantEpic) {
      actions.push({
        type: 'add',
        path: '../../src/views/{{properCase name}}/store/epics.js',
        templateFile: './views/epic.js.hbs',
        abortOnFail: true,
      });
      actions.push({
        type: 'add',
        path: '../../src/views/{{properCase name}}/store/tests/epics.test.js',
        templateFile: './views/epic.test.js.hbs',
        abortOnFail: true,
      });
    }

    if (data.wantLoadable) {
      actions.push({
        type: 'add',
        path: '../../src/views/{{properCase name}}/Loadable.js',
        templateFile: './component/loadable.js.hbs',
        abortOnFail: true,
      });
    }

    if (data.wantSubComponents) {
      actions.push({
        type: 'add',
        path: '../../src/views/{{properCase name}}/components/Section.js',
        templateFile: './views/subcomponent.js.hbs',
        abortOnFail: true,
      });
    }

    actions.push({
      type: 'prettify',
      path: '/views/',
    });

    return actions;
  },
};
