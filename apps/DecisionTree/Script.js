ta1 = document.getElementById("ta1")
b1 = document.getElementById("b1")
b1.addEventListener("click", getTree)

function getTree(){
    let data = ta1.value
    let rows = data.split("\n")
    let header = rows[0].split(";")
    let objects = []
    for(let row of rows.slice(1,rows.length)){
        row = row.split(";")
        let user = {}
        for(let i = 0;i<header.length;i++){
            user[header[i]] = row[i]
        }
        objects.push(user)
    }
    makeTree(objects,header)
}

