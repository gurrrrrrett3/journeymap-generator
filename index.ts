import { webmap, worlds, type } from "./config";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";

if (type !== "squaremap") {
  throw new Error("Only squaremap is supported at the moment");
}

const promises: Promise<void>[] = [];

for (const world of worlds) {
  const url = new URL(webmap);
  url.pathname = `tiles/${world}/0/`;

 // expand out from the center of the map in a spiral

    let x = 0;
    let z = 0;
    let dx = 0;
    let dz = -1;

    let iterations = 10000
    
    for (let i = 0;i < iterations; i++) {
        if ((-100 < x && x < 100) && (-100 < z && z < 100)) {
            promises.push(createPromise(world, x, z));
        }
    
        if (x === z || (x < 0 && x === -z) || (x > 0 && x === 1 - z)) {
            const temp = dx;
            dx = -dz;
            dz = temp;
        }
    
        x += dx;
        z += dz;
        }

    Promise.all(promises).then(() => {
        console.log("Done!");
        process.exit(0);
    }).catch((err) => {})
}

function createPromise(world: string, x: number, z: number) {
  const promise = new Promise<void>(async (resolve, reject) => {
    const url = new URL(webmap);
    url.pathname = `${url.pathname}/tiles/${world}/3/${z}_${x}.png`;

    fetch(url)
      .then((res) => {
        if (res.status === 200) {
          console.log(`Found tile: ${url}`);

            const filename = path.resolve("./out/", `${z},${x}.png`);
            const file = fs.createWriteStream(filename)
            
            res.body.pipe(file);
          resolve();
        } else {
            console.log(`No tile: ${url}`);
    
            reject();
            }
      })
      .catch((err) => {
        console.log(`No tile: ${url}`);

        reject(err);
      });
  });

  return promise;
}
