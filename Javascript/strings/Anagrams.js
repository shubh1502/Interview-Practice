str1 = "Silent";
str2 = "Listen";

const areAnagrams = (str1,str2) => {
    if(str1.length !== str2.length){
        return false
    }
    const str1Lower = str1.toLowerCase();
    const str2Lower = str2.toLowerCase();
    const hash = {}
    for(let char of str1Lower){
        hash[char] = hash[char] ? hash[char] + 1 : 1
    }
    for(let char of str2Lower){
        if(!hash[char]){
            return false
        }
        hash[char]--
    }
    return true 
}

console.log(areAnagrams(str1,str2));