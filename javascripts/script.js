(function (D, window, undefined) {
    var about = D.getElementById('about');
    var aboutLink = D.getElementById('aboutlink');
    aboutLink.onclick = function (e) {
        e.preventDefault();
        about.style.opacity = 1;
    };
    D.body.onclick = function (e) {
        if (e.target.id !== 'about' && e.target.id !== 'aboutlink') {
            about.style.opacity = 0;
        }
    };
}(document, window));
