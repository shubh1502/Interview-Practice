const input = "aaabbbbbcc";

// Input : aaabbbbbcc; Output : 3a5b2c - write a code in jsvascript

const desiredoutput = (string) =>{
    console.log(string.length)
    let countofletter = 1
    let outputstr = ''
    const arrstr = string.split('')

    for (let i = 0;i<arrstr.length;i++){
        if(arrstr[i] == arrstr[i+1]){
            countofletter++
        }
        else{
            outputstr += `${countofletter}${arrstr[i]}`
            countofletter = 1
        }
    }
    return outputstr
}

console.log(desiredoutput(input))