import React from "react";
import { useState, useEffect } from "react";

const useDebounce = (input, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(input);

  useEffect(() => {
    const id = setTimeout(() => {
        setDebouncedValue(input);
    }, delay);

    return () => {
      clearTimeout(id);
    };
  }, [input, delay]);

  return debouncedValue
};

export default useDebounce;
