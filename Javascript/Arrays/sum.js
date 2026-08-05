const arr = [10, 20, 30, 40];
// const arr = [];

// Output
// 100

// const sum = arr.reduce((acc, curr) => {
//     console.log(acc, curr)
//     return acc + curr;
// });

// ----------------------------
// Average
// function findAverage(arr) {

//     if (arr.length === 0) {
//         return 0;
//     }

//     return arr.reduce(
//         (acc, num) => {
//             console.log(acc,num, acc + num / arr.length);
//             return acc + num / arr.length;
//         },
//         0
//     );
// }
// console.log(findAverage(arr));
// ------------------------- prefix sum
const prefixSum = (arr) =>{
    return arr.reduce((acc,curr,i)=>{
        if(acc.length === 0){
            return acc
        }
        if(i > 0){
            let sum = acc[i-1] + curr;
            acc.push(sum);
        }
        return acc;
    },[]);
}

console.log(prefixSum(arr)) ;