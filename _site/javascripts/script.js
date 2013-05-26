(function (D, window, undefined) {
    var about = D.getElementById('about');
    var aboutLink = D.getElementById('aboutlink');
    var wrapper = D.getElementById('wrapper');
    aboutLink.onclick = function (e) {
        e.preventDefault();
        about.className = 'full';
    };
    D.body.onclick = function (e) {
        if (about.className !== 'min' && e.target.id !== 'aboutlink') {
            about.className = 'min';
        }
    };
}(document, window));
