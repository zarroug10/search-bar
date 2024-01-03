const  express=  require ('express');
const   engine  = require('express-handlebars').engine;
const   puppeteer = require ('puppeteer')

const app = express();

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');


app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/search', async function(req, res) {
    let searchQuery = req.query.q;
    let searchAmazonURL = 'https://www.amazon.com/s?k=' + searchQuery;

    console.log(searchAmazonURL);
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
        
            await page.goto(searchAmazonURL);
          
        
            // Extract search results
            //evalute gets me the source code of the page requested
            const searchResults = await page.$$eval('.s-result-item', (items) => {
              return items.map((item) => {
                const titleElement = item.querySelector('h2 a');
                const imageElement = item.querySelector('.s-image');
                const priceElement = item.querySelector('.a-price .a-offscreen');
                return {
                  title: titleElement ? titleElement.textContent.trim() : '',
                  image: imageElement ? imageElement.src : '',
                  price: priceElement ? priceElement.textContent.trim() : '',
                };
              });
            });
        
            console.log(searchResults);
        
            await browser.close();
        
            res.render('search', { searchResults });
          } catch (error) {
            console.error(error);
            res.render('error');
          }
        });
app.listen(3000);