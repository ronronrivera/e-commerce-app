import React, {useState, useEffect} from 'react'
import axiosInstance from '../lib/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from "./LoadingSpinner"
import ProductCard from "./ProductCard"

const PeopleAlsoBought = () => {
  
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() =>{
    const fetchRecommendations = async () =>{
      try{
        const res = await axiosInstance.get("/products/recommendations");
        setRecommendations(res.data)
      }
      catch(error){
        toast.error(error.response.data.message || "An error occured while fetching");
      }
      finally{
        setLoading(false);
      }
   }
    fetchRecommendations();
  },[])
  
  if(isLoading) return <LoadingSpinner/>

  return (
    <div>
    <h3 className='text-2xl font-semibold text-emerald-400'>
      People Also Bought
      <div className='mt-6 grid grid-cols gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {recommendations.map((product) => (
          <ProductCard key={product._id} product={product}/>
        ))}
      </div>
    </h3>
    </div>
  )
}

export default PeopleAlsoBought 
