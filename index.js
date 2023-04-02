import * as tf from '@tensorflow/tfjs-node'
import * as use from '@tensorflow-models/universal-sentence-encoder';
import DataLoader from './dataLoader.js';

const loader = new DataLoader();
const [testKey, trainKey, testVal, trainVal] = await loader.loadSplitData(0.2);

const getValue = (c) => {
  switch(c){
    case 'device_information':
      return 0;
    case 'financial_information':
      return 1;
    case 'personal_information':
      return 2;
    case 'location':
      return 3;
    default:
      return 4;
  }
}

const output = trainKey.map(key => getValue(key.class));
const trainingInputs = trainKey.map(key => key.key);

let sentenceEncoder = await use.load();
let embeds = await sentenceEncoder.embed(trainingInputs);

// tensors are TensorFlow vectors to simplify the internal
// processing for the library
const inputTensors = tf.tensor(embeds);
const outputTensors = tf.tensor(output);

const model = tf.sequential();

// 1st layer: a 1d convolutional network
model.add(tf.layers.conv1d({
	filters: 100,
	kernelSize: 3,
	strides: 1,
	activation: 'relu',
	padding: 'valid',
	inputShape: embeds.shape,
}));

// transform 2d input into 1d
model.add(tf.layers.globalMaxPool1d({}));

// the final layer with one neuron
model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

// here are some tuning, read in the TF docs for more
model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy'],
});

// print the model architecture
model.summary();

// train the model
await model.fit(inputs, answers, {
    // the default size, how many inputs to process per time
    batchSize: 32,
    
    // how many times to "process", simply put
    epochs: EPOCHS,
    
    // the fraction of the inputs to be in the validation set:
    // the set, which isn't trained on, but participates in calculating
    // the model's metrics such as accuracy and loss
    validationSplit: 0.2,
    
    // shuffle inputs randomly to have a different starting seed every time
    shuffle: true,
});