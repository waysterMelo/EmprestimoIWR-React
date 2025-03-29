import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CadastrarEmprestimo from './app/components/RealizarEmprestimo';
import EmprestimosVencidosHoje from './app/components/EmprestimosVencidosHoje';
import Home from "./Home";
import CadastrarClientes from "./app/components/CadastrarClientes";
import ConsultarCliente from "./app/components/ConsultarCliente";
import Login from "./app/components/Login";
import PrivateRoute from "./app/components/PrivateRoute";
import LoanOverviewDashboard from './app/components/LoanOverviewDashboard';


function RoutesApp(){
    return (
        <Routes>
            <Route path="/" element={<Login />} />

            {/* Rotas protegidas */}
            <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/realizar-emprestimo" element={<PrivateRoute><CadastrarEmprestimo /></PrivateRoute>} />
            <Route path="/consultar-cliente" element={<PrivateRoute><ConsultarCliente /></PrivateRoute>} />
            <Route path="/vencidos-hoje" element={<PrivateRoute><EmprestimosVencidosHoje /></PrivateRoute>} />
            <Route path="/cadastrar-cliente" element={<PrivateRoute><CadastrarClientes /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><LoanOverviewDashboard /> </PrivateRoute>} />
            <Route path="*" element={<h1>Página não encontrada</h1>} />
        </Routes>
    )
}

export default RoutesApp;