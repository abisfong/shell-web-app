/*jshint esversion: 6 */
const DIRECTORY = 'directory';
const FILE = 'file';

/* --------------------------------------------------------------------------
 *                               DESCRIPTION
 * Node class used as tree elements of file system class.
 *
 * NOTE: All directories or files are Nodes. All Nodes are capable of
 * having child Nodes.
 * -------------------------------------------------------------------------- */
class Node {
  constructor(type, name) {
    this.type = type;
    this.name = name;
    this.children = {};
    this.childCount = 0;
  }

  /*
   * DESC: Adds new child Node to this Node's 'children' object in dictionary
   *       form with the child Node's name as key and updates child count.
   * PARAM TYPE: Array of Nodes
   * RETRN TYPE: void
   */
  addChild(newChild, name = newChild.name) {
    this.children[name] = newChild;
    this.childCount++;
  }

  /*
   * DESC: Gets child based on name
   * PARAM TYPE: String
   * RETRN TYPE: Node
   */
  getChild(name) {
    return this.children[name];
  }

  /*
   * DESC: Gets count of children
   * PARAM TYPE: void
   * RETRN TYPE: Number
   */
  getChildCount() {
    return this.childCount;
  }

  /*
   * DESC: Gets names of all children
   * PARAM TYPE: void
   * RETRN TYPE: Array
   */
  getChildNames() {
    console.log('In get child names');
    var childNames = [];
    for (var childName in this.children) {
      childNames.push(childName);
    }
    console.log('Returning from get child names');
    return childNames;
  }

  /*
   * DESC: Returns Node name
   * PARAM TYPE: void
   * RETRN TYPE: String
   */
  getName() {
    return this.name;
  }

  /*
   * DESC: Returns Node type. Available types are 'directory' or 'file'
   * PARAM TYPE: void
   * RETRN TYPE: String
   */
  getType() {
    return this.type;
  }

  /*
   * DESC: Sets contents of this Node. Contents can be a file, image, etc.
   * PARAM TYPE: file
   * RETRN TYPE: void
   */
  setContent(content) {
    this.content = content;
  }
}

/* --------------------------------------------------------------------------
 *                              DESCRIPTION
 * File system class that mimics a file system and command line functionality
 * -------------------------------------------------------------------------- */
class FileSystem {
  constructor() {
    this.root = this.nodeInit(DIRECTORY, 'ROOT');
    this.cwd = this.root;
  }

  /*
   * DESC: Executes command given if it exists. Returns error string otherwise.
   * PARAM TYPE: String
   * RETRN TYPE: String
   */
  executeCommand(command, flags) {
    console.log('In executeCommand');
    console.log('command:');
    console.log(command);
    if (this[command[0]]) {
      /*
       * If a function from this object other than a command is called, it will
       * fail. Catch the failure and return an error message.
       */
      try {
        return this[command[0]](command.splice(1).sort(), flags);
      } catch (error) {
        console.log(error);
        return command[0] + ': command not found (2)';
      }
    } else {
      return command[0] + ': command not found';
    }
  }

  /*
   * DESC: finds flags that begin with '-' within a command. Returns flags
   *       found as object and split command string without flags.
   * PARAM TYPE: String
   * RETRN TYPE: [Object, String]
   */
  findFlags(command) {
    var flags = {};
    var commandSplit = command.trim().split(' ');

    /*
     * Look through command string arguments for flags. If a flag is found,
     * save it then splice it out of the split command string array.
     */
    for (var i = 0; i < commandSplit.length; ++i) {
      if (commandSplit[i][0] == '-') {
        for (var j = 1; j < commandSplit[i].length; ++j) {
          if (commandSplit[i][j].match(/[a-z]/i))
            flags[commandSplit[i][j]] = commandSplit[i][j];
        }
        commandSplit.splice(i, 1);
      }
    }

    console.log('flags:');
    console.log(flags);

    /* As a pair, return the split command string array and the flags found */
    return [commandSplit, flags];
  }

