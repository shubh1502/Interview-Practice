const str = "javascript";

const frequencyCount = (str) => {
    const strarr = str.split("");

    return strarr.reduce((acc, curr) => {
       acc[curr] = (acc[curr] || 0) + 1;
       return acc;
    },{})
}

console.log(frequencyCount(str));

// --------------GROUP By using reduce
const employees = [
    { name: "John", dept: "IT" },
    { name: "Jane", dept: "HR" },
    { name: "Alex", dept: "IT" },
];

// {
//     IT: [
//         { name: "John", dept: "IT" },
//         { name: "Alex", dept: "IT" }
//     ],
//     HR: [
//         { name: "Jane", dept: "HR" }
//     ]
// }

// const groupByDept = (employees) => {
//     return employees.reduce((acc, curr) =>{
//         if(!acc[curr.dept]){
//             acc[curr.dept] = [];
//         }
//         acc[curr.dept].push(curr);
//         return acc;
//     },{});
// }

// console.log(groupByDept(employees));

// ------------------
const input = [
 {name:"John", dept:"IT"},
 {name:"Jane", dept:"HR"},
 {name:"Alex", dept:"IT"}
]

// {
//  IT:2,
//  HR:1
// }


const groupByDeptCount = (input) => {
    return input.reduce((acc,curr) => {
        if(!acc[curr.dept]){
            acc[curr.dept] = 0;
        }
        acc[curr.dept]++;
        return acc;
    },{})}

console.log(groupByDeptCount(input));

// --------------------
const employees = [
    {id:1,name:"John"},
    {id:2,name:"Jane"},
    {id:3,name:"Alex"}
];

/*{
    1:{
        id:1,
        name:"John"
    },
    2:{
        id:2,
        name:"Jane"
    },
    3:{
        id:3,
        name:"Alex"
    }
}*/

const groupById = (employees) => {
    return employees.reduce((acc,curr) => {
        acc[curr.id] = curr;
        return acc;
    },{})
}