/// <reference types="cypress" />

// First Test: Login y navegación a Projects

describe('Flujo de autenticación – Login', () => {
  const baseUrl  = 'https://prod-ampl.web.app'
  const email    = '123@test.com'
  const password = '1234'

  // Lista de rutas a visitar — extraída de tu carpeta de páginas
  

  beforeEach(() => {
    // Para el test de login
    cy.intercept('POST', '**/auth/v1/token**').as('loginApi')
    cy.visit(`${baseUrl}/login`)
  })

  it('Debería loguearse con credenciales válidas y redirigir al dashboard', () => {
    // Rellenar email y password
    cy.get('input#email').should('be.visible').clear().type(email)
    cy.get('input#password').should('be.visible').clear().type(password)

    // (Opcional) Marcar "Remember me"
    cy.contains('label', 'Remember me')
      .find('input[type="checkbox"]')
      .check()

    // Pulsar Sign In
    cy.get('button[type="submit"]')
      .contains('Sign In')
      .click()

    // 1) Esperamos la llamada a la API de Supabase y comprobamos 200
    cy.wait('@loginApi').its('response.statusCode').should('eq', 200)

    // 2) Ahora validamos que la URL ya no siga en /login, sino en /dashboard-*
    cy.url({ timeout: 10_000 })
      .should('not.include', '/login')
      .and('match', /\/dashboard(-admin|-employee)?$/)


    
  })
})

// Segundo Test: Navegación a Projects

describe('Flujo E2E – Login y navegación a Projects', () => {
  const baseUrl  = 'https://prod-ampl.web.app';
  const email    = '123@test.com';
  const password = '1234';

  beforeEach(() => {
    // Interceptamos la llamada de autenticación
    cy.intercept('POST', '**/auth/v1/token**').as('loginApi');
    cy.visit(`${baseUrl}/login`);
  });

  it('Debería iniciar sesión y luego navegar a la página de Projects', () => {
    // Rellenar email y password
    cy.get('input#email')
      .should('be.visible')
      .clear()
      .type(email);

    cy.get('input#password')
      .should('be.visible')
      .clear()
      .type(password);

    // (Opcional) Marcar "Remember me"
    cy.contains('label', 'Remember me')
      .find('input[type="checkbox"]')
      .check();

    // Pulsar Sign In
    cy.get('button[type="submit"]')
      .contains('Sign In')
      .click();

    // 1) Esperamos la llamada a la API de Supabase y comprobamos 200
    cy.wait('@loginApi')
      .its('response.statusCode')
      .should('eq', 200);

    // 2) Validamos que estamos en /dashboard-employee o /dashboard-admin
    cy.url({ timeout: 10_000 })
      .should('not.include', '/login')
      .and('match', /\/dashboard(-admin|-employee)?$/);

    // 3) Verificamos que el dashboard muestra el encabezado esperado
    cy.get('h4')
      .should('contain.text', 'Welcome back!');

    // 4) Hacemos clic en el ítem de menú “Projects”
    cy.get('nav ul').within(() => {
      cy.contains('Projects').click();
    });

    // 5) Comprobamos que la URL incluye /projects
    cy.url()
      .should('include', '/projects');

    // 6) Verificamos que la página de Projects tiene su encabezado
    cy.get('h4')
      .should('contain.text', 'Projects');
    cy.contains('All projects').click();
    cy.contains('Completed').click();
    cy.contains('Ongoing').click();
    cy.contains('On Hold').click();
    cy.contains('Not Started').click();

    // --- Click en Add Project ---
    cy.contains('Add Project').click();

    // --- Verificar formulario de creación ---
    cy.url().should('match', /(\/add-projects)$/);
    cy.get('h4').should('contain.text', 'Create New Project');
  });
});
// Tercer Test: Navegación a My Path
/// <reference types="cypress" />

describe('Flujo E2E – Login y navegación a My Path', () => {
  const baseUrl  = 'https://prod-ampl.web.app';  // o tu URL de dev: 'https://dev-ampl.web.app'
  const email    = '123@test.com';
  const password = '1234';

  beforeEach(() => {
    // Interceptar la llamada de login para validar el status
    cy.intercept('POST', '**/auth/v1/token**').as('loginApi');
    cy.visit(`${baseUrl}/login`);
  });

  it('Debe iniciar sesión y luego ir a My Path', () => {
    // — Login —
    cy.get('input#email')
      .should('be.visible')
      .clear()
      .type(email);

    cy.get('input#password')
      .should('be.visible')
      .clear()
      .type(password);

    cy.contains('label', 'Remember me')
      .find('input[type="checkbox"]')
      .check();

    cy.get('button[type="submit"]')
      .contains(/Sign In|Iniciar sesión/)
      .click();

    cy.wait('@loginApi')
      .its('response.statusCode')
      .should('eq', 200);

    // Validar que estamos en dashboard
    cy.url({ timeout: 10_000 })
      .should('match', /\/dashboard(-admin|-employee)?$/);
    cy.get('h4')
      .should('contain.text', 'Welcome back!');

    // — Ir a My Path —
    cy.contains('a.MuiListItem-root', 'My Path')
      .click();

    // Verificar URL y encabezado de My Path
    cy.url()
      .should('include', '/mypath');
    cy.get('h4')
      .should('contain.text', 'Professional Journey');

    // (Opcional) Validar que las pestañas Timeline, Projects y Certifications existen
    cy.get('[role="tab"]').should('have.length.at.least', 3);
    cy.contains('[role="tab"]', 'Timeline').should('exist');
    cy.contains('[role="tab"]', 'Projects').should('exist');
    cy.contains('[role="tab"]', 'Certifications').should('exist');
  });
});
// Cuarto Test: Navegación a Certifications
/// <reference types="cypress" />

