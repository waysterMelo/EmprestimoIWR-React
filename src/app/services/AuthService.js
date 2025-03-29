import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const login = async (username, password) => {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password,
    });

    const { token } = response.data;

    // Salva o token no localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("username", response.data.username);

    return response.data;
};

const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
};

const AuthService = {
    login,
    logout,
};

export function getToken() {
    return localStorage.getItem("token");
}

export default AuthService;
