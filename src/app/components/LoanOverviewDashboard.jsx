import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
    ResponsiveContainer, CartesianGrid, LineChart, Line, Area
} from 'recharts';
import { Info, TrendingUp, DollarSign, BookOpen } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/LoanDashboard.css'

const LoanOverviewDashboard = () => {
    const [loanData, setLoanData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Constantes para meses em português
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/dashboard/resumo-mensal');

                // Mapeando os dados da API para o formato esperado pelo dashboard
                const mappedData = response.data.map(item => ({
                    month: monthNames[item.mes - 1], // Convertendo número do mês para nome abreviado
                    originalMonth: item.mes, // Mantendo o mês original para ordenação
                    totalLent: item.totalEmprestado,
                    expectedReturn: item.retornoEsperado,
                    activeLoans: item.clientes,
                    interestRate: item.mediaJuros,
                    profit: item.retornoEsperado - item.totalEmprestado
                }));

                // Ordenação por mês para garantir exibição cronológica
                const sortedData = mappedData.sort((a, b) => a.originalMonth - b.originalMonth);

                setLoanData(sortedData);
                setError(null);
            } catch (err) {
                console.error("Erro ao buscar dados do dashboard:", err);
                setError("Não foi possível carregar os dados do dashboard. Por favor, tente novamente mais tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Cálculo de totais e médias
    const totalLent = loanData.reduce((sum, item) => sum + item.totalLent, 0);
    const totalExpectedReturn = loanData.reduce((sum, item) => sum + item.expectedReturn, 0);
    const totalProfit = totalExpectedReturn - totalLent;
    const averageInterestRate = loanData.length
        ? (loanData.reduce((sum, item) => sum + item.interestRate, 0) / loanData.length).toFixed(2)
        : 0;
    const totalActiveLoans = loanData.reduce((sum, item) => sum + item.activeLoans);

    // Componente para exibir mensagem de erro
    const ErrorMessage = () => (
        <div className="error-message">
            <div className="error-icon">⚠️</div>
            <div className="error-text">{error}</div>
        </div>
    );

    return (
        <div className="loan-dashboard">
            {/* Header estilo glassmorphism */}
            <header className="app-header">
                <div className="container-fluid px-4 py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <h1 className="app-title">Painel de Empréstimos</h1>
                        <div className="profit-container">
                            <p className="profit-label">Lucro Total</p>
                            <h2 className="profit-value">R$ {totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                        </div>
                    </div>
                </div>
            </header>

            {/* Conteúdo principal */}
            <div className="container-fluid px-4 pb-5">
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : error ? (
                    <ErrorMessage />
                ) : (
                    <>
                        {/* Cards de métricas com efeito glassmorphism */}
                        <div className="metrics-section mb-5">
                            <div className="row g-3">
                                {/* Card Total Emprestado */}
                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="metric-card">
                                        <div className="metric-value">R$ {totalLent.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                        <div className="metric-label">
                                            <DollarSign size={18} className="metric-icon" />
                                            <span>Total Emprestado</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Retorno Esperado */}
                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="metric-card">
                                        <div className="metric-value">R$ {totalExpectedReturn.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                        <div className="metric-label">
                                            <TrendingUp size={18} className="metric-icon" />
                                            <span>Retorno Esperado</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Empréstimos Ativos */}
                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="metric-card">
                                        <div className="metric-value">{totalActiveLoans}</div>
                                        <div className="metric-label">
                                            <BookOpen size={18} className="metric-icon" />
                                            <span>Clientes Ativos</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Taxa Média */}
                                <div className="col-12 col-md-6 col-lg-3">
                                    <div className="metric-card">
                                        <div className="metric-value">{averageInterestRate}%</div>
                                        <div className="metric-label">
                                            <Info size={18} className="metric-icon" />
                                            <span>Taxa Média</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Gráficos */}
                        <div className="row g-4">
                            <div className="col-12">
                                <div className="chart-container-main">
                                    <h3 className="chart-title">Visão Geral de Performance</h3>
                                    <div className="chart-wrapper">
                                        <ResponsiveContainer width="100%" height={380}>
                                            <BarChart
                                                data={loanData}
                                                margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                                                barGap={2}
                                                barCategoryGap={40}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                                <XAxis
                                                    dataKey="month"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#1e3a8a', fontSize: 13 }}
                                                    dy={10}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#1e3a8a', fontSize: 13 }}
                                                    tickFormatter={(value) => `R$${(value/1000).toFixed(0)}k`}
                                                    dx={-10}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                        borderRadius: '10px',
                                                        border: 'none',
                                                        boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                                                        padding: '12px'
                                                    }}
                                                    formatter={(value, name) => {
                                                        const formattedValue = value.toLocaleString('pt-BR', {
                                                            style: 'currency',
                                                            currency: 'BRL'
                                                        });

                                                        if (name === "Total Emprestado") {
                                                            return [formattedValue, "Total Emprestado"];
                                                        } else if (name === "Retorno Esperado") {
                                                            return [formattedValue, "Retorno Esperado"];
                                                        } else {
                                                            return [formattedValue, "Lucro"];
                                                        }
                                                    }}
                                                    labelFormatter={(label) => `Mês: ${label}`}
                                                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                                />
                                                <Legend
                                                    verticalAlign="top"
                                                    align="right"
                                                    wrapperStyle={{ paddingBottom: '20px' }}
                                                    iconType="circle"
                                                />
                                                <Bar
                                                    dataKey="totalLent"
                                                    name="Total Emprestado"
                                                    fill="#3b82f6"
                                                    radius={[4, 4, 0, 0]}
                                                    animationDuration={1000}
                                                    maxBarSize={18}
                                                />
                                                <Bar
                                                    dataKey="expectedReturn"
                                                    name="Retorno Esperado"
                                                    fill="#10b981"
                                                    radius={[4, 4, 0, 0]}
                                                    animationDuration={1200}
                                                    maxBarSize={18}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="profit"
                                                    name="Lucro"
                                                    stroke="#8b5cf6"
                                                    strokeWidth={2}
                                                    dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 2, stroke: "#fff" }}
                                                    activeDot={{ r: 6 }}
                                                    animationDuration={1400}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Gráficos menores */}
                            <div className="col-12 col-lg-6">
                                <div className="chart-container-secondary">
                                    <h3 className="chart-title">Taxa de Juros</h3>
                                    <div className="chart-wrapper">
                                        <ResponsiveContainer width="100%" height={280}>
                                            <LineChart data={loanData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                                <XAxis
                                                    dataKey="month"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#1e3a8a', fontSize: 13 }}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#1e3a8a', fontSize: 13 }}
                                                    tickFormatter={(value) => `${value.toFixed(1)}%`}
                                                />
                                                <Tooltip
                                                    formatter={(value) => [`${value.toFixed(2)}%`, 'Taxa de Juros']}
                                                    contentStyle={{
                                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                        borderRadius: '10px',
                                                        border: 'none',
                                                        boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                                                        padding: '12px'
                                                    }}
                                                    cursor={{ stroke: 'rgba(0,0,0,0.05)' }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="interestRate"
                                                    name="Taxa de Juros"
                                                    stroke="#f59e0b"
                                                    strokeWidth={2}
                                                    dot={{ r: 4, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }}
                                                    activeDot={{ r: 6, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }}
                                                    animationDuration={1200}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="interestRate"
                                                    fill="#f59e0b"
                                                    fillOpacity={0.1}
                                                    stroke="none"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Gráfico de Clientes */}
                            <div className="col-12 col-lg-6">
                                <div className="chart-container-secondary">
                                    <h3 className="chart-title">Clientes Ativos por Mês</h3>
                                    <div className="chart-wrapper">
                                        <ResponsiveContainer width="100%" height={280}>
                                            <BarChart
                                                data={loanData}
                                                layout="vertical"
                                                margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.03)" />
                                                <XAxis
                                                    type="number"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#1e3a8a', fontSize: 13 }}
                                                />
                                                <YAxis
                                                    dataKey="month"
                                                    type="category"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#1e3a8a', fontSize: 13 }}
                                                    width={50}
                                                />
                                                <Tooltip
                                                    formatter={(value) => [`${value} clientes`, 'Clientes Ativos']}
                                                    contentStyle={{
                                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                        borderRadius: '10px',
                                                        border: 'none',
                                                        boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                                                        padding: '12px'
                                                    }}
                                                    cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                                                />
                                                <Bar
                                                    dataKey="activeLoans"
                                                    name="Clientes"
                                                    fill="#8b5cf6"
                                                    radius={[0, 4, 4, 0]}
                                                    background={{ fill: 'rgba(0,0,0,0.02)' }}
                                                    animationDuration={1200}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Footer estilo glassmorphism */}
            <footer className="app-footer">
                <div className="container-fluid px-4">
                    <p>© 2025 Sistema de Gestão de Empréstimos</p>
                </div>
            </footer>
        </div>
    );
};

export default LoanOverviewDashboard;