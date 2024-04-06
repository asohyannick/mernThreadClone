import {Flex, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import Post from "../components/Post";
function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const showToast = useShowToast();
  useEffect(() => {
    const getFeedPosts = async () => {
      setLoading(true);
      setPosts([]);
      try {
        const res = await fetch("/api/v1/posts/feedPost");
        const data = await res.json();
        setPosts(data);
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };
    getFeedPosts();
  }, [showToast, setPosts]);
  return (
    <>
       {!loading && posts.length === 0 &&  (
        <h1>Follow some users to see the feed.</h1>
       )}
       {loading && (
        <Flex justify={'center'}>
          <Spinner size='xl'/>
        </Flex>
       )} 
       {posts.map((post) => (
        <Post key={post._id} post={post} postedBy={post.postedBy}/>
       ))}
    </>
  );
}

export default HomePage;
