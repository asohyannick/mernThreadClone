import UserHeader from "../components/UserHeader";
import UserPost from "../components/UserPost";
function UserPage() {
  return (
    <>
      <UserHeader />
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
      <UserPost
        likes={110}
        replies={850}
        postTitle="This is my first thread"
      />
    </>
  );
}

export default UserPage;
