// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

/* ─── Pages publiques (auth & home) ─────────────────────────── */
import Home          from "./pages/Home";
import LoginPage     from "./pages/LoginPage";
import RegisterPage  from "./pages/RegisterPage";



/* ─── Agents ─────────────────────────────────────────────────── */
import AgentList     from "./components/agents/AgentList";
import AgentCreate   from "./components/agents/CreateAgent";
import AgentEdit     from "./components/agents/EditAgent";
import AgentDetail   from "./components/agents/AgentDetail";
import DeleteAgent   from "./components/agents/DeleteAgent";

/* ─── Entreprises ───────────────────────────────────────────── */
import EntrepriseList    from "./components/entreprises/EntrepriseList";
import CreateEntreprise  from "./components/entreprises/CreateEntreprise";
import EditEntreprise    from "./components/entreprises/EditEntreprise";
import EntrepriseDetail  from "./components/entreprises/EntrepriseDetail";
import DeleteEntreprise  from "./components/entreprises/DeleteEntreprise";

/* ─── Géolocalisations ──────────────────────────────────────── */
import GeolocalisationList   from "./components/geolocalisations/GeolocalisationList";
import CreateGeolocalisation from "./components/geolocalisations/CreateGeolocalisation";
import EditGeolocalisation   from "./components/geolocalisations/EditGeolocalisation";
import GeolocalisationDetail from "./components/geolocalisations/GeolocalisationDetail";
import DeleteGeolocalisation from "./components/geolocalisations/DeleteGeolocalisation";

/* ─── Missions ───────────────────────────────────────────────── */
import MissionList            from "./components/missions/MissionList";
import CreateMission          from "./components/missions/CreateMission";
import EditMission            from "./components/missions/EditMission";
import MissionDetail          from "./components/missions/MissionDetail";
import DeleteMission          from "./components/missions/DeleteMission";
import AssignMissionRelations from "./components/missions/AssignMissionRelations";

/* ─── Plannings ─────────────────────────────────────────────── */
import PlanningList   from "./components/plannings/PlanningList";
import CreatePlanning from "./components/plannings/CreatePlanning";
import EditPlanning   from "./components/plannings/EditPlanning";
import PlanningDetail from "./components/plannings/PlanningDetail";
import DeletePlanning from "./components/plannings/DeletePlanning";

/* ─── Sites ─────────────────────────────────────────────────── */
import SiteList     from "./components/sites/SiteList";
import CreateSite   from "./components/sites/CreateSite";
import EditSite     from "./components/sites/EditSite";
import SiteDetail   from "./components/sites/SiteDetail";
import DeleteSite   from "./components/sites/DeleteSite";

/* ─── Rapports ──────────────────────────────────────────────── */
import RapportList    from "./components/rapports/RapportList";
import CreateRapport  from "./components/rapports/CreateRapport";
import EditRapport    from "./components/rapports/EditRapport";
import RapportDetail  from "./components/rapports/RapportDetail";
import DeleteRapport  from "./components/rapports/DeleteRapport";

/* ─── Clients ───────────────────────────────────────────────── */
import ClientList    from "./components/clients/ClientList";
import CreateClient  from "./components/clients/CreateClient";
import EditClient    from "./components/clients/EditClient";
import ClientDetail  from "./components/clients/ClientDetail";
import DeleteClient  from "./components/clients/DeleteClient";

/* ─── Articles ──────────────────────────────────────────────── */
import ArticleList   from "./components/articles/ArticleList";
import CreateArticle from "./components/articles/CreateArticle";
import EditArticle   from "./components/articles/EditArticle";
import ArticleDetail from "./components/articles/ArticleDetail";

/* ─── Zones de travail ──────────────────────────────────────── */
import ZoneList      from "./components/zones/ZoneList";
import ZoneForm      from "./components/zones/ZoneForm";
import ZoneDetail    from "./components/zones/ZoneDetail";

/* ─── Disponibilités ───────────────────────────────────────── */
import DisponibiliteList   from "./components/disponibilites/DisponibiliteList";
import DisponibiliteCreate from "./components/disponibilites/DisponibiliteCreate";
import DisponibiliteEdit   from "./components/disponibilites/DisponibiliteEdit";

/* ─── Cartes pro ───────────────────────────────────────────── */
import CarteProList   from "./components/cartesPro/CarteProList";
import CarteProCreate from "./components/cartesPro/CarteProCreate";
import CarteProEdit   from "./components/cartesPro/CarteProEdit";

/* ─── Diplômes SSIAP ───────────────────────────────────────── */
import DiplomeList    from "./components/diplomes/DiplomeList";
import DiplomeCreate  from "./components/diplomes/DiplomeCreate";
import DiplomeEdit    from "./components/diplomes/DiplomeEdit";

