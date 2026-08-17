const users = [
  { id: 1, name: "Shubham" },
  { id: 2, name: "Rahul" },
  { id: 1, name: "Shubham" },
  { id: 3, name: "Amit" },
  { id: 2, name: "Rahul" },
];

const removeDuplicate = (arr) => {
  // const uniqueArr = []
  // const uniqObj = {}

  // for(const singleObj of arr){
  //     console.log(singleObj)
  //     if(!uniqObj[singleObj.id]){
  //         uniqObj[singleObj.id] = singleObj
  //         uniqueArr.push(singleObj)
  //     }
  // }
  const seen = new Set()
  const uniqueArr = arr.reduce((acc, curr) => {
    if(!seen.has(curr.id)){
        seen.add(curr.id)
        acc.push(curr)
    }

    return acc;
  }, []);

  return uniqueArr;
};

console.log(removeDuplicate(users));
