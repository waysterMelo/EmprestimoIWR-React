import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./app/css/Home.css"; // Arquivo de estilos externo

const Home = () => {
    const navigate = useNavigate();
    const [particles, setParticles] = useState([]);

    // Criando partículas animadas de cifrões ($)
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
            setParticles(prevParticles =>
                prevParticles.map(particle => ({
                    ...particle,
                    y: particle.y > 100 ? -10 : particle.y + particle.speed, // Garante que as partículas reapareçam no topo
                }))
            );
        }, 50);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="background-money">
            {/* Partículas animadas de cifrões ($) */}
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

            <div className="home-card">
                <h1 className="text-white fw-bold">Bem-vindo ao Sistema de Empréstimos</h1><br/>
                <p className="home-subtitle">Gerencie seus empréstimos de forma rápida e segura. 💰</p>
                <div className="button-container">
                    <button className="btn-home" onClick={() => navigate("/realizar-emprestimo")}>
                        Cadastrar Empréstimo
                    </button>
                    <button className="btn-outline" onClick={() => navigate("/consultar-cliente")}>
                        Consultar Cliente
                    </button>
                    <button className="btn-outline" onClick={() => navigate("/cadastrar-cliente")}>
                        Cadastrar Cliente
                    </button>
                    <button className="btn-outline" onClick={() => navigate("/dashboard")}>
                        Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
