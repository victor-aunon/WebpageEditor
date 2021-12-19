const homePage = (req, res) => {
    res.render('home', {
        page: 'Login',
    });
};

export { homePage };
