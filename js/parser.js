/*jshint esversion: 6 */
class Parser {
  constructor() {
    this.commandName = ''; /* Contains command name */
    this.commandArguments = []; /* Contains command arguments */
    this.commandFlags = {}; /* Contains command flags */

    this.fileName = ''; /* Contains name of file found at end of path */
    this.path = ''; /* Contains path to a file */
    this.pathNoFileName = '';
  }

  /* Clears flags object. Required before execution of new command */
  clearFlags() {
    this.commandFlags = {};
  }

  getCommandArguments() {
    return this.commandArguments;
  }

  getCommandFlags() {
    return this.commandFlags;
  }

  getCommandName() {
    return this.commandName;
  }

  getFileName() {
    return this.fileName;
  }

  getPath() {
    return this.path;
  }

  getPathNoFileName() {
    return this.pathNoFileName;
  }

  parseCommand(commandLine, history) {
    var commandLineSplit = commandLine.trim().split(' ');
    var tempCommandArray = [];

    /* Replace event requests with corresponding command */
    for (let i = 0; i < commandLineSplit.length; ++i) {
      if (commandLineSplit[i][0] == '!') {
        let eventRequest = commandLineSplit[i];
        let eventNumber = parseInt(eventRequest.substring(1));
        let command = history[eventNumber - 1];
        let commandSplit = command.split(' ');
        let historyEnd = history.length - 1;

        /*
         * Delete most recent history record and return error message if event
         * is not found.
         */
        if (eventNumber > historyEnd || eventNumber < 0) {
          history.splice(historyEnd, 1);
          return eventRequest + ': event not found';
        }

        /* Change event request to corresponding command */
        for(let j = 0; j < commandSplit.length; ++j)
          tempCommandArray.push(commandSplit[j]);

        /* Update history to include command and not event request. */
        history[historyEnd] = history[historyEnd].replace(eventRequest, command);
      }else{
        tempCommandArray.push(commandLineSplit[i]);
      }
    }
    commandLineSplit = tempCommandArray;

    /* Find flag arguments */
    for (let i = 0; i < commandLineSplit.length; ++i) {
      /* If flag encountered, save to flag object */
      if (commandLineSplit[i][0] == '-') {
        for (let j = 1; j < commandLineSplit[i].length; ++j) {
          if (commandLineSplit[i][j].match(/[a-z]/i))
            this.commandFlags[commandLineSplit[i][j]] = commandLineSplit[i][j];
        }
        commandLineSplit.splice(i, 1);
      }
    }

    /* Save command name. First index is assumed to be command name. */
    this.commandName = commandLineSplit[0];

    /* Save arguments. Exclude command name. */
    commandLineSplit.splice(0, 1);
    this.commandArguments = commandLineSplit;
  }

  parsePath(path) {
    /* Split path into individual names */
    var pathSplit = path.split('/');

    /* On split, some indices may contain ''. Delete those that do */
    for (var i = 0; i < pathSplit.length; ++i) {
      if (pathSplit[i] == '')
        pathSplit.splice(i, 1);
    }

    /* Save last path name as file name */
    this.fileName = pathSplit[pathSplit.length - 1];

    /* Save path as pathSplit / */
    this.path = pathSplit.join('/');

    /* Save path with no file name as pathSplit without last index */
    pathSplit.splice(pathSplit.length - 1, 1);
    this.pathNoFileName = pathSplit.join('/');
  }
}









/* EOF */
