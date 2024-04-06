import { useEffect, useState } from "react";
import UserHeader from "../components/UserHeader";
import { useParams } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";
import { Flex, Spinner } from "@chakra-ui/react";
import Post from "../components/Post";
import useGetUserProfile from "../hooks/useGetUserProfile";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtom";
function UserPage() {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useRecoilState(postsAtom)
  const showToast = useShowToast();
  const { username } = useParams();
  const { user } = useGetUserProfile();
  useEffect(() => {
    const getPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/posts/user/${username}`);
        const data = await res.json();
        setPosts(data);
      } catch (error) {
        showToast("Error", error, "error");
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    getPosts();
  }, [username, showToast, setPosts, user]);
  if (!user && loading) {
    return (
      <Flex justifyContent={"center"}>
        <Spinner size="xl" />
      </Flex>
    );
  }
  if (!user && !loading) return <h1>User not found</h1>;
  return (
    <>
      <UserHeader user={user} />
      {!loading && posts.length === 0 && <h1>User has not posts.</h1>}
      {loading && (
        <Flex justifyContent={"center"} my={12}>
          <Spinner size={"xl"} />
        </Flex>
      )}
      {posts.map((post) => (
        <Post
          key={post._id}
          post={post}
          postedBy={post.postedBy}
        />
      ))}
    </>
  );
}

export default UserPage;
