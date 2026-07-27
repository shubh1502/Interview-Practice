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

// -------------------------------------------------------------

// Reverse a string without changing position of any special character.
const input2 = "R@*IG#H!T";
// Output- "T@*HG#I!R"

const desiredoutput2 = (string) =>{
    const arrstr = string.split('')
    let left = 0
    let right = arrstr.length - 1

    while(left < right){
        if(!/[a-zA-Z]/.test(arrstr[left])){
            left++
        }
        else if(!/[a-zA-Z]/.test(arrstr[right])){
            right--
        }
        else{
            [arrstr[left], arrstr[right]] = [arrstr[right], arrstr[left]]
            left++
            right--
        }
    }
    return arrstr.join('')
}

console.log(desiredoutput2(input2))