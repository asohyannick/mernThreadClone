import { useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "./useShowToast";

const useLogOut = () => {
    const setUser = useSetRecoilState(userAtom);
    const showToast = useShowToast();
    const handleLogout = async (e) => {
      e.preventDefault();
      try {
        const res = await fetch("/api/v1/users/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        localStorage.removeItem("user-threads");
        setUser(null);
      } catch (error) {
        showToast("Error", error, "error");
      }
    };
    return handleLogout;
}

export default useLogOut;