/* ─── Notifications ────────────────────────────────────────── */
import NotificationList   from "./components/notifications/NotificationList";
import NotificationCreate from "./components/notifications/NotificationCreate";
import NotificationEdit   from "./components/notifications/NotificationEdit";

/* ─── Contrats de travail ─────────────────────────────────── */
import ContratDeTravailList    from "./components/contrats-de-travail/ContratDeTravailList";
import ContratDeTravailCreate  from "./components/contrats-de-travail/ContratDeTravailCreate";
import ContratDeTravailEdit    from "./components/contrats-de-travail/ContratDeTravailEdit";
import ContratDeTravailDetail  from "./components/contrats-de-travail/ContratDeTravailDetail";

/* ─── Barre de navigation ──────────────────────────────────── */

import DevisList   from "./components/devis/DevisList";
import DevisForm   from "./components/devis/DevisForm";
import DevisDetail from "./components/devis/DevisDetail";


import FactureList   from "./components/factures/FactureList";
import FactureForm   from "./components/factures/FactureForm";
import FactureDetail from "./components/factures/FactureDetail";

import FicheDePaieList            from "./components/ficheDePaie/FicheDePaieList";
import FicheDePaieForm            from "./components/ficheDePaie/FicheDePaieForm";
import FicheDePaieDetail          from "./components/ficheDePaie/FicheDePaieDetail";

import ArticleContratTravailList       from "./components/articleContratTravails/ArticleContratTravailList";
import ArticleContratTravailForm       from "./components/articleContratTravails/ArticleContratTravailForm";
import ArticleContratTravailView       from "./components/articleContratTravails/ArticleContratTravailView";

// Contrats
import ContratList    from "./components/contrats/ContratList";
import ContratDetail  from "./components/contrats/ContratDetail";
import CreateContrat  from "./components/contrats/CreateContrat";
import EditContrat    from "./components/contrats/EditContrat";


import "leaflet/dist/leaflet.css";

import NavBar from "./components/Navbar";