describe('Flujo E2E – Login y navegación a Certifications', () => {
  const baseUrl  = 'https://prod-ampl.web.app'; // o tu URL de dev si aplica
  const email    = '123@test.com';
  const password = '1234';

  beforeEach(() => {
    // Interceptar login para comprobar status
    cy.intercept('POST', '**/auth/v1/token**').as('loginApi');
    cy.visit(`${baseUrl}/login`);
  });

  it('Debe iniciar sesión y luego interactuar con la página de Certifications', () => {
    // — Login —
    cy.get('input#email')
      .should('be.visible')
      .clear()
      .type(email);

    cy.get('input#password')
      .should('be.visible')
      .clear()
      .type(password);

    cy.contains('label', 'Remember me')
      .find('input[type="checkbox"]')
      .check();

    cy.get('button[type="submit"]')
      .contains('Sign In')
      .click();

    cy.wait('@loginApi')
      .its('response.statusCode')
      .should('eq', 200);

    // Verificar dashboard
    cy.url({ timeout: 10_000 })
      .should('match', /\/dashboard(-admin|-employee)?$/);
    cy.get('h4')
      .should('contain.text', 'Welcome back!');

    // — Navegar a Certifications —
    cy.contains('a.MuiListItem-root', 'Certifications').click();
    cy.url()
      .should('include', '/certifications');
    cy.get('h4')
      .should('contain.text', 'Certifications');

    // — Probar búsqueda —
    cy.get('input[placeholder="Search certifications..."]')
      .type('Cloud')
      .should('have.value', 'Cloud')
      .clear()
      .should('have.value', '');

    // — Abrir panel de filtros —
    cy.contains('button', 'Filters').click();
    cy.contains('Filter Certifications').should('be.visible');

    // — Aplicar un filtro de categoría (ej. Cloud Computing) —
    cy.contains('Cloud Computing').click();
    // El botón Filters debe mostrar un badge con el contador
    cy.contains('button', 'Filters')
      .find('.MuiChip-root')
      .should('exist');

    // — Limpiar filtros —
    cy.contains('button', 'Clear filters').click();
    // El badge de filtros activos ya no debe existir
    cy.contains('button', 'Filters')
      .find('.MuiChip-root')
      .should('not.exist');

    // — Abrir modal de Submit Certification —
    cy.contains('button', 'Submit').click();
    // Verificamos que aparece el modal
    cy.get('div[role="presentation"]')
      .should('be.visible');
  });
});
// Quinto Test: Navegación a Profiles
/// <reference types="cypress" />

describe('Flujo E2E – Login y navegación a Profiles', () => {
  const baseUrl  = 'https://prod-ampl.web.app';
  const email    = '123@test.com';
  const password = '1234';

  beforeEach(() => {
    // Interceptar login para comprobar status
    cy.intercept('POST', '**/auth/v1/token**').as('loginApi');
    cy.visit(`${baseUrl}/login`);
  });

  it('Debe iniciar sesión y luego ir a Profiles', () => {
    // — Login —
    cy.get('input#email')
      .should('be.visible')
      .clear()
      .type(email);

    cy.get('input#password')
      .should('be.visible')
      .clear()
      .type(password);

    cy.contains('label', 'Remember me')
      .find('input[type="checkbox"]')
      .check();

    cy.get('button[type="submit"]')
      .contains('Sign In')
      .click();

    cy.wait('@loginApi')
      .its('response.statusCode')
      .should('eq', 200);

    // Validar que estamos en dashboard
    cy.url({ timeout: 10_000 })
      .should('match', /\/dashboard(-admin|-employee)?$/);
    cy.get('h4').should('contain.text', 'Welcome back!');

    // — Navegar a Profiles —
    cy.contains('a.MuiListItem-root', 'Profiles').click();
    cy.url().should('include', '/profiles');
    cy.get('h4').should('contain.text', 'Employee Profiles');

    // — Verificar estadísticas principales —
    cy.contains('Total Employees').should('exist');
    cy.contains('Available Employees').should('exist');
    cy.contains('Active Projects').should('exist');

    // — Abrir modal de Review Certifications (si el usuario es reviewer) —
    cy.contains('button', 'Review Certifications').then($btn => {
      if ($btn.length) {
        cy.wrap($btn).click();
        cy.get('div[role="presentation"]')  // MUI Dialog wrapper
          .should('be.visible');
        // Cerrar el modal (asumiendo que hay un botón con aria-label="Close")
        cy.get('[role="dialog"]').should('be.visible').within(() => {
          cy.get('button.MuiIconButton-root').click();
        });
        cy.get('[role="dialog"]').should('not.exist');
      }
    });
  });
});
// Sexto Test: Navegación a Analytics
/// <reference types="cypress" />