  /*
   * DESC: finds Node of correspoding path.
   * PARAM TYPE: String
   * RETRN TYPE: [Node, String], [Node, null], null
   */
  findPath(path) {
    console.log('path:');
    console.log(path);
    /* Split path string at '/' */
    var pathSplit = path.split('/');
    console.log('pathSplit:');
    console.log(pathSplit);

    /* On split, some indices may contain ''. Delete those that do */
    for (var i = 0; i < pathSplit.length; ++i) {
      if (pathSplit[i] == '')
        pathSplit.splice(i, 1);
    }

    /* Check if path starts at root. Else begin search from cwd */
    if (path[0] == '/') {
      return this.findPathRecursive(pathSplit, this.root);
    } else {
      return this.findPathRecursive(pathSplit, this.cwd);
    }
  }

  /*
   * DESC: Helper for 'findPath.' Finds Node of correspoding path. If path is
   *       for creating a new node, then the return value includes the name
   *       of the new node, which is located at the end of the path. If the path
   *       is for lookup only, the return value is [Node, null]. If there is an
   *       error in the path, the return value is null.
   * PARAM TYPE: String
   * RETRN TYPE: [Node, String], [Node, null], null
   */
  findPathRecursive(path, startNode) {
    /* Look for next node to traverse to using the next path name */
    var nextNode = startNode.children[path[0]];

    /*
     * If path name exists, use the retrieved node to continue searching
     * through the path. Splice the first element of 'path' so that the next
     * path name is used in the next traversal.
     */
    if (nextNode)
      return this.findPathRecursive(path.splice(1), nextNode);
    /*
     * If path name does not exist, then nextNode will be undefined. If 'path'
     * has 1 or less names left to search through, the search was succesful
     * in finding the last node of the path. If 'path' has more than 1 name
     * left to look at, then we have encountered an error and so no such path
     * exists; return null.
     */
    else if (path.length > 1)
      return null;
    /*
     * As explained above, if the path search was successful, we will be at the
     * end of the path. The last node encountered will be returned, along with
     * the last name in the path.
     *
     * NOTE: The last name in the path is returned to facilitate the creation of
     * a new node in the case that a path is used to describe where to create
     * it. In commands like 'ls,' if a name is returned, this is considered a
     * failure because if the name was a node it would have activated one more
     * recursion and the name returned would have the value 'undefined'
     */
    return [startNode, path[0]];
  }

  /*
   * DESC: Creates new file in system of specified type
   * PARAM TYPE: Array, Object, String
   * RETRN TYPE: String (on failure)
   */
  newSystemFile(paths, flags, type) {
    for (var i = 0; i < paths.length; ++i) {
      /* Retrieve Node of where to put new Node using given path */
      var pathResult = this.findPath(paths[0]);
      if (pathResult && pathResult[0] && pathResult != null) {
        var parentFile = pathResult[0];
        var fileName = pathResult[1];

        /* Create new system file with specified type */
        var newDirectory = this.nodeInit(type, fileName, parentFile);
        parentFile.addChild(newDirectory);
      } else if (pathResult[0] && pathResult == null) {
        return 'mkdir:' + pathResults[0].name + ': File exists';
      } else {
        return 'mkdir: ' + paths[i] + ': no such file or directory';
      }
    }
  }

  /*
   * DESC: Initializes a new file system Node. Each node contains directories
           '.' and '..' on creation as well as files '.css' and '.html', which
           are used to render a Node's <section>.
   *
   * PARAM TYPE: String, String, Node (defaults to null for creation of root)
   * RETRN TYPE: Node
   */
  nodeInit(type, name, parent = null) {
    var newNode = new Node(type, name);
    var css = new Node(FILE, '.css');
    var html = new Node(FILE, '.html');

    newNode.addChild(css);
    newNode.addChild(html);
    newNode.addChild(newNode, '.');
    if (parent)
      newNode.addChild(parent, '..');
    else
      newNode.addChild(newNode, '..');
    return newNode;
  }

  /*
   * DESC: Sets contents of specified Node. Contents can be a file, image,
   *       etc.
   * PARAM TYPE: file, String
   * RETRN TYPE: void
   */
  uploadContent(content, fileName) {
    this.cwd.children[fileName].setContent(content);
  }

  /* ------------------------------------------------------------------------
   *                               COMMANDS
   * ------------------------------------------------------------------------ */

