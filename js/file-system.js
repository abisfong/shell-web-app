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
class Node{
  constructor(type, name){
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
  addChild(newChild, name=newChild.name){
    this.children[name] = newChild;
    this.childCount++;
  }

  /*
   * DESC: Gets child based on name
   * PARAM TYPE: String
   * RETRN TYPE: Node
   */
  getChild(name){
    return this.children[name];
  }

  /*
   * DESC: Gets count of children
   * PARAM TYPE: void
   * RETRN TYPE: Number
   */
  getChildCount(){
    return this.childCount;
  }

  /*
   * DESC: Returns Node name
   * PARAM TYPE: void
   * RETRN TYPE: String
   */
  getName(){
    return this.name;
  }

  /*
   * DESC: Returns Node type. Available types are 'directory' or 'file'
   * PARAM TYPE: void
   * RETRN TYPE: String
   */
  getType(){
    return this.type;
  }

  /*
   * DESC: Sets contents of this Node. Contents can be a file, image, etc.
   * PARAM TYPE: file
   * RETRN TYPE: void
   */
  setContent(content){
    this.content = content;
  }

  /*
   * DESC: Creates string consisting of names of child Nodes separated by
   *       specified separator. Separator defaults to tab.
   * PARAM TYPE: String or Char
   * RETRN TYPE: String
   */
  toStringChildren(separator = '\t'){
    var output = '';
    var loopCount = 0;
    for(var name in this.children){
      output += name;
      if(loopCount+1 <= this.childCount)
        output += separator;
      loopCount++;
    }
    return output;
  }
}

/* --------------------------------------------------------------------------
 *                              DESCRIPTION
 * File system class that mimics a file system and command line functionality
 * -------------------------------------------------------------------------- */
class FileSystem{
  constructor(){
    this.root = this.nodeInit(DIRECTORY, 'ROOT');
    this.cwd = this.root;
  }

  /*
   * DESC: Executes command given if it exists. Returns error string otherwise.
   * PARAM TYPE: String
   * RETRN TYPE: String
   */
  executeCommand(command){
    if(this[command[0]]){
      return this[command[0]](command.splice(1).sort());
    }else{
      return command[0]+': command not found\n';
    }
  }

  /*
   * DESC: finds Node of correspoding path.
   * PARAM TYPE: String
   * RETRN TYPE: [Node, assumedNameForNewNode], [Node, null], null
   */
  findPath(path){
    console.log('path:');
    console.log(path);
    /* Split path string at '/' */
    var pathSplit = path.split('/');
    console.log('pathSplit:');
    console.log(pathSplit);

    /* On split, some indices may contain ''. Delete those that do */
    for(var i = 0; i < pathSplit.length; ++i){
      if(pathSplit[i] == '')
        pathSplit.splice(i, 1);
    }

    /* Check if path starts at root. Else begin search from cwd */
    if(path[0] == '/'){
      return this.findPathRecursive(pathSplit, this.root);
    }else{
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
   * RETRN TYPE: [Node, assumedNameForNewNode], [Node, null], null
   */
  findPathRecursive(path, startNode){
    /* Look for next node to traverse to using the next path name */
    var nextNode = startNode.children[path[0]];

    /*
     * If path name exists, use the retrieved node to continue searching
     * through the path. Splice the first element of 'path' so that the next
     * path name is used in the next traversal.
     */
    if(nextNode)
      return this.findPathRecursive(path.splice(1), nextNode);
    /*
     * If path name does not exist, then nextNode will be undefined. If 'path'
     * has 1 or less names left to search through, the search was succesful
     * in finding the last node of the path. If 'path' has more than 1 name
     * left to look at, then we have encountered an error and so no such path
     * exists; return null.
     */
    else if(path.length > 1)
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
   * DESC: Initializes a new file system Node. Each node contains directories
           '.' and '..' on creation as well as files '.css' and '.html', which
           are used to render a Node's <section>.
   *
   * PARAM TYPE: String, String, Node (defaults to null for creation of root)
   * RETRN TYPE: Node
   */
  nodeInit(type, name, parent = null){
    var newNode = new Node(type, name);
    var css = new Node(FILE, '.css');
    var html = new Node(FILE, '.html');

    newNode.addChild(css);
    newNode.addChild(html);
    newNode.addChild(newNode, '.');
    if(parent)
      newNode.addChild(parent, '..');
    else
      newNode.addChild(newNode, '..');
    return newNode;
  }

  /*
   * DESC: Sets contents of a child Node of cwd. Contents can be a file, image,
   *       etc.
   * PARAM TYPE: file, String
   * RETRN TYPE: void
   */
  setContent(content, fileName){
    this.cwd.children[fileName].setContent(content);
  }

  /* ------------------------------------------------------------------------
   *                               COMMANDS
   * ------------------------------------------------------------------------ */

  /* Lists contents of specified directory. If none is specified, cwd is used */
  ls(args){
    var output = '';
    var errorOutput = '';
    var options = [];

    /*
     * If multiple arguments are listed, try to list all their contents. Else,
     * list the contents of the current working directory.
     */
    console.log('args:');
    console.log(args);
    if(args.length){
      /* Iterate through argument list */
      for(var i = 0; i < args.length; ++i){
        /* Retrieve Node of last element in path */
        var pathResult = this.findPath(args[i]);
        console.log('pathResult:');
        console.log(pathResult);

        /*
         * Using path results, check if path search was successful. Else
         * indicate error.
         */
        if(pathResult && pathResult[0] && pathResult[1] == null){
          /*
           * Print path if search result is of file type. Else print directory
           * contents
           */
          if(pathResult[0].getType() == FILE)
            output += args[i]+'\n';
          else{
            /* Only include name of directory if listing more than one */
            if(args.length > 1)
              output += pathResult[0].getName()+":\n";
            output += pathResult[0].toStringChildren()+'\n';
          }
        }else{
          errorOutput += 'ls: '+args[i]+': no such file or directory\n';
        }
      }
    }else{
      output += this.cwd.toStringChildren()+'\n';
    }

    return errorOutput+output;
  }

  /* Creates new directory under specified path */
  mkdir(paths){
    for(var i = 0; i < paths.length; ++i){
      /* Retrieve Node of where to put new Node using given path */
      var pathResult = this.findPath(paths[0]);
      var parentDirectory = pathResult[0];
      var directoryName = pathResult[1];

      /* Create new directory and add it to parent directory children */
      var newDirectory = this.nodeInit(DIRECTORY, directoryName, parentDirectory);
      parentDirectory.addChild(newDirectory);
    }
  }

  /* Creates new file under current working directory. */
  touch(fileName){
    var newFile = newSystemNode(FILE, fileName);
    this.cwd.addChild(newFile);
  }
}


/* NOTES: mkdir and touch can use the same function to create nodes. Use a
   separate function they both can use except each inserts the correct 'type'.
*/


























/* EOF */
