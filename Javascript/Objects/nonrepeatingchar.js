let name = 'Shubhamm'

const desiredOutput = (str, pos)=>{
    const stack = [...str].reduce((acc,curr)=>{
        acc[curr] = acc[curr] ? acc[curr]+1 : 1
        return acc
    },{})
    let result = ''
    console.log(stack);
    let start = 1
    for(let char of str){
        if(stack[char] == 1){
            if(start < pos ){
                start++
            } 
            else {
                return result = char
                start = str.length()
            }
        }
    }
    return result
}

console.log(desiredOutput(name,3));