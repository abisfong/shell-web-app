/*jshint esversion: 6 */
class Shell {
  constructor(commandLineElement) {
    this.doc = new Document(commandLineElement);
    this.fs = new FileSystem();
    this.parser = new Parser();

    /* Set event tracking on command line element */
    this.doc.setTracker();
  }
  /*
   * DESC: Executes command given if it exists. Returns error string otherwise.
   * PARAM TYPE: String
   * RETRN TYPE: String
   */
  executeCommand(command) {
    /* Parse command */
    var parseResult = this.parser.parseCommand(command, this.doc.getHistory());

    /* If parser returned a value, parse failed */
    if (parseResult)
      return parseResult;

    /* Extract command, command arguments, and flags */
    var commandName = this.parser.getCommandName();
    var commandArgs = this.parser.getCommandArguments();
    var commandFlags = this.parser.getCommandFlags();

    if (this[commandName]) {
      /*
       * If a function from this object other than a command is called, it will
       * fail. Catch the failure and return an error message.
       */
      try {
        return this[commandName](commandArgs, commandFlags);
      } catch (error) {
        console.log(error);
        return commandName + ': command not found (2)';
      }
    } else {
      return commandName + ': command not found';
    }
  }

  /*
   * DESC: Creates new file in system of specified type
   * PARAM TYPE: Array, Object, String
   * RETRN TYPE: String (on failure)
   */
  newSystemFile(paths, flags, type) {
    for (var i = 0; i < paths.length; ++i) {
      /* Parse path for name of new file and path with no name of new file */
      this.parser.parsePath(paths[i]);
      var fileName = this.parser.getFileName();
      var path = this.parser.getPath();
      var pathNoFileName = this.parser.getPathNoFileName();
      var parentFile;

      /* If file exists, return error */
      if (this.fs.getFile(path))
        if (type == DIRECTORY)
          return 'mkdir:' + fileName + ': File exists';
        else
          return 'touch:' + fileName + ': File exists';

      /*
       * Retrieve parent Node of new Node using given path without name of
       * new file
       */
      if (pathNoFileName.length > 0)
        parentFile = this.fs.getFile(pathNoFileName);
      else
        parentFile = this.fs.getCWD();

      /* If parent of new file exists, create file. Else, return error */
      if (parentFile) {
        /* Create new system file with specified type */
        var newFile = this.fs.newFile(type, fileName, parentFile);

        /* Set permissions */
        newFile.setPermissions(['r', 'w']);

        parentFile.addChild(newFile);
      } else {
        if (type == DIRECTORY)
          return 'mkdir: ' + path + ': no such file or directory';
        else
          return 'touch: ' + path + ': no such file or directory';
      }
    }
  }

  start() {
    var commandLineElement = this.doc.getElement();

    /* Initialize prompt */
    this.doc.setPrompt();

    /* Event listener on key up for command line element */
    commandLineElement.addEventListener('keyup', event => {
      /* Execute command on carriage return and print result */
      if (event.key == 'Enter') {
        var result = '';
        var commandLine = this.doc.getCommandLine();

        /* Clear command flags object */
        this.parser.clearFlags();

        /* Do not try to execute command if there is none */
        if (commandLine)
          result = this.executeCommand(commandLine);

        /* If result is more than an empty string, add carriage return */
        if (result && result.length > 0)
          result += '\n';
        else
          result = '';

        /* Update shell output with result */
        this.doc.setOutput(result + this.doc.getPrompt());

        /* Clear flags object */
        this.parser.getCommandFlags();
      }
    });

    /* Event listener on key down for command line element */
    commandLineElement.addEventListener('keydown', (event) => {
      /* Do not allow deletion of prompt on 'backspace' click */
      if (event.key == 'Backspace') {
        let commandLineElement = this.doc.getElement();
        let commandLine = commandLineElement.value;
        let commandLength = commandLine.length;

        if (commandLine[commandLength - 2] == ">") {
          var correction = commandLine.substring(0, commandLength - 2) + ">  ";
          commandLineElement.value = correction;
        }
      }
    });
  }

  /* ------------------------------------------------------------------------
   *                               COMMANDS
   * ------------------------------------------------------------------------ */

  /* Clears screen and scrollback unless -x is given. 'path' is ignored. */
  clear(path, flags = {}) {
    /* Flags check. If an illegal flag is found, return usage message. */
    for (var flag in flags)
      if (flag != 'x')
        return 'clear: illegal option -- ' + flag +
          '\nusage: clear [-x]';

    /* Clear all of shell text using command line element */
    this.doc.clearScrollback('');
  }

  cd(args, flags = {}) {
    /* Flags check. If an illegal flag is found, return usage message. */
    if (Object.entries(flags).length !== 0)
      return 'cd: ' + Object.entries(flags)[0][0] + ': invalid option' +
        '\nusage: cd [directory]';


    /* If a path is specified, change directory to it. Else, go back to root */
    if (args && args.length > 0) {
      /* If more than one path is specified, ignore all but the first */
      args = args[0];

      /* Retrieve file using given path */
      var file = this.fs.getFile(args);

      /* If the path leads to a file of type FILE, return error */
      if (file.getType() == FILE)
        return 'cd: ' + args + ': not a directory';

      /* If file exists, change cwd. Return error otherwise */
      if (file)
        this.fs.cwd = file;
      else
        return 'cd: ' + args + ': no such file or directory';
    } else {
      this.fs.cwd = this.fs.root;
    }
  }

