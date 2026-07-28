import React, { useState, useEffect } from "react";
import useDebounce from "../shared/Custom_hooks/useDebounce";

const SearchInput = () => {
  const [input, setInput] = useState("");
  const debouncedValue = useDebounce(input, 500);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async (input) => {
    try {
      const response = await fetch(
        `https://dummyjson.com/products/search?q=${debouncedValue}`
      );
      const data = await response.json();
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    if (debouncedValue) {
      setLoading(true);
      fetchProducts(debouncedValue).finally(() => setLoading(false));
    }
  }, [debouncedValue]);

  return (
    <div>
      <input
        placeholder="Enter item name"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
        }}
      ></input>
      {loading && <div>loading...</div>}
      {debouncedValue && <div>{debouncedValue}</div>}
    </div>
  );
};

export default SearchInput;
