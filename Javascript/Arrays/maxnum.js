const arr = [12, 45, 2, 78, 21, 90, 67];

// Output
// 90

// const maxNum = (arr)=>{
//     let max = arr[0];
//     for(let i=1; i<arr.length; i++){
//         if(arr[i] > max){
//             max = arr[i];
//         }
//     }
//     return max; 
// }
// -------------------

const maxSum = arr.reduce((acc,curr) =>{
    if(curr>acc){
        console.log(acc, curr)
        acc=curr;
    }
    return acc;
},arr[0]);
console.log(maxSum);