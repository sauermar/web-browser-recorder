import fs from 'fs';
import * as path from "path";

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

function promiseAllP(items: any, block: any) {
  var promises: any = [];
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



