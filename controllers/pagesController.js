const homePage = (req, res) => {
    res.render('home', {
        page: 'Home',
        name: req.user.name || '',
    });
};

const loginPage = (req, res) => {
    res.render('login', {
        page: 'Login',
        // messages: req.messages,
    });
};

export { homePage, loginPage };
