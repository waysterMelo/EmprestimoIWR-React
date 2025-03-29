import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Login.css";
import AuthService from "../services/AuthService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const Login = () => {
    const navigate = useNavigate();
    const [particles, setParticles] = useState([]);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [erro, setErro] = useState("");
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        const createParticles = () => {
            const particlesArray = Array.from({ length: 30 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 20 + 10,
                speed: Math.random() * 0.4 + 0.1,
                opacity: Math.random() * 0.6 + 0.2,
            }));
            setParticles(particlesArray);
        };

        createParticles();

        const interval = setInterval(() => {
            setParticles(prev =>
                prev.map(p => ({
                    ...p,
                    y: p.y > 100 ? -10 : p.y + p.speed,
                }))
            );
        }, 50);

        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErro("");

        try {
            const response = await AuthService.login(username, password);
            console.log("Login bem-sucedido!", response);

            toast.success("Login realizado com sucesso!");

            setTimeout(() => {
                navigate("/home");
            }, 3000); // dá tempo pro usuário ler
        } catch (error) {
            console.error("Erro no login:", error);
            setErro("Usuário ou senha inválidos");
            toast.error("Usuário ou senha inválidos");
        } finally {
            setIsLoading(false);
        }
    };

    return (
    <div className="background-money">
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="particle"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        fontSize: `${particle.size}px`,
                        opacity: particle.opacity,
                    }}
                >
                    $
                </div>
            ))}

            <div className="login-card">
                <h1 className="login-title">Sistema de Empréstimos</h1>
                <p className="login-subtitle">Acesse sua conta para gerenciar empréstimos 💰</p>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Usuário</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Digite seu usuário"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Senha</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Digite sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-login"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"/>
                                Entrando...
                            </>
                        ) : (
                            "Login"
                        )}
                    </button>
                </form>

                {erro && <div className="alert alert-danger mt-3">{erro}</div>}

            </div>
        <ToastContainer position="top-right" autoClose={2000} />
    </div>

    );

};

export default Login;