  /* Lists command history */
  history(args, flags = {}) {
    var history = this.doc.getHistory();
    var historyOutput = '';

    /* Flags check: If an illegal flag is found, return usage message */
    if (Object.entries(flags).length !== 0)
      return 'history: ' + Object.entries(flags)[0][0] + ': invalid option ' +
        '\nusage: history';

    /* Return numbered list of history of commands seprated by newlines */
    for (let i = 0; i < history.length; ++i) {
      historyOutput += `${i+1}: ` + history[i];
      if ((i + 2) <= history.length)
        historyOutput += '\n';
    }

    /* Return history output without last character to avoid double newline */
    return historyOutput;
  }

  /* Lists contents of specified directory. If none is specified, cwd is used */
  ls(args, flags = {}) {
    var output = '';
    var fileAccessErrorOutput = '';
    var errorOutput = '';

    /* Flags check. If an illegal flag is found, return usage message */
    for (let flag in flags)
      if (flag != 'a')
        return 'ls: illegal option -- ' + flag + '\nusage: ls [-a] [file ...]';

    /* If there are no arguments, push '.' so cwd contents are listed */
    if (args.length < 1)
      args.push('.');

    /* Iterate through argument list */
    for (let i = 0; i < args.length; ++i) {
      /* Retrieve file in path */
      this.parser.parsePath(args[i]);
      var file = this.fs.getFile(this.parser.getPath());

      /* Check if path search was successful. Else, indicate error. */
      if (file) {
        /* Print path if file type is FILE. Else print directory contents */
        if (file.getType() == FILE) {
          fileAccessErrorOutput += args[i];
        } else {
          /* Get names of directory's children */
          var childNames = file.getChildNames();
          /* Only include name of directory if listing more than one */
          if (args.length > 1)
            output += file.getName() + ":\n";
          /* Include names of children as a tab separated list */
          for (let j = 0; j < childNames.length; ++j) {
            /* Don't include '.' files unless '-a' flag was found */
            if (!flags.a && childNames[j][0] == '.')
              continue;
            output += childNames[j] + '\t';
          }
        }
      } else {
        errorOutput += 'ls: ' + args[i] + ': no such file or directory';
      }
    }

    /* Return output, with error messages first */
    errorOutput = errorOutput + fileAccessErrorOutput;
    if (errorOutput.length > 0 && output.length > 0)
      output = errorOutput + '\n' + output;
    else if (output.length == 0)
      output = errorOutput;
    return output;
  }

  /* Creates new directory under specified path */
  mkdir(args, flags = {}) {
    /* Flags check. If an illegal flag is found, return usage message */
    if (Object.entries(flags).length !== 0)
      return 'mkdir: illegal option -- ' + Object.entries(flags)[0][0] +
        '\nusage: mkdir [directory ...]';
    this.newSystemFile(args, flags, DIRECTORY);
  }

  /* Returns path to cwd. Ignores 'paths' variable. Uses flags for error */
  pwd(paths, flags = {}) {
    var path = [];
    var startNode = this.fs.cwd;

    /* Flags check: If an illegal flag is found, return usage message */
    if (Object.entries(flags).length !== 0)
      return 'pwd: ' + Object.entries(flags)[0][0] + ': invalid option ' +
        '\nusage: pwd';

    /* Find path to cwd */
    while (startNode !== this.fs.root) {
      path.push(startNode.getName());
      startNode = startNode.children['..'];
    }

    /* Return String of path names flipped to the correct order and joined */
    return '/' + path.reverse().join('/');
  }

  /* Removes a system file of type FILE */
  rm(args, flags) {
    var errorOutput = '';
    /* Iterate through argument list */
    for (let i = 0; i < args.length; ++i) {
      /* Retrieve file in path */
      this.parser.parsePath(args[i]);
      var file = this.fs.getFile(this.parser.getPath());

      /* Check if path search was successful. Else, indicate error. */
      if (file) {
        /* Print error if file type is DIRECTORY */
        if (file.getType() != FILE) {
          errorOutput += 'rm: ' + args[i] + ': is a directory';
        } else if (!this.fs.removeFile(file)) {
          errorOutput += 'rm: cannot remove \'' + args[i] +
            '\': permission denied';
        }
      } else {
        errorOutput += 'rm: ' + args[i] + ': no such file or directory';
      }
    }

    return errorOutput;
  }

  /* Removes a system file of type FILE */
  rmdir(args, flags) {
    var errorOutput = '';
    /* Iterate through argument list */
    for (let i = 0; i < args.length; ++i) {
      /* Retrieve file in path */
      this.parser.parsePath(args[i]);
      var file = this.fs.getFile(this.parser.getPath());

      /* Check if path search was successful. Else, indicate error. */
      if (file) {
        /* Print error if file type is DIRECTORY */
        if (file.getType() != DIRECTORY) {
          errorOutput += 'rmdir: ' + args[i] + ': not a directory';
        } else if (!this.fs.removeFile(file)) {
          errorOutput += 'rmdir: cannot remove \'' + args[i] +
            '\': permission denied';
        }
      } else {
        errorOutput += 'rmdir: ' + args[i] + ': no such file or directory';
      }
    }

    return errorOutput;
  }

  /* Creates new file under specified path. */
  touch(args, flags = {}) {
    /* Flags check. If an illegal flag is found, return usage message */
    if (Object.entries(flags).length !== 0)
      return 'touch: illegal option -- ' + Object.entries(flags)[0][0] +
        '\nusage: touch [file ...]';
    this.newSystemFile(args, flags, FILE);
  }

  /* Uploads a folder into the into the file system */
  upload(args, flags) {

  }
}









/* EOF */
