import {mockData} from './data'

export const fetchproducts = (page) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockData[page]);
    }, 1000);
  });
};