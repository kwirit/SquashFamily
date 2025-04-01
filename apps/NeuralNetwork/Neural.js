
function multi(matrix,neurons) {
    let c = []
    let tmp = 0
    for(let i = 0; i<matrix.length;i++){
        let tmp = 0
        for(let j = 0;j < matrix[i].length;j++){
            tmp += matrix[i][j] * neurons[j]
        }
        c[i] = tmp;
    }
    return c;
}

function multiTransponent(matrix,neurons) {
    let c = []
    let tmp = 0
    for(let i = 0; i<matrix.length;i++){
        let tmp = 0
        for(let j = 0;j < matrix[i].length;j++){
            tmp += matrix[j][i] * neurons[j]
        }
        c[i] = tmp;
    }
    return c;
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
function activateDerFunc(values){
    for(let i = 0;i<values.length;i++) {
        values[i] = values[i] * (1-values[i])
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

function Neural(data){
    let neurons1 = data;
    let bias1=  Array(784).fill(1);
    let bias2=  Array(200).fill(1);
    let weights1 = []
    let weights2 = []
    for(let i = 0;i<200;i++){
        weights1[i] = []
        for(let j = 0;j<784;j++){
            weights1[i][j] = (Math.floor(Math.random() * 100) * 0.03) / (data.length + 35);
        }
    }
    for(let i = 0;i<10;i++){
        weights2[i] = []
        for(let j = 0;j<200;j++){
            weights2[i][j] = (Math.floor(Math.random() * 100) * 0.03) / (200 + 35);
        }
    }
    let neurons2 = multi(weights1, neurons1)
    sum(neurons2,bias1)
    activateFunc(neurons2)
    let neurons3 = multi(weights2, neurons2)
    sum(neurons3,bias2)
    activateFunc(neurons3)
    let set = mnist.set(1000,0)
    set = set.training
    console.log(set[0].input)


}