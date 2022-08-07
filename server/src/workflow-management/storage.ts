/**
 * A group of functions for storing recordings on the file system.
 * Functions are asynchronous to unload the server from heavy file system operations.
 */
import fs from 'fs';
import * as path from "path";

/**
 * Reads a file from path and returns its content as a string.
 * @param path The path to the file.
 * @returns {Promise<string>}
 * @category WorkflowManagement-Storage
 */
export const readFile = (path: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

/**
 * Writes a string to a file. If the file already exists, it is overwritten.
 * @param path The path to the file.
 * @param data The data to write to the file.
 * @returns {Promise<void>}
 * @category WorkflowManagement-Storage
 */
export const saveFile = (path: string, data: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

/**
 * Deletes a file from the file system.
 * @param path The path to the file.
 * @returns {Promise<void>}
 * @category WorkflowManagement-Storage
 */
export const deleteFile = (path: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.unlink(path, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

/**
 * A helper function to apply a callback to the all resolved
 * promises made out of an array of the items.
 * @param items An array of items.
 * @param block The function to call for each item after the promise for it was resolved.
 * @returns {Promise<any[]>}
 * @category WorkflowManagement-Storage
 */
function promiseAllP(items: any, block: any) {
  let promises: any = [];
  items.forEach(function(item : any, index: number) {
    promises.push( function(item,i) {
      return new Promise(function(resolve, reject) {
        // @ts-ignore
        return block.apply(this,[item,index,resolve,reject]);
      });
    }(item,index))
  });
  return Promise.all(promises);
}

/**
 * Reads all files from a directory and returns an array of their contents.
 * @param dirname The path to the directory.
 * @category WorkflowManagement-Storage
 * @returns {Promise<string[]>}
 */
export const readFiles = (dirname: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    fs.readdir(dirname, function(err, filenames) {
      if (err) return reject(err);
      promiseAllP(filenames.filter((filename: string) => !filename.startsWith('.')),
        (filename: string, index : number, resolve: any, reject: any) =>  {
          fs.readFile(path.resolve(dirname, filename), 'utf-8', function(err, content) {
            if (err) return reject(err);
            return resolve(content);
          });
        })
        .then(results => {
          return resolve(results);
        })
        .catch(error => {
          return reject(error);
        });
    });
  });
}



