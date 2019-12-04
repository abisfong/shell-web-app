/*jshint esversion: 6 */
const DIRECTORY = 'directory';
const FILE = 'file';

/* --------------------------------------------------------------------------
 *                               DESCRIPTION
 * Node class used as tree elements of file system class for file management.
 *
 * All directories or files are Nodes. Note that all Nodes are capable of
 * having children Nodes.
 * -------------------------------------------------------------------------- */
class Node{
  constructor(type, name){
    this.type = type;
    this.name = name;
    this.children = {};
  }

  /* Gets child based on name */
  getChild(name){
    // for(var i = 0; i < this.children.length; ++i)
    //   if(this.children[i].name == name)
    //     return this.children[i];
    // return null;
    return this.children[name];
  }

  /* Returns Node name */
  getName(){
    return this.name;
  }

  /* Returns Node type. Available types are 'directory' or 'file' */
  getType(){
    return this.type;
  }

  /* Sets contents of this Node. Contents can be a file, image, etc. */
  setContent(content){
    this.content = content;
  }

  /* Sets a reference to parent of this Node. */
  setParent(parent){
    this.parent = parent;
  }

  /* Adds new child Node to this Node in dictionary form with its name as key */
  addChild(newNodeChild){
    this.children[newNodeChild.name] = newNodeChild;
  }

  /* Prints children of Node as tab divided list */
  printChildren(){
    var output = '';
    this.children.forEach(function(child){
      output += child.getName()+'\t';
    });
    return output+'\b\n';
  }
}

/* --------------------------------------------------------------------------
 *                              DESCRIPTION
 * File system class that mimics a file system and command line functionality
 * -------------------------------------------------------------------------- */
class FileSystem{
  constructor(){
    /* Initialize root */
    this.root = new Node(DIRECTORY, 'ROOT');
    this.root.setParent(this.root);

    var cssNode = new Node(FILE, '.css');
    var htmlNode = new Node(FILE, '.html');

    this.root.addChild(cssNode);
    this.root.addChild(htmlNode);

    /* Initialize current working directory */
    this.cwd = this.root;
  }

  /* Sets contents of a child Node of cwd. Contents can be a file, image, etc.*/
  addContent(content, fileName){
    this.cwd.children[fileName].setContent(content);
  }

   /* Executes command given if it exists. Returns error string otherwise. */
  executeCommand(command){
    /*
     * If user's command has corresponding function, run function. Else, return
     * string that indicates error.
     */
    if(this[command[0]]){
      console.log(command[0]+': command found');
      return this[command[0]](command.splice(1).sort());
    }else{
      return command[0]+': command not found';
    }
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

        /* Try to retrieve  */
        var argChild = this.cwd.getChild(args[i]);

        if(argChild){
          output += argChild.getName()+":\n";
          output += argChild.printChildren();
        }else{
          errorOutput += 'ls: '+args[i]+': no such file or directory\n';
        }
      }
    }else{
      output += this.cwd.printChildren();
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

      this.cwd.addChild(newDirectory);
    }
  }

  /* Creates new file under current working directory. */
  touch(fileName){
    var newFile = newSystemNode(FILE, fileName);
    this.cwd.addChild(newFile);
  }
}



























/* EOF */
