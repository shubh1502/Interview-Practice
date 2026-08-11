import React, { useEffect, useState, useRef } from "react";
import { fetchproducts } from "./service";

const Main = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const observerRef = useRef(null);

  const fetchProducts = async (page) => {
    setLoading(true);
    try {
      const response = await fetchproducts(page);
      console.log(response);
      setProducts((prev) => [...prev, ...response.products]);
      setHasMore(response.hasMore);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
        console.log(entries)
      const target = entries[0];

      if (target.isIntersecting && !loading && hasMore) {
        setPage((prev) => prev + 1);
      }
    });
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [loading, hasMore]);

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  return (
    <div>
      <h2> products</h2>
      {products.map((product) => (
        <div key={product.id}>
          <h3>{product.title}</h3>
          <p>₹{product.price}</p>
        </div>
      ))}

      {loading && <p>Loading...</p>}

      {!hasMore && <p>No more products</p>}

      <div ref={observerRef} style={{ height: "20px" }} />
    </div>
  );
};

export default Main;
