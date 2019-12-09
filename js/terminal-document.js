/*jshint esversion: 6 */
/* -----------------------------------------------------------------------------
 * Command line class used to keep track of command line input
 */
class TerminalDocument{
  constructor(commandLineElement, prompt = "> "){
    this.commandLineElement = commandLineElement;
    /* Keeps track of all commands for entirety of instance */
    this.history = [];
    /* Keeps track of start position of new command */
    this.position = 0;

    /* Initialize prompt */
    this.setOutput(prompt);
  }

  /* Gets command line element attached to this object */
  getElement(){
    return this.commandLineElement;
  }

  /* Returns array of all inputed commands */
  getHistory(){
    return this.history;
  }

  /* Returns most recent command */
  getLatestCommand(){
    return this.history[this.history.length-1];
  }

  /* Returns index of start position of most recent command */
  getPostion(){
    return this.position;
  }

  /* Returns command line text */
  getText(){
    return this.commandLineElement.value;
  }

  /* Returns length of command line text */
  getTextLength(){
    return this.commandLineElement.value.length;
  }

  /*
   * Updates text position of start of most recent command.
   * Updates command count
   * Updates 'history' to keep track of all commands
   */
  setHistory(){
    for(var i = this.position; i < this.commandLineElement.value.length; ++i){
      if(this.commandLineElement.value[i] == '>'){
        this.position = i+2;
        this.history.push(this.commandLineElement.value.substring(i+2));
      }
    }
  }

  /* Adds output to command line string */
  setOutput(output){
    this.commandLineElement.value += output;
  }

}


































/* EOF */
