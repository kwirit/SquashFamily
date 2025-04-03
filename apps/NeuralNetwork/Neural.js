function multi(matrix,neurons, neurons2) {
    let tmp
    for(let i = 0; i<matrix.length;i++){
        tmp = 0
        for(let j = 0;j < matrix[i].length;j++){
            tmp += matrix[i][j] * neurons[j]
        }
        neurons2[i] = tmp;
    }
}

function multiTransponent(matrix,neurons,delta2) {
    let tmp
    for(let i = 0; i<matrix[0].length;i++){
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
        values[i] = 1 / (1 + Math.exp(-values[i]))
    }
}
function activateDerFunc(value){
    return value *(1-value)
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

function feedForward(data, weights1, weights2,bias1,bias2, neuronsForBackpropogation, neurons2, neurons3){
    let neurons1 = data
    multi(weights1, neurons1, neurons2)
    sum(neurons2,bias1)
    copyArray(neuronsForBackpropogation,neurons2)
    activateFunc(neurons2)
    multi(weights2, neurons2, neurons3)
    sum(neurons3,bias2)
    activateFunc(neurons3)
    return searchMax(neurons3)
}

function backPropogation(weights2, neuronsOutput, neuronsHidden,exept , neuronsForBackpropogation,delta1,delta2){
    for(let i = 0;i<neuronsOutput.length;i++){
        if(i !== exept){
            delta1[i] = -neuronsOutput[i] * activateDerFunc(neuronsOutput[i])
        }
        else{
            delta1[i] = (1-neuronsOutput[i]) * activateDerFunc(neuronsOutput[i])
        }
    }
    multiTransponent(weights2, delta1, delta2)
    for(let i = 0;i<delta2.length;i++){
        delta2[i] = delta2[i] *  activateDerFunc(neuronsForBackpropogation[i])
    }
}

function weightsUpdater(lr,weights1,weights2,neurons2,neurons3,delta1,delta2,bias1,bias2){
    for(let i = 0;i<200;i++){
        for(let j = 0;j<784;j++){
            weights1[i][j] += neurons2[i] *delta2[i] * lr;
        }
    }
    for(let i = 0;i<10;i++){
        for(let j = 0;j<200;j++){
            weights2[i][j] += neurons2[i] *delta1[i] * lr;
        }
    }
    for(let i = 0;i<delta2.length;i++){
        for (let j = 0; j < bias2.length; j++) {
            bias1[j] += bias1[j] + delta2[i] * lr;
        }
    }
    for(let i = 0;i<delta1.length;i++){
        for (let j  = 0; j < bias2.length; j++) {
            bias2[j] += bias2[j] + delta1[i] * lr;
        }
    }

}


function Neural(data){
    let neurons1 = data;
    let weights1= Array(200)
    let weights2 = Array(10)
    let bias1 = Array(200).fill(1);
    let bias2 = Array(10).fill(1);
    for(let i = 0;i<200;i++){
        weights1[i] = Array(784)
        for(let j = 0;j<784;j++){
            weights1[i][j] = (Math.floor(Math.random() * 100) * 0.03) / (data.length + 35);
        }
    }
    for(let i = 0;i<10;i++){
        weights2[i] = Array(200)
        for(let j = 0;j<200;j++){
            weights2[i][j] = (Math.floor(Math.random() * 100) * 0.03) / (200 + 35);
        }
    }
    console.log("созданы веса")
    let examples = 10;
    let set = mnist.set(examples,0)
    set = set.training
    console.log("созданы сеты")
    let neurons3 = Array(10)
    let neurons2 = Array(200)
    let neuronsForBackpropogation = Array(200)
    let delta1 = Array(10)
    let delta2 = Array(200)
    for(let i = 0;i<examples;i++){
        let right = searchMax(set[i].output)
        let pred = feedForward(set[i].input,weights1,weights2,bias1,bias2,neuronsForBackpropogation,neurons2,neurons3)
        if(pred !== right){
            backPropogation(weights2,neurons3,neurons2,right,neuronsForBackpropogation, delta1,delta2)
            weightsUpdater((0.15 * Math.exp(-i / 20.)),weights1,weights2,neurons2,neurons3,delta1 ,delta2,bias1,bias2)
        }
        console.log(i)
    }
    feedForward(data,weights1,weights2,bias1,bias2,neuronsForBackpropogation,neurons2,neurons3)
    console.log(neurons3)
}