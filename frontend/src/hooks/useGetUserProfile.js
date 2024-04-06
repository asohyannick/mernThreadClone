import { useEffect, useState } from "react";
import useShowToast from "./useShowToast";
import { useParams } from "react-router-dom";
const useGetUserProfile = () => {
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
  }, [showToast, username]);
  return { loading, user };
};

export default useGetUserProfile;
