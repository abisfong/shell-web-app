/*jshint esversion: 6 */
/*
 * Terminal class used to combine command line input tracking with file system
 * and command line functionality
 */
class Terminal{
  constructor(commandLineElement){
    this.termDoc = new TermDoc(commandLineElement);
    this.fileSys = new FileSystem();
  }

  /*
   * Uses TerminalDoc object, which keeps track of command line input, to
   * retrieve user input at command line and FileSystem's prototype to
   * lookup the command's corresponding function. An error is printed if no
   * such command exists.
   */
}
