function multi(matrix, neurons, neurons2) {
    let tmp
    for (let i = 0; i < matrix.length; i++) {
        tmp = 0
        for (let j = 0; j < neurons.length; j++) {
            tmp += matrix[i][j] * neurons[j]
        }
        neurons2[i] = tmp;
    }
}

function activateFunc(values) {
    for (let i = 0; i < values.length; i++) {
        values[i] = Math.tanh(values[i])
    }
}

function searchMax(values) {
    let tmp = -1
    let index
    for (let i = 0; i < values.length; i++) {
        if (values[i] > tmp) {
            tmp = values[i]
            index = i;
        }
    }
    return index
}

function softmax(arr) {
    const expValues = arr.map(x => Math.exp(x));
    const sumExp = expValues.reduce((a, b) => a + b, 0);
    return expValues.map(x => x / sumExp);
}

function feedForward(data, weights1, weights2, neurons2, neurons3) {
    multi(weights1, data, neurons2);
    activateFunc(neurons2);
    multi(weights2, neurons2, neurons3);
    const output = softmax(neurons3);
    return searchMax(output);
}

async function Neural(data) {
    let response = await fetch('./weights.json');
    let weights = await response.json();
    let weights1 = weights.weights_0_1;
    let weights2 = weights.weights_1_2;
    let neurons2 = Array(100).fill(0);
    let neurons3 = Array(10).fill(0);
    let S1 = Array(100)
    let S2 = Array(10)
    return feedForward(data, weights1, weights2, neurons2, neurons3)
}