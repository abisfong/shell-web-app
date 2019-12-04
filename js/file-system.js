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
   * DESC: Executes command given if it exists. Returns error string otherwise.
   * PARAM TYPE: String
   * RETRN TYPE: String
   */
  executeCommand(command){
    if(this[command[0]]){
      return this[command[0]](command.splice(1).sort());
    }else{
      return command[0]+': command not found';
    }
  }

  /*
   * DESC: finds Node of correspoding path.
   * PARAM TYPE: String
   * RETRN TYPE: [Node, assumedNameForNewNode], [Node, null], null
   */
  findPath(path){
    var pathSplit = path.split('/');

    /* Check if path starts at root. Else begin search from cwd */
    if(path[0] == '/'){
      return findPathRecursive(pathSplit, this.root);
    }else{
      return findPathRecursive(pathSplit, this.cwd);
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
    var nextNode = startNode[path[0]];
    if(nextNode)
      return findPathRecursive(path.splice(1), nextNode);
    else if(path.length > 1)
      return null;
    return [startNode, path[0]];
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

    /*
     * If multiple arguments are listed, try to list all their contents. Else,
     * list the contents of the current working directory.
     */
    if(args.length){
      /* Iterate through argument list */
      for(var i = 0; i < args.length; ++i){
        var argChild = this.cwd.getChild(args[i]);

        if(argChild){
          output += argChild.getName()+":\n";
          output += argChild.toStringChildren();
        }else{
          errorOutput += 'ls: '+args[i]+': no such file or directory\n';
        }
      }
    }else{
      output += this.cwd.toStringChildren();
    }

    return errorOutput+output;
  }

  /*
   * Creates new directory under current working directory. Each new directory
   * has two directories on creation: .css and .html, which hold structural
   * style information about a directory.
   */
  mkdir(directoryNames){
    for(var i = 0; i < directoryNames.length; ++i){
      var newDirectory = new Node(DIRECTORY, directoryNames[i]);
      var cssNode = new Node(FILE, '.css');
      var htmlNode = new Node(FILE, '.html');

      newDirectory.addChild(cssNode);
      newDirectory.addChild(htmlNode);

      this.addChild(newDirectory);
    }
  }

  /* Creates new file under current working directory. */
  touch(fileName){
    var newFile = newSystemNode(FILE, fileName);
    this.cwd.addChild(newFile);
  }
}



























/* EOF */
