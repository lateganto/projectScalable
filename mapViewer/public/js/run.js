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

    start(demo);
});