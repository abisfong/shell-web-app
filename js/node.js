/*jshint esversion: 6 */
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
    this.permissions = {};
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
    var childNames = [];
    for (var childName in this.children) {
      childNames.push(childName);
    }
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

  getPermissions(){
    return this.permissions;
  }

  /*
   * DESC: Returns Node type. Available types are 'directory' or 'file'
   * PARAM TYPE: void
   * RETRN TYPE: String
   */
  getType() {
    return this.type;
  }

  setPermissions(permissions=[]){
    for(let i = 0; i < permissions.length; ++i)
      this.permissions[permissions[i]] = true;
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
