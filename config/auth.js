exports.isUser = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash('danger', 'Please Log in!');
        res.redirect('/');
    }
}

exports.isAdmin = function (req, res, next) {
    if (req.isAuthenticated() ) {
        next();
    } else {
        req.flash('danger', 'Please Log in as admin!');
        res.redirect('/');
    }
}