/**
 * Logrotate module setup get and set counters from APEX OS
 * @module Database
 */
 import * as Utils from "./Utils"
 import { SystemRedisSubscriber as subscriber } from "./Redis";


async function getStatus(path: string = '') {
    return await Utils.OSExecute(`apx-db status --database=${path}`);
}

async function query(path: string = '', command: string = '') {
    return await Utils.OSExecute(`apx-db query --database=${path} '${command}'`);
} 

async function createDatabase(path: string = '') {  
    return await Utils.OSExecute(`apx-db create --database=${path}`).then( response => {
        console.log('createDatabase success:', response)
    }).catch( error => {
        console.log('createDatabase error:', error)
    });
 }

async function createTable(path: string = '', tableName:string = 'default_table') {
    return await Utils.OSExecute(`apx-db create --database=${path} --table=${tableName}`).then( response => {
        console.log('createTable success:', response)
    }).catch( error => {
        console.log('createTable error:', error)
    });
}


async function insertRow(path:string = '', tableName: string = 'default_table', payload: string = '') {
    const timestamp = Date.now();
    return await Utils.OSExecute(`apx-db write --database=${path} --table=${tableName} --timestamp=${timestamp} --payload='${payload}'` ).then( response => {
        console.log('insertRow success:', response)
    }).catch( error => {
        console.log('insertRow error:', error)
    });
}

async function readFromTo(path:string = '', tableName: string = 'default_table', from: number = 0, to: number = 100) {
    return await Utils.OSExecute(`apx-db read --database=${path} --table=${tableName} --from=${from} --to=${to}`)
}


 export default { createDatabase, insertRow, createTable, readFromTo, query }