describe('Flujo E2E – Login y Analytics', () => {
  const baseUrl = 'https://prod-ampl.web.app';
  const email   = '123@test.com';
  const pass    = '1234';

  beforeEach(() => {
    cy.intercept('POST', '**/auth/v1/token**').as('login');
    cy.visit(`${baseUrl}/login`);
    cy.get('#email').type(email);
    cy.get('#password').type(pass);
    cy.contains('label', 'Remember me').find('input').check();
    cy.contains('button', /Sign In|Iniciar sesión/).click();
    cy.wait('@login').its('response.statusCode').should('eq', 200);
  });

  it('Debiera cargar Analytics correctamente', () => {
    // 1) Ir a Analytics
    cy.contains('a.MuiListItem-root', 'Analytics').click();
    cy.url().should('include', '/analytics');

    // 2) Título
    cy.contains('h4', 'Analytics').should('be.visible');

    // 3) Executive Summary Cards
    const cardLabels = [
      'Project Completion Rate',
      'Certifications per Employee',
      'Average Bench Days',
      'Avg Employee Assignment'
    ];
    cardLabels.forEach(label => {
      cy.contains('h6', label).should('exist');
    });

    // 4) Secciones de gráficos
    ['Employee Distribution', 'Project Status', 'Team Skills Analysis']
      .forEach(title => {
        cy.contains('h6', title).should('exist');
      });

    // 5) Filtros de skills
    cy.contains('button', 'Hard').click().should('have.class', 'MuiButton-contained');
    cy.contains('button', 'Soft').click().should('have.class', 'MuiButton-contained');
    cy.contains('button', 'All').click().should('have.class', 'MuiButton-contained');

    // 6) Pestañas dentro de Skills Analysis
    cy.contains('button', 'Improvement Areas').click().should('have.class', 'Mui-selected');
    cy.contains('button', 'Top Skills').click().should('have.class', 'Mui-selected');

    // 7) Ir a All Skills
    cy.contains('button', 'View All Skills').click();
    cy.url().should('include', '/all-skills');
  });
});
// Séptimo Test: Navegación a User (Profile)
/// <reference types="cypress" />

describe('E2E – User Profile y Edit Profile', () => {
  const baseUrl = 'https://prod-ampl.web.app';
  const email   = '123@test.com';
  const pass    = '1234';

  beforeEach(() => {
    // interceptamos login
    cy.intercept('POST', '**/auth/v1/token**').as('loginApi');
    cy.visit(`${baseUrl}/login`);
    cy.get('#email').type(email);
    cy.get('#password').type(pass);
    cy.contains('label', 'Remember me')
      .find('input[type="checkbox"]').check();
    cy.contains('button', /Sign In|Iniciar sesión/).click();
    cy.wait('@loginApi').its('response.statusCode').should('eq', 200);
  });

  it('Carga el perfil de usuario y navega a Edit Profile', () => {
    // 1) Visitar página de perfil
    cy.visit(`${baseUrl}/user`);

    // 2) Comprobar que el banner muestra el badge "Available for projects"
    cy.contains('Available for projects').should('be.visible'); // BannerProfile :contentReference[oaicite:0]{index=0}

    // 3) Verificar secciones principales
    cy.contains('h6', 'Information').should('exist');           // Information :contentReference[oaicite:1]{index=1}
    cy.contains('h6', 'Skills').should('exist');                // Skills :contentReference[oaicite:2]{index=2}
    cy.contains('h6', 'Certifications').should('exist');        // Certifications :contentReference[oaicite:3]{index=3}
    cy.contains('h6', 'Past Projects').should('exist');         // PastProjectsCard :contentReference[oaicite:4]{index=4}

    // 4) Click en Edit Profile
    cy.contains('button', 'Edit Profile').click();
    cy.url().should('include', '/edit-profile');
  });

  it('Desde Edit Profile, cancelar vuelve a /user', () => {
    cy.visit(`${baseUrl}/edit-profile`);
    cy.contains('h5', 'Edit Profile').should('be.visible');     // header de EditProfile :contentReference[oaicite:5]{index=5}
    cy.contains('button', 'Cancel').click();
    cy.url().should('include', '/user');
  });
});

