# AMPL - PathExplorer
Group project for TC3004B.103

Proyecto para socioformador Accenture

Equipo :

    Acker Enif Saldana Polanco
    Jose Angel Perez Guerrero
    Amhed Jahir Cortes Lopez
    Elit Shadday Acosta Pastrana
    Emilio Magallanes Villagomez


**PathExplorer** es una plataforma web desarrollada en colaboración académica con **Accenture Monterrey**, cuyo objetivo es optimizar la gestión del talento dentro de la empresa. La aplicación permite centralizar la información profesional de los empleados, automatizar la asignación de personal a proyectos y proporcionar visualizaciones analíticas para apoyar la toma de decisiones estratégicas.

Este sistema fue diseñado bajo un enfoque escalable y basado en los principios del desarrollo ágil, utilizando herramientas modernas para asegurar calidad y eficiencia.

---

## 📌 Objetivos del Proyecto

- Facilitar a los líderes de proyecto la búsqueda de empleados en banca.
- Permitir a los empleados gestionar y actualizar su perfil profesional.
- Automatizar la generación de reportes y sugerencias de carrera.
- Implementar un algoritmo de compatibilidad entre perfiles y roles usando IA.
- Optimizar el proceso de asignación de talento dentro de la organización.

---

## 🚀 Funcionalidades Principales

- **Inicio de sesión seguro** con gestión de roles (Empleado, TFS, Ejecutivo).
- **Gestión de perfiles profesionales**: CV, certificaciones, habilidades y metas.
- **Parser de CVs** en PDF que extrae datos automáticamente para crear perfiles.
- **Visualización de trayectoria profesional** con sugerencias inteligentes.
- **Creación y asignación de proyectos y roles** desde el panel de proyectos, solo accessible a TFS y Ejecutivos.
- **Algoritmo de match por porcentaje** entre empleados y proyectos.
- **Carga y seguimiento de certificaciones** con alertas por vencimiento.
- **Feedback y métricas** sobre desempeño por parte de los ejecutivos.
- **Generación de reportes descargables** y visuales para análisis estratégico.
- **Modo oscuro / claro** personalizable por el usuario.

---

## 🧠 Tecnologías Utilizadas

### Frontend
- React
- Material UI
- React Router DOM
- Context API y hooks para manejo de estado

### Backend
- Node.js (API REST desarrollada en JavaScript)
- OpenAI GPT-4.1-nano

### Base de datos y autenticación
- Supabase (PostgreSQL + Supabase Auth)

### Otras herramientas
- GitHub Actions para CI/CD
- Cypress para pruebas end-to-end
- Azure DevOps para gestión de backlog y sprints
- Figma para diseño de mockups
- Lucidchart para modelado arquitectónico

---

## 📁 Estructura del Proyecto

PATHEXPLORER/
│
├── cypress/
├── functions/
│   └── node_modules/
├── routes/
├── services/
├── test/
├── node_modules/
├── public/
├── scripts/
├── src/
│   ├── assets/
│   ├── brand/
│   ├── components/
│   ├── contexts/
│   ├── fonts/
│   ├── hooks/
│   ├── layout/
│   ├── pages/
│   ├── styles/
│   ├── supabase/
│   ├── utils/
│   ├── App.css
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── .env
├── .firebaserc
├── .gitignore
├── cypress.config.js
├── eslint.config.js
├── firebase.json
├── index.html
├── index.js
├── package-lock.json
├── package.json
├── README.md
├── server.js
└── vite.config.js

---


## 🖼️ Diagramas de Arquitectura

Consulta los diagramas lógicos, físicos, de proceso y desarrollo del sistema en el siguiente enlace de Lucidchart:

🔗 [Diagramas de Arquitectura – Lucidchart](https://lucid.app/lucidchart/367b715d-5ad0-48a5-9c68-94c781b5728e/edit?viewport_loc=-91%2C-625%2C7689%2C3560%2CHWEp-vi-RSFO&invitationId=inv_23777952-2306-44ce-a3bc-8a6af5f77dcf)

---

## 👥 Roles de Usuario

| Rol       | Funcionalidades principales                                                                 |
|-----------|----------------------------------------------------------------------------------------------|
| Empleado  | Editar su perfil, subir CV y certificados, consultar trayectoria, recibir sugerencias.      |
| TFS       | Crear proyectos y roles, ver empleados en banca, asignar personal a proyectos.              |
| Ejecutivo | Ver reportes y métricas, feedback, y crear o gestionar usuarios dentro del sistema.         |

---

## 🔄 Metodología

Se utilizó la metodología ágil **SCRUM**, con sprints semanales. Se realizaron ceremonias como dailys, sprint planning, retrospectives y demos con el cliente, utilizando Azure DevOps para la gestión del backlog, tareas y métricas de velocidad.

---

## 📊 Resultados y Alcance

- Se desarrolló una plataforma funcional y completa, cumpliendo todos los requerimientos del backlog inicial.
- Se agregaron funcionalidades extra como el parser de CVs y asignación de certificaciones específicas por rol.
- Se validó el sistema con el cliente mediante reuniones semanales y pruebas funcionales.
- Se diseñó una arquitectura escalable para poder implementarse en más unidades de Accenture.

---

## 🧑‍💻 Integrantes del Equipo

- Acker Enif Saldana Polanco  
- Jose Angel Perez Guerrero  
- Amhed Jahir Cortes Lopez  
- Elit Shadday Acosta Pastrana  
- Emilio Magallanes Villagomez

---

## 📄 Licencia

Este proyecto fue desarrollado con fines académicos en colaboración con Accenture Monterrey. No está destinado a uso comercial sin autorización.

