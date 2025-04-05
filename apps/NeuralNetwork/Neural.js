function multi(matrix,neurons, neurons2) {
    let tmp
    for(let i = 0; i<matrix.length;i++){
        tmp = 0
        for(let j = 0;j < neurons2.length;j++){
            tmp += matrix[i][j] * neurons[j]
        }
        neurons2[i] = tmp;
    }
}

function multiTransponent(matrix,neurons,delta2) {
    let tmp
    for(let i = 0; i<delta2;i++){
        tmp = 0
        for(let j = 0;j < matrix.length;j++){
            tmp += matrix[j][i] * neurons[j]
        }
        delta2[i] = tmp;
    }
}

function sum(neurons, bias){
    for(let i = 0;i<neurons.length;i++){
        neurons[i] = neurons[i] + bias[i]
    }
}

function activateFunc(values){
    for(let i = 0;i<values.length;i++) {
        if(values[i] < 0){
            values[i] = 0
        }
    }
}
function activateDerFunc(value){
    if(value > 0){
        return 1
    }
    else{
        return 0
    }
}

function searchMax(values){
    let tmp = -1
    let index
    for(let i = 0;i<values.length;i++){
        if(values[i] > tmp){
            tmp = values[i]
            index = i;
        }
    }
    return index
}

function copyArray(array1,array2){
    for(let i = 0;i<array1.length;i++){
        array1[i] = array2[i]
    }
}

function feedForward(data, weights1, weights2,bias1,bias2, S1,S2, neurons2, neurons3){
    let neurons1 = data
    multi(weights1, neurons1, neurons2)
    copyArray(S1,neurons2)
    activateFunc(neurons2)
    multi(weights2, neurons2, neurons3)
    copyArray(S2,neurons3)
    return searchMax(neurons3)
}

function backPropogation(weights2, neuronsOutput, neuronsHidden,exept,S1,S2,delta1,delta2){
    for(let i = 0;i<exept.length;i++){
        delta1[i] = exept[i] - neuronsOutput[i]
    }
    multiTransponent(weights2,delta1,delta2)
    for(let i = 0;i<delta2.length;i++){
        delta2[i] = delta2[i]*activateDerFunc(neuronsHidden[i])
    }
}

function weightsUpdater(lr,weights1,weights2,neurons1,neurons2,neurons3,delta1,delta2,bias1,bias2) {
    let delta1temp = Array(10)
    let delta2temp = Array(200)
    multi(delta1, neurons2, delta1temp)
    for(let i = 0;i<10;i++){
        for(let j = 0;j<200;j++){
            weights2[i][j] = lr*delta1temp[i];
        }
    }
    multiTransponent(delta2,neurons1,delta2temp)
    for(let i = 0;i<200;i++){
        for(let j = 0;j<784;j++){
            weights2[i][j] = lr*delta2temp[i];
        }
    }
}

async function Neural(data){
    let response = await fetch('./weights.json');
    let weights = await response.json();
    let weights1 = weights.weights_0_1;
    let weights2 = weights.weights_1_2;
    console.log("weights_0_1:", weights1);
    console.log("weights_1_2:", weights2);
    let neurons1 = data;
    let bias1 = Array(200).fill(1);
    let bias2 = Array(10).fill(1);
    console.log("созданы веса")
    let examples = 10;
    let set = mnist.set(examples,0)
    set = set.training
    console.log("созданы сеты")
    let neurons3 = Array(10)
    let neurons2 = Array(200)
    let S1 = Array(200)
    let S2 = Array(10)
    let delta1 = Array(10)
    let delta2 = Array(200)
    feedForward(data,weights1,weights2,bias1,bias2,S1,S2,neurons2,neurons3)
    console.log(neurons3)
}