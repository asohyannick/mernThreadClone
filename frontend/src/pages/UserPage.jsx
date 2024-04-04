import { useEffect, useState } from "react";
import UserHeader from "../components/UserHeader";
import UserPost from "../components/UserPost";
import { useParams } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";
function UserPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const { username } = useParams();
  const showToast = useShowToast();
  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/users/profile/${username}`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setUser(data);
      } catch (error) {
        showToast("Error", error, "error");
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, [username, showToast]);
  if (!user) return null;
  return (
    <>
      <UserHeader user={user} />
      <UserPost
        likes={1200}
        replies={481}
        postImg="/post1.png"
        postTitle="Let's talk about threads."
      />
      <UserPost
        likes={750}
        replies={350}
        postImg="/post2.png"
        postTitle="Great work buddy"
      />
      <UserPost
        likes={520}
        replies={320}
        postImg="/post3.png"
        postTitle="I love this guy."
      />
      <UserPost likes={110} replies={850} postTitle="This is my first thread" />
    </>
  );
}

export default UserPage;
