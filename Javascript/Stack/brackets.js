// Input- [{{[()]}}] Output - True
// Input-({[[{}]]) Output - False
// Input-()({})[()] Output - True

const brackets = (str) => {
    const stack = [];
    const map = {
        ')': '(',
        '}': '{',
        ']': '['        
    };

    for (let char of str){
        if(!map[char]){
        stack.push(char);
        } else {
            if (map[char] !== stack.pop()) {
                return false;
            }
        }
    }
    return stack.length === 0;
}

console.log(brackets('({[[{}]])'));