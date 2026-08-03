// "nums(10) -> sum of nums till 10
// nums(11) => sum till 10 + 11
// nums(15) => sum till 11 + ...15"

function memoizedSum () {
  let lastNum = 0;
    let lastSum = 0;

    return function num(num){
        let numtoStartSum = 0
        if(lastNum < num){
            numtoStartSum = lastNum + 1
            console.log("lastNum < num", lastNum, numtoStartSum)
        }
        for (numtoStartSum; numtoStartSum <= num; numtoStartSum++){
            lastSum += numtoStartSum;
        }
        lastNum = num;
        return lastSum;
    }
}

const num = memoizedSum();
console.log(num(10)); // 55
console.log(num(11)); // 66
console.log(num(15)); // 120