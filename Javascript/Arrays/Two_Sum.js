// const nums = [3, 2, 4];
// const target = 6;

const nums = [2, 7, 11, 15];
const target = 17;

//Brute Force
const twoSum = (nums, target) =>{
    if(!Array.isArray(nums)){
        throw new Error(`${nums} is not an array`)
    }

    for(firstIndex = 0; firstIndex <nums.length; firstIndex++){
        for(let secondIndex = firstIndex + 1 ;secondIndex < nums.length ; secondIndex++){
            console.log(firstIndex,secondIndex)
            if(nums[firstIndex] + nums[secondIndex] === target) {
                return [firstIndex, secondIndex]
            }
        }
    }
    return finalarr
}


//Optimized solution
const twoSum_optimized = (nums,target) =>{
    const seen = new Map()


    for (let i=0;i<nums.length;i++){
        const current = nums[i]
        const complement = target - current

        if(seen.has(complement)){
            return [seen.get(complement),i]
        }

        seen.set(current,i)
    }
    return []
}

console.log(twoSum_optimized(nums,target));