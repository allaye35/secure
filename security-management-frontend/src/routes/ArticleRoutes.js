// src/routes/ArticleRoutes.js
import React from "react";
import { Route, Routes } from "react-router-dom";
import ArticleList from "../components/articles/ArticleList";
import ArticleDetail from "../components/articles/ArticleDetail";
import CreateArticle from "../components/articles/CreateArticle";
import EditArticle from "../components/articles/EditArticle";

const ArticleRoutes = () => {
  return (
    <Routes>
      <Route path="/articles" element={<ArticleList />} />
      <Route path="/articles/create" element={<CreateArticle />} />
      <Route path="/articles/edit/:id" element={<EditArticle />} />
      <Route path="/articles/:id" element={<ArticleDetail />} />
    </Routes>
  );
};

export default ArticleRoutes;
