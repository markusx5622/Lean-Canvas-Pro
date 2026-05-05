# 🚀 Lean Canvas Pro  
*Plataforma estratégica de modelado de negocio y validación heurística para Startups*

![Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-Proprietary_&_All_Rights_Reserved-red)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Auditor Local](https://img.shields.io/badge/Motor-Heur%C3%ADstico_Local-brightgreen)

## 🎯 Sobre el Proyecto

**Lean Canvas Pro** es una suite profesional diseñada para ser el núcleo decisivo en la etapa temprana (*Early Stage*) de toda Startup. Desarrollada para acompañar a founders, directivos y CEOs hacia el éxito, esta plataforma permite construir modelos de negocio de manera iterativa, estructurada y profesional, respaldados activamente por auditorías heurísticas ejecutadas 100% localmente en el navegador.

## ✨ Características Principales

- 📋 **Modelado Estratégico Dinámico:** Construcción ágil, intuitiva y visual de los 9 bloques fundamentales del modelo *Lean Canvas*.
- 🤖 **Auditoría Estratégica con Motor Heurístico Local:** Motor estratégico 100% local que evalúa bloques individuales o el proyecto al completo dando feedback sobre CAC, LTV, coherencia entre bloques, viabilidad del modelo y prioridades de mejora. Sin dependencias de APIs externas.
- 🔒 **Persistencia y Privacidad Local:** Los datos de negocio se almacenan en el almacenamiento local del navegador y nunca abandonan tu dispositivo. Los secretos industriales y datos de la startup pertenecen a los directivos.
- 🌓 **Diseño Adaptativo y Accesible:** Interfaz inmersiva enfocada a la productividad continua; modos claro y oscuro pulidos para evitar la fatiga en las sesiones largas de brainstorming.
- 📁 **Centro de Gestión Integral:** Administración de múltiples ideas y proyectos, con facilidades de importación, exportación en JSON e impresión del lienzo directamente desde el navegador.

## 🛠️ Stack Tecnológico y Arquitectura

- **Frontend:** React 18, TypeScript, Tailwind CSS, Framer Motion (para transiciones hápticas visuales), Lucide Icons.
- **Backend:** Servidor en Node.js mediante Express con Vite en modo middleware (*Full-Stack*).
- **Motor Heurístico:** Motor heurístico local (`src/evaluator`) que analiza el canvas al instante: puntuación, fortalezas, inconsistencias entre bloques y prioridades de mejora. Sin dependencias de APIs externas.

## 🔑 Autenticación (Supabase Auth)

Lean Canvas Pro usa **Supabase Auth** para gestionar cuentas reales de usuario.  
La autenticación es completamente por email y contraseña; la sesión persiste al recargar el navegador gracias al almacenamiento de sesión de Supabase.

### Arquitectura

| Pieza | Responsabilidad |
|---|---|
| `src/lib/supabase.ts` | Cliente Supabase singleton |
| `src/contexts/AuthContext.tsx` | Context que expone `user`, `session`, `loading`, `signIn`, `signUp`, `signOut` |
| `src/components/auth/AuthPage.tsx` | Pantalla de registro/inicio de sesión coherente con el diseño |
| `src/App.tsx` (componente `App`) | Auth-gate: muestra `AuthPage` o el workspace según el estado de sesión |

### Setup local

1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. Ve a **Settings → API** y copia la URL y la clave `anon public`.
3. Crea un archivo `.env` en la raíz del proyecto (basándote en `.env.example`):
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
4. En el panel de Supabase, asegúrate de que **Email Auth** está habilitado en *Authentication → Providers*.  
   (Opcional) Desactiva la confirmación de email en entornos de desarrollo en *Authentication → Settings → Email confirmations*.
5. Arranca el servidor de desarrollo:
   ```bash
   npm run dev
   ```

> Las variables `VITE_*` son expuestas al cliente por Vite de forma segura.  
> Nunca añadas la clave `service_role` al frontend.



Diseñado y desarrollado de manera empírica en el ecosistema de talento e innovación por **Marc Cubero Cantavella** desde el campo de la *Ingeniería de Organización Industrial* aplicados sobre la **Universidad Europea de Valencia**. 

[🔗 Conectar con Marc Cubero en LinkedIn](https://www.linkedin.com/in/marc-cubero-cantavella-bb04542a7)

## ⚖️ Licencia y Propiedad Intelectual

**© 2026 Marc Cubero Cantavella. Todos los derechos reservados.**

Esta plataforma, su código fuente, arquitectura, diseño y concepto son propiedad exclusiva e intelectual de su creador.

🔹 **Puedes** acceder y usar la aplicación funcional en la web de forma abierta para construir tus modelos y dar vida a tus Startups.  
❌ **No puedes** descargar, clonar, copiar, distribuir, revender, modificar ni realizar obras derivadas de este código fuente o del diseño para fines comerciales ni no comerciales sin la autorización directa, mediante firma, de Marc Cubero. 

> *La visibilidad de este código fuente en repositorios como GitHub sirve con fines exclusivos de portafolio y evidencia de capacidad técnica. No se ampara de ninguna manera bajo terminologías Open Source.* Por favor, ver el archivo `LICENSE` completo del repositorio para detalles legales.
