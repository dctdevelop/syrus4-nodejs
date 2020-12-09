/**
 * Onewire module get information about onewire
 * @module Onewire
 */
import Utils from "./Utils";


/**
 * allow to get al lthe state of the ibuttons connected
 */
function getAll(): Promise<any>{
  return Utils.OSExecute("apx-onewire-ibutton getall");
}

/**
 * allow to get al lthe state of the ibuttons connected
 */
function get(idButton:string): Promise<any>{
  if(idButton == "") throw "idButton is required";
  return Utils.OSExecute(`apx-onewire-ibutton get ${idButton}`);
}

/**
 * allow to get al lthe state of the ibuttons connected
 */
function create(idButton:string, aliasName:string): Promise<any>{
  if(aliasName == "") throw "Alias Name is required";
  if(idButton == "") throw "idButton is required";
  return Utils.OSExecute(`apx-onewire-ibutton create ${idButton} ${aliasName}`);
}


function remove(idButton): Promise<any>{
  if(idButton == "") throw "idButton is required";
  return Utils.OSExecute(`apx-onewire-ibutton delete ${idButton}`);
}


export default { getAll, get, create, remove };