// cypress/e2e/login.cy.js
describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('/login'); // Assuming '/login' is the path to your login page
  });

  it('should display login form elements', () => {
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible').and('contain', 'Login');
    cy.get('a').contains('Sign Up').should('be.visible');
  });

  it('should allow a user to log in successfully', () => {
    // This test assumes a successful login redirects to '/' or '/dashboard'
    // and that the login credentials are valid.
    // Replace with actual valid credentials for your application.
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    // Assuming successful login redirects to dashboard or main page
    cy.url().should('include', '/dashboard'); // Or whatever your dashboard route is
    cy.contains('Welcome').should('be.visible'); // Assuming a welcome message
  });

  it('should show an error message with invalid credentials', () => {
    cy.get('input[type="email"]').type('invalid@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.get('.error-message').should('be.visible').and('contain', 'Invalid credentials');
    cy.url().should('include', '/login');
  });
});