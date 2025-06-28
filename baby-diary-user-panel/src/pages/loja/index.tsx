import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LojaHome from './LojaHome';
import CategoriaLoja from './CategoriaLoja';
import ProdutoLoja from './ProdutoLoja';
import CarrinhoLoja from './CarrinhoLoja';
import CheckoutReal from './CheckoutReal';

const LojaRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="" element={<LojaHome />} />
      <Route path="categoria/:categoriaId" element={<CategoriaLoja />} />
      <Route path="produto/:produtoId" element={<ProdutoLoja />} />
      <Route path="carrinho" element={<CarrinhoLoja />} />
      <Route path="checkout-real" element={<CheckoutReal />} />
    </Routes>
  );
};

export default LojaRoutes; 