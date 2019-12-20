/*jshint esversion: 6 */
const DIRECTORY = 'directory';
const FILE = 'file';

/* --------------------------------------------------------------------------
 *                              DESCRIPTION
 * File system class that mimics a file system and command line functionality
 * -------------------------------------------------------------------------- */
class FileSystem {
  constructor() {
    this.root = this.newFile(DIRECTORY, 'ROOT');
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
  newFile(type, name, parent = null) {
    var newFile = new Node(type, name);
    var css     = new Node(FILE, '.css');
    var html    = new Node(FILE, '.html');

    newFile.addChild(newFile, '.');
    css.addChild(css, '.');
    html.addChild(html, '.');

    if (parent)
      newFile.addChild(parent, '..');
    else
      newFile.addChild(newFile, '..');

    css.addChild(newFile, '..');
    html.addChild(newFile, '..');

    newFile.addChild(css);
    newFile.addChild(html);
    return newFile;
  }

  /* Remove file if permissable */
  removeFile(file){
    var permissions = file.getPermissions();

    if (permissions.w) {
      /* Get file parent */
      var parentFile = file.children['..'];
      /* Delete file */
      delete parentFile.children[file.getName()];

      /* Return true to indicate success */
      return true;
    } else {
      /* Return false to indicate failure */
      return false;
    }
  }

  /*
   * DESC: Returns current working directory of file system
   * PARAM TYPE: void
   * RETRN TYPE: Node
   */
  getCWD(){
    return this.cwd;
  }

  /*
   * DESC: Finds file using given path. Returns null on failure.
   * PARAM TYPE: String
   * RETRN TYPE: Node or null
   */
  getFile(path){
    var pathSplit = path.split('/'); /* Split path into individual names */
    var startNode;                   /* Holds starting node for path search */

    /* Check if path starts at root. Else begin search from cwd */
    if (path[0] == '/')
      startNode = this.root;
    else
      startNode = this.cwd;

    /* Recursively search through file tree */
    return (function searchPath(path, node){
      /* Get next name in path */
      var nextNodeName = path[0];
      /* Try to retrieve next node named in path */
      var nextNode = node.children[nextNodeName];

      /* If name exists in current children of node, continue tree traversal */
      if (nextNode)
        return searchPath(path.splice(1), nextNode);
      /*
       * If path has more names to search through, an error has occured. Return
       * null to indicate failure.
       */
      if (path.length > 0)
        return null;

      /*
       * If nextNode does not exist and there are no more names in 'path' to
       * traverse, the search was successful. Return current 'node'.
       */
      return node;
    })(pathSplit, startNode);
  }

  /*
   * DESC: Returns root of file system
   * PARAM TYPE: void
   * RETRN TYPE: Node
   */
  getRoot(){
    return this.root;
  }
}

/*
 * DESC:
 * PARAM TYPE:
 * RETRN TYPE:
 */































/* EOF */
