// src/app/components/BotaoSair.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

const BotaoSair = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Aqui você pode limpar o token do localStorage ou sessionStorage
        localStorage.removeItem("token");
        sessionStorage.clear(); // Se estiver usando session

        // Redireciona para login
        navigate("/");
    };

    return (
        <button
            onClick={handleLogout}
            className="btn btn-outline-danger position-absolute top-0 end-0 m-3 d-flex align-items-center"
            style={{ zIndex: 10 }}
        >
            <LogOut size={20} className="me-2" />
            Sair
        </button>
    );
};

export default BotaoSair;
