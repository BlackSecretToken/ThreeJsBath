import { getStorage } from "firebase/storage";
import app from './app'; 
// Firebase storage reference
const storage = getStorage(app);
export default storage;