import { Router } from "express";
const router = Router();
import { getUserHistory, addToHistory } from "../controllers/history.js"; 
import { Signup, Login, Logout } from "../controllers/Auth.js";

// /users/...

router.post("/signup", Signup, (req, res) => {
  console.log("Signup done");
});

router.post("/login", Login, (req, res) => {
  console.log("Login done");
});

router.get("/logout", Logout, (req, res) => {
  console.log("Logout done");
});

router.get("/get_all_activity",getUserHistory);


router.post("/add_to_activity", addToHistory);








export default router;