export default function App() {
    return (
        <BrowserRouter>
            <NavBar />

            <Routes>
                {/* Auth / Public */}
                <Route path="/"                element={<Home />} />
                <Route path="/login"           element={<LoginPage />} />
                <Route path="/register"        element={<RegisterPage />} />

                {/* Agents */}
                <Route path="/agents"            element={<AgentList />} />
                <Route path="/agents/create"     element={<AgentCreate />} />
                <Route path="/agents/edit/:id"   element={<AgentEdit />} />
                <Route path="/agents/delete/:id" element={<DeleteAgent />} />
                <Route path="/agents/:id"        element={<AgentDetail />} />

                {/* Entreprises */}
                <Route path="/entreprises"            element={<EntrepriseList />} />
                <Route path="/entreprises/create"     element={<CreateEntreprise />} />
                <Route path="/entreprises/edit/:id"   element={<EditEntreprise />} />
                <Route path="/entreprises/delete/:id" element={<DeleteEntreprise />} />
                <Route path="/entreprises/:id"        element={<EntrepriseDetail />} />

                {/* Géolocalisations */}
                <Route path="/geolocalisations"            element={<GeolocalisationList />} />
                <Route path="/geolocalisations/create"     element={<CreateGeolocalisation />} />
                <Route path="/geolocalisations/edit/:id"   element={<EditGeolocalisation />} />
                <Route path="/geolocalisations/delete/:id" element={<DeleteGeolocalisation />} />
                <Route path="/geolocalisations/:id"        element={<GeolocalisationDetail />} />

                {/* Missions */}
                <Route path="/missions"            element={<MissionList />} />
                <Route path="/missions/create"     element={<CreateMission />} />
                <Route path="/missions/edit/:id"   element={<EditMission />} />
                <Route path="/missions/delete/:id" element={<DeleteMission />} />
                <Route path="/missions/:id"        element={<MissionDetail />} />
                <Route path="/missions/:id/assign" element={<AssignMissionRelations />} />

                {/* Plannings */}
                <Route path="/plannings"            element={<PlanningList />} />
                <Route path="/plannings/create"     element={<CreatePlanning />} />
                <Route path="/plannings/edit/:id"   element={<EditPlanning />} />
                <Route path="/plannings/delete/:id" element={<DeletePlanning />} />
                <Route path="/plannings/:id"        element={<PlanningDetail />} />

                {/* Sites */}
                <Route path="/sites"            element={<SiteList />} />
                <Route path="/sites/create"     element={<CreateSite />} />
                <Route path="/sites/edit/:id"   element={<EditSite />} />
                <Route path="/sites/delete/:id" element={<DeleteSite />} />
                <Route path="/sites/:id"        element={<SiteDetail />} />

                {/* Rapports */}
                <Route path="/rapports"            element={<RapportList />} />
                <Route path="/rapports/create"     element={<CreateRapport />} />
                <Route path="/rapports/edit/:id"   element={<EditRapport />} />
                <Route path="/rapports/delete/:id" element={<DeleteRapport />} />
                <Route path="/rapports/:id"        element={<RapportDetail />} />

                {/* Clients */}
                <Route path="/clients"            element={<ClientList />} />
                <Route path="/clients/create"     element={<CreateClient />} />
                <Route path="/clients/edit/:id"   element={<EditClient />} />
                <Route path="/clients/delete/:id" element={<DeleteClient />} />
                <Route path="/clients/:id"        element={<ClientDetail />} />

                {/* Articles */}
                <Route path="/articles"          element={<ArticleList />} />
                <Route path="/articles/create"   element={<CreateArticle />} />
                <Route path="/articles/edit/:id" element={<EditArticle />} />
                <Route path="/articles/:id"      element={<ArticleDetail />} />

                {/* Zones de travail */}
                <Route path="/zones"          element={<ZoneList />} />
                <Route path="/zones/create"   element={<ZoneForm />} />
                <Route path="/zones/edit/:id" element={<ZoneForm />} />
                <Route path="/zones/:id"      element={<ZoneDetail />} />

                {/* Disponibilités */}
                <Route path="/disponibilites"          element={<DisponibiliteList />} />
                <Route path="/disponibilites/create"   element={<DisponibiliteCreate />} />
                <Route path="/disponibilites/edit/:id" element={<DisponibiliteEdit />} />

                {/* Cartes professionnelles */}
                <Route path="/cartes-professionnelles"          element={<CarteProList />} />
                <Route path="/cartes-professionnelles/create"   element={<CarteProCreate />} />
                <Route path="/cartes-professionnelles/edit/:id" element={<CarteProEdit />} />

                {/* Diplômes SSIAP */}
                <Route path="/diplomes-ssiap"          element={<DiplomeList />} />
                <Route path="/diplomes-ssiap/create"   element={<DiplomeCreate />} />
                <Route path="/diplomes-ssiap/edit/:id" element={<DiplomeEdit />} />

                {/* Notifications */}
                <Route path="/notifications"          element={<NotificationList />} />
                <Route path="/notifications/create"   element={<NotificationCreate />} />
                <Route path="/notifications/edit/:id" element={<NotificationEdit />} />

                {/* Contrats de travail */}
                <Route path="/contrats-de-travail"          element={<ContratDeTravailList />} />
                <Route path="/contrats-de-travail/create"   element={<ContratDeTravailCreate />} />
                <Route path="/contrats-de-travail/edit/:id" element={<ContratDeTravailEdit />} />
                <Route path="/contrats-de-travail/:id"      element={<ContratDeTravailDetail />} />

                <Route path="/devis" element={<DevisList />} />
                <Route path="/devis/create" element={<DevisForm />} />
                <Route path="/devis/edit/:id" element={<DevisForm />} />
                <Route path="/devis/:id" element={<DevisDetail />} />

                {/* Factures */}
                <Route path="/factures"            element={<FactureList />} />
                <Route path="/factures/create"     element={<FactureForm />} />
                <Route path="/factures/edit/:id"   element={<FactureForm />} />
                <Route path="/factures/:id"        element={<FactureDetail />} />


                <Route path="/fiches"           element={<FicheDePaieList />} />
                <Route path="/fiches/create"    element={<FicheDePaieForm />} />
                <Route path="/fiches/edit/:id"  element={<FicheDePaieForm />} />
                <Route path="/fiches/:id"       element={<FicheDePaieDetail />} />

                <Route path="/articles" element={<ArticleList />} />
                <Route path="/articles/:id" element={<ArticleDetail />} />

                <Route path="/article-contrat-travail"          element={<ArticleContratTravailList />} />
                <Route path="/article-contrat-travail/create"   element={<ArticleContratTravailForm />} />
                <Route path="/article-contrat-travail/edit/:id" element={<ArticleContratTravailForm />} />
                <Route path="/article-contrat-travail/:id"      element={<ArticleContratTravailView />} />

                {/* Contrats */}
                <Route path="/contrats/create"  element={<CreateContrat />} />
                <Route path="/contrats/edit/:id" element={<EditContrat />} />
                <Route path="/contrats/:id"     element={<ContratDetail />} />
                <Route path="/contrats"         element={<ContratList />} />
            </Routes>
        </BrowserRouter>
    );
}
