/// <reference types = "cypress" />

describe('Test with backend', () =>{
    beforeEach('login to the app', ()=>{
        cy.intercept('GET','**/tags',{fixture:'tags.json'})
        //cy.route('GET','https://api.realworld.io/api/tags','fixture:tags.json')
        cy.loginToApplication()
    })

    it('verify correct request and response', () => {
  
        cy.intercept('POST','**/articles').as('postArticles')
        // cy.route('POST','https://api.realworld.io/api/articles/').as('postArticles')
        // cy.intercept('POST','https://api.realworld.io/api/articles/').as('GetUser')

        cy.contains('New Article').click()
        cy.get('[formcontrolname="title"]').type('This is an Article')
        cy.get('[formcontrolname="description"]').type('This is the description')
        cy.get('[formcontrolname="body"]').type('This is the body of the Article')
        cy.get('[placeholder="Enter tags"]').type('tag1')
        cy.contains('Publish Article').click()
        cy.wait('@postArticles')
        cy.get('@postArticles').then(xhr =>{
            console.log(xhr)
           // expect(xhr.response.statusCode).to.equal(307)
          // expect(xhr.request.body.article.body).to.equal('This is the body of the Article')
           // expect(xhr.response.body.article.description).to.equal('This is the description')
        })  
    })

    it('should give tags with routing object', () =>{
        cy.get('div .tag-list')
        .should('contain','cypress')
        .and('contain','automation')
        .and('contain','testing')
    })

    it('verify global feed likes count', () =>{
        // cy.intercept('GET','https://api.realworld.io/api/articles/feed?limit=10&offset=0',{"articles":[],"articlesCount":0}) 
        cy.intercept('GET','**/articles/feed*',{"articles":[],"articlesCount":0}) 
        // cy.intercept('GET','https://api.realworld.io/api/articles?limit=10&offset=0',{fixture:'articles.json'})              
        cy.intercept('GET','**/articles*',{fixture:'articles.json'})             

        cy.contains('Global Fee').click()
   
        cy.get('app-article-list button').then(listOfButtons =>{
            expect(listOfButtons[0]).to.contain('1')
            expect(listOfButtons[1]).to.contain('5')
        })

        cy.fixture('articles').then(file => {
            const articleLink = file.articles[1].slug
           // cy.intercept('POSt','https://api.realworld.io/api/articles/articleLink/favorite',file)     
            cy.intercept('POSt','**/articles/'+articleLink+'/favorite',file)     
        })

        cy.get('app-article-list button')
        .eq(1)
        .click()
        .should('contain','6')
    })

    it.skip('delete a new article in the Global Fee', ()=>{

        const bodyRequest = {
            "article": {
                "title": "Full stack Reactjs developer",
                "description": "React position",
                "body": "$60 per hour",
                "tagList": []
            }
        }

        cy.get('@token').then(token =>{

            cy.request({
                url: Cypress.env('apiUrl') + '/api/articles/',
                headers: {'Authorization':'Token '+ token},
                method: 'POST',
                // failOnStatusCode: false,
                body: bodyRequest
            })
            .then(res =>{
                expect(res.status).to.equal(200)
            })

            cy.contains('Global Feed').click()
            cy.wait(500)
            cy.get('.article-preview').first().click()
            cy.wait(50)
            cy.get('.article-actions').contains('Delete Article').click()
            cy.wait(5000)

            cy.request({
                url: Cypress.env('apiUrl') + '/api/articles?limit=10&offset=0',
                headers: {'Authorization': 'Token '+token},
                method: 'GET'
            }).its('body').then( body =>{
                console.log(body)
                expect(body.articles[0].title).not.to.equal('Full stack Reactjs developer')
            })
        })
    })
})
