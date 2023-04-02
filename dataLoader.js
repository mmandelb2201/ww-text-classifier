import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import trainTestSplit from 'train-test-split';

export default class DataLoader {
    loadSplitData = async (testTrainSplit) => {
        const fileLocs = ["./raw-kv-B5Kz4DAK5BqcSaUmLYsGL.csv", "./raw-kv-bL4IN35r9A4scuV1EEonP.csv", "./raw-kv-EnAyhn5myfBBBcKDoTyY7.csv", "./raw-kv-OWqJGwWJPH4sJ8KqT4T0s.csv", "./raw-kv-QptX0qtYp5TMJ0Qk-aoDw.csv", "./raw-kv-TJU8238YfgUSeK3GB9VoH.csv", "./raw-kv-vdL9khMYzqESDRh9fGc2H.csv", "./raw-kv-VfiQYxoXLbqKfblxed7UK.csv"];

        let dataKey = [];
        let dataValue = [];

        const addData = async (path) => {
            let stream = createReadStream(path);
            let reader = createInterface({ input: stream });
            
            let index = 0;
            for await (const line of reader) {
                if (index === 0) {
                    index++;
                   continue;
                }
                
                // do what you have to do
                const raw = line.split(",");
                dataKey.push({
                    key : raw[0].split('.').join(' '),
                    class : raw[3]
                });
                dataValue.push({
                    value : raw[1],
                    class : raw[3]
                });
            }
        }

        for(const loc of fileLocs){
            await addData(loc);
        }

        const [testKey, trainKey] = this.balanceData(dataKey, 80, testTrainSplit);
        const [testVal, trainVal] = this.balanceData(dataValue, 80, testTrainSplit);

        return [testKey, trainKey, testVal, trainVal];
    }

    displayCounts = (dataPoints) => {
        let counts = {
            device_information : 0,
            personal_information : 0,
            financial_information : 0,
            location : 0,
            other : 0
        }

        for(let point of dataPoints){
            const c = point.class;
            counts[c] += 1;
        }

        console.log(counts);

    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
          let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
      
          [array[i], array[j]] = [array[j], array[i]];
        }
      }

    balanceData = (dataPoints, limit, testTrainSplit) => {
        this.shuffle(dataPoints);

        let counts = {
            device_information : 0,
            personal_information : 0,
            financial_information : 0,
            location : 0,
            other : 0
        }

        let finalArr = [];

        for(let point of dataPoints){
            if(counts[point.class] < limit){
                finalArr.push(point);
                counts[point.class] += 1;
            }
        }

        const s = Math.floor(testTrainSplit * finalArr.length);        
        const [test, train] = trainTestSplit(finalArr, s);

        return [test, train];
    }
}