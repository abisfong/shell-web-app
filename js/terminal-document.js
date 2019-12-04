/*jshint esversion: 6 */
/* -----------------------------------------------------------------------------
 * Command line class used to keep track of command line input
 */
class TermDoc{
  constructor(commandLineElement, prompt = "> "){
    this.commandLineElement = commandLineElement;
    /* Keeps track of all commands for entirety of instance */
    this.history = [];
    /* Keeps track of start position of new command */
    this.position = 0;

    /* Initialize prompt */
    this.setOutput(prompt);
  }

  /*
   * Updates text position of start of most recent command.
   * Updates command count
   * Updates 'history' to keep track of all commands
   */
  setPosition(){
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

}


































/* EOF */