  /* Clears screen and scrollback unless -x is given. 'path' is ignored. */
  clear(path, flags={}){
    /* Flags check. If an illegal flag is found, return usage message. */
    for (var flag in flags)
      if (flag != 'x')
        return 'clear: illegal option -- ' + flag +
               '\nusage: clear [-x]';

    /*
     * Return indication of clear request and x flag, if defined. Clear
     * request will be handled by Terminal class using terminal document.
     */
    return ['clear-request', flags.x];
  }

  cd(path, flags = {}) {
    /* Flags check. If an illegal flag is found, return usage message. */
    if (Object.entries(flags).length !== 0)
      return 'cd: ' + Object.entries(flags)[0][0] + ': invalid option' +
             '\nusage: cd [directory]';

    /* If a path is specified, change directory to it. Else, go back to root */
    if(path){
      /* Retrieve Node of last element in path. Use only first path. */
      var pathResult = this.findPath(path[0]);

      /* If path exists, change cwd. Return error otherwise */
      if (pathResult && pathResult[0] && pathResult[1] == null) {
        this.cwd = pathResult[0];
      } else {
        return 'cd: ' + path[0] + ': no such file or directory';
      }
    } else {
      this.cwd = this.root;
    }
  }

  /* Lists contents of specified directory. If none is specified, cwd is used */
  ls(args, flags = {}) {
    var output = '';
    var errorOutput = '';

    /* Flags check. If an illegal flag is found, return usage message */
    for (var flag in flags)
      if (flag != 'a')
        return 'ls: illegal option -- ' + flag + '\nusage: ls [-a] [file ...]';

    /* If there are no arguments, push '.' so cwd contents are listed */
    if (args.length < 1)
      args.push('.');

    /* Iterate through argument list */
    for (var i = 0; i < args.length; ++i) {
      /* Retrieve Node of last element in path */
      var pathResult = this.findPath(args[i]);

      /*
       * Using path results, check if path search was successful. Else,
       * indicate error.
       */
      if (pathResult && pathResult[0] && pathResult[1] == null) {
        /*
         * Print path if search result is of file type. Else print directory
         * contents
         */
        if (pathResult[0].getType() == FILE)
          output += args[i];
        else {
          /* Get names of Node's children */
          var childNames = pathResult[0].getChildNames();
          /* Only include name of directory if listing more than one */
          if (args.length > 1)
            output += pathResult[0].getName() + ":\n";
          for (i = 0; i < childNames.length; ++i) {
            if (!flags.a && childNames[i][0] == '.') {
              console.log('continuing, no print');
              continue;
            }
            output += childNames[i] + '\t';
          }
        }
      } else {
        errorOutput += 'ls: ' + args[i] + ': no such file or directory';
      }
    }

    /* Return output, with error messages first */
    return errorOutput + output;
  }

  /* Creates new directory under specified path */
  mkdir(paths, flags = {}) {
    /* Flags check. If an illegal flag is found, return usage message */
    if (Object.entries(flags).length !== 0)
      return 'mkdir: illegal option -- ' + Object.entries(flags)[0][0] +
             '\nusage: mkdir [directory ...]';
    this.newSystemFile(paths, flags, DIRECTORY);
  }

  /* Returns path to cwd. Ignores 'paths' variable */
  pwd(paths, flags={}){
    var path = [];
    var startNode = this.cwd;

    /* Flags check. If an illegal flag is found, return usage message */
    if (Object.entries(flags).length !== 0)
      return 'pwd: ' + Object.entries(flags)[0][0] + ': invalid option ' +
             '\nusage: pwd';

    /* Find path to cwd */
    while(startNode !== this.root){
      path.push(startNode.getName());
      startNode = startNode.children['..'];
    }

    /* Return String of path names flipped to the correct order and joined */
    return '/'+path.reverse().join('/');
  }

  /* Creates new file under specified path. */
  touch(paths, flags = {}) {
    /* Flags check. If an illegal flag is found, return usage message */
    if (Object.entries(flags).length !== 0)
      return 'touch: illegal option -- ' + Object.entries(flags)[0][0] +
             '\nusage: touch [file ...]';
    this.newSystemFile(paths, flags, FILE);
  }
}









/* EOF */
