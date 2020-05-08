spinnerText.hidden = true;
spinner.hidden = true;

gcpButton.addEventListener('click', function () {
    spinnerText.hidden = false;
    spinner.hidden = false;
    gcpButton.remove();
    demoButton.remove();

    init();
});

demoButton.addEventListener('click', function () {
    spinnerText.hidden = false;
    spinner.hidden = false;
    demoButton.remove();
    gcpButton.remove();

    mapZoom = 12;
    rankFactor = 25;
    start(demo);
});