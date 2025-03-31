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

function feedForward(){
    for(let i = 0;i<values.length;i++) {
        values[i] = values[i] * (1-values[i])
    }
}


function Neural(data){